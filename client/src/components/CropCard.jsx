export function CropCard({ crop, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      {/* Image */}
      <div style={{ height: '180px', overflow: 'hidden', background: '#f0fdf4' }}>
        {crop.images?.[0] ? (
          <img 
            src={crop.images[0]} 
            alt={crop.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '64px'
          }}>
            🌾
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '16px' }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '700', 
          color: '#14532d',
          marginBottom: '6px'
        }}>
          {crop.name}
        </div>
        
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#16a34a',
          marginBottom: '8px'
        }}>
          ₹{crop.pricePerUnit}/kg
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          {crop.stock}kg available • Min {crop.minOrderQty}kg
        </div>
      </div>
    </div>
  )
}