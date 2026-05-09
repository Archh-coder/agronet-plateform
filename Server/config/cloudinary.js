import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

console.log('Testing Cloudinary...')
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME)

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Agronet',         // images go into this folder in your cloudinary dashboard
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]  // auto resize
  }
})

export const upload = multer({ storage })
export default cloudinary