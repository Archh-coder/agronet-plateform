
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setUser } from '../redux/authSlice'
import api from '../api/axiosInstance'

export default function Login() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/login', form)
      dispatch(setUser({
        user:  res.data.user,
        token: res.data.token
      }))
      if (res.data.user.role === 'farmer') {
        navigate('/crops')
      } else {
        navigate('/crops')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-card">
        {/* logo */}
        <div className="form-logo">🌾</div>
        <h2 className="form-title">Welcome back</h2>
        <p className="form-subtitle">Sign in to your AgroNet account</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
              placeholder='••••••••'
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="form-btn"
            type='submit'
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="form-footer">
          Don't have an account?{' '}
          <Link to='/register' className="form-link">Create one</Link>
        </p>
      </div>
    </div>
  )
}