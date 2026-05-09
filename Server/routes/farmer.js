// import express from 'express'
// const router = express.Router()
// export default router

import express from 'express'
import {
  addCrop,
  getMyCrops,
  updateCrop,
  deleteCrop,
  getMyOrders,
  updateOrderStatus,
  answerQuery
} from '../controllers/farmerController.js'
import protect from '../Middleware/authMiddleware.js'
import { cropValidation, validate } from "../validators/cropValidator.js"
// import { addCrop } from "../controllers/farmerController.js"

import allowOnly from '../Middleware/roleMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

// all farmer routes are protected — must be logged in and must be a farmer
router.post('/crop', protect, allowOnly('farmer'), upload.array('images', 5), cropValidation, validate, addCrop)
router.get('/crops',                protect, allowOnly('farmer'), getMyCrops)
router.put('/crop/:id',             protect, allowOnly('farmer'), upload.array('images', 5), updateCrop)
router.delete('/crop/:id',          protect, allowOnly('farmer'), deleteCrop)
router.get('/orders',               protect, allowOnly('farmer'), getMyOrders)
router.put('/order/:id/status',     protect, allowOnly('farmer'), updateOrderStatus)
router.put('/query/:id/answer',     protect, allowOnly('farmer'), answerQuery)

export default router