import Razorpay from 'razorpay'
import crypto from 'crypto'
import Contract from '../models/Contract.js'
import Crop from '../models/Crop.js'
import User from '../models/User.js'
import MarketPrice from '../models/MarketPrice.js'

//RAZORPAY INSTANCE 
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

//  CREATE CONTRACT + RAZORPAY ORDER 
export const createContract = async (req, res) => {
  try {
    const { cropId, quantity, startDate, endDate } = req.body

    if (!cropId || !quantity) {
      return res.status(400).json({ 
        message: 'Missing required fields: cropId, quantity' 
      })
    }

    const crop = await Crop.findById(cropId)
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' })
    }

    const parsedQuantity = parseInt(quantity)

    if (parsedQuantity < crop.minOrderQty) {
      return res.status(400).json({
        message: `Minimum order quantity is ${crop.minOrderQty}`
      })
    }

    if (parsedQuantity > crop.stock) {
      return res.status(400).json({
        message: `Only ${crop.stock} units available`
      })
    }

    const lockedPrice  = crop.pricePerUnit
    const totalAmount  = parsedQuantity * lockedPrice

    // create Razorpay order (amount in paise — multiply by 100)
    const razorpayOrder = await razorpay.orders.create({
      amount:   totalAmount * 100,
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    })

    // create contract with payment pending
    const contract = await Contract.create({
      farmerId:        crop.farmerId,
      buyerId:         req.user._id,
      cropId,
      quantity:        parsedQuantity,
      lockedPrice,
      totalAmount,
      startDate:       startDate || undefined,
      endDate:         endDate   || undefined,
      status:          'pending',
      escrowStatus:    'pending_payment',   // waiting for buyer to pay
      razorpayOrderId: razorpayOrder.id,
    })

    await MarketPrice.create({
      cropType:    crop.category,
      marketPrice: crop.pricePerUnit,
      lockedPrice: lockedPrice,
      date:        new Date()
    })

    res.status(201).json({
      message:        'Contract created — complete payment to confirm',
      contract,
      razorpayOrderId: razorpayOrder.id,
      amount:          totalAmount * 100,  // in paise for Razorpay
      currency:        'INR',
      keyId:           process.env.RAZORPAY_KEY_ID
    })

  } catch (error) {
    console.error('Create contract error:', error)
    res.status(500).json({ message: 'Failed to create contract', error: error.message })
  }
}

//VERIFY PAYMENT 
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, contractId } = req.body

    // verify signature — this proves payment is genuine
    const body      = razorpayOrderId + '|' + razorpayPaymentId
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' })
    }

    // update contract — payment confirmed, escrow held
    const contract = await Contract.findByIdAndUpdate(
      contractId,
      {
        escrowStatus:      'held',
        razorpayPaymentId: razorpayPaymentId,
        paymentVerified:   true,
      },
      { new: true }
    )

    res.status(200).json({ message: 'Payment verified — escrow held', contract })

  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ message: 'Payment verification failed', error: error.message })
  }
}

//  GET MY CONTRACTS 
export const getMyContracts = async (req, res) => {
  try {
    let filter = {}

    if (req.user.role === 'farmer') filter.farmerId = req.user._id
    if (req.user.role === 'buyer')  filter.buyerId  = req.user._id

    const contracts = await Contract.find(filter)
      .populate('farmerId', 'name email')
      .populate('buyerId',  'name email')
      .populate('cropId',   'name images category')
      .sort({ createdAt: -1 })

    res.status(200).json(contracts)

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contracts', error: error.message })
  }
}

// GET SINGLE CONTRACT 
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('farmerId', 'name email')
      .populate('buyerId',  'name email')
      .populate('cropId',   'name images category pricePerUnit')

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' })
    }

    if (
      contract.farmerId._id.toString() !== req.user._id.toString() &&
      contract.buyerId._id.toString()  !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this contract' })
    }

    res.status(200).json(contract)

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contract', error: error.message })
  }
}

// ─── ACCEPT CONTRACT (farmer only) ───────────────────────
export const acceptContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' })
    }

    if (contract.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the farmer can accept this contract' })
    }

    if (contract.status !== 'pending') {
      return res.status(400).json({ message: 'Contract is not in pending state' })
    }

    // make sure buyer has paid before farmer can accept
    if (!contract.paymentVerified) {
      return res.status(400).json({ message: 'Buyer has not completed payment yet' })
    }

    contract.status      = 'accepted'
    contract.escrowStatus = 'held'
    await contract.save()

    await Crop.findByIdAndUpdate(contract.cropId, {
      $inc: { stock: -contract.quantity }
    })

    res.status(200).json({ message: 'Contract accepted', contract })

  } catch (error) {
    res.status(500).json({ message: 'Failed to accept contract', error: error.message })
  }
}

// ─── REJECT CONTRACT + REFUND (farmer only) ──────────────
export const rejectContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' })
    }

    if (contract.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the farmer can reject this contract' })
    }

    if (contract.status !== 'pending') {
      return res.status(400).json({ message: 'Contract is not in pending state' })
    }

    // refund via Razorpay if payment was made
    if (contract.paymentVerified && contract.razorpayPaymentId) {
      await razorpay.payments.refund(contract.razorpayPaymentId, {
        amount: contract.totalAmount * 100  
      })
    }

    contract.status       = 'rejected'
    contract.escrowStatus = 'refunded'
    await contract.save()

    res.status(200).json({ message: 'Contract rejected and payment refunded', contract })

  } catch (error) {
    res.status(500).json({ message: 'Failed to reject contract', error: error.message })
  }
}

// ─── COMPLETE CONTRACT + RELEASE (farmer only) ───────────
export const completeContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' })
    }

    if (contract.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the farmer can complete this contract' })
    }

    if (contract.status !== 'accepted') {
      return res.status(400).json({ message: 'Contract must be accepted first' })
    }

    // in test mode — just mark as released

    contract.status       = 'completed'
    contract.escrowStatus = 'released'
    await contract.save()

    res.status(200).json({ message: 'Contract completed — payment released', contract })

  } catch (error) {
    res.status(500).json({ message: 'Failed to complete contract', error: error.message })
  }
}

// ─── CHECKOUT ────────────────────────────────────────────
export const checkout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.cropId')

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const contracts = []

    for (const item of user.cart) {
      const crop = item.cropId

      if (item.quantity > crop.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${crop.name}. Only ${crop.stock} available.`
        })
      }

      const totalAmount   = item.quantity * crop.pricePerUnit
      const razorpayOrder = await razorpay.orders.create({
        amount:   totalAmount * 100,
        currency: 'INR',
        receipt:  `receipt_${Date.now()}`,
      })

      const contract = await Contract.create({
        farmerId:        crop.farmerId,
        buyerId:         req.user._id,
        cropId:          crop._id,
        quantity:        item.quantity,
        lockedPrice:     crop.pricePerUnit,
        totalAmount,
        escrowStatus:    'pending_payment',
        razorpayOrderId: razorpayOrder.id,
      })

      contracts.push({ contract, razorpayOrderId: razorpayOrder.id, amount: totalAmount * 100 })
    }

    user.cart = []
    await user.save()

    res.status(201).json({
      message:  'Orders placed — complete payment to confirm',
      contracts,
      keyId:    process.env.RAZORPAY_KEY_ID
    })

  } catch (error) {
    res.status(500).json({ message: 'Checkout failed', error: error.message })
  }
}

// ─── GET CONTRACT STATS ──────────────────────────────────
export const getContractStats = async (req, res) => {
  try {
    const filter = req.user.role === 'farmer'
      ? { farmerId: req.user._id }
      : { buyerId:  req.user._id }

    const [total, pending, active, completed, rejected] = await Promise.all([
      Contract.countDocuments(filter),
      Contract.countDocuments({ ...filter, status: 'pending'   }),
      Contract.countDocuments({ ...filter, status: 'accepted'  }),
      Contract.countDocuments({ ...filter, status: 'completed' }),
      Contract.countDocuments({ ...filter, status: 'rejected'  }),
    ])

    res.status(200).json({ total, pending, active, completed, rejected })

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message })
  }
}