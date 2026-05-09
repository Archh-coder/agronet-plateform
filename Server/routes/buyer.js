// import express from 'express'
// const router = express.Router()
// export default router

import express from 'express'
import {
  getAllCrops,
  getCropById,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  addReview,
  submitQuery,
    deleteReview,    
  updateReview
} from '../controllers/buyerController.js'
import protect from '../Middleware/authMiddleware.js'
import allowOnly from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/crops',        getAllCrops)
router.get('/crop/:id',     getCropById)

router.post('/cart',              protect, allowOnly('buyer'), addToCart)
router.get('/cart',               protect, allowOnly('buyer'), getCart)
router.put('/cart/:cropId',       protect, allowOnly('buyer'), updateCartItem)
router.delete('/cart/:cropId',    protect, allowOnly('buyer'), removeFromCart)
router.post('/review/:cropId',    protect, allowOnly('buyer'), addReview)
router.post('/query/:cropId',     protect, allowOnly('buyer'), submitQuery)
router.delete('/review/:reviewId',  protect, allowOnly('buyer'), deleteReview)
router.put('/review/:reviewId',     protect, allowOnly('buyer'), updateReview)

export default router