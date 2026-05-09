

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosInstance'

const STATUS_TABS = ['all', 'pending', 'accepted', 'completed', 'rejected']

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#d97706', bg: '#fef3c7', icon: '⏳' },
  accepted:  { label: 'Active',    color: '#16a34a', bg: '#dcfce7', icon: '✅' },
  completed: { label: 'Completed', color: '#2563eb', bg: '#dbeafe', icon: '🎉' },
  rejected:  { label: 'Rejected',  color: '#dc2626', bg: '#fee2e2', icon: '✗'  },
}

export default function FarmerContracts() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchContracts() }, [])

  const fetchContracts = async () => {
    try {
      const res = await api.get('/api/contract/my-contracts')
      setContracts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (contractId, action) => {
    setActionLoading(contractId + action)
    try {
      await api.put(`/api/contract/${contractId}/${action}`)
      await fetchContracts()
    } catch (err) {
      alert(`Failed to ${action} contract`)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = activeTab === 'all'
    ? contracts
    : contracts.filter(c => c.status === activeTab)

  const counts = {
    all:       contracts.length,
    pending:   contracts.filter(c => c.status === 'pending').length,
    accepted:  contracts.filter(c => c.status === 'accepted').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    rejected:  contracts.filter(c => c.status === 'rejected').length,
  }

  if (loading) return (
    <div style={s.center}>
      <div style={{ fontSize: '48px' }}>🌾</div>
      <p style={{ color: '#6b7280' }}>Loading contracts...</p>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>My Contracts</h1>
            <p style={s.subtitle}>Manage buyer orders and contract requests</p>
          </div>
          <Link to='/farmer/dashboard' style={s.backBtn}>← Dashboard</Link>
        </div>

        {/* stats */}
        <div style={s.statsRow}>
          {['pending', 'accepted', 'completed', 'rejected'].map(status => {
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={status} style={{ ...s.statCard, borderTop: `3px solid ${cfg.color}` }}>
                <div style={{ fontSize: '22px' }}>{cfg.icon}</div>
                <div style={{ ...s.statNum, color: cfg.color }}>{counts[status]}</div>
                <div style={s.statLabel}>{cfg.label}</div>
              </div>
            )
          })}
        </div>

        {/* tabs */}
        <div style={s.tabs}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...s.tab,
                ...(activeTab === tab ? s.tabActive : {})
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{
                ...s.tabCount,
                background: activeTab === tab ? '#16a34a' : '#e5e7eb',
                color:      activeTab === tab ? '#fff'     : '#6b7280',
              }}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* contract list */}
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>📋</div>
            <p style={s.emptyText}>No {activeTab === 'all' ? '' : activeTab} contracts yet</p>
          </div>
        ) : (
          <div style={s.list}>
            {filtered.map(c => {
              const cfg = STATUS_CONFIG[c.status] || {}
              return (
                <div key={c._id} style={s.card}>

                  {/* top row */}
                  <div style={s.cardTop}>
                    <div style={s.cropInfo}>
                      {c.cropId?.images?.[0] && (
                        <img src={c.cropId.images[0]} alt='' style={s.cropImg} />
                      )}
                      <div>
                        <div style={s.cropName}>{c.cropId?.name || 'Crop'}</div>
                        <div style={s.buyerName}>Buyer: {c.buyerId?.name}</div>
                        <div style={s.buyerEmail}>{c.buyerId?.email}</div>
                      </div>
                    </div>
                    <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* details */}
                  <div style={s.details}>
                    <div style={s.detailItem}>
                      <span style={s.detailLabel}>Quantity</span>
                      <span style={s.detailValue}>{c.quantity} kg</span>
                    </div>
                    <div style={s.detailItem}>
                      <span style={s.detailLabel}>Price/kg</span>
                      <span style={s.detailValue}>₹{c.lockedPrice}</span>
                    </div>
                    <div style={s.detailItem}>
                      <span style={s.detailLabel}>Total</span>
                      <span style={{ ...s.detailValue, color: '#16a34a', fontWeight: '700' }}>
                        ₹{c.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div style={s.detailItem}>
                      <span style={s.detailLabel}>Escrow</span>
                      <span style={s.detailValue}>
                        {c.escrowStatus === 'held'     ? '💰 Held'
                        : c.escrowStatus === 'released' ? '✅ Released'
                        : '🔄 Refunded'}
                      </span>
                    </div>
                    <div style={s.detailItem}>
                      <span style={s.detailLabel}>Date</span>
                      <span style={s.detailValue}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* actions */}
                  <div style={s.actions}>
                    <Link to={`/contract/${c._id}`} style={s.viewBtn}>View Details →</Link>

                    {c.status === 'pending' && (
                      <>
                        <button
                          style={s.acceptBtn}
                          disabled={!!actionLoading}
                          onClick={() => handleAction(c._id, 'accept')}
                        >
                          {actionLoading === c._id + 'accept' ? '...' : '✓ Accept'}
                        </button>
                        <button
                          style={s.rejectBtn}
                          disabled={!!actionLoading}
                          onClick={() => handleAction(c._id, 'reject')}
                        >
                          {actionLoading === c._id + 'reject' ? '...' : '✗ Reject'}
                        </button>
                      </>
                    )}

                    {c.status === 'accepted' && (
                      <button
                        style={s.completeBtn}
                        disabled={!!actionLoading}
                        onClick={() => handleAction(c._id, 'complete')}
                      >
                        {actionLoading === c._id + 'complete' ? '...' : '🎉 Mark Complete'}
                      </button>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  page:      { minHeight: '100vh', background: '#f8faf5', padding: '32px 24px' },
  container: { maxWidth: '900px', margin: '0 auto' },
  center:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' },

  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  title:    { fontSize: '26px', fontWeight: '700', color: '#14532d', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  backBtn:  { color: '#16a34a', fontWeight: '600', textDecoration: 'none', fontSize: '14px' },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statNum:  { fontSize: '24px', fontWeight: '700', margin: '6px 0 4px' },
  statLabel:{ fontSize: '12px', color: '#6b7280' },

  tabs:     { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive:{ background: '#f0fdf4', border: '1px solid #16a34a', color: '#14532d', fontWeight: '600' },
  tabCount: { borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '600' },

  list:  { display: 'flex', flexDirection: 'column', gap: '16px' },
  card:  { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },

  cardTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' },
  cropInfo:  { display: 'flex', gap: '12px', alignItems: 'center' },
  cropImg:   { width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover' },
  cropName:  { fontSize: '16px', fontWeight: '700', color: '#14532d', marginBottom: '3px' },
  buyerName: { fontSize: '13px', color: '#374151', marginBottom: '2px' },
  buyerEmail:{ fontSize: '12px', color: '#9ca3af' },
  badge:     { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },

  details:     { display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '14px', background: '#f8faf5', borderRadius: '10px', marginBottom: '16px' },
  detailItem:  { display: 'flex', flexDirection: 'column', gap: '2px' },
  detailLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: '14px', fontWeight: '600', color: '#374151' },

  actions:    { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  viewBtn:    { color: '#16a34a', fontWeight: '600', textDecoration: 'none', fontSize: '13px', marginRight: 'auto' },
  acceptBtn:  { background: '#16a34a', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  rejectBtn:  { background: '#fff', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  completeBtn:{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },

  empty:     { textAlign: 'center', padding: '60px 20px' },
  emptyText: { fontSize: '16px', color: '#6b7280' },
}