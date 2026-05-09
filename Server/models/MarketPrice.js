import mongoose from 'mongoose'

const marketPriceSchema = new mongoose.Schema({
  cropType:    { type: String, required: true },
  marketPrice: { type: Number, required: true },
  lockedPrice: { type: Number },
  date:        { type: Date, default: Date.now }
})

export default mongoose.model('MarketPrice', marketPriceSchema)