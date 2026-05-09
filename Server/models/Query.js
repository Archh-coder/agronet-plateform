import mongoose from 'mongoose'

const querySchema = new mongoose.Schema({
  cropId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  farmerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question:   { type: String, required: true },
  answer:     { type: String, default: '' },
  isAnswered: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Query', querySchema)