import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import { cropService } from '../api/services'

const categories = ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Other']

const sortOptions = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_low',  label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
]

export default function BrowseCrops() {
  const [crops, setCrops]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [sort, setSort]         = useState('newest')
  const [searchParams]          = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('category') || 'All')

  const navigate = useNavigate()

  const fetchCrops = async () => {
    setLoading(true)
    try {
      const res = await cropService.getAll({
        category: category === 'All' ? '' : category,
        search,
        sort
      })
      setCrops(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCrops()
  }, [category, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCrops()
  }

  return (
    <div className="browse-container">

      {/* HEADER */}
      <div className="browse-header">
        <div className="browse-header-inner">
          <h1 className="browse-title">Browse Crops</h1>
          <p className="browse-subtitle">
            {crops.length} listings available for contract farming
          </p>

          <form onSubmit={handleSearch} className="browse-search-row">
            <input
              className="browse-search-input"
              placeholder="Search crops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="browse-search-btn" type="submit">
              🔍 Search
            </button>
          </form>
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div className="browse-category-bar">
        <div className="browse-category-scroll">
          {categories.map((c) => (
            <button
              key={c}
              className={`browse-category-pill ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="browse-body">

        {/* SIDEBAR */}
        <div className="browse-sidebar">
          <div className="filter-box">
            <div className="filter-title">Categories</div>
            {categories.map((c) => (
              <div
                key={c}
                className={category === c ? 'filter-item-active' : 'filter-item'}
                onClick={() => setCategory(c)}
              >
                {c}
              </div>
            ))}
          </div>

          <div className="filter-box">
            <div className="filter-title">Sort By</div>
            {sortOptions.map((s) => (
              <div
                key={s.value}
                className={sort === s.value ? 'filter-item-active' : 'filter-item'}
                onClick={() => setSort(s.value)}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div className="browse-main">

          {/* MOBILE SORT */}
          <div className="browse-sort-mobile">
            <span className="browse-sort-label">Sort:</span>
            <div className="browse-sort-pills">
              {sortOptions.map((s) => (
                <button
                  key={s.value}
                  className={`browse-sort-pill ${sort === s.value ? 'active' : ''}`}
                  onClick={() => setSort(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="crops-center">
              <div className="crops-spinner">🌱</div>
              <p className="crops-loading-text">Loading crops...</p>
            </div>
          ) : crops.length === 0 ? (
            <div className="crops-center">
              <div style={{ fontSize: '48px' }}>🌾</div>
              <p className="crops-empty-text">No crops found</p>
              <p className="crops-empty-subtext">
                Try a different category or search term
              </p>
            </div>
          ) : (
            <div className="crops-grid">
              {crops.map((crop) => (
                <div key={crop._id} className="crop-card">

                  <div
                    className="crop-card-image"
                    onClick={() => navigate(`/crop/${crop._id}`)}
                  >
                    {crop.images?.[0] ? (
                      <img
                        src={crop.images[0]}
                        alt={crop.name}
                      />
                    ) : (
                      <div className="crop-card-placeholder">🌾</div>
                    )}
                  </div>

                  <div className="crop-card-content">
                    <div className="crop-card-title">{crop.name}</div>

                    <div className="crop-card-location">
                      👨‍🌾 {crop.farmerId?.name || 'Unknown Farmer'}
                    </div>

                    <div className="crop-card-price">
                      ₹{crop.pricePerUnit}/kg
                    </div>

                    <div className="crop-card-quantity">
                      {crop.stock > 0
                        ? `${crop.stock}kg available`
                        : 'Out of stock'}
                    </div>

                    <div className="crop-card-badge">
                      {crop.category}
                    </div>
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


const styles = {
  cropCardFarmer: {
  fontSize: '12px',
  color: '#6b7280',
  marginBottom: '8px',
},
farmerActions: {
  display: 'flex',
  gap: '8px',
  marginTop: '12px',
},
editBtn: {
  flex: 1,
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  color: '#16a34a',
  padding: '8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
},
deleteBtn: {
  flex: 1,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: '8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
},
}
