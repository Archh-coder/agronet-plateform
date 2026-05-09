
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const categories = [
  { icon: '🌾', name: 'Grains',     desc: 'Wheat, Rice, Corn' },
  { icon: '🥦', name: 'Vegetables', desc: 'Fresh & Organic' },
  { icon: '🍎', name: 'Fruits',     desc: 'Seasonal Produce' },
  { icon: '🫘', name: 'Pulses',     desc: 'Lentils, Beans' },
  { icon: '🌶️', name: 'Spices',     desc: 'Premium Quality' },
  { icon: '📦', name: 'Other',      desc: 'More Categories' },
]

const features = [
  { icon: '📄', title: 'Assured Contracts',   desc: 'Lock in prices before harvest. No more market uncertainty for farmers or buyers.' },
  { icon: '🤖', title: 'AI Crop Prediction',  desc: 'CropSense AI recommends the best crops based on your soil, region and season.' },
  { icon: '💰', title: 'Price Locking',        desc: 'Buyers lock prices today. Farmers get guaranteed income. Win-win for both.' },
  { icon: '🗺️', title: 'Location Mapping',    desc: 'See exactly where your crops are grown with interactive farm maps.' },
  { icon: '📊', title: 'Market Analytics',     desc: 'Track price trends with live graphs. Make smarter trading decisions.' },
  { icon: '🔒', title: 'Escrow Protection',    desc: 'Payments held securely until delivery is confirmed. Zero risk.' },
]

const stats = [
  { number: '10,000+', label: 'Farmers' },
  { number: '50,000+', label: 'Buyers' },
  { number: '₹2Cr+',   label: 'Traded' },
  { number: '99%',     label: 'Satisfaction' },
]

export default function Home() {
  const { user } = useSelector((state) => state.auth)

  return (
    <div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">🌱 India's #1 Contract Farming Platform</div>
          <h1 className="hero-title">
            Connecting Farmers &<br />
            <span className="hero-green">Buyers Directly</span>
          </h1>
          <p className="hero-sub">
            AgroNet eliminates middlemen. Farmers get fair prices,
            buyers get fresh produce — through secure, assured contracts.
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to='/register' className="hero-btn-primary">
                  Start Trading →
                </Link>
                <Link to='/crops' className="hero-btn-secondary">
                  Browse Crops
                </Link>
              </>
            ) : user.role === 'farmer' ? (
              <>
                <Link to='/farmer/dashboard' className="hero-btn-primary">
                  Go to Dashboard →
                </Link>
                <Link to='/ai' className="hero-btn-secondary">
                  Try CropSense AI
                </Link>
              </>
            ) : (
              <>
                <Link to='/crops' className="hero-btn-primary">
                  Browse Crops →
                </Link>
                <Link to='/buyer/dashboard' className="hero-btn-secondary">
                  My Dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        {/* hero illustration */}
        <div className="hero-image">
          <div className="hero-card">
            <div className="hero-card-icon">🌾</div>
            <div className="hero-card-text">
              <div className="hero-card-title">Wheat — Punjab</div>
              <div className="hero-card-price">₹28/kg</div>
              <div className="hero-card-badge">Contract Available</div>
            </div>
          </div>
          <div className="hero-card" style={{marginTop: '16px', marginLeft: '40px'}}>
            <div className="hero-card-icon">🍅</div>
            <div className="hero-card-text">
              <div className="hero-card-title">Tomato — Karnataka</div>
              <div className="hero-card-price">₹15/kg</div>
              <div className="hero-card-badge">Price Locked</div>
            </div>
          </div>
          <div className="hero-card" style={{marginTop: '16px'}}>
            <div className="hero-card-icon">🫘</div>
            <div className="hero-card-text">
              <div className="hero-card-title">Lentils — MP</div>
              <div className="hero-card-price">₹75/kg</div>
              <div className="hero-card-badge">New Contract</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="section-inner">
          <div className="section-badge">Browse by Category</div>
          <h2 className="section-title">What are you looking for?</h2>
          <div className="category-grid">
            {categories.map((c) => (
              <Link
                to={`/crops?category=${c.name}`}
                key={c.name}
                className="category-card"
              >
                <div className="category-icon">{c.icon}</div>
                <div className="category-name">{c.name}</div>
                <div className="category-desc">{c.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <div className="section-inner">
          <div className="section-badge">Simple Process</div>
          <h2 className="section-title">How AgroNet Works</h2>
          <div className="steps-row">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-icon">📝</div>
              <div className="step-title">Register</div>
              <div className="step-desc">Sign up as a farmer or buyer in under 2 minutes</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-icon">🔍</div>
              <div className="step-title">Browse & Match</div>
              <div className="step-desc">Buyers browse crops, farmers list their produce</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-icon">📄</div>
              <div className="step-title">Sign Contract</div>
              <div className="step-desc">Lock in price and quantity with a secure contract</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-icon">🚚</div>
              <div className="step-title">Deliver & Pay</div>
              <div className="step-desc">Escrow releases payment on confirmed delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="section-inner">
          <div className="section-badge">Why AgroNet</div>
          <h2 className="section-title">Everything you need to trade smarter</h2>
          <div className="feature-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to transform how you trade crops?</h2>
          <p className="cta-sub">Join thousands of farmers and buyers already on AgroNet</p>
          <div className="hero-buttons">
            <Link to='/register' className="cta-btn">
              Get Started for Free →
            </Link>
            <Link to='/crops' className="cta-btn-secondary">
              Browse Crops
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">🌾 AgroNet</div>
          <div className="footer-text">
            © 2024 AgroNet. Connecting farmers and buyers across India.
          </div>
          <div className="footer-links">
            <Link to='/crops'  className="footer-link">Browse</Link>
            <Link to='/market' className="footer-link">Market</Link>
            <Link to='/ai'     className="footer-link">AI</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}