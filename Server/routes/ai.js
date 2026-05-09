// import express from 'express'
// const router = express.Router()
// export default router

import express from 'express'
import { predictCrop } from '../controllers/aiController.js'
import protect from '../Middleware/authMiddleware.js'

const router = express.Router()

// protected — only logged in users can use AI prediction
router.post('/predict', protect, predictCrop)

export default router