import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { sendVerificationEmail } from '../config/mailer.js'

// REGISTER 
export const register = async (req, res) => {
  
  try {
    const { name, email, password, role } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    
    
    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
    })
    
    res.status(201).json({
      message: 'Account created. You can now login to  your account.'
    })

  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
}

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({ verificationToken: token })
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' })
    }
    
    user.isVerified = true
    user.verificationToken = undefined
    await user.save()
    
    res.status(200).json({ message: 'Email verified successfully. You can now login.' })
    
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message })
  }
}


export const login = async (req, res) => {
  console.log('Login attempt:', req.body)  
  try {
        console.log('🔍 Login attempt:', req.body)  // ← ADD THIS

    const { email, password } = req.body

 
    const user = await User.findOne({ email })
        console.log('👤 User found:', user ? 'YES' : 'NO')  // ← ADD THIS

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password)
        console.log('🔑 Password match:', isMatch)  // ← ADD THIS

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // create JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // store token in cookie
    res.cookie('token', token, {
      httpOnly: true,   
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000  
    })

    res.status(200).json({
      message: 'Login successful',
      token,  
      user: {
        _id:  user._id,
        name: user.name,
        email: user.email,
        role:  user.role
      }
    })

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

// LOGOUT 
export const logout = (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ message: 'Logged out successfully' })
}

// GET CURRENT USER 
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error: error.message })
  }
}

// UPDATE PROFILE 
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body

    const existing = await User.findOne({ email })
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    ).select('-password')

    res.status(200).json({ message: 'Profile updated', user })

  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message })
  }
}

// CHANGE PASSWORD 
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.status(200).json({ message: 'Password changed successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error: error.message })
  }
}

// DELETE ACCOUNT 
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.clearCookie('token')
    res.status(200).json({ message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message })
  }
}

//  UPDATE AVATAR 
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path }, 
      { new: true }
    ).select('-password')

    res.status(200).json({ message: 'Avatar updated', avatar: user.avatar })

  } catch (error) {
    res.status(500).json({ message: 'Failed to update avatar', error: error.message })
  }
}