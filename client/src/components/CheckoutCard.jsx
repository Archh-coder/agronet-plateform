// CheckoutCard.jsx — drop this into CropDetail where the contract form was

import { useState } from 'react'

export default function CheckoutCard({ crop, onSubmit, contracting, contractMsg }) {
  const [quantity, setQuantity] = useState(crop.minOrderQty)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')

  const total = quantity * crop.pricePerUnit

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ quantity, startDate, endDate })
  }

  return (
    <div style={card.wrap}>

      {/* shimmer top bar */}
      <div style={card.topBar} />

      {/* header */}
      <div style={card.header}>
        <div style={card.headerLeft}>
          <div style={card.headerIcon}>🛍️</div>
          <div>
            <div style={card.headerTitle}>Place Order</div>
            <div style={card.headerSub}>Price locked at ₹{crop.pricePerUnit}/kg</div>
          </div>
        </div>
        <div style={card.escrowPill}>
          🔒 Escrow Protected
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* quantity selector */}
        <div style={card.section}>
          <div style={card.label}>Quantity</div>
          <div style={card.qtyRow}>
            <button
              type='button'
              style={card.qtyBtn}
              onClick={() => setQuantity(q => Math.max(crop.minOrderQty, q - 10))}
            >−</button>
            <div style={card.qtyDisplay}>
              <input
                type='number'
                min={crop.minOrderQty}
                max={crop.stock}
                value={quantity}
                onChange={e => setQuantity(Math.max(crop.minOrderQty, Math.min(crop.stock, parseInt(e.target.value) || crop.minOrderQty)))}
                style={card.qtyInput}
              />
              <span style={card.qtyUnit}>kg</span>
            </div>
            <button
              type='button'
              style={card.qtyBtn}
              onClick={() => setQuantity(q => Math.min(crop.stock, q + 10))}
            >+</button>
          </div>
          <div style={card.qtyHint}>
            Min: {crop.minOrderQty}kg · Available: {crop.stock}kg
          </div>
        </div>

        {/* dates */}
        <div style={card.dateRow}>
          <div style={{ flex: 1 }}>
            <div style={card.label}>Start Date <span style={card.optional}>(optional)</span></div>
            <input
              type='date'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={card.dateInput}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={card.label}>End Date <span style={card.optional}>(optional)</span></div>
            <input
              type='date'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={card.dateInput}
            />
          </div>
        </div>

        {/* price breakdown */}
        <div style={card.breakdown}>
          <div style={card.breakdownRow}>
            <span style={card.breakdownLabel}>Price per kg</span>
            <span style={card.breakdownValue}>₹{crop.pricePerUnit}</span>
          </div>
          <div style={card.breakdownRow}>
            <span style={card.breakdownLabel}>Quantity</span>
            <span style={card.breakdownValue}>{quantity} kg</span>
          </div>
          <div style={card.breakdownDivider} />
          <div style={card.breakdownRow}>
            <span style={card.totalLabel}>Total Amount</span>
            <span style={card.totalValue}>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* escrow info */}
        <div style={card.escrowBox}>
          <div style={card.escrowRow}>
            <span style={card.escrowIcon}>💰</span>
            <div>
              <div style={card.escrowTitle}>Escrow Payment</div>
              <div style={card.escrowDesc}>Your payment is held securely until the farmer delivers your order</div>
            </div>
          </div>
          <div style={card.escrowSteps}>
            <div style={card.escrowStep}><span style={card.dot}>●</span> You pay → funds held in escrow</div>
            <div style={card.escrowStep}><span style={card.dot}>●</span> Farmer delivers crop</div>
            <div style={card.escrowStep}><span style={card.dot}>●</span> Funds released to farmer</div>
          </div>
        </div>

        {/* message */}
        {contractMsg && (
          <div style={
            contractMsg.startsWith('✅') ? card.successMsg :
            contractMsg.startsWith('⚠️') ? card.warnMsg : card.errorMsg
          }>
            {contractMsg}
          </div>
        )}

        {/* pay button */}
        <button
          type='submit'
          disabled={contracting}
          style={contracting ? card.payBtnDisabled : card.payBtn}
        >
          {contracting ? (
            <span>Opening Payment...</span>
          ) : (
            <span>💳 Pay ₹{total.toLocaleString()} Securely</span>
          )}
        </button>

        {/* trust badges */}
        <div style={card.trustRow}>
          <span style={card.trustBadge}>🔐 SSL Secured</span>
          <span style={card.trustBadge}>⚡ Razorpay</span>
          <span style={card.trustBadge}>↩️ Refundable</span>
        </div>

      </form>
    </div>
  )
}

const card = {
  wrap: {
    background:   '#fff',
    borderRadius: '20px',
    overflow:     'hidden',
    boxShadow:    '0 8px 32px rgba(22,163,74,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '20px',
    border:       '1px solid #e8f5e9',
  },

  topBar: {
    height:     '4px',
    background: 'linear-gradient(90deg, #16a34a, #4ade80, #16a34a)',
    backgroundSize: '200% 100%',
    animation:  'shimmer 2s infinite',
  },

  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '20px 24px 16px',
    borderBottom:   '1px solid #f0fdf4',
    flexWrap:       'wrap',
    gap:            '12px',
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon:  { fontSize: '28px' },
  headerTitle: { fontSize: '17px', fontWeight: '700', color: '#14532d' },
  headerSub:   { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  escrowPill:  {
    background:   '#f0fdf4',
    border:       '1px solid #bbf7d0',
    color:        '#14532d',
    padding:      '5px 12px',
    borderRadius: '20px',
    fontSize:     '12px',
    fontWeight:   '600',
  },

  section: { padding: '20px 24px 0' },
  label:   { fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  optional:{ fontWeight: '400', color: '#9ca3af', textTransform: 'none', letterSpacing: 0 },

  qtyRow:    { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  qtyBtn:    {
    width: '40px', height: '40px', borderRadius: '10px',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    color: '#16a34a', fontSize: '20px', fontWeight: '700',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  qtyDisplay: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f8faf5', borderRadius: '10px', border: '1px solid #e5e7eb',
    padding: '8px 16px', gap: '8px',
  },
  qtyInput: {
    width: '80px', border: 'none', background: 'transparent',
    fontSize: '22px', fontWeight: '700', color: '#14532d',
    textAlign: 'center', outline: 'none',
  },
  qtyUnit: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  qtyHint: { fontSize: '11px', color: '#9ca3af', textAlign: 'center' },

  dateRow: { display: 'flex', gap: '12px', padding: '16px 24px 0' },
  dateInput: {
    width: '100%', padding: '9px 12px',
    border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '13px', color: '#374151', outline: 'none',
    boxSizing: 'border-box', background: '#fafafa',
  },

  breakdown: {
    margin:       '20px 24px 0',
    background:   '#f8faf5',
    borderRadius: '12px',
    padding:      '16px',
  },
  breakdownRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  breakdownLabel: { fontSize: '13px', color: '#6b7280' },
  breakdownValue: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  breakdownDivider: { height: '1px', background: '#e5e7eb', margin: '10px 0' },
  totalLabel: { fontSize: '15px', fontWeight: '700', color: '#14532d' },
  totalValue: { fontSize: '22px', fontWeight: '800', color: '#16a34a' },

  escrowBox: {
    margin:       '16px 24px 0',
    background:   'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    borderRadius: '12px',
    padding:      '14px',
    border:       '1px solid #bbf7d0',
  },
  escrowRow:   { display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' },
  escrowIcon:  { fontSize: '20px', flexShrink: 0 },
  escrowTitle: { fontSize: '13px', fontWeight: '700', color: '#14532d', marginBottom: '2px' },
  escrowDesc:  { fontSize: '12px', color: '#4b7c59', lineHeight: '1.4' },
  escrowSteps: { display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '30px' },
  escrowStep:  { fontSize: '11px', color: '#4b7c59', display: 'flex', alignItems: 'center', gap: '6px' },
  dot:         { color: '#16a34a', fontSize: '8px' },

  successMsg: { margin: '12px 24px 0', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },
  warnMsg:    { margin: '12px 24px 0', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },
  errorMsg:   { margin: '12px 24px 0', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },

  payBtn: {
    display:      'block',
    width:        'calc(100% - 48px)',
    margin:       '16px 24px 0',
    padding:      '14px',
    background:   'linear-gradient(135deg, #16a34a, #15803d)',
    color:        '#fff',
    border:       'none',
    borderRadius: '12px',
    fontSize:     '15px',
    fontWeight:   '700',
    cursor:       'pointer',
    textAlign:    'center',
    boxShadow:    '0 4px 12px rgba(22,163,74,0.3)',
    letterSpacing: '0.3px',
  },
  payBtnDisabled: {
    display:      'block',
    width:        'calc(100% - 48px)',
    margin:       '16px 24px 0',
    padding:      '14px',
    background:   '#86efac',
    color:        '#fff',
    border:       'none',
    borderRadius: '12px',
    fontSize:     '15px',
    fontWeight:   '700',
    cursor:       'not-allowed',
    textAlign:    'center',
  },

  trustRow:  { display: 'flex', justifyContent: 'center', gap: '16px', padding: '12px 24px 20px', flexWrap: 'wrap' },
  trustBadge:{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' },
}