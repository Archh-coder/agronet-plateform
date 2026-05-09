
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'buyer' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/register', form)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-logo">🌾</div>
        <h2 className="form-title">Join AgroNet</h2>
        <p className="form-subtitle">Create your account to get started</p>

        {error   && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type='text'
              name='name'
              placeholder='John Farmer'
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type='email'
              name='email'
              placeholder='you@example.com'
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type='password'
              name='password'
              placeholder='Min 6 characters'
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* role selector */}
          <div className="form-field">
            <label className="form-label">I am a</label>
            <div className="form-role-row">
              <div
                className={form.role === 'buyer' ? 'form-role-active' : 'form-role'}
                onClick={() => setForm({ ...form, role: 'buyer' })}
              >
                🛒 Buyer
              </div>
              <div
                className={form.role === 'farmer' ? 'form-role-active' : 'form-role'}
                onClick={() => setForm({ ...form, role: 'farmer' })}
              >
                🌾 Farmer
              </div>
            </div>
          </div>

          <button
            className="form-btn"
            type='submit'
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="form-footer">
          Already have an account?{' '}
          <Link to='/login' className="form-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}