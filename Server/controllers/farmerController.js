
import Crop from '../models/Crop.js'
import Contract from '../models/Contract.js'
import Query from '../models/Query.js'

// ADD CROP 
export const addCrop = async (req, res) => {
  try {
     console.log('Request body:', req.body)
    console.log('Request files:', req.files)
    const {
      name, category, description,
      pricePerUnit, stock, minOrderQty
    } = req.body

    console.log('Extracted fields:', { name, category, pricePerUnit, stock, minOrderQty })

    // validate required fields
    if (!name || !category || !pricePerUnit || !stock || !minOrderQty) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { name, category, pricePerUnit, stock, minOrderQty }
      })
    }

    // req.files comes from multer — array of uploaded images
    const images = req.files ? req.files.map(file => file.path) : []
    console.log('🖼️ Image URLs:', images)
    console.log('🖼️ Raw files:', req.files)

    const crop = await Crop.create({
      farmerId:     req.user._id,   // from JWT token via authMiddleware
      name,
      category,
      description,
      pricePerUnit: parseFloat(pricePerUnit),
      stock: parseInt(stock),
      minOrderQty: parseInt(minOrderQty),
      images
    })

    res.status(201).json({ message: 'Crop added successfully', crop })

  } catch (error) {
        console.error('Add crop error:', error)
    res.status(500).json({ message: 'Failed to add crop', error: error.message })
  }
}

// GET MY CROPS 
export const getMyCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json(crops)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch crops', error: error.message })
  }
}

// UPDATE CROP 
export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' })
    }

    // make sure this farmer owns this crop
    if (crop.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own crops' })
    }

    const {
      name, category, description,
      pricePerUnit, stock, minOrderQty,
      lat, lng
    } = req.body

    // if new images uploaded add them, otherwise keep existing
    const newImages = req.files && req.files.length > 0
      ? req.files.map(file => file.path)
      : crop.images

    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      {
        name, category, description,
        pricePerUnit, stock, minOrderQty,
        location: { lat, lng },
        images: newImages
      },
      { new: true }   // return the updated document
    )

    res.status(200).json({ message: 'Crop updated successfully', crop: updatedCrop })

  } catch (error) {
    res.status(500).json({ message: 'Failed to update crop', error: error.message })
  }
}

// DELETE CROP 
export const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' })
    }

    // make sure this farmer owns this crop
    if (crop.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own crops' })
    }

    await Crop.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Crop deleted successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Failed to delete crop', error: error.message })
  }
}

//  GET MY ORDERS 
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Contract.find({ farmerId: req.user._id })
      .populate('buyerId', 'name email')   // show buyer name and email
      .populate('cropId', 'name images')   // show crop name and image
      .sort({ createdAt: -1 })

    res.status(200).json(orders)

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message })
  }
}

//UPDATE ORDER STATUS 
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const contract = await Contract.findById(req.params.id)

    if (!contract) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (contract.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    contract.status = status

    // handle escrow based on status
    if (status === 'accepted')   contract.escrowStatus = 'held'
    if (status === 'rejected')   contract.escrowStatus = 'refunded'
    if (status === 'completed')  contract.escrowStatus = 'released'

    // reduce stock when order is accepted
    if (status === 'accepted') {
      await Crop.findByIdAndUpdate(contract.cropId, {
        $inc: { stock: -contract.quantity }  // subtract ordered quantity from stock
      })
    }

    await contract.save()
    res.status(200).json({ message: 'Order status updated', contract })

  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message })
  }
}

// ANSWER QUERY (becomes FAQ) 
export const answerQuery = async (req, res) => {
  try {
    const { answer } = req.body
    const query = await Query.findById(req.params.id)

    if (!query) {
      return res.status(404).json({ message: 'Query not found' })
    }

    if (query.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    query.answer     = answer
    query.isAnswered = true
    await query.save()

    res.status(200).json({ message: 'Query answered successfully', query })

  } catch (error) {
    res.status(500).json({ message: 'Failed to answer query', error: error.message })
  }
}