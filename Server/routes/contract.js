// import express from 'express'
// const router = express.Router()
// export default router

import express from 'express'
import {
  createContract,
  getMyContracts,
  getContractById,
  acceptContract,
  rejectContract,
  completeContract,
  checkout,
    getContractStats,
    verifyPayment

} from '../controllers/contractController.js'
import protect from '../Middleware/authMiddleware.js'

const router = express.Router()

// both farmers and buyers can access these
router.post('/create',           protect, createContract)
router.post('/verify-payment', protect, verifyPayment)
router.get('/my-contracts',      protect, getMyContracts)
router.get('/stats', protect, getContractStats)
router.get('/:id',               protect, getContractById)

// only farmers can accept/reject/complete
router.put('/:id/accept',        protect, acceptContract)
router.put('/:id/reject',        protect, rejectContract)
router.put('/:id/complete',      protect, completeContract)

// buyers create orders via checkout
router.post('/checkout',         protect, checkout)

export default router