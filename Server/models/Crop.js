import mongoose from 'mongoose'

const faqSchema = new mongoose.Schema({
  question:   { type: String, required: true },
  answer:     { type: String, default: '' },
  isAnswered: { type: Boolean, default: false }
})

const cropSchema = new mongoose.Schema({
  farmerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  category:     { type: String, enum: ['Grains','Vegetables','Fruits','Pulses','Spices','Other'], required: true },
  images:       [{ type: String }],
  description:  { type: String },
  pricePerUnit: { type: Number, required: true },
  stock:        { type: Number, required: true },
  minOrderQty:  { type: Number, required: true },
  location:     { lat: Number, lng: Number },
  faqs:         [faqSchema]
}, { timestamps: true })

export default mongoose.model('Crop', cropSchema)