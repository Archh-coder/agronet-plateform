import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../api/axiosInstance'

const STATUS_CONFIG = {
  pending:   { label: 'Pending Approval', color: '#d97706', bg: '#fef3c7', icon: '⏳', step: 1 },
  accepted:  { label: 'Active / In Progress', color: '#16a34a', bg: '#dcfce7', icon: '✅', step: 2 },
  completed: { label: 'Completed',        color: '#2563eb', bg: '#dbeafe', icon: '🎉', step: 3 },
  rejected:  { label: 'Rejected',         color: '#dc2626', bg: '#fee2e2', icon: '✗',  step: 0 },
}

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [contract, setContract] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchContract() }, [id])

  const fetchContract = async () => {
    try {
      const res = await api.get(`/api/contract/${id}`)
      setContract(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action) => {
    setActionLoading(action)
    try {
      await api.put(`/api/contract/${id}/${action}`)
      await fetchContract()
    } catch (err) {
      alert(`Failed to ${action} contract`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return (
    <div style={s.center}>
      <div style={{ fontSize: '48px' }}>📋</div>
      <p style={{ color: '#6b7280' }}>Loading contract...</p>
    </div>
  )

  if (!contract) return (
    <div style={s.center}>
      <div style={{ fontSize: '48px' }}>❌</div>
      <p style={{ color: '#6b7280' }}>Contract not found</p>
      <button onClick={() => navigate(-1)} style={s.backBtn}>Go Back</button>
    </div>
  )

  const cfg = STATUS_CONFIG[contract.status] || {}
  const isFarmer = user?.role === 'farmer'
  const isBuyer  = user?.role === 'buyer'

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* header */}
        <div style={s.header}>
          <button onClick={() => navigate(-1)} style={s.backLink}>← Back</button>
          <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        <h1 style={s.title}>Contract Details</h1>
        <p style={s.contractId}>ID: {contract._id}</p>

        {/* progress bar — only for non-rejected */}
        {contract.status !== 'rejected' && (
          <div style={s.progressWrap}>
            {['Placed', 'Accepted', 'Completed'].map((label, i) => {
              const done = cfg.step > i
              const active = cfg.step === i + 1
              return (
                <div key={label} style={s.progressStep}>
                  <div style={{
                    ...s.progressDot,
                    background: done || active ? '#16a34a' : '#e5e7eb',
                    border: active ? '3px solid #16a34a' : 'none',
                    transform: active ? 'scale(1.2)' : 'scale(1)',
                  }} />
                  <div style={{ ...s.progressLabel, color: done || active ? '#14532d' : '#9ca3af', fontWeight: active ? '700' : '400' }}>
                    {label}
                  </div>
                  {i < 2 && (
                    <div style={{ ...s.progressLine, background: done ? '#16a34a' : '#e5e7eb' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={s.grid}>

          {/* crop info */}
          <div style={s.card}>
            <div style={s.cardTitle}>🌾 Crop Details</div>
            {contract.cropId?.images?.[0] && (
              <img src={contract.cropId.images[0]} alt='' style={s.cropImg} />
            )}
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Name</span>
              <span style={s.infoValue}>{contract.cropId?.name}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Category</span>
              <span style={s.infoValue}>{contract.cropId?.category}</span>
            </div>
          </div>

          {/* contract financials */}
          <div style={s.card}>
            <div style={s.cardTitle}>💰 Order Summary</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Quantity</span>
              <span style={s.infoValue}>{contract.quantity} kg</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Locked Price</span>
              <span style={s.infoValue}>₹{contract.lockedPrice}/kg</span>
            </div>
            <div style={{ ...s.infoRow, borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '4px' }}>
              <span style={{ ...s.infoLabel, fontWeight: '700' }}>Total Amount</span>
              <span style={{ ...s.infoValue, color: '#16a34a', fontSize: '20px', fontWeight: '700' }}>
                ₹{contract.totalAmount?.toLocaleString()}
              </span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Escrow</span>
              <span style={s.infoValue}>
                {contract.escrowStatus === 'held'     ? '💰 Held'
                : contract.escrowStatus === 'released' ? '✅ Released'
                : '🔄 Refunded'}
              </span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Placed On</span>
              <span style={s.infoValue}>{new Date(contract.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* farmer info */}
          <div style={s.card}>
            <div style={s.cardTitle}>👨‍🌾 Farmer</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Name</span>
              <span style={s.infoValue}>{contract.farmerId?.name}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Email</span>
              <span style={s.infoValue}>{contract.farmerId?.email}</span>
            </div>
          </div>

          {/* buyer info */}
          <div style={s.card}>
            <div style={s.cardTitle}>🛒 Buyer</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Name</span>
              <span style={s.infoValue}>{contract.buyerId?.name}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Email</span>
              <span style={s.infoValue}>{contract.buyerId?.email}</span>
            </div>
          </div>

        </div>

        {/* farmer actions */}
        {isFarmer && (
          <div style={s.actionsCard}>
            <div style={s.cardTitle}>⚡ Actions</div>

            {contract.status === 'pending' && (
              <div style={s.actionRow}>
                <p style={s.actionHint}>Review this contract request and accept or reject it.</p>
                <div style={s.actionBtns}>
                  <button
                    style={s.acceptBtn}
                    disabled={!!actionLoading}
                    onClick={() => handleAction('accept')}
                  >
                    {actionLoading === 'accept' ? 'Processing...' : '✓ Accept Contract'}
                  </button>
                  <button
                    style={s.rejectBtn}
                    disabled={!!actionLoading}
                    onClick={() => handleAction('reject')}
                  >
                    {actionLoading === 'reject' ? 'Processing...' : '✗ Reject Contract'}
                  </button>
                </div>
              </div>
            )}

            {contract.status === 'accepted' && (
              <div style={s.actionRow}>
                <p style={s.actionHint}>Once you have delivered the crop, mark this contract as complete.</p>
                <button
                  style={s.completeBtn}
                  disabled={!!actionLoading}
                  onClick={() => handleAction('complete')}
                >
                  {actionLoading === 'complete' ? 'Processing...' : '🎉 Mark as Completed'}
                </button>
              </div>
            )}

            {(contract.status === 'completed' || contract.status === 'rejected') && (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No actions available for this contract.</p>
            )}
          </div>
        )}

        {/* buyer status message */}
        {isBuyer && (
          <div style={{ ...s.actionsCard, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
            <p style={{ color: cfg.color, fontWeight: '600', fontSize: '15px', margin: 0 }}>
              {cfg.icon} {
                contract.status === 'pending'   ? 'Your order is waiting for farmer approval.' :
                contract.status === 'accepted'  ? 'Your order has been accepted! The farmer is preparing your crop.' :
                contract.status === 'completed' ? 'This contract has been completed. Thank you!' :
                'This contract was rejected by the farmer.'
              }
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  page:      { minHeight: '100vh', background: '#f8faf5', padding: '32px 24px' },
  container: { maxWidth: '860px', margin: '0 auto' },
  center:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' },

  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  backLink:    { background: 'none', border: 'none', color: '#16a34a', fontWeight: '600', cursor: 'pointer', fontSize: '14px', padding: 0 },
  backBtn:     { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  badge:       { padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  title:       { fontSize: '26px', fontWeight: '700', color: '#14532d', margin: '0 0 4px' },
  contractId:  { fontSize: '12px', color: '#9ca3af', marginBottom: '24px', fontFamily: 'monospace' },

  progressWrap:  { display: 'flex', alignItems: 'center', marginBottom: '32px', background: '#fff', borderRadius: '12px', padding: '20px 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  progressStep:  { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  progressDot:   { width: '16px', height: '16px', borderRadius: '50%', marginBottom: '8px', transition: 'all 0.2s' },
  progressLine:  { position: 'absolute', top: '8px', left: '50%', width: '100%', height: '3px', zIndex: 0, transition: 'background 0.2s' },
  progressLabel: { fontSize: '12px', textAlign: 'center' },

  grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  card:    { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '14px', fontWeight: '700', color: '#14532d', marginBottom: '16px' },
  cropImg:   { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' },

  infoRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
  infoLabel: { fontSize: '13px', color: '#9ca3af' },
  infoValue: { fontSize: '14px', fontWeight: '600', color: '#374151' },

  actionsCard: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' },
  actionRow:   { display: 'flex', flexDirection: 'column', gap: '12px' },
  actionHint:  { fontSize: '13px', color: '#6b7280', margin: 0 },
  actionBtns:  { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  acceptBtn:   { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  rejectBtn:   { background: '#fff', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  completeBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
}