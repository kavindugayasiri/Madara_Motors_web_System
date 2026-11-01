
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, getMyProfile, updateMyProfile } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CustomerDashboard = () => {
  const { customer, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({})
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { navigate('/customer/login'); return }
    loadDashboard()
  }, [isLoggedIn])

  const loadDashboard = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        getMyProfile(),
        getMyOrders(),
      ])
      setProfile(profileRes.data)
      setProfileForm(profileRes.data)
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : [])
    } catch (err) {
      console.error('Dashboard load error:', err)
      const localData = JSON.parse(localStorage.getItem('customerData') || '{}')
      setProfile(localData)
      setProfileForm(localData)
      setOrders([])
    }
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    try {
      await updateMyProfile(profileForm)
      setSaveMsg('✅ Profile updated successfully!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setSaveMsg('❌ Update failed. Try again.')
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: '📦', color: '#e67e22' },
    { label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length, icon: '✅', color: '#27ae60' },
    { label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, icon: '⏳', color: '#3498db' },
    { label: 'Returns', value: orders.filter(o => o.status === 'RETURNED').length, icon: '↩️', color: '#e74c3c' },
  ]

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders', icon: '📦', label: 'My Orders' },
    { id: 'wishlist', icon: '❤️', label: 'Wishlist' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ]

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        flexDirection: 'column', gap: '15px'
      }}>
        <div style={{
          width: '45px', height: '45px',
          border: '4px solid #f0f0f0',
          borderTop: '4px solid #e67e22',
          borderRadius: '50%',
        }} />
        <p style={{ color: '#888' }}>Loading Dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={styles.layout}>
        {/* ✅ SIDEBAR */}
        <div style={styles.sidebar}>

          {/* User Card */}
          <div style={styles.userCard}>
            <div style={styles.sideAvatar}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={styles.sideUserName}>
                {profile?.name || 'Customer'}
              </div>
              <div style={styles.sideUserEmail}>
                {profile?.email || ''}
              </div>
            </div>
          </div>

          {/* ✅ Navigation */}
          <nav style={styles.sideNav}>

            {/* ✅ Home - Link to "/" */}
            <Link
              to="/"
              style={{
                ...styles.sideNavItem,
                textDecoration: 'none',
                color: '#aaa',
              }}
            >
              <span style={{ fontSize: '18px' }}>🏠</span>
              <span>Home</span>
            </Link>

            {/* ✅ Other Tabs */}
            {navItems.map(item => (
              <div
                key={item.id}
                style={{
                  ...styles.sideNavItem,
                  ...(activeTab === item.id ? styles.sideNavActive : {}),
                }}
                onClick={() => setActiveTab(item.id)}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Quick Links */}
          <div style={styles.sideLinks}>
            <div style={styles.sideLinkTitle}>Quick Links</div>
            <Link to="/parts-catalog" style={styles.sideLink}>
              <span>🔧</span>
              <span>Browse Parts</span>
            </Link>
            <Link to="/cart" style={styles.sideLink}>
              <span>🛒</span>
              <span>My Cart</span>
            </Link>
          </div>

          {/* Logout */}
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>

          {/* ===== DASHBOARD TAB ===== */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={styles.pageHeader}>
                <h2 style={styles.pageTitle}>
                  👋 Welcome, {profile?.name?.split(' ')[0] || 'Customer'}!
                </h2>
                <span style={styles.dateText}>
                  {new Date().toLocaleDateString('en-LK', {
                    weekday: 'long', year: 'numeric',
                    month: 'long', day: 'numeric'
                  })}
                </span>
              </div>

              {/* Stats Cards */}
              <div style={styles.statsGrid}>
                {stats.map((s, i) => (
                  <div key={i} style={{
                    ...styles.statCard,
                    borderTop: `4px solid ${s.color}`
                  }}>
                    <div style={styles.statIcon}>{s.icon}</div>
                    <div style={{ ...styles.statValue, color: s.color }}>
                      {s.value}
                    </div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
                <div style={styles.quickGrid}>
                  {[
                    { to: '/parts-catalog', icon: '🛒', label: 'Browse Parts', isLink: true },
                    { icon: '📋', label: 'My Orders', action: () => setActiveTab('orders') },
                    { icon: '❤️', label: 'Wishlist', action: () => setActiveTab('wishlist') },
                    { icon: '✏️', label: 'Edit Profile', action: () => setActiveTab('profile') },
                  ].map((item, i) => (
                    item.isLink ? (
                      <Link key={i} to={item.to} style={styles.quickCard}>
                        <span style={styles.quickIcon}>{item.icon}</span>
                        <span style={styles.quickLabel}>{item.label}</span>
                      </Link>
                    ) : (
                      <div key={i} style={styles.quickCard} onClick={item.action}>
                        <span style={styles.quickIcon}>{item.icon}</span>
                        <span style={styles.quickLabel}>{item.label}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>📦 Recent Orders</h3>
                  <button
                    style={styles.viewAllBtn}
                    onClick={() => setActiveTab('orders')}
                  >
                    View All →
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <p style={styles.emptyIcon}>📦</p>
                    <p style={styles.emptyText}>No orders yet!</p>
                    <Link to="/parts-catalog" style={styles.shopNowBtn}>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.thead}>
                          <th style={styles.th}>Order ID</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Amount</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order, i) => (
                          <tr key={i} style={styles.trow}>
                            <td style={styles.td}>#{order.id}</td>
                            <td style={styles.td}>
                              {order.orderDate || order.date || 'N/A'}
                            </td>
                            <td style={styles.td}>
                              Rs. {(order.totalAmount || 0).toLocaleString()}
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusBadge,
                                background: order.status === 'COMPLETED' ? '#d4edda'
                                  : order.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                                color: order.status === 'COMPLETED' ? '#155724'
                                  : order.status === 'PENDING' ? '#856404' : '#721c24',
                              }}>
                                {order.status || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== ORDERS TAB ===== */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={styles.pageTitle}>📦 My Orders</h2>
              <div style={styles.section}>
                {orders.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <p style={styles.emptyIcon}>📭</p>
                    <p style={styles.emptyText}>No orders found!</p>
                    <Link to="/parts-catalog" style={styles.shopNowBtn}>
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.thead}>
                          <th style={styles.th}>Order ID</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Items</th>
                          <th style={styles.th}>Total</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, i) => (
                          <tr key={i} style={styles.trow}>
                            <td style={styles.td}>#{order.id}</td>
                            <td style={styles.td}>
                              {order.orderDate || order.date || 'N/A'}
                            </td>
                            <td style={styles.td}>
                              {order.items?.length || 0} items
                            </td>
                            <td style={styles.td}>
                              Rs. {(order.totalAmount || 0).toLocaleString()}
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusBadge,
                                background: order.status === 'COMPLETED'
                                  ? '#d4edda' : '#fff3cd',
                                color: order.status === 'COMPLETED'
                                  ? '#155724' : '#856404',
                              }}>
                                {order.status || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== WISHLIST TAB ===== */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 style={styles.pageTitle}>❤️ My Wishlist</h2>
              <div style={styles.section}>
                <div style={styles.emptyBox}>
                  <p style={styles.emptyIcon}>❤️</p>
                  <p style={styles.emptyText}>Your wishlist is empty!</p>
                  <Link to="/parts-catalog" style={styles.shopNowBtn}>
                    Browse Parts
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ===== PROFILE TAB ===== */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={styles.pageTitle}>👤 My Profile</h2>
              <div style={styles.section}>
                {saveMsg && (
                  <div style={{
                    padding: '12px 15px', borderRadius: '8px',
                    marginBottom: '20px', fontSize: '14px',
                    background: saveMsg.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: saveMsg.includes('✅') ? '#155724' : '#721c24',
                  }}>
                    {saveMsg}
                  </div>
                )}
                <div style={styles.profileGrid}>
                  <div style={styles.profileAvatarWrap}>
                    <div style={styles.profileAvatar}>
                      {profile?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div style={styles.profileAvatarName}>{profile?.name}</div>
                    <div style={styles.profileAvatarEmail}>{profile?.email}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[
                      { key: 'name', label: 'Full Name', type: 'text' },
                      { key: 'email', label: 'Email (Read-only)', type: 'email', disabled: true },
                      { key: 'phone', label: 'Phone Number', type: 'tel' },
                      { key: 'address', label: 'Address', type: 'text' },
                    ].map(f => (
                      <div key={f.key} style={styles.field}>
                        <label style={styles.fieldLabel}>{f.label}</label>
                        <input
                          type={f.type}
                          style={{
                            ...styles.fieldInput,
                            background: f.disabled ? '#f9f9f9' : 'white',
                          }}
                          value={profileForm[f.key] || ''}
                          onChange={e => setProfileForm({
                            ...profileForm, [f.key]: e.target.value
                          })}
                          disabled={f.disabled}
                        />
                      </div>
                    ))}
                    <button style={styles.saveBtn} onClick={handleSaveProfile}>
                      💾 Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex', flex: 1,
    minHeight: 'calc(100vh - 68px)',
  },
  sidebar: {
    width: '250px',
    background: '#1a1a2e',
    color: 'white',
    padding: '25px 15px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: '68px',
    height: 'calc(100vh - 68px)',
    overflowY: 'auto',
  },
  userCard: {
    display: 'flex', alignItems: 'center',
    gap: '12px', background: '#2d2d44',
    borderRadius: '12px', padding: '14px',
    marginBottom: '25px',
  },
  sideAvatar: {
    width: '44px', height: '44px',
    borderRadius: '50%', background: '#e67e22',
    color: 'white', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '18px', flexShrink: 0,
  },
  sideUserName: {
    fontWeight: '700', fontSize: '13px',
    color: 'white', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  sideUserEmail: {
    fontSize: '11px', color: '#aaa',
    marginTop: '2px', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  sideNav: { marginBottom: '10px' },
  sideNavItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 15px', borderRadius: '10px',
    cursor: 'pointer', color: '#aaa',
    marginBottom: '5px', fontSize: '14px',
    fontWeight: '500', transition: 'all 0.2s',
  },
  sideNavActive: {
    background: '#e67e22', color: 'white',
  },
  sideLinks: {
    marginTop: '10px',
    borderTop: '1px solid #2d2d44',
    paddingTop: '15px',
    marginBottom: '15px',
  },
  sideLinkTitle: {
    fontSize: '11px', color: '#555',
    fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: '1px', marginBottom: '8px',
    paddingLeft: '12px',
  },
  sideLink: {
    display: 'flex', alignItems: 'center',
    gap: '10px', padding: '9px 12px',
    color: '#888', textDecoration: 'none',
    fontSize: '13px', marginBottom: '3px',
    borderRadius: '8px', fontWeight: '500',
  },
  logoutBtn: {
    width: '100%', padding: '12px',
    background: 'rgba(231, 76, 60, 0.15)',
    color: '#e74c3c',
    border: '1px solid rgba(231,76,60,0.3)',
    borderRadius: '10px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600',
    marginTop: 'auto',
  },
  mainContent: {
    flex: 1, padding: '35px 40px',
    background: '#f5f7fa', overflowY: 'auto',
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '25px',
  },
  pageTitle: {
    fontSize: '24px', fontWeight: '700',
    color: '#1a1a2e', margin: '0 0 20px 0',
  },
  dateText: { color: '#888', fontSize: '14px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px', marginBottom: '25px',
  },
  statCard: {
    background: 'white', borderRadius: '14px',
    padding: '22px', textAlign: 'center',
    boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
  },
  statIcon: { fontSize: '30px', marginBottom: '10px' },
  statValue: { fontSize: '30px', fontWeight: '800' },
  statLabel: { color: '#999', fontSize: '13px', marginTop: '5px' },
  section: {
    background: 'white', borderRadius: '14px',
    padding: '25px', marginBottom: '20px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '17px', fontWeight: '700',
    color: '#1a1a2e', margin: '0 0 15px 0',
  },
  viewAllBtn: {
    padding: '6px 16px', background: '#f3f4f6',
    border: 'none', borderRadius: '8px',
    color: '#555', cursor: 'pointer', fontSize: '13px',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px', marginTop: '15px',
  },
  quickCard: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '20px 15px',
    background: '#f8f9fa', borderRadius: '12px',
    cursor: 'pointer', textDecoration: 'none',
    color: '#333', border: '2px solid transparent',
  },
  quickIcon: { fontSize: '28px', marginBottom: '8px' },
  quickLabel: { fontSize: '13px', fontWeight: '600', color: '#555' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  thead: { background: '#f8f9fa' },
  th: {
    padding: '12px 15px', textAlign: 'left',
    fontWeight: '600', color: '#555', fontSize: '13px',
    borderBottom: '2px solid #eee',
  },
  trow: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '13px 15px', color: '#333' },
  statusBadge: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
  },
  emptyBox: { textAlign: 'center', padding: '50px 20px' },
  emptyIcon: { fontSize: '50px', marginBottom: '15px' },
  emptyText: { color: '#888', fontSize: '16px', marginBottom: '20px' },
  shopNowBtn: {
    display: 'inline-block', padding: '11px 28px',
    background: '#e67e22', color: 'white',
    borderRadius: '8px', textDecoration: 'none',
    fontWeight: '600', fontSize: '14px',
  },
  profileGrid: { display: 'flex', gap: '30px', alignItems: 'flex-start' },
  profileAvatarWrap: { textAlign: 'center', minWidth: '140px' },
  profileAvatar: {
    width: '80px', height: '80px',
    borderRadius: '50%', background: '#e67e22',
    color: 'white', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '34px',
    margin: '0 auto 10px',
  },
  profileAvatarName: { fontWeight: '700', fontSize: '15px', color: '#1a1a2e' },
  profileAvatarEmail: { fontSize: '12px', color: '#888', marginTop: '4px' },
  field: { marginBottom: '16px' },
  fieldLabel: {
    display: 'block', marginBottom: '6px',
    fontWeight: '600', fontSize: '14px', color: '#374151',
  },
  fieldInput: {
    width: '100%', padding: '12px 15px',
    borderRadius: '10px', border: '1.5px solid #e5e7eb',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
  },
  saveBtn: {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    color: 'white', border: 'none',
    borderRadius: '10px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer', marginTop: '8px',
  },
}

export default CustomerDashboard