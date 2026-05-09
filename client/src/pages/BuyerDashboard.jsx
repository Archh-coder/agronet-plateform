
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../api/axiosInstance'
import { contractService } from '../api/services'


export default function BuyerDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchContracts() }, [])

  const fetchContracts = async () => {
    try {
      const res = await contractService.getMy()
      setContracts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

const stats = [
  { icon: '📋', label: 'Total Orders', value: contracts.length, link: '/buyer/contracts', color: '#6b7280' },
  { icon: '⏳', label: 'Pending Approval', value: contracts.filter(c => c.status === 'pending').length, link: '/buyer/contracts', color: '#d97706' },
  { icon: '✅', label: 'Active Contracts', value: contracts.filter(c => c.status === 'accepted').length, link: '/buyer/contracts', color: '#16a34a' },
  { icon: '🎉', label: 'Completed', value: contracts.filter(c => c.status === 'completed').length, link: '/buyer/contracts', color: '#2563eb' },
]

  const pendingContracts = contracts.filter(c => c.status === 'pending')
  const activeContracts = contracts.filter(c => c.status === 'accepted')

  if (loading) return (
    <div className="dashboard-center">
      <div style={{ fontSize: '48px' }}>🛒</div>
      <p>Loading dashboard...</p>
    </div>
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        <div className="dashboard-welcome">
          <div>
            <h1 className="dashboard-welcome-text">Welcome, {user?.name} 🛒</h1>
            <p className="dashboard-subtitle">Your orders and contracts at a glance</p>
          </div>
          <Link to='/crops' className="dashboard-add-btn">
            + Browse Crops
          </Link>
        </div>

        {/* stats */}
   <div className="dashboard-stats">
  {stats.map((s, i) => (
    <Link key={i} to={s.link} className="stat-card" style={{borderTop: `3px solid ${s.color}`}}>
      <div className="stat-icon">{s.icon}</div>
      <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
      <div className="stat-label">{s.label}</div>
      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>View all →</div>
    </Link>
  ))}
</div>

        {/* pending orders */}
        {pendingContracts.length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section-title">⏳ Pending Orders (Awaiting Farmer Approval)</div>
            <div className="order-list">
              {pendingContracts.map(c => (
                <div key={c._id} className="order-item">
                  <div className="order-left">
                    <div className="order-crop">{c.cropId?.name}</div>
                    <div className="order-meta">
                      {c.quantity}kg @ ₹{c.lockedPrice}/kg = ₹{c.totalAmount?.toLocaleString()}
                    </div>
                    <div className="order-farmer">Farmer: {c.farmerId?.name}</div>
                  </div>
                  <Link to={`/contract/${c._id}`} className="view-link">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* active contracts */}
        {activeContracts.length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section-title">✅ Active Contracts (Confirmed)</div>
            <div className="order-list">
              {activeContracts.map(c => (
                <div key={c._id} className="order-item">
                  <div className="order-left">
                    <div className="order-crop">{c.cropId?.name}</div>
                    <div className="order-meta">
                      {c.quantity}kg locked at ₹{c.lockedPrice}/kg
                    </div>
                    <div className="order-status">
                      Escrow: {c.escrowStatus === 'held' ? '💰 Held' : c.escrowStatus === 'released' ? '✅ Released' : '🔄 Refunded'}
                    </div>
                  </div>
                  <Link to={`/contract/${c._id}`} className="view-link">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* quick links */}
        {contracts.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🌾</div>
            <p className="empty-text">No orders yet</p>
            <p className="empty-sub">Start by browsing crops and placing an order</p>
            <Link to='/crops' className="dashboard-add-btn">Browse Crops</Link>
          </div>
        )}

      </div>
    </div>
  )
}