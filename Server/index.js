import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'

import authRoutes     from './routes/auth.js'
import farmerRoutes   from './routes/farmer.js'
import buyerRoutes    from './routes/buyer.js'
import contractRoutes from './routes/contract.js'
import aiRoutes       from './routes/ai.js'
import marketRoutes   from './routes/market.js'

dotenv.config()
connectDB()

const app = express()

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(helmet())
app.use(morgan('dev'))
app.use(limiter)
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',     authRoutes)
app.use('/api/farmer',   farmerRoutes)
app.use('/api/buyer',    buyerRoutes)
app.use('/api/contract', contractRoutes)
app.use('/api/ai',       aiRoutes)
app.use('/api/market',   marketRoutes)

app.get('/', (req, res) => res.send('AgroNet API running'))

app.get("/test-market", (req, res) => {
  res.send("Market route connected")
})

// temporary — delete after testing
app.get('/test-ai', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const result = await genAI.listModels()
    res.json(result)
  } catch (err) {
    res.json({ error: err.message })
  }
})

app.listen(8080, () => console.log('Server running on port 8080'))