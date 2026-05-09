import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const rateLimiter = new Map()

const MAX_PREDICTIONS = 15
const WINDOW_MS = 2 * 60 * 60 * 1000 

const checkRateLimit = (userId) => {
  const now = Date.now()
  const entry = rateLimiter.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_PREDICTIONS - 1, resetAt: now + WINDOW_MS }
  }

  if (entry.count >= MAX_PREDICTIONS) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000)
    return { allowed: false, minutesLeft }
  }

  entry.count += 1
  return { allowed: true, remaining: MAX_PREDICTIONS - entry.count, resetAt: entry.resetAt }
}

export const predictCrop = async (req, res) => {
  try {
    const userId = req.user._id.toString()

    const limit = checkRateLimit(userId)
    if (!limit.allowed) {
      return res.status(429).json({
        message: `You've used all ${MAX_PREDICTIONS} predictions. Try again in ${limit.minutesLeft} minutes.`,
        minutesLeft: limit.minutesLeft
      })
    }

    const { soilType, season, region, rainfall, temperature } = req.body

    if (!soilType || !season || !region || !rainfall || !temperature) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'GROQ_API_KEY not set in .env' })
    }

    const prompt = `You are an expert agricultural advisor for Indian farmers.
Given the following farm conditions, recommend exactly 3 suitable crops.

Farm Conditions:
- Soil Type: ${soilType}
- Season: ${season}
- Region: ${region}
- Annual Rainfall: ${rainfall}mm
- Average Temperature: ${temperature}°C

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "recommendations": [
    {
      "crop": "Crop Name",
      "reason": "2-3 sentences explaining why this crop suits the given conditions",
      "expectedYield": "X-Y quintals/acre",
      "marketPrice": "Rs X-Y per quintal",
      "growthDuration": "X-Y days"
    }
  ]
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    })

    const text = completion.choices?.[0]?.message?.content
    if (!text) {
      return res.status(500).json({ message: 'Empty AI response' })
    }

    let predictions
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      predictions = JSON.parse(clean)
    } catch (e) {
      console.error('JSON parse failed. Raw:', text)
      return res.status(500).json({ message: 'AI returned invalid format', raw: text })
    }

    res.status(200).json({
      ...predictions,
      usage: {
        predictionsUsed: MAX_PREDICTIONS - limit.remaining,
        predictionsRemaining: limit.remaining,
        resetsAt: new Date(limit.resetAt).toISOString()
      }
    })

  } catch (error) {
    console.error('AI Controller Error:', error)
    res.status(500).json({ message: 'Prediction failed', error: error.message })
  }
}