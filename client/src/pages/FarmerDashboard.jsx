import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axiosInstance'

export default function FarmerDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [crops, setCrops] = useState([])
  const [orders, setOrders] = useState([])
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('Fetching farmer data...')
      const cropsRes = await api.get('/api/farmer/crops')
      console.log('Crops response:', cropsRes.data)
      setCrops(cropsRes.data)

      const ordersRes = await api.get('/api/contract/my-contracts')
      console.log('Orders response:', ordersRes.data)
      setOrders(ordersRes.data)

      const pricesRes = await api.get('/api/market/prices/history')
      console.log('Prices response:', pricesRes.data)
      setPrices(
        pricesRes.data
          .slice(-10)
          .map(p => ({
            date: new Date(p.date).toLocaleDateString(),
            price: p.marketPrice
          }))
      )
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (cropId) => {
    if (!window.confirm('Delete this crop listing?')) return
    setDeleting(cropId)
    try {
      await api.delete(`/api/farmer/crop/${cropId}`)
      setCrops(crops.filter(c => c._id !== cropId))
    } catch (err) {
      alert('Failed to delete crop')
    } finally {
      setDeleting(null)
    }
  }

const handleOrderStatus = async (orderId, status) => {
  try {
    await api.put(`/api/contract/${orderId}/${status}`)  
    fetchData()
  } catch (err) {
    alert(`Failed to ${status} contract`)
  }
}

  // stats
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const activeContracts = orders.filter(o => o.status === 'accepted').length

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: '48px' }}>🌾</div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* {WELCOME } */}
        <div className="dashboard-welcome">
          <div className="dashboard-welcome-text">
            <h1>Welcome back, {user?.name} 🌾</h1>
            <p>Here's what's happening on your farm today</p>
          </div>
          <Link to='/farmer/add-crop' className="dashboard-add-btn">
            + Add New Crop
          </Link>
        </div>

        {/* ── STATS ── */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌾</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#14532d', marginBottom: '4px' }}>{crops.length}</div>
            <div className="stat-label">Total Listings</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#14532d', marginBottom: '4px' }}>{pendingOrders}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#14532d', marginBottom: '4px' }}>{activeContracts}</div>
            <div className="stat-label">Active Contracts</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#14532d', marginBottom: '4px' }}>₹{totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {/* ── CHART ── */}
        {prices.length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section-title">Market Price Trends</div>
            <div className="chart-container">
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={prices}>
                  <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='price'
                    stroke='#16a34a'
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── PENDING ORDERS ── */}
        {orders.filter(o => o.status === 'pending').length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section-title">📋 Pending Order Requests</div>
            {orders
              .filter(o => o.status === 'pending')
              .map(order => (
                <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#14532d', marginBottom: '4px' }}>{order.cropId?.name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      By {order.buyerId?.name} · {order.quantity}kg · ₹{order.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                      onClick={() => handleOrderStatus(order._id, 'accept')}
                    >
                      ✓ Accept
                    </button>
                    <button
                      style={{ background: '#fff', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                      onClick={() => handleOrderStatus(order._id, 'reject')}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── MY CROPS ── */}
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div className="dashboard-section-title" style={{ margin: 0 }}>🌾 My Crop Listings</div>
            <Link to='/farmer/add-crop' style={{ color: '#16a34a', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
              + Add Crop
            </Link>
          </div>

          {crops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌱</div>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>No crops listed yet</p>
              <Link to='/farmer/add-crop' className="dashboard-add-btn">
                Add Your First Crop
              </Link>
            </div>
          ) : (
            <div className="crops-list">
              {crops.map(crop => (
                <div key={crop._id} className="crop-item">
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {crop.images?.[0] ? (
                      <img
                        src={crop.images[0]}
                        alt={crop.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ fontSize: '24px' }}>🌾</div>
                    )}
                  </div>
                  <div className="crop-item-info">
                    <div className="crop-item-name">{crop.name}</div>
                    <div className="crop-item-detail">
                      ₹{crop.pricePerUnit}/kg · {crop.stock}kg stock · {crop.category}
                    </div>
                  </div>
                  <div className="crop-item-actions">
                    <button
                      className={`crop-item-btn ${deleting === crop._id ? 'disabled' : 'crop-item-delete'}`}
                      onClick={() => handleDelete(crop._id)}
                      disabled={deleting === crop._id}
                      style={{ background: deleting === crop._id ? '#f3f4f6' : '#fef2f2', color: deleting === crop._id ? '#9ca3af' : '#dc2626' }}
                    >
                      {deleting === crop._id ? '...' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}