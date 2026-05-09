import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  email:             { type: String, required: true, unique: true },
  password:          { type: String, required: true },
  role:              { type: String, enum: ['farmer', 'buyer'], required: true },
  isVerified:        { type: Boolean, default: false },
  avatar:     { type: String, default: '' },
    cart: [
    {
      cropId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true })

export default mongoose.model('User', userSchema)