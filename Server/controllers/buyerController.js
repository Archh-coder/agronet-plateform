
import Crop from '../models/Crop.js'
import Review from '../models/Review.js'
import Query from '../models/Query.js'
import User from '../models/User.js'

// get all crops
export const getAllCrops = async (req, res) => {
  try {
    const { category, search, sort } = req.query

    let query = {}

    // Filter by category
    if (category && category !== 'All') {
      query.category = category
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }


    if (req.user?.role === 'farmer') {
      query.farmerId = req.user._id
    }


    let sortOption = { createdAt: -1 }
    if (sort === 'price_low') sortOption = { pricePerUnit: 1 }
    if (sort === 'price_high') sortOption = { pricePerUnit: -1 }

    const crops = await Crop.find(query)
      .populate('farmerId', 'name email')
      .sort(sortOption)

    res.status(200).json(crops)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch crops', error: error.message })
  }
}
  

// get single crop
export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmerId', 'name email')  // show farmer details

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' })
    }

    // get reviews for this crop
    const reviews = await Review.find({ cropId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })

    // get answered FAQs for this crop
    const faqs = await Query.find({
      cropId: req.params.id,
      isAnswered: true
    }).sort({ createdAt: -1 })

    res.status(200).json({ crop, reviews, faqs })

  } catch (error) {
    console.error('Get crop error:', error)
    res.status(500).json({ message: 'Failed to fetch crop', error: error.message })
  }
}

// ─── ADD TO CART ─────────────────────────────────────────
// cart is stored in the User model as an array
export const addToCart = async (req, res) => {
  try {
    const { cropId, quantity } = req.body

    const crop = await Crop.findById(cropId)
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' })
    }

    // check quantity is valid
    if (quantity < crop.minOrderQty) {
      return res.status(400).json({
        message: `Minimum order quantity is ${crop.minOrderQty}`
      })
    }

    if (quantity > crop.stock) {
      return res.status(400).json({
        message: `Only ${crop.stock} units available`
      })
    }

    // add cart field to User model if not exists
    const user = await User.findById(req.user._id)

    if (!user.cart) user.cart = []

    // check if crop already in cart
    const existingItem = user.cart.find(
      item => item.cropId.toString() === cropId
    )

    if (existingItem) {
      existingItem.quantity = quantity  // update quantity
    } else {
      user.cart.push({ cropId, quantity })  // add new item
    }

    await user.save()
    res.status(200).json({ message: 'Added to cart', cart: user.cart })

  } catch (error) {
    res.status(500).json({ message: 'Failed to add to cart', error: error.message })
  }
}

// ─── GET CART ────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.cropId', 'name images pricePerUnit stock minOrderQty')

    res.status(200).json(user.cart || [])

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message })
  }
}

// ─── UPDATE CART ITEM ────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body
    const user = await User.findById(req.user._id)

    const item = user.cart.find(
      item => item.cropId.toString() === req.params.cropId
    )

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    item.quantity = quantity
    await user.save()

    res.status(200).json({ message: 'Cart updated', cart: user.cart })

  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart', error: error.message })
  }
}

// ─── REMOVE FROM CART ────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    user.cart = user.cart.filter(
      item => item.cropId.toString() !== req.params.cropId
    )

    await user.save()
    res.status(200).json({ message: 'Item removed from cart', cart: user.cart })

  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item', error: error.message })
  }
}

// ─── ADD REVIEW ──────────────────────────────────────────
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body

    // check if user already reviewed this crop
    const existing = await Review.findOne({
      cropId: req.params.cropId,
      userId: req.user._id
    })

    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this crop' })
    }

    const review = await Review.create({
      cropId:  req.params.cropId,
      userId:  req.user._id,
      rating,
      comment
    })

    res.status(201).json({ message: 'Review added', review })

  } catch (error) {
    res.status(500).json({ message: 'Failed to add review', error: error.message })
  }
}

// ─── SUBMIT QUERY (contact farmer) ───────────────────────
export const submitQuery = async (req, res) => {
  try {
    const { question } = req.body

    const crop = await Crop.findById(req.params.cropId)
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' })
    }

    const query = await Query.create({
      cropId:   req.params.cropId,
      farmerId: crop.farmerId,
      buyerId:  req.user._id,
      question
    })

    res.status(201).json({ message: 'Query submitted successfully', query })

  } catch (error) {
    res.status(500).json({ message: 'Failed to submit query', error: error.message })
  }
}

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)

    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await Review.findByIdAndDelete(req.params.reviewId)
    res.status(200).json({ message: 'Review deleted' })

  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review', error: error.message })
  }
}

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const review = await Review.findById(req.params.reviewId)

    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    review.rating = rating
    review.comment = comment
    await review.save()

    res.status(200).json({ message: 'Review updated', review })

  } catch (error) {
    res.status(500).json({ message: 'Failed to update review', error: error.message })
  }
}