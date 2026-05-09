import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axiosInstance'

export default function MarketPrices() {
  const [prices, setPrices] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      console.log('📊 Fetching market prices...')

      const pricesRes = await api.get('/api/market/prices')
      console.log('💰 Prices response:', pricesRes.data)
                      console.log(pricesRes.data)


      const historyRes = await api.get('/api/market/prices/history?days=30')
      console.log('📈 History response:', historyRes.data)

      setPrices(Array.isArray(pricesRes.data) ? pricesRes.data : [])
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = selected
    ? history.filter(h => h.cropType === selected)
    : history

  const chartData = filteredHistory
    .slice(-10)
    .map(h => ({
      date: new Date(h.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      price: h.marketPrice
    }))

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading market data...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>📊 Market Prices</h1>
        <p style={styles.subtitle}>Live crop prices across India</p>

        {!prices || prices.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌾</div>
            <p style={styles.emptyText}>No market prices available yet</p>
            <p style={styles.emptySub}>
              Prices will appear once contracts are created
            </p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {prices.map(p => (
                <div
                  key={
                    p._id ||
                    p.cropType ||
                    p.cropName ||
                    p.name
                  }
                  style={
                    selected === p.cropType
                      ? styles.priceCardActive
                      : styles.priceCard
                  }
                  onClick={() =>
                    setSelected(
                      p.cropType ||
                      p.cropName ||
                      p.name ||
                      p.crop
                    )
                  }
                >
                  <div style={styles.priceIcon}>🌾</div>
                  <div style={styles.priceName}>
                    {p.cropType ||
                      p.cropName ||
                      p.name ||
                      p.crop ||
                      'Unknow'}
                  </div>
                  <div style={styles.priceValue}>
                    ₹
                    {typeof p.marketPrice === 'number'
                      ? p.marketPrice.toFixed(2)
                      : '0'}
                    /kg
                  </div>
                  <div style={styles.priceDate}>
                    {p.date
                      ? new Date(p.date).toLocaleDateString()
                      : 'Today'}
                  </div>
                </div>
              ))}
            </div>

            {chartData.length > 0 && (
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>
                  {selected
                    ? `${selected} Price Trend (Last 30 Days)`
                    : 'All Crops - Price Trend'}
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8faf5', padding: '32px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },

  title: { fontSize: '26px', fontWeight: '700', color: '#14532d', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' },
  priceCard: { background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 0.2s' },
  priceCardActive: { background: '#16a34a', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.2)', transform: 'scale(1.02)', color: '#fff' },
  priceIcon: { fontSize: '32px', marginBottom: '8px' },
  priceName: { fontSize: '15px', fontWeight: '600', marginBottom: '8px' },
  priceValue: { fontSize: '24px', fontWeight: '700', marginBottom: '4px' },
  priceDate: { fontSize: '12px', color: '#9ca3af' },

  chartCard: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: '16px', fontWeight: '600', color: '#14532d', marginBottom: '16px' }
}
