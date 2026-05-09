import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/authSlice'
import { clearCart } from '../redux/cartSlice'
import api from '../api/axiosInstance'
import { useState, useRef, useEffect } from 'react'

function AgroNetLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 480 520" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      {/* Ground dashes */}
      <line x1="80"  y1="490" x2="140" y2="490" stroke="#4C8B3D" strokeWidth="30" strokeLinecap="round"/>
      <line x1="200" y1="490" x2="280" y2="490" stroke="#4C8B3D" strokeWidth="30" strokeLinecap="round"/>
      <line x1="340" y1="490" x2="400" y2="490" stroke="#4C8B3D" strokeWidth="30" strokeLinecap="round"/>
      {/* Main stem */}
      <line x1="240" y1="490" x2="240" y2="305" stroke="#4C8B3D" strokeWidth="30" strokeLinecap="round"/>
      {/* Left leaf */}
      <path d="M240 375 C205 338 125 328 104 368 C83 408 143 452 203 422 C223 412 240 393 240 375Z"
            stroke="#4C8B3D" strokeWidth="28" fill="none" strokeLinejoin="round"/>
      {/* Right leaf */}
      <path d="M240 375 C275 338 355 328 376 368 C397 408 337 452 277 422 C257 412 240 393 240 375Z"
            stroke="#4C8B3D" strokeWidth="28" fill="none" strokeLinejoin="round"/>
      {/* Center leaf */}
      <path d="M240 305 C212 268 212 208 240 178 C268 208 268 268 240 305Z"
            stroke="#4C8B3D" strokeWidth="28" fill="none" strokeLinejoin="round"/>
      {/* Center leaf vein */}
      <line x1="240" y1="295" x2="240" y2="188" stroke="#4C8B3D" strokeWidth="14" strokeLinecap="round"/>
      {/* Pin stems */}
      <line x1="155" y1="228" x2="196" y2="270" stroke="#4C8B3D" strokeWidth="28" strokeLinecap="round"/>
      <line x1="325" y1="228" x2="284" y2="270" stroke="#4C8B3D" strokeWidth="28" strokeLinecap="round"/>
      <line x1="240" y1="178" x2="240" y2="112" stroke="#4C8B3D" strokeWidth="28" strokeLinecap="round"/>
      {/* Left pin circle */}
      <circle cx="116" cy="190" r="52" stroke="#4C8B3D" strokeWidth="28" fill="none"/>
      {/* Right pin circle */}
      <circle cx="364" cy="190" r="52" stroke="#4C8B3D" strokeWidth="28" fill="none"/>
      {/* Center pin circle */}
      <circle cx="240" cy="66"  r="58" stroke="#4C8B3D" strokeWidth="28" fill="none"/>
      {/* Center dot */}
      <circle cx="240" cy="66"  r="18" fill="#4C8B3D"/>
    </svg>
  )
}

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch (err) {
      console.log(err)
    } finally {
      dispatch(logout())
      dispatch(clearCart())
      navigate('/')
      setMobileMenuOpen(false)
      setUserMenuOpen(false)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to='/' className="navbar-logo" onClick={closeMobileMenu}>
          <AgroNetLogo />
          <span className="navbar-logo-text">AgroNet</span>
        </Link>

        {/* Center links — desktop */}
        <div className="navbar-links">
          <Link to='/crops'  className="navbar-link">Browse Crops</Link>
          <Link to='/market' className="navbar-link">Market Prices</Link>
          {user && <Link to='/ai' className="navbar-link">CropSense AI</Link>}
          <Link to='/faq'    className="navbar-link">FAQ</Link>
        </div>

        {/* Right side — desktop */}
        <div className="navbar-right">
          {!user ? (
            <>
              <Link to='/login'    className="navbar-link-btn">Sign In</Link>
              <Link to='/register' className="navbar-btn">Get Started</Link>
            </>
          ) : (
            <div className="navbar-user-menu" ref={userMenuRef}>
              <button
                className="navbar-user-trigger"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <span className="navbar-user-badge">
                  {user.role === 'farmer' ? '🌾' : '🛒'} {user.name}
                </span>
                <span className={`navbar-chevron ${userMenuOpen ? 'open' : ''}`}>▾</span>
              </button>

              {userMenuOpen && (
                <div className="navbar-dropdown">
                  {user.role === 'farmer' && (
                    <>
                      <Link to='/crops'            className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>🌾 My Listings</Link>
                      <Link to='/farmer/add-crop'  className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>➕ Add Crop</Link>
                      <Link to='/farmer/contracts' className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>📦 Orders</Link>
                    </>
                  )}
                  {user.role === 'buyer' && (
                    <>
                      <Link to='/buyer/cart'      className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>🛒 Cart</Link>
                      <Link to='/buyer/contracts' className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>📄 My Contracts</Link>
                    </>
                  )}
                  <div className="navbar-dropdown-divider" />
                  <Link to='/profile' className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>👤 Profile</Link>
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`navbar-mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-links">
          <Link to='/crops'  className="navbar-link" onClick={closeMobileMenu}>Browse Crops</Link>
          <Link to='/market' className="navbar-link" onClick={closeMobileMenu}>Market Prices</Link>
          {user && <Link to='/ai' className="navbar-link" onClick={closeMobileMenu}>CropSense AI</Link>}
          <Link to='/faq'    className="navbar-link" onClick={closeMobileMenu}>FAQ</Link>
        </div>

        {!user ? (
          <div className="navbar-mobile-right">
            <Link to='/login'    className="navbar-link-btn" onClick={closeMobileMenu}>Sign In</Link>
            <Link to='/register' className="navbar-btn"      onClick={closeMobileMenu}>Get Started</Link>
          </div>
        ) : (
          <div className="navbar-mobile-user">
            <div className="navbar-user-badge">
              {user.role === 'farmer' ? '🌾' : '🛒'} {user.name}
            </div>
            {user.role === 'farmer' && (
              <>
                <Link to='/crops'            className="navbar-link" onClick={closeMobileMenu}>🌾 My Listings</Link>
                <Link to='/farmer/add-crop'  className="navbar-link" onClick={closeMobileMenu}>➕ Add Crop</Link>
                <Link to='/farmer/contracts' className="navbar-link" onClick={closeMobileMenu}>📦 Orders</Link>
              </>
            )}
            {user.role === 'buyer' && (
              <>
                <Link to='/buyer/cart'      className="navbar-link" onClick={closeMobileMenu}>🛒 Cart</Link>
                <Link to='/buyer/contracts' className="navbar-link" onClick={closeMobileMenu}>📄 My Contracts</Link>
              </>
            )}
            <Link to='/profile' className="navbar-link" onClick={closeMobileMenu}>👤 Profile</Link>
            <button className="navbar-logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}