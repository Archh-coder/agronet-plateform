

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../redux/cartSlice'
import api from '../api/axiosInstance'
import { contractService } from '../api/services'

export default function Cart() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  useEffect(() => { fetchCart() }, [])

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/buyer/cart')
      setCartItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (cropId) => {
    try {
      await api.delete(`/api/buyer/cart/${cropId}`)
      setCartItems(cartItems.filter(item => item.cropId?._id !== cropId))
    } catch (err) {
      alert('Failed to remove item')
    }
  }

  const handleUpdateQty = async (cropId, qty) => {
    try {
      await api.put(`/api/buyer/cart/${cropId}`, { quantity: qty })
      fetchCart()
    } catch (err) {
      alert('Failed to update quantity')
    }
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      // create contracts for each item
      for (let item of cartItems) {
        await contractService.create({
          cropId: item.cropId?._id,
          quantity: item.quantity,
        });
      }
      dispatch(clearCart())
      setCartItems([])
      alert('✅ All orders placed successfully!')
      navigate('/buyer/contracts')
    } catch (err) {
      alert('❌ Failed to place order: ' + err.response?.data?.message)
    } finally {
      setPlacing(false)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.cropId?.pricePerUnit * item.quantity), 0)

if (loading) return (
  <div className="crops-center">
    <div className="crops-spinner">🌱</div>
    <p className="crops-loading-text">Loading cart...</p>
  </div>
)

  return (
    <div className="cart-page">
      <div className="cart-container">

        <h1 className="cart-title">🛒 Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p className="cart-empty-text">Your cart is empty</p>
            <button className="browse-btn" onClick={() => navigate('/crops')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-grid">

            {/* items */}
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.cropId?._id} className="cart-item-card">
                  <div className="cart-item-image">
                    {item.cropId?.images?.[0] ? (
                      <img src={item.cropId.images[0]} alt={item.cropId.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '32px' }}>🌾</div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.cropId?.name}</div>
                    <div className="cart-item-price">₹{item.cropId?.pricePerUnit}/kg</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{item.cropId?.farmerId?.name}</div>
                    
                    <div className="cart-item-qty-control">
                      <button className="cart-item-qty-btn" onClick={() => handleUpdateQty(item.cropId?._id, Math.max(1, item.quantity - 1))}>−</button>
                      <span style={{ margin: '0 10px', fontWeight: '600' }}>{item.quantity}kg</span>
                      <button className="cart-item-qty-btn" onClick={() => handleUpdateQty(item.cropId?._id, item.quantity + 1)}>+</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
                        ₹{(item.cropId?.pricePerUnit * item.quantity).toLocaleString()}
                      </div>
                      <button className="cart-item-remove" onClick={() => handleRemove(item.cropId?._id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* summary */}
            <div className="cart-summary">
              <div className="cart-summary-title">Order Summary</div>
              <div className="cart-summary-row">
                <span>Subtotal:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery:</span>
                <span>₹0</span>
              </div>
              <div className="cart-summary-total">
                <span>Total:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <button
                className="cart-checkout-btn"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}