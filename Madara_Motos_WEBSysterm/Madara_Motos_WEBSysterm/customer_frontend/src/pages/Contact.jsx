
import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Contact Us 📞</h1>
        <p style={styles.heroSub}>We're here to help you find the right parts</p>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Contact Info */}
          <div style={styles.infoSide}>
            <h2 style={styles.infoTitle}>Get In Touch</h2>
            {[
              { icon: '📍', title: 'Address', text: 'Puththal Rd, Wariyapola, Sri Lanka' },
              { icon: '📞', title: 'Phone', text: '+94 76 992 4173' },
              { icon: '✉️', title: 'Email', text: 'madaramotors123@gmail.com' },
              { icon: '🕒', title: 'Hours', text: 'Mon-Sat: 8:00 AM - 6:00 PM' },
            ].map((item, i) => (
              <div key={i} style={styles.infoCard}>
                <div style={styles.infoIcon}>{item.icon}</div>
                <div>
                  <div style={styles.infoLabel}>{item.title}</div>
                  <div style={styles.infoText}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div style={styles.formSide}>
            <h2 style={styles.formTitle}>Send a Message</h2>

            {sent && (
              <div style={styles.successMsg}>
                ✅ Message sent! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {[
                { key: 'name', label: 'Your Name', type: 'text', placeholder: 'John Silva' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@email.com' },
                { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Part inquiry...' },
              ].map(f => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    type={f.type}
                    style={styles.input}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required
                  />
                </div>
              ))}

              <div style={styles.field}>
                <label style={styles.label}>Message</label>
                <textarea
                  style={styles.textarea}
                  placeholder="How can we help you?"
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                📤 Send Message
              </button>
            </form>
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
    color: 'white', textAlign: 'center', padding: '70px 20px',
  },
  heroTitle: { fontSize: '40px', fontWeight: '800', marginBottom: '12px' },
  heroSub: { fontSize: '17px', color: '#aaa' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '60px 40px', flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '50px' },
  infoSide: {},
  infoTitle: { fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '25px' },
  infoCard: {
    display: 'flex', alignItems: 'flex-start', gap: '15px',
    marginBottom: '20px', padding: '18px', background: 'white',
    borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  infoIcon: { fontSize: '24px', flexShrink: 0 },
  infoLabel: { fontWeight: '700', color: '#1a1a2e', fontSize: '14px' },
  infoText: { color: '#666', fontSize: '14px', marginTop: '3px' },
  formSide: {
    background: 'white', borderRadius: '16px',
    padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formTitle: { fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '25px' },
  successMsg: {
    background: '#d4edda', color: '#155724',
    padding: '14px', borderRadius: '8px',
    marginBottom: '20px', fontSize: '14px',
  },
  field: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  input: {
    width: '100%', padding: '12px 15px',
    borderRadius: '10px', border: '1.5px solid #e5e7eb',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '12px 15px',
    borderRadius: '10px', border: '1.5px solid #e5e7eb',
    fontSize: '15px', boxSizing: 'border-box',
    outline: 'none', resize: 'vertical',
  },
  submitBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    color: 'white', border: 'none',
    borderRadius: '10px', fontSize: '16px',
    fontWeight: '700', cursor: 'pointer',
  },
}

export default Contact