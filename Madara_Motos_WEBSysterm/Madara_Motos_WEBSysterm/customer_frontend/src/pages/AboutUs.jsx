
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const AboutUs = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>About Madara Motors 🚗</h1>
        <p style={styles.heroSub}>Sri Lanka's Most Trusted Auto Parts Marketplace</p>
      </div>

      {/* Content */}
      <div style={styles.container}>
        {/* Story */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Story</h2>
          <p style={styles.text}>
            Madara Motors was founded with a simple mission: to make genuine vehicle parts
            accessible to every Sri Lankan. Located in Wariyapola, we've grown from a small
            parts shop to the island's most trusted automotive parts marketplace.
          </p>
          <p style={styles.text}>
            With over 1,000+ products in our catalog, we serve customers from Colombo to
            Jaffna, ensuring quality parts reach your doorstep quickly and affordably.
          </p>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { value: '1000+', label: 'Parts Available' },
            { value: '500+', label: 'Happy Customers' },
            { value: '5+', label: 'Years Experience' },
            { value: '24/7', label: 'Online Support' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Values</h2>
          <div style={styles.valuesGrid}>
            {[
              { icon: '✅', title: 'Quality First', desc: 'Only genuine OEM and quality aftermarket parts' },
              { icon: '🤝', title: 'Trust & Integrity', desc: 'Honest pricing, no hidden fees' },
              { icon: '⚡', title: 'Fast Service', desc: 'Quick delivery island-wide' },
              { icon: '💡', title: 'Expert Advice', desc: 'Our team helps you find the right part' },
            ].map((v, i) => (
              <div key={i} style={styles.valueCard}>
                <div style={styles.valueIcon}>{v.icon}</div>
                <h3 style={styles.valueTitle}>{v.title}</h3>
                <p style={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e, #2d2d44)',
    color: 'white', textAlign: 'center', padding: '80px 20px',
  },
  heroTitle: { fontSize: '42px', fontWeight: '800', marginBottom: '15px' },
  heroSub: { fontSize: '18px', color: '#aaa' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' },
  section: { marginBottom: '50px' },
  sectionTitle: {
    fontSize: '28px', fontWeight: '800', color: '#1a1a2e',
    marginBottom: '20px', borderBottom: '3px solid #e67e22',
    paddingBottom: '10px', display: 'inline-block',
  },
  text: { fontSize: '16px', lineHeight: '1.8', color: '#555', marginBottom: '15px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px', marginBottom: '50px',
    background: '#1a1a2e', borderRadius: '16px', padding: '40px',
  },
  statCard: { textAlign: 'center' },
  statValue: { fontSize: '36px', fontWeight: '900', color: '#e67e22' },
  statLabel: { color: '#aaa', fontSize: '14px', marginTop: '5px' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  valueCard: {
    background: 'white', borderRadius: '12px',
    padding: '25px', textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
  },
  valueIcon: { fontSize: '36px', marginBottom: '12px' },
  valueTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  valueDesc: { fontSize: '14px', color: '#888', lineHeight: '1.6' },
}

export default AboutUs