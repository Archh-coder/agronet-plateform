// CropDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import api from '../api/axiosInstance'
import { cartService, cropService } from '../api/services'
import CheckoutCard from '../components/CheckoutCard'

// fix leaflet default icon bug in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

//  load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CropDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [crop, setCrop] = useState(null)
  const [reviews, setReviews] = useState([])
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  // contract form
  const [showContract, setShowContract] = useState(false)
  const [contractForm, setContractForm] = useState({ quantity: '', startDate: '', endDate: '' })
  const [contracting, setContracting] = useState(false)
  const [contractMsg, setContractMsg] = useState('')
  const [selectedQty, setSelectedQty] = useState(10)

  // review form
  const [showReview, setShowReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewing, setReviewing] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)

  // query form
  const [question, setQuestion] = useState('')
  const [querying, setQuerying] = useState(false)
  const [queryMsg, setQueryMsg] = useState('')

  // cart
  const [addingCart, setAddingCart] = useState(false)
  const [cartMsg, setCartMsg] = useState('')

  useEffect(() => { fetchCrop() }, [id])

  const fetchCrop = async () => {
    try {
      const res = await cropService.getById(id)
      setCrop(res.data.crop)
      setReviews(res.data.reviews)
      setFaqs(res.data.faqs)
      setContractForm(f => ({ ...f, quantity: res.data.crop.minOrderQty }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAddingCart(true)
    setCartMsg('')
    try {
      await cartService.add({ cropId: id, quantity: crop.minOrderQty })
      setCartMsg('✅ Added to cart!')
      setTimeout(() => setCartMsg(''), 3000)
    } catch (err) {
      setCartMsg('❌ ' + (err.response?.data?.message || 'Failed to add to cart'))
    } finally {
      setAddingCart(false)
    }
  }


  const handleReview = async (e) => {
    e.preventDefault()
    setReviewing(true)
    try {
      if (editingReviewId) {
        await api.put(`/api/buyer/review/${editingReviewId}`, reviewForm)
      } else {
        await api.post(`/api/buyer/review/${id}`, reviewForm)
      }
      setShowReview(false)
      setEditingReviewId(null)
      setReviewForm({ rating: 5, comment: '' })
      fetchCrop()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setReviewing(false)
    }
  }
const handleDeleteReview = async (reviewId) => {
  const confirmDelete = window.confirm(
    'Delete this review?'
  )

  if (!confirmDelete) return

  try {
    await api.delete(`/api/buyer/review/${reviewId}`)
    fetchCrop()
  } catch (err) {
    alert('Failed to delete review')
  }
}
  const handleQuery = async (e) => {
    e.preventDefault()
    setQuerying(true)
    try {
      await api.post(`/api/buyer/query/${id}`, { question })
      setQueryMsg('✅ Question sent to farmer!')
      setQuestion('')
    } catch (err) {
      setQueryMsg('❌ Failed to send question')
    } finally {
      setQuerying(false)
    }
  }


  const totalPrice = selectedQty * crop?.pricePerUnit
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return (
    <div style={styles.center}>
      <div style={{ fontSize: '48px' }}>🌾</div>
      <p>Loading crop details...</p>
    </div>
  )

  if (!crop) return (
    <div style={styles.center}><p>Crop not found</p></div>
  )

  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>

          <button style={styles.backBtn} onClick={() => navigate('/crops')}>
            ← Back to Browse
          </button>

          <div style={styles.topGrid}>

            {/* ── LEFT: Images ── */}
            <div>
              <div style={styles.mainImgWrap}>
                {crop.images?.[activeImg] ? (
                  <img src={crop.images[activeImg]} alt={crop.name} style={styles.mainImg} />
                ) : (
                  <div style={styles.mainImgPlaceholder}>🌾</div>
                )}
              </div>
              {crop.images?.length > 1 && (
                <div style={styles.thumbRow}>
                  {crop.images.map((img, i) => (
                    <img
                      key={i} src={img} alt=''
                      style={i === activeImg ? styles.thumbActive : styles.thumb}
                      onClick={() => setActiveImg(i)}
                    />
                  ))}
                </div>
              )}
                     <div style={styles.farmerCard}>
  <div style={styles.farmerAvatar}>
    👨‍🌾
  </div>

  <div>
    <div style={styles.farmerName}>
      {crop.farmerId?.name}
    </div>

    <div style={styles.farmerMeta}>
      ⭐ 4.8 Rating
    </div>

    <div style={styles.farmerMeta}>
      ✅ Verified Farmer
    </div>

    <div style={styles.farmerMeta}>
      📍 Maharashtra, India
    </div>
  </div>
</div>
            </div>

          
            <div>
              <div style={styles.categoryBadge}>{crop.category}</div>
              <h1 style={styles.cropName}>{crop.name}</h1>

              <div style={styles.farmerRow}>
                🧑‍🌾 Listed by <strong style={{ marginLeft: '4px' }}>{crop.farmerId?.name}</strong>
                {avgRating && (
                  <span style={styles.ratingBadge}>⭐ {avgRating} ({reviews.length})</span>
                )}
              </div>

              <div style={styles.priceBox}>
                <div style={styles.price}>₹{crop.pricePerUnit}<span style={styles.perKg}>/kg</span></div>
                <div style={crop.stock > 0 ? styles.stockBadge : styles.stockBadgeOut}>
                  {crop.stock > 0 ? `${crop.stock}kg available` : 'Out of stock'}
                </div>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Min Order</div>
                  <div style={styles.infoValue}>{crop.minOrderQty}kg</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Category</div>
                  <div style={styles.infoValue}>{crop.category}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Total Value</div>
                  <div style={styles.infoValue}>₹{(crop.pricePerUnit * crop.stock).toLocaleString()}</div>
                </div>
              </div>
 {crop.description && (
                <p style={styles.description}>{crop.description}</p>
              )}
          
              <div style={styles.qtyCard}>
                <div style={styles.qtyTop}>
                  <span style={styles.qtyLabel}>Order Quantity</span>
                  <span style={styles.qtyStock}>
                    Available: {crop.stock}kg
                  </span>
                </div>

                <div style={styles.qtyControls}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() =>
                      setSelectedQty((prev) =>
                        Math.max(crop.minOrderQty, prev - 1)
                      )
                    }
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={selectedQty}
                    min={crop.minOrderQty}
                    max={crop.stock}
                    onChange={(e) =>
                      setSelectedQty(Number(e.target.value))
                    }
                    style={styles.qtyInput}
                  />

                  <button
                    style={styles.qtyBtn}
                    onClick={() =>
                      setSelectedQty((prev) =>
                        Math.min(crop.stock, prev + 1)
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <div style={styles.totalBox}>
                  Total Price: ₹{totalPrice?.toLocaleString()}
                </div>
              </div>
              

              {contractMsg && (
                <div style={contractMsg.startsWith('✅') ? styles.successMsg : contractMsg.startsWith('⚠️') ? styles.warnMsg : styles.errorMsg}>
                  {contractMsg}
                </div>
              )}

              {user?.role === 'buyer' && crop.stock > 0 && (
                <>
                  {cartMsg && (
                    <div style={cartMsg.startsWith('✅') ? styles.successMsg : styles.errorMsg}>
                      {cartMsg}
                    </div>
                  )}
                  <div style={styles.actionRow}>
                    <button
                      style={addingCart ? styles.btnDisabled : styles.addCartBtn}
                      onClick={handleAddToCart}
                      disabled={addingCart}
                    >
                      {addingCart ? 'Adding...' : '🛒 Add to Cart'}
                    </button>
                    <button
                      style={styles.contractBtn}
                      onClick={() => setShowContract(true)}  // just true, not toggle

                    >
                      🛍️ Place Order
                    </button>
                  </div>
                </>
              )}


              {/* review form */}
              {showReview && (
                <form onSubmit={handleReview} style={styles.contractForm}>
                  <div style={styles.formTitle}>
                    {editingReviewId ? '✏️ Edit Review' : '⭐ Write a Review'}
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Rating</label>
                    <div style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span
                          key={s}
                          style={{ fontSize: '28px', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                        >⭐</span>
                      ))}
                    </div>
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Comment</label>
                    <textarea
                      style={styles.formTextarea}
                      placeholder='Share your experience...'
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <button
                    style={reviewing ? styles.btnDisabled : styles.contractSubmitBtn}
                    type='submit'
                    disabled={reviewing}
                  >
                    {reviewing ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
          
          </div>
          </div>

      
<div style={styles.reviewSection}>

  <div style={styles.reviewHeader}>

    <div>
      <h2 style={styles.reviewTitle}>
        Reviews
      </h2>

      <div style={styles.reviewSummary}>
        <div style={styles.bigRating}>
          {avgRating || '0.0'}
        </div>

        <div>
          <div style={styles.starBig}>
            ⭐⭐⭐⭐⭐
          </div>

          <div style={styles.reviewCount}>
            {reviews.length} reviews
          </div>
        </div>
      </div>
    </div>

    {user?.role === 'buyer' && (
      <button
        style={styles.writeReviewBtn}
        onClick={() => {
          setShowReview(!showReview)
          setEditingReviewId(null)
        }}
      >
        ✍️ Write Review
      </button>
    )}

  </div>

  {reviews.length === 0 ? (

    <div style={styles.noReviewBox}>
      No reviews yet.
    </div>

  ) : (

    <div style={styles.reviewList}>

      {reviews.map((review) => {

        const isOwner =
          user?._id === review.userId?._id

        return (

          <div
            key={review._id}
            style={styles.reviewCardModern}
          >

            <div style={styles.reviewCardTop}>

              <div style={styles.reviewUser}>

                <div style={styles.reviewAvatar}>
                  👤
                </div>

                <div>

                  <div style={styles.reviewUserName}>
                    {review.userId?.name || 'Buyer'}
                  </div>

                  <div style={styles.reviewStars}>
                    {'⭐'.repeat(review.rating)}
                  </div>

                </div>

              </div>

              {isOwner && (

                <div style={styles.menuWrapper}>

                  <button
                    style={styles.menuBtn}
                    onClick={() =>
                      setActiveMenu(
                        activeMenu === review._id
                          ? null
                          : review._id
                      )
                    }
                  >
                    ⋮
                  </button>

                  {activeMenu === review._id && (

                    <div style={styles.dropdownMenu}>

                      <button
                        style={styles.dropdownItem}
                        onClick={() => {
                          setShowReview(true)

                          setEditingReviewId(review._id)

                          setReviewForm({
                            rating: review.rating,
                            comment: review.comment,
                          })

                          setActiveMenu(null)
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        style={styles.dropdownDelete}
                        onClick={() => {
                          handleDeleteReview(review._id)
                          setActiveMenu(null)
                        }}
                      >
                        🗑 Delete
                      </button>

                    </div>

                  )}

                </div>

              )}

            </div>

            <p style={styles.reviewTextModern}>
              {review.comment}
            </p>

          </div>

        )

      })}

    </div>

  )}
        </div>
        </div>
        </div>
      

      
      {showContract && (
        <div style={styles.modalOverlay} onClick={() => setShowContract(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>🛍️ Place Order</div>
              <button style={styles.modalClose} onClick={() => setShowContract(false)}>✕</button>
              </div>
            <CheckoutCard
              crop={crop}
              contracting={contracting}
              contractMsg={contractMsg}
              onSubmit={async ({ quantity, startDate, endDate }) => {
                setContracting(true)
                setContractMsg('')
                try {
                  const res = await api.post('/api/contract/create', {
                    cropId: id,
                    quantity: parseInt(quantity),
                    startDate: startDate || null,
                    endDate: endDate || null
                  })
                  const { contract, razorpayOrderId, amount, keyId } = res.data
                  const loaded = await loadRazorpay()
                  if (!loaded) {
                    setContractMsg('❌ Failed to load payment gateway.')
                    setContracting(false)
                    return
                  }
                  const options = {
                    key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: amount,
                    currency: 'INR',
                    name: 'AgroNet',
                    description: `Payment for ${crop.name}`,
                    order_id: razorpayOrderId,
                    prefill: { name: user.name, email: user.email, contact: '' },
                    theme: { color: '#16a34a' },
                    handler: async (response) => {
                      try {
                        await api.post('/api/contract/verify-payment', {
                          razorpayOrderId: response.razorpay_order_id,
                          razorpayPaymentId: response.razorpay_payment_id,
                          razorpaySignature: response.razorpay_signature,
                          contractId: contract._id
                        })
                        setContractMsg('✅ Payment successful! Redirecting...')
                        setShowContract(false)
                        setTimeout(() => navigate('/buyer/contracts'), 2000)
                      } catch {
                        setContractMsg('❌ Payment verification failed.')
                      }
                    },
                    modal: {
                      ondismiss: () => {
                        setContractMsg('⚠️ Payment cancelled.')
                        setContracting(false)
                      }
                    }
                  }
                  const rzp = new window.Razorpay(options)
                  rzp.open()
                } catch (err) {
                  setContractMsg('❌ ' + (err.response?.data?.message || 'Failed to place order'))
                } finally {
                  setContracting(false)
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}


const styles = {
  page: { minHeight: '100vh', background: '#f8faf5', padding: '24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' },
  backBtn: { background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '20px', padding: 0 },

topGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '32px',
  marginBottom: '32px',
},
  mainImgWrap: { borderRadius: '12px', overflow: 'hidden', height: '300px', background: '#f0fdf4', marginBottom: '12px' },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  mainImgPlaceholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' },
  thumbRow: { display: 'flex', gap: '8px' },
  thumb: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', opacity: 0.6 },
  thumbActive: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid #16a34a' },

  categoryBadge: { display: 'inline-block', background: '#dcfce7', color: '#14532d', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '10px' },
  cropName: { fontSize: '28px', fontWeight: '700', color: '#14532d', marginBottom: '10px' },
  farmerRow: { fontSize: '14px', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  ratingBadge: { background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' },

  priceBox: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  price: { fontSize: '32px', fontWeight: '800', color: '#16a34a' },
  perKg: { fontSize: '16px', fontWeight: '400', color: '#6b7280' },
  stockBadge: { background: '#dcfce7', color: '#14532d', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' },
  stockBadgeOut: { background: '#fef2f2', color: '#dc2626', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' },

infoGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '12px',
  marginBottom: '16px',
},
  infoItem: { background: '#f8faf5', borderRadius: '8px', padding: '12px', textAlign: 'center' },
  infoLabel: { fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' },
  infoValue: { fontSize: '15px', fontWeight: '600', color: '#14532d' },

  description: { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', marginBottom: '16px' },
  extraGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '16px',
  marginBottom: '20px',
},

  qtyCard: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },

  qtyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },

  qtyLabel: {
    fontWeight: '600',
    color: '#14532d',
  },

  qtyStock: {
    fontSize: '13px',
    color: '#6b7280',
  },

  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },

  qtyBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: '#16a34a',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
  },

  qtyInput: {
    width: '100px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    textAlign: 'center',
    fontSize: '16px',
  },

  totalBox: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#14532d',
  },

  farmerCard: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },

  farmerAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
  },

  farmerName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#14532d',
    marginBottom: '6px',
  },

  farmerMeta: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
  },

  reviewCard: {
    background: '#f8faf5',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '12px',
  },

  reviewTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },

  reviewText: {
    color: '#4b5563',
    lineHeight: '1.6',
    fontSize: '14px',
  },

  reviewSection: {
  background: '#fff',
  borderRadius: '20px',
  padding: '32px',
  marginTop: '30px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
},

reviewHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '30px',
  flexWrap: 'wrap',
},

reviewTitle: {
  fontSize: '36px',
  fontWeight: '800',
  color: '#111827',
  marginBottom: '18px',
},

reviewSummary: {
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
},

bigRating: {
  fontSize: '55px',
  fontWeight: '800',
  color: '#111827',
  lineHeight: 1,
},

starBig: {
  fontSize: '22px',
},

reviewCount: {
  color: '#6b7280',
  fontSize: '14px',
  marginTop: '6px',
},

writeReviewBtn: {
  background: '#16a34a',
  color: '#fff',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
},

reviewList: {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
},

reviewCardModern: {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
},

reviewCardTop: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '14px',
},

reviewUser: {
  display: 'flex',
  gap: '14px',
  alignItems: 'center',
},

reviewAvatar: {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  background: '#dcfce7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
},

reviewUserName: {
  fontSize: '16px',
  fontWeight: '700',
  color: '#111827',
  marginBottom: '4px',
},

reviewStars: {
  fontSize: '14px',
},

reviewTextModern: {
  color: '#4b5563',
  lineHeight: '1.9',
  fontSize: '12px',
  paddingLeft: '66px',
},

menuWrapper: {
  position: 'relative',
},

menuBtn: {
  background: 'transparent',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#6b7280',
},

dropdownMenu: {
  position: 'absolute',
  top: '30px',
  right: 0,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
  zIndex: 20,
  minWidth: '150px',
},

dropdownItem: {
  width: '100%',
  border: 'none',
  background: '#fff',
  padding: '12px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
},

dropdownDelete: {
  width: '100%',
  border: 'none',
  background: '#fff',
  padding: '12px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#dc2626',
},

noReviewBox: {
  padding: '30px',
  background: '#f9fafb',
  borderRadius: '14px',
  textAlign: 'center',
  color: '#6b7280',
},

  successMsg: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' },
  errorMsg: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' },
  warnMsg: { background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' },

  addCartBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  actionRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  contractBtn: { flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },

  contractForm: { background: '#f8faf5', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  formTitle: { fontSize: '15px', fontWeight: '600', color: '#14532d', marginBottom: '16px' },
  formRow: { display: 'flex', gap: '12px', marginBottom: '12px' },
  formField: { flex: 1 },
  formLabel: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' },
  formInput: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  formTextarea: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  lockedPrice: { background: '#dcfce7', color: '#14532d', padding: '8px 12px', borderRadius: '6px', fontSize: '15px', fontWeight: '700' },
  totalPreview: { background: '#fff', border: '1px solid #e5e7eb', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', color: '#374151', marginBottom: '12px' },
  escrowNote: { color: '#9ca3af', fontSize: '12px' },
  starRow: { display: 'flex', gap: '4px', marginBottom: '8px' },
  contractSubmitBtn: { width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnDisabled: { width: '100%', padding: '12px', background: '#86efac', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontSize: '14px', fontWeight: '600' },

  section: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#14532d', marginBottom: '16px' },
  mapWrap: { borderRadius: '12px', overflow: 'hidden' },
  emptyText: { fontSize: '14px', color: '#9ca3af' },

  faqList: { marginBottom: '20px' },
  faqItem: { background: '#f8faf5', borderRadius: '8px', padding: '14px', marginBottom: '10px' },
  faqQ: { fontSize: '14px', fontWeight: '600', color: '#14532d', marginBottom: '6px' },
  faqA: { fontSize: '13px', color: '#6b7280', lineHeight: '1.6' },
  queryForm: { background: '#f8faf5', borderRadius: '10px', padding: '16px' },

  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    zIndex: 1000, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px',
  },
  modalBox: {
    background: '#fff', borderRadius: '20px', width: '100%',
    maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '20px 24px 0',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#14532d' },
  modalClose: {
    background: '#f3f4f6', border: 'none', borderRadius: '50%',
    width: '32px', height: '32px', cursor: 'pointer',
    fontSize: '16px', color: '#6b7280',
  },

}