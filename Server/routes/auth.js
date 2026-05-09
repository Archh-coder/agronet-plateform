import express from 'express'
import {
  register,
  login,
  verifyEmail,
  logout,
  getMe,
  updateProfile,  
  changePassword, 
  deleteAccount ,
  updateAvatar 
} from '../controllers/authController.js'
import protect from '../Middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'  


const router = express.Router()

router.post('/register', register)
router.post('/login',    login)
router.get('/verify/:token', verifyEmail)
router.post('/logout',   logout)
router.get('/me',        protect, getMe)
router.put('/profile',  protect, updateProfile)
router.put('/password', protect, changePassword)
router.put('/avatar', protect, upload.single('avatar'), updateAvatar)
router.delete('/account', protect, deleteAccount)

export default router