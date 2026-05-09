import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function Profile() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [activeTab, setActiveTab] = useState('info')

  const [info, setInfo]               = useState({ name: user?.name || '', email: user?.email || '' })
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoMsg, setInfoMsg]         = useState(null)

  const [passwords, setPasswords]     = useState({ current: '', newPass: '', confirm: '' })
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg]         = useState(null)

  const [avatar, setAvatar]               = useState(user?.avatar || null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarMsg, setAvatarMsg]         = useState(null)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleInfoSave = async () => {
    setInfoLoading(true)
    setInfoMsg(null)
    try {
      await api.put('/api/auth/profile', { name: info.name, email: info.email })
      setInfoMsg({ type: 'success', text: '✅ Profile updated successfully!' })
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setInfoLoading(false)
    }
  }

  const handlePasswordSave = async () => {
    if (passwords.newPass !== passwords.confirm) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (passwords.newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    setPassLoading(true)
    setPassMsg(null)
    try {
      await api.put('/api/auth/password', {
        currentPassword: passwords.current,
        newPassword:     passwords.newPass
      })
      setPassMsg({ type: 'success', text: '✅ Password changed successfully!' })
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' })
    } finally {
      setPassLoading(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarLoading(true)
    setAvatarMsg(null)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.put('/api/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAvatar(res.data.avatar)
      setAvatarMsg({ type: 'success', text: '✅ Profile photo updated!' })
    } catch (err) {
      setAvatarMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload photo' })
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== user?.name) return
    setDeleteLoading(true)
    try {
      await api.delete('/api/auth/account')
      dispatch({ type: 'auth/logout' })
      navigate('/')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  const tabs = [
    { id: 'info',     icon: '👤', label: 'Edit Profile'    },
    { id: 'avatar',   icon: '📷', label: 'Profile Photo'   },
    { id: 'password', icon: '🔑', label: 'Change Password' },
    { id: 'delete',   icon: '🗑️', label: 'Delete Account'  },
  ]

  const deleteItems = user?.role === 'farmer'
    ? ['All your crop listings', 'Your contract history', 'Your reviews and ratings', 'Your account and login access']
    : ['All your orders and contracts', 'Your cart and wishlist', 'Your reviews and queries', 'Your account and login access']

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div style={s.avatarWrap}>
            {avatar ? (
              <img src={avatar} alt='avatar' style={s.avatarImg} />
            ) : (
              <div style={s.avatarPlaceholder}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button style={s.changePhotoBtn} onClick={() => setActiveTab('avatar')}>
              📷 Change Photo
            </button>
          </div>
          <div style={s.headerInfo}>
            <div style={{
              ...s.roleBadge,
              background: user?.role === 'farmer' ? '#dcfce7' : '#dbeafe',
              color:      user?.role === 'farmer' ? '#14532d' : '#1e40af'
            }}>
              {user?.role === 'farmer' ? '👨‍🌾 Farmer Account' : '🛒 Buyer Account'}
            </div>
            <h1 style={s.name}>{user?.name}</h1>
            <p style={s.email}>📧 {user?.email}</p>
          </div>
        </div>

        <div style={s.layout}>

          {/* ── SIDEBAR ── */}
          <div style={s.sidebar}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...s.sideTab,
                  ...(activeTab === tab.id ? s.sideTabActive : {}),
                  ...(tab.id === 'delete' ? s.sideTabDelete : {}),
                  ...(tab.id === 'delete' && activeTab === tab.id ? s.sideTabDeleteActive : {}),
                }}
              >
                <span>{tab.icon}</span>
                <span style={{ flex: 1 }}>{tab.label}</span>
                {activeTab === tab.id && <span style={s.arrow}>›</span>}
              </button>
            ))}
          </div>

          {/* ── CONTENT ── */}
          <div style={s.content}>

            {/* Edit Profile */}
            {activeTab === 'info' && (
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.cardIcon}>👤</div>
                  <div>
                    <div style={s.cardTitle}>Edit Profile</div>
                    <div style={s.cardSub}>Update your name and email address</div>
                  </div>
                </div>
                <div style={s.divider} />
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input style={s.input} value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} placeholder='Your full name' />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input style={s.input} type='email' value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} placeholder='your@email.com' />
                </div>
                {infoMsg && <div style={infoMsg.type === 'success' ? s.successMsg : s.errorMsg}>{infoMsg.text}</div>}
                <button style={infoLoading ? s.btnDisabled : s.btn} onClick={handleInfoSave} disabled={infoLoading}>
                  {infoLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Profile Photo */}
            {activeTab === 'avatar' && (
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.cardIcon}>📷</div>
                  <div>
                    <div style={s.cardTitle}>Profile Photo</div>
                    <div style={s.cardSub}>Upload or update your profile picture</div>
                  </div>
                </div>
                <div style={s.divider} />
                <div style={s.avatarSection}>
                  <div style={s.avatarPreviewWrap}>
                    {avatar ? (
                      <img src={avatar} alt='avatar' style={s.avatarLarge} />
                    ) : (
                      <div style={s.avatarLargePlaceholder}>{user?.name?.charAt(0).toUpperCase()}</div>
                    )}
                    <div style={s.avatarLabel}>Current Photo</div>
                  </div>
                  <div style={s.avatarActions}>
                    <p style={s.avatarHint}>
                      Choose a clear photo. Supported: <strong>JPG, PNG, WEBP</strong>. Max size: 5MB.
                    </p>
                    <input ref={fileRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={handleAvatarChange} />
                    <button style={avatarLoading ? s.btnDisabled : s.btn} onClick={() => fileRef.current.click()} disabled={avatarLoading}>
                      {avatarLoading ? 'Uploading...' : '📷 Upload New Photo'}
                    </button>
                  </div>
                </div>
                {avatarMsg && <div style={avatarMsg.type === 'success' ? s.successMsg : s.errorMsg}>{avatarMsg.text}</div>}
              </div>
            )}

            {/* Change Password */}
            {activeTab === 'password' && (
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.cardIcon}>🔑</div>
                  <div>
                    <div style={s.cardTitle}>Change Password</div>
                    <div style={s.cardSub}>Keep your account secure with a strong password</div>
                  </div>
                </div>
                <div style={s.divider} />
                <div style={s.field}>
                  <label style={s.label}>Current Password</label>
                  <input style={s.input} type='password' value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} placeholder='Enter your current password' />
                </div>
                <div style={s.field}>
                  <label style={s.label}>New Password</label>
                  <input style={s.input} type='password' value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder='Minimum 6 characters' />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Confirm New Password</label>
                  <input style={s.input} type='password' value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder='Re-enter your new password' />
                </div>
                {passMsg && <div style={passMsg.type === 'success' ? s.successMsg : s.errorMsg}>{passMsg.text}</div>}
                <button style={passLoading ? s.btnDisabled : s.btn} onClick={handlePasswordSave} disabled={passLoading}>
                  {passLoading ? 'Updating...' : '🔑 Update Password'}
                </button>
              </div>
            )}

            {/* Delete Account */}
            {activeTab === 'delete' && (
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <div style={{ ...s.cardIcon, background: '#fef2f2' }}>🗑️</div>
                  <div>
                    <div style={{ ...s.cardTitle, color: '#dc2626' }}>Delete Account</div>
                    <div style={s.cardSub}>Permanently remove your account and all data</div>
                  </div>
                </div>
                <div style={s.divider} />
                <div style={s.deleteWarning}>
                  <div style={s.deleteWarningTitle}>⚠️ This action cannot be undone</div>
                  <div style={s.deleteWarningText}>The following data will be permanently deleted:</div>
                  <div style={s.deleteList}>
                    {deleteItems.map((item, i) => (
                      <div key={i} style={s.deleteListItem}>✗ {item}</div>
                    ))}
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>
                    To confirm, type your name: <strong>{user?.name}</strong>
                  </label>
                  <input
                    style={{
                      ...s.input,
                      borderColor: deleteConfirm
                        ? deleteConfirm === user?.name ? '#16a34a' : '#fecaca'
                        : '#d1d5db'
                    }}
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder={`Type "${user?.name}" to confirm`}
                  />
                </div>
                <button
                  style={deleteConfirm === user?.name ? s.deleteBtn : s.deleteBtnDisabled}
                  onClick={handleDelete}
                  disabled={deleteConfirm !== user?.name || deleteLoading}
                >
                  {deleteLoading ? 'Deleting Account...' : '🗑️ Yes, Delete My Account'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page:      { minHeight: '100vh', background: '#f8faf5', padding: '32px 16px' },
  container: { maxWidth: '860px', margin: '0 auto' },

  header:            { display: 'flex', alignItems: 'center', gap: '24px', background: '#fff', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px', flexWrap: 'wrap' },
  avatarWrap:        { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0 },
  avatarImg:         { width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dcfce7' },
  avatarPlaceholder: { width: '84px', height: '84px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '700' },
  changePhotoBtn:    { background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: '#6b7280', cursor: 'pointer' },
  headerInfo:        { flex: 1 },
  roleBadge:         { display: 'inline-block', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '8px' },
  name:              { fontSize: '22px', fontWeight: '700', color: '#14532d', margin: '0 0 4px' },
  email:             { fontSize: '14px', color: '#6b7280', margin: 0 },

  layout:  { display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' },

  sidebar: { display: 'flex', flexDirection: 'column', gap: '4px', width: '200px', flexShrink: 0, background: '#fff', borderRadius: '14px', padding: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sideTab: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6b7280', textAlign: 'left', width: '100%' },
  sideTabActive:       { background: '#f0fdf4', color: '#14532d', fontWeight: '600' },
  sideTabDelete:       { color: '#dc2626' },
  sideTabDeleteActive: { background: '#fef2f2', color: '#dc2626' },
  arrow: { fontSize: '18px', color: '#16a34a' },

  content: { flex: 1, minWidth: '280px' },
  card:    { background: '#fff', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },

  cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' },
  cardIcon:   { width: '44px', height: '44px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  cardTitle:  { fontSize: '16px', fontWeight: '700', color: '#14532d' },
  cardSub:    { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  divider:    { height: '1px', background: '#f3f4f6', marginBottom: '24px' },

  field:  { marginBottom: '16px' },
  label:  { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input:  { width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },

  btn:        { background: '#16a34a', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnDisabled:{ background: '#86efac', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px' },

  successMsg: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg:   { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },

  avatarSection:          { display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
  avatarPreviewWrap:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  avatarLarge:            { width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dcfce7' },
  avatarLargePlaceholder: { width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: '700' },
  avatarLabel:            { fontSize: '11px', color: '#9ca3af' },
  avatarActions:          { flex: 1 },
  avatarHint:             { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', marginBottom: '16px' },

  deleteWarning:     { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', marginBottom: '20px' },
  deleteWarningTitle:{ fontSize: '14px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' },
  deleteWarningText: { fontSize: '13px', color: '#6b7280', marginBottom: '10px' },
  deleteList:        { display: 'flex', flexDirection: 'column', gap: '4px' },
  deleteListItem:    { fontSize: '13px', color: '#dc2626' },
  deleteBtn:         { background: '#dc2626', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  deleteBtnDisabled: { background: '#fca5a5', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px' },
}