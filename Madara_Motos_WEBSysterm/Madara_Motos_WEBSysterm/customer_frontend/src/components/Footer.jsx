
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.col}>
          <div style={styles.logoWrap}>
            <div style={styles.logoBox}>M</div>
            <span style={styles.logoText}>Madara Motors</span>
          </div>
          <p style={styles.desc}>
            Sri Lanka's #1 trusted marketplace for genuine vehicle parts.
            Quality parts delivered to your doorstep.
          </p>
        </div>

        {/* Quick Links */}
        <div style={styles.col}>
          <h3 style={styles.colTitle}>Quick Links</h3>
          <div style={styles.links}>
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/parts-catalog" style={styles.link}>Parts Catalog</Link>
            <Link to="/about" style={styles.link}>About Us</Link>
            <Link to="/contact" style={styles.link}>Contact</Link>
            <Link to="/customer/login" style={styles.link}>Customer Login</Link>
            <Link to="/customer/register" style={styles.link}>Register</Link>
          </div>
        </div>

        {/* Contact */}
        <div style={styles.col}>
          <h3 style={styles.colTitle}>Contact Us</h3>
          <div style={styles.links}>
            <span style={styles.contactItem}>
              📍 Puththal Rd, Wariyapola
            </span>
            <span style={styles.contactItem}>
              📞 +94 76 992 4173
            </span>
            <span style={styles.contactItem}>
              ✉️ madaramotors123@gmail.com
            </span>
            <span style={styles.contactItem}>
              🕒 Mon-Sat: 8AM - 6PM
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <p style={styles.bottomText}>
          © 2025 Madara Motors - All Rights Reserved.
        </p>
        <p style={styles.bottomText}>
          Made with ❤️ in Sri Lanka 🇱🇰
        </p>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    background: '#1a1a2e',
    color: '#ccc',
    marginTop: '60px',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
    padding: '50px 60px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  col: {},
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  logoBox: {
    width: '36px', height: '36px',
    background: '#e67e22',
    borderRadius: '8px',
    color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '16px',
  },
  logoText: { fontWeight: '700', fontSize: '18px', color: 'white' },
  desc: { fontSize: '14px', lineHeight: '1.7', color: '#aaa' },
  colTitle: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '15px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  contactItem: {
    fontSize: '14px',
    color: '#aaa',
    display: 'flex',
    gap: '8px',
  },
  bottomBar: {
    borderTop: '1px solid #2d2d44',
    padding: '20px 60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomText: { fontSize: '13px', color: '#666' },
}

export default Footer