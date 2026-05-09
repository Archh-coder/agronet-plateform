// import express from 'express'
// const router = express.Router()
// export default router

import express from 'express'
import {
  getCurrentPrices,
  getPriceHistory,
  updateMarketPrice,
  lockPrice
} from '../controllers/marketController.js'
import protect from '../Middleware/authMiddleware.js'
import allowOnly from '../Middleware/roleMiddleware.js'
import { getCrops } from "../controllers/marketController.js"

const router = express.Router()

// public — anyone can view prices
router.get('/prices',         getCurrentPrices)
router.get('/prices/history', getPriceHistory)


router.get("/", (req, res) => {
    res.send("Market route working")
})
router.get("/", getCrops)

// protected — only farmers can update market prices
router.post('/prices/update', protect, allowOnly('farmer'), updateMarketPrice)
router.post('/prices/lock',   protect, lockPrice)

export default router