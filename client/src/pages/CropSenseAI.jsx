import { useState } from 'react'
import api from '../api/axiosInstance'

export default function CropSenseAI() {
  const [form, setForm] = useState({
    soilType: 'Loamy',
    season: 'Summer',
    region: 'Central India',
    rainfall: '600',
    temperature: '28'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePredict = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post('/api/ai/predict', {
        soilType: form.soilType,
        season: form.season,
        region: form.region,
        rainfall: parseInt(form.rainfall),
        temperature: parseInt(form.temperature)
      })
      setResult(res.data)
      if (res.data.usage) setUsage(res.data.usage)
    } catch (err) {
      const msg = err.response?.data?.message || 'Prediction failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-page">
      <div className="ai-container">

        <div className="ai-header">
          <div className="ai-header-badge">🤖 Powered by Llama 3.3 via Groq</div>
          <h1 className="ai-title">CropSense AI</h1>
          <p className="ai-subtitle">Get AI-powered crop recommendations tailored to your farm conditions</p>
        </div>

        <div className="ai-grid">

          {/* Form */}
          <form onSubmit={handlePredict} className="ai-form-card">
            <div className="ai-form-title">🌱 Your Farm Conditions</div>

            <div className="ai-field">
              <label className="ai-label">Soil Type</label>
              <select className="ai-input" name="soilType" value={form.soilType} onChange={handleChange}>
                <option>Clay</option>
                <option>Sandy</option>
                <option>Loamy</option>
                <option>Red Soil</option>
                <option>Black Soil</option>
                <option>Alluvial</option>
              </select>
            </div>

            <div className="ai-field">
              <label className="ai-label">Season</label>
              <select className="ai-input" name="season" value={form.season} onChange={handleChange}>
                <option>Summer</option>
                <option>Winter</option>
                <option>Monsoon</option>
                <option>Rabi</option>
                <option>Kharif</option>
                <option>Zaid</option>
              </select>
            </div>

            <div className="ai-field">
              <label className="ai-label">Region</label>
              <select className="ai-input" name="region" value={form.region} onChange={handleChange}>
                <option>North India</option>
                <option>South India</option>
                <option>East India</option>
                <option>West India</option>
                <option>Central India</option>
                <option>Northeast India</option>
              </select>
            </div>

            <div className="ai-row">
              <div className="ai-field">
                <label className="ai-label">Rainfall (mm)</label>
                <input className="ai-input" type="number" name="rainfall" value={form.rainfall} onChange={handleChange} min="0" max="3000" />
              </div>
              <div className="ai-field">
                <label className="ai-label">Temperature (°C)</label>
                <input className="ai-input" type="number" name="temperature" value={form.temperature} onChange={handleChange} min="0" max="50" />
              </div>
            </div>

            {/* Usage counter */}
            {usage && (
              <div className="ai-usage">
                <span>🔢 {usage.predictionsRemaining} predictions remaining</span>
                <span>Resets at {new Date(usage.resetsAt).toLocaleTimeString()}</span>
              </div>
            )}

            <button className={`ai-btn ${loading ? 'ai-btn-disabled' : ''}`} type="submit" disabled={loading}>
              {loading
                ? <><span className="ai-spinner">⟳</span> Analyzing...</>
                : '🤖 Get AI Recommendations'}
            </button>
          </form>

          {/* Results */}
          <div className="ai-result-card">
            {error && <div className="ai-error">{error}</div>}

            {loading && (
              <div className="ai-placeholder">
                <div className="ai-loading-icon">🌿</div>
                <p className="ai-placeholder-text">Consulting AI agronomist...</p>
                <p className="ai-placeholder-sub">Analyzing soil, climate and market conditions</p>
              </div>
            )}

            {result && !loading && (
              <div>
                <div className="ai-result-title">✅ Top 3 Recommended Crops</div>
                <div className="ai-result-list">
                  {result.recommendations?.map((r, i) => (
                    <div key={i} className="ai-result-item">
                      <div className="ai-result-rank">#{i + 1}</div>
                      <div className="ai-result-body">
                        <div className="ai-result-crop">{r.crop}</div>
                        <p className="ai-result-reason">{r.reason}</p>
                        <div className="ai-result-meta">
                          <span className="ai-meta-tag">📊 {r.expectedYield}</span>
                          <span className="ai-meta-tag">💰 {r.marketPrice}</span>
                          <span className="ai-meta-tag">📅 {r.growthDuration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="ai-placeholder">
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌾</div>
                <p className="ai-placeholder-text">Ready to analyze your farm</p>
                <p className="ai-placeholder-sub">Fill in your conditions and click the button for personalized recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}