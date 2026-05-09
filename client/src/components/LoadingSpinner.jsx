export function LoadingSpinner({ size = 48 }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '12px'
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #16a34a',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: '#6b7280' }}>Loading...</p>
    </div>
  )
}