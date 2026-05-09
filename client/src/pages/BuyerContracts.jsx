
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosInstance'
import { contractService } from '../api/services'

export default function BuyerContracts() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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

  const filtered = filter === 'all' ? contracts : contracts.filter(c => c.status === filter)

  if (loading) return (
    <div style={styles.center}>
      <p>Loading contracts...</p>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h1 style={styles.title}>📋 My Contracts</h1>

        {/* filter buttons */}
        <div style={styles.filterRow}>
          {['all', 'pending', 'accepted', 'rejected', 'completed'].map(f => (
            <button
              key={f}
              style={filter === f ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({contracts.filter(c => f === 'all' || c.status === f).length})
            </button>
          ))}
        </div>

        {/* contracts table */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p>No {filter !== 'all' ? filter : ''} contracts</p>
          </div>
        ) : (
          <div style={styles.table}>
            {filtered.map(c => (
              <div key={c._id} style={styles.row}>
                <div style={styles.rowLeft}>
                  <div style={styles.rowTitle}>{c.cropId?.name}</div>
                  <div style={styles.rowMeta}>
                    {c.quantity}kg @ ₹{c.lockedPrice}/kg | {c.farmerId?.name}
                  </div>
                </div>
                <div style={styles.rowMiddle}>
                  <span style={styles.badge(c.status)}>{c.status}</span>
                  <span style={styles.escrowBadge(c.escrowStatus)}>{c.escrowStatus}</span>
                </div>
                <Link to={`/contract/${c._id}`} style={styles.rowBtn}>
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page:      { minHeight: '100vh', background: '#f8faf5', padding: '32px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  center:    { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },

  title:     { fontSize: '26px', fontWeight: '700', color: '#14532d', marginBottom: '20px' },

  filterRow: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { background: '#fff', border: '1px solid #d1d5db', color: '#6b7280', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  filterBtnActive: { background: '#16a34a', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },

  table:  { display: 'flex', flexDirection: 'column', gap: '10px' },
  row:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  rowLeft:{ flex: 1 },
  rowTitle:{ fontSize: '15px', fontWeight: '600', color: '#14532d', marginBottom: '4px' },
  rowMeta: { fontSize: '12px', color: '#6b7280' },
  rowMiddle:{ display: 'flex', gap: '8px', alignItems: 'center' },
  badge:   (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    background: status === 'pending' ? '#fef3c7' : status === 'accepted' ? '#dcfce7' : status === 'completed' ? '#d1f4f1' : '#fef2f2',
    color: status === 'pending' ? '#92400e' : status === 'accepted' ? '#14532d' : status === 'completed' ? '#134e4a' : '#991b1b'
  }),
  escrowBadge: (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    background: status === 'held' ? '#e0e7ff' : status === 'released' ? '#d1f4f1' : '#fef2f2',
    color: status === 'held' ? '#3730a3' : status === 'released' ? '#134e4a' : '#991b1b'
  }),
  rowBtn: { color: '#16a34a', fontWeight: '600', textDecoration: 'none', fontSize: '13px' },

  empty: { textAlign: 'center', padding: '40px', color: '#6b7280' }
}