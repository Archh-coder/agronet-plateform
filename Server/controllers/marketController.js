import MarketPrice from '../models/MarketPrice.js'
import Crop from '../models/Crop.js'

// ─── GET CURRENT MARKET PRICES ───────────────────────────
export const getCurrentPrices = async (req, res) => {
  try {
    // get the latest price for each crop type
    const prices = await MarketPrice.aggregate([
      { $sort: { date: -1 } },  // newest first
      {
        $group: {
          _id: '$cropType',
          marketPrice: { $first: '$marketPrice' },
          date: { $first: '$date' }
        }
      }
    ])

    res.status(200).json(prices)

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch prices', error: error.message })
  }
}

// ─── GET PRICE HISTORY (for Recharts graph) ──────────────
export const getPriceHistory = async (req, res) => {
  try {
    const { cropType, days = 30 } = req.query

    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - days)

    const filter = { date: { $gte: dateLimit } }
    if (cropType && cropType !== 'All') {
      filter.cropType = cropType
    }

    const history = await MarketPrice.find(filter).sort({ date: 1 })

    res.status(200).json(history)

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message })
  }
}

// ─── UPDATE MARKET PRICE (admin/farmer can update) ───────
export const updateMarketPrice = async (req, res) => {
  try {
    const { cropType, marketPrice } = req.body

    await MarketPrice.create({
      cropType,
      marketPrice,
      date: new Date()
    })

    res.status(201).json({ message: 'Market price updated successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Failed to update price', error: error.message })
  }
}

// ─── LOCK PRICE (when contract is created) ───────────────
export const lockPrice = async (req, res) => {
  try {
    const { cropType, lockedPrice } = req.body

    await MarketPrice.create({
      cropType,
      marketPrice: lockedPrice,  // at time of locking, they're the same
      lockedPrice,
      date: new Date()
    })

    res.status(201).json({ message: 'Price locked successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Failed to lock price', error: error.message })
  }
}

// import Crop from "../models/crop.js"

export const getCrops = async (req, res) => {
  const { category, search } = req.query

  let query = {}

  if (category) {
    query.category = category
  }

  if (search) {
    query.name = { $regex: search, $options: "i" }
  }

  const crops = await Crop.find(query)

  res.json(crops)
}