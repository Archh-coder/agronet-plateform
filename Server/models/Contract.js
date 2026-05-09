import mongoose from 'mongoose'

const contractSchema = new mongoose.Schema({
  farmerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  quantity:         { type: Number, required: true },
  lockedPrice:      { type: Number, required: true },   // price frozen at contract time
  totalAmount:      { type: Number, required: true },   // quantity × lockedPrice
  status:           { type: String, enum: ['pending','accepted','rejected','completed'], default: 'pending' },
  escrowStatus: { type: String, enum: ['pending_payment', 'held', 'released', 'refunded'], default: 'pending_payment' },
  startDate:        { type: Date },
  endDate:          { type: Date },
  razorpayOrderId:   { type: String },
razorpayPaymentId: { type: String },
paymentVerified:   { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Contract', contractSchema)