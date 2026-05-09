// AddCrop.jsx
// export default function AddCrop() { return <div>AddCrop</div> }

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import { cropService } from '../api/services'

const categories = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Other']

export default function AddCrop() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [images, setImages]   = useState([])
  const [form, setForm]       = useState({
    name: '', category: 'Grains', description: '',
    pricePerUnit: '', stock: '', minOrderQty: '',
    
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('name', form.name)
      data.append('category', form.category)
      data.append('description', form.description)
      data.append('pricePerUnit', form.pricePerUnit)
      data.append('stock', form.stock)
      data.append('minOrderQty', form.minOrderQty)
      images.forEach(img => {
        data.append('images', img)
      })
      
      console.log('Sending data:', data)
      
      const res = await cropService.create(data)
    
    console.log('Success:', res.data)
    navigate('/crops')  // redirect to browse crops page
    } catch (err) {
    console.error('Error response:', err.response?.data)
    setError(err.response?.data?.message || err.message || 'Failed to add crop')
  } finally {
    setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Add New Crop</h1>
          <p style={styles.subtitle}>List your crop for contract farming</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>

            {/* left column */}
            <div style={styles.col}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Basic Details</div>

                <div style={styles.field}>
                  <label style={styles.label}>Crop Name</label>
                  <input
                    style={styles.input}
                    name='name'
                    placeholder='e.g. Organic Wheat'
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.input}
                    name='category'
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    name='description'
                    placeholder='Describe your crop quality, farming methods...'
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardTitle}>Pricing & Stock</div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Price per kg (₹)</label>
                    <input
                      style={styles.input}
                      name='pricePerUnit'
                      type='number'
                      placeholder='e.g. 30'
                      value={form.pricePerUnit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Total Stock (kg)</label>
                    <input
                      style={styles.input}
                      name='stock'
                      type='number'
                      placeholder='e.g. 5000'
                      value={form.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Minimum Order Quantity (kg)</label>
                  <input
                    style={styles.input}
                    name='minOrderQty'
                    type='number'
                    placeholder='e.g. 100'
                    value={form.minOrderQty}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* right column */}
            <div style={styles.col}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Crop Images</div>
                <div
                  style={styles.uploadBox}
                  onClick={() => document.getElementById('imgInput').click()}
                >
                  {images.length > 0 ? (
                    <div style={styles.imagePreviewGrid}>
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={URL.createObjectURL(img)}
                          alt='preview'
                          style={styles.previewImg}
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div style={styles.uploadIcon}>📷</div>
                      <div style={styles.uploadText}>Click to upload images</div>
                      <div style={styles.uploadSub}>JPG, PNG up to 5 images</div>
                    </>
                  )}
                </div>
                <input
                  id='imgInput'
                  type='file'
                  multiple
                  accept='image/*'
                  style={{ display: 'none' }}
                  onChange={(e) => setImages(Array.from(e.target.files))}
                />
              </div>


              <button
                style={loading ? styles.btnDisabled : styles.btn}
                type='submit'
                disabled={loading}
              >
                {loading ? 'Adding Crop...' : '🌾 Add Crop Listing'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page:      { minHeight: '100vh', background: '#f8faf5', padding: '32px 24px' },
  container: { maxWidth: '900px', margin: '0 auto' },
  header:    { marginBottom: '28px' },
  title:     { fontSize: '28px', fontWeight: '700', color: '#14532d' },
  subtitle:  { fontSize: '15px', color: '#6b7280', marginTop: '4px' },
  error:     { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  grid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  col:       { display: 'flex', flexDirection: 'column', gap: '20px' },
  card:      { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#14532d', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' },
  field:     { marginBottom: '14px', flex: 1 },
  row:       { display: 'flex', gap: '12px' },
  label:     { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  input:     { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' },
  textarea:  { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  uploadBox: { border: '2px dashed #d1d5db', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#f8faf5', minHeight: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  uploadIcon:{ fontSize: '36px', marginBottom: '8px' },
  uploadText:{ fontSize: '14px', fontWeight: '500', color: '#374151' },
  uploadSub: { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },
  imagePreviewGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  previewImg:{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' },
  locationNote: { fontSize: '13px', color: '#6b7280', marginBottom: '14px' },
  locationTip:  { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginTop: '8px' },
  btn:        { width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  btnDisabled:{ width: '100%', padding: '14px', background: '#86efac', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'not-allowed' }
}