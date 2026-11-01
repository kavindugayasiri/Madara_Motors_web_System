// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const { customer, isLoggedIn, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [showPanel, setShowPanel] = useState(false)
  const [hoveredLink, setHoveredLink] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ✅ Close panel on route change
  useEffect(() => {
    setShowPanel(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setShowPanel(false)
    navigate('/')
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navLinks = [
    { label: 'Home',         path: '/'             },
    { label: 'Parts Catalog',path: '/parts'        },
    { label: 'About Us',     path: '/about'        },
    { label: 'Contact',      path: '/contact'      },
    { label: 'Support',      path: '/support'      },
  ]

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0 }
          to   { transform: translateX(0);    opacity: 1 }
        }
        @keyframes fadeOverlay {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        .nav-link-item:hover {
          color: #e67e22 !important;
        }
        .cart-icon-wrap:hover .cart-icon-emoji {
          transform: scale(1.15) rotate(-8deg);
        }
        .cart-icon-emoji {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          display: inline-block;
        }
        .profile-btn:hover {
          border-color: #e67e22 !important;
          background: #fff8f0 !important;
        }
        .login-btn:hover {
          background: #fff8f0 !important;
          color: #d35400 !important;
        }
        .register-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .panel-menu-item:hover {
          background: #f8f9fa !important;
        }
        .panel-logout:hover {
          background: #fff5f5 !important;
        }
      `}</style>

      <nav style={styles.navbar}>

        {/* ━━━ Logo ━━━ */}
        <Link to="/" style={styles.logoWrap}>
          <div style={styles.logoBox}>M</div>
          <span style={styles.logoText}>Madara Motors</span>
        </Link>

        {/* ━━━ Nav Links ━━━ */}
        <ul style={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className="nav-link-item"
                style={{
                  ...styles.navLink,
                  color:      isActive(link.path) ? '#e67e22' : '#555',
                  fontWeight: isActive(link.path) ? '700'     : '500',
                  borderBottom: isActive(link.path)
                    ? '2.5px solid #e67e22'
                    : '2.5px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ━━━ Right Side ━━━ */}
        <div style={styles.navRight}>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="cart-icon-wrap"
            style={styles.cartWrap}
            title={`Cart (${totalItems} items)`}
          >
            <span className="cart-icon-emoji" style={{ fontSize:'24px' }}>🛒</span>
            {totalItems > 0 && (
              <span style={styles.cartBadge}>
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <div
              className="profile-btn"
              style={styles.profileBtn}
              onClick={() => setShowPanel(!showPanel)}
            >
              <div style={styles.avatar}>
                {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <span style={styles.profileName}>
                {customer?.name?.split(' ')[0] || 'Customer'}
              </span>
              <span style={{ fontSize:'11px', color:'#aaa', transition:'transform 0.2s', transform: showPanel ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/customer/login"    className="login-btn"    style={styles.loginBtn}>Login</Link>
              <Link to="/customer/register" className="register-btn" style={styles.registerBtn}>Register</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ━━━ Side Panel ━━━ */}
      {isLoggedIn && showPanel && (
        <>
          {/* Overlay */}
          <div
            style={styles.overlay}
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div ref={panelRef} style={styles.sidePanel}>

            {/* Panel Header */}
            <div style={styles.panelHeader}>
              <div style={styles.panelAvatar}>
                {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={styles.panelName}>
                  {customer?.name || 'Customer'}
                </div>
                <div style={styles.panelEmail}>
                  {customer?.email || ''}
                </div>
              </div>
              <button
                style={styles.closeBtn}
                onClick={() => setShowPanel(false)}
              >✕</button>
            </div>

           

<div style={styles.panelDivider} />

<div style={styles.menuSection}>
  {[
    { label: 'Home',          icon: '🏠', path: '/',                 color: '#3498db' },
    { label: 'Parts Catalog', icon: '📂', path: '/parts',            color: '#e67e22' },
    { label: 'My Cart',       icon: '🛒', path: '/cart',             color: '#e74c3c' },
    { label: 'My Orders',     icon: '📦', path: '/customer/orders',  color: '#2ecc71' },
    { label: 'Support',       icon: '📞', path: '/contact',          color: '#9b59b6' },
    { label: 'My Profile',    icon: '👤', path: '/customer/profile', color: '#3498db' },
  ].map((item, i) => (
    <div
      key={i}
      className="panel-menu-item"
      style={{
        ...styles.menuItem,
        background: isActive(item.path) ? '#fff8f0' : 'transparent',
      }}
      onClick={() => { navigate(item.path); setShowPanel(false); }}
    >
      <div style={{ ...styles.menuIcon, background: item.color + '20' }}>
        <span style={{ fontSize: '18px' }}>{item.icon}</span>
      </div>
      <span style={{
        ...styles.menuLabel,
        color: isActive(item.path) ? '#e67e22' : '#333',
      }}>
        {item.label}
      </span>
      <span style={styles.menuArrow}>›</span>
    </div>
  ))}
</div>

<div style={styles.panelDivider} />


            {/* Logout */}
            <div style={styles.menuSection}>
              <div
                className="panel-logout"
                style={styles.logoutItem}
                onClick={handleLogout}
              >
                <div style={{ ...styles.menuIcon, background:'#e74c3c20' }}>
                  <span style={{ fontSize:'18px' }}>🚪</span>
                </div>
                <span style={{ color:'#e74c3c', fontWeight:'700', fontSize:'14px' }}>
                  Logout
                </span>
              </div>
            </div>

            {/* Panel Footer */}
            <div style={styles.panelFooter}>
              <div style={styles.footerLogo}>M</div>
              <span style={styles.footerText}>Madara Motors © 2025</span>
            </div>

          </div>
        </>
      )}
    </>
  )
}

const styles = {
  navbar: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 40px',
    height:         '68px',
    background:     'white',
    boxShadow:      '0 2px 20px rgba(0,0,0,0.08)',
    position:       'sticky',
    top:            0,
    zIndex:         1000,
    width:          '100%',
    boxSizing:      'border-box',
  },

  // Logo
  logoWrap: {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoBox: {
    width:          '40px',
    height:         '40px',
    background:     'linear-gradient(135deg,#e67e22,#d35400)',
    borderRadius:   '10px',
    color:          'white',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     'bold',
    fontSize:       '20px',
    boxShadow:      '0 4px 10px rgba(230,126,34,0.4)',
  },
  logoText: {
    fontWeight: '800',
    fontSize:   '19px',
    color:      '#1a1a2e',
  },

  // Nav Links
  navLinks: {
    display:        'flex',
    gap:            '28px',
    margin:         0,
    padding:        0,
    listStyle:      'none',
    flex:           1,
    justifyContent: 'center',
  },
  navLink: {
    textDecoration: 'none',
    fontSize:       '14.5px',
    transition:     'color 0.2s, border-color 0.2s',
    display:        'inline-block',
  },

  // Right
  navRight: {
    display:    'flex',
    alignItems: 'center',
    gap:        '16px',
    flexShrink: 0,
  },
  cartWrap: {
    position:       'relative',
    textDecoration: 'none',
    cursor:         'pointer',
    flexShrink:     0,
    display:        'flex',
    alignItems:     'center',
  },
  cartBadge: {
    position:       'absolute',
    top:            '-9px',
    right:          '-9px',
    background:     'linear-gradient(135deg,#e31e24,#c0392b)',
    color:          'white',
    borderRadius:   '50%',
    minWidth:       '20px',
    height:         '20px',
    fontSize:       '11px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     'bold',
    padding:        '0 4px',
    boxShadow:      '0 3px 8px rgba(227,30,36,0.4)',
    border:         '2px solid white',
  },
  authBtns: {
    display:    'flex',
    gap:        '10px',
    alignItems: 'center',
  },
  loginBtn: {
    padding:        '8px 22px',
    border:         '2px solid #e67e22',
    borderRadius:   '8px',
    color:          '#e67e22',
    fontWeight:     '700',
    fontSize:       '14px',
    textDecoration: 'none',
    transition:     'all 0.2s',
  },
  registerBtn: {
    padding:        '8px 22px',
    background:     'linear-gradient(135deg,#e67e22,#d35400)',
    borderRadius:   '8px',
    color:          'white',
    fontWeight:     '700',
    fontSize:       '14px',
    textDecoration: 'none',
    boxShadow:      '0 4px 12px rgba(230,126,34,0.3)',
    transition:     'all 0.2s',
    display:        'inline-block',
  },
  profileBtn: {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    padding:    '7px 14px',
    border:     '1.5px solid #eee',
    borderRadius: '25px',
    background: '#fafafa',
    cursor:     'pointer',
    userSelect: 'none',
    transition: 'all 0.2s',
  },
  avatar: {
    width:          '32px',
    height:         '32px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg,#e67e22,#d35400)',
    color:          'white',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     'bold',
    fontSize:       '14px',
  },
  profileName: {
    fontWeight: '600',
    fontSize:   '14px',
    color:      '#333',
  },

  // Overlay
  overlay: {
    position:        'fixed',
    inset:           0,
    background:      'rgba(0,0,0,0.5)',
    zIndex:          1998,
    backdropFilter:  'blur(3px)',
    animation:       'fadeOverlay 0.25s ease',
  },

  // Side Panel
  sidePanel: {
    position:       'fixed',
    top:            0,
    right:          0,
    width:          '310px',
    height:         '100vh',
    background:     'white',
    zIndex:         1999,
    boxShadow:      '-10px 0 50px rgba(0,0,0,0.2)',
    display:        'flex',
    flexDirection:  'column',
    overflowY:      'auto',
    animation:      'slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  },

  panelHeader: {
    display:    'flex',
    alignItems: 'center',
    gap:        '14px',
    padding:    '25px 20px',
    background: 'linear-gradient(135deg,#1a1a2e,#2d2d44)',
    flexShrink: 0,
  },
  panelAvatar: {
    width:          '52px',
    height:         '52px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg,#e67e22,#d35400)',
    color:          'white',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     'bold',
    fontSize:       '22px',
    flexShrink:     0,
    boxShadow:      '0 4px 12px rgba(230,126,34,0.4)',
  },
  panelName: {
    fontWeight:   '700',
    fontSize:     '15px',
    color:        'white',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  },
  panelEmail: {
    fontSize:     '12px',
    color:        '#aaa',
    marginTop:    '3px',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  },
  closeBtn: {
    background:     'rgba(255,255,255,0.15)',
    border:         'none',
    borderRadius:   '50%',
    width:          '32px',
    height:         '32px',
    cursor:         'pointer',
    fontSize:       '14px',
    color:          'white',
    flexShrink:     0,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    transition:     'background 0.2s',
  },

  panelDivider: { borderTop:'1px solid #f0f0f0', flexShrink:0 },

  menuSection:      { padding:'10px', flexShrink:0 },
  menuSectionTitle: { fontSize:'11px', color:'#bbb', fontWeight:'700', letterSpacing:'1.5px', padding:'8px 12px 4px' },
  menuItem: {
    display:     'flex',
    alignItems:  'center',
    gap:         '12px',
    padding:     '10px 12px',
    borderRadius:'10px',
    cursor:      'pointer',
    transition:  'background 0.2s',
    marginBottom:'2px',
  },
  menuIcon: {
    width:          '38px',
    height:         '38px',
    borderRadius:   '10px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  menuLabel: { flex:1, fontSize:'14px', fontWeight:'600', color:'#333' },
  menuBadge: {
    background:     '#e74c3c',
    color:          'white',
    borderRadius:   '50%',
    width:          '20px',
    height:         '20px',
    fontSize:       '11px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     'bold',
  },
  menuArrow: { color:'#ddd', fontSize:'20px', fontWeight:'300' },

  logoutItem: {
    display:     'flex',
    alignItems:  'center',
    gap:         '12px',
    padding:     '10px 12px',
    borderRadius:'10px',
    cursor:      'pointer',
    transition:  'background 0.2s',
  },

  panelFooter: {
    marginTop:  'auto',
    padding:    '18px 20px',
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
    borderTop:  '1px solid #f0f0f0',
    background: '#fafafa',
    flexShrink: 0,
  },
  footerLogo: {
    width:          '28px',
    height:         '28px',
    background:     'linear-gradient(135deg,#e67e22,#d35400)',
    borderRadius:   '6px',
    color:          'white',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     'bold',
    fontSize:       '13px',
  },
  footerText: { fontSize:'12px', color:'#888', fontWeight:'500' },
}

export default Navbar