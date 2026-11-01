
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useGoogleLogin } from '@react-oauth/google'
import FacebookLogin from '@greatsumini/react-facebook-login'
import { googleAuth, facebookAuth } from '../services/api'

const formatLKR = (n) => {
  const val = Number(n || 0)
  return `Rs. ${val.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const NO_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%231a1a1a'/%3E%3Ctext x='40' y='45' text-anchor='middle' font-size='28'%3E%F0%9F%94%A7%3C/text%3E%3C/svg%3E`

const getImageUrl = (url) => {
  if (!url) return NO_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://localhost:8080/uploads/${url}`
}

const MadaraLogo = ({ size = 'md' }) => {
  const big = size === 'lg'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: big ? '14px' : '12px' }}>
      <div style={{
        width: big ? 58 : 42, height: big ? 58 : 42,
        borderRadius: big ? '18px' : '13px',
        background: 'linear-gradient(145deg,#f39c12,#e67e22,#d35400)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: big ? '0 8px 32px rgba(230,126,34,0.5)' : '0 4px 16px rgba(230,126,34,0.4)',
        flexShrink: 0, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40%', left: '-20%',
          width: '60%', height: '60%', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
        }} />
        <span style={{
          color: 'white', fontWeight: '900',
          fontSize: big ? '28px' : '20px',
          position: 'relative', zIndex: 1,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}>M</span>
      </div>
      <div>
        <div style={{
          color: 'white', fontWeight: '800',
          fontSize: big ? '22px' : '17px',
          letterSpacing: '-0.5px', lineHeight: 1.1,
        }}>Madara Motors</div>
        <div style={{
          color: '#777', fontSize: big ? '12px' : '11px',
          fontWeight: '500', marginTop: '3px',
        }}>
          {big ? 'Vehicle Parts & Accessories' : 'Parts & Accessories'}
        </div>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.9 6 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.2-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.9 6 29.7 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.6 0 10.7-2.1 14.5-5.4l-6.7-5.5C29.8 34.9 27.1 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.7 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-3 5-5.5 6.6l.1.1 6.7 5.5C39.9 37.1 44 31.8 44 24c0-1.1-.1-2.2-.4-3.5z" />
  </svg>
)

const Checkbox = ({ checked, onChange, label, sublabel }) => (
  <div className="checkbox-wrap" onClick={onChange}>
    <div className={`checkbox-box ${checked ? 'checkbox-checked' : ''}`}>
      {checked && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <div>
      <div className="checkbox-label">{label}</div>
      {sublabel && <div className="checkbox-sub">{sublabel}</div>}
    </div>
  </div>
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIELD — email readOnly only, lock icon
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Field = ({ label, name, type = 'text', value, onChange, error, placeholder, hint, prefix, readOnly }) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.toString().trim().length > 0

  const borderColor = error
    ? '#e63946'
    : focused
    ? '#e67e22'
    : hasValue
    ? 'rgba(255,255,255,0.5)'
    : 'rgba(255,255,255,0.12)'

  const boxShadow = error
    ? '0 0 0 3px rgba(230,57,70,0.12)'
    : focused
    ? '0 0 0 3px rgba(230,126,34,0.15)'
    : 'none'

  const bgColor = focused
    ? 'rgba(255,255,255,0.08)'
    : hasValue
    ? 'rgba(255,255,255,0.07)'
    : 'rgba(255,255,255,0.04)'

  return (
    <div className="field">
      <label className={`field-lbl ${error ? 'field-lbl-err' : ''}`}>{label}</label>
      <div
        className={['field-box', readOnly ? 'field-disabled' : ''].join(' ')}
        style={{ borderColor, boxShadow, backgroundColor: bgColor, transition: 'all 0.2s ease' }}
      >
        {prefix && <div className="field-pre">{prefix}</div>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={readOnly ? undefined : onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          autoComplete="new-password"
          spellCheck={false}
          className="field-inp"
          onFocus={() => !readOnly && setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
            WebkitBoxShadow: `0 0 0 9999px ${bgColor} inset`,
            caretColor: readOnly ? 'transparent' : '#e67e22',
            cursor: readOnly ? 'not-allowed' : 'text',
            opacity: readOnly ? 0.7 : 1,
            backgroundColor: 'transparent',
          }}
        />
        {readOnly && (
          <div style={{ padding: '0 14px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <div className="field-err-msg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      {hint && !error && <div className="field-hint">{hint}</div>}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHONE FIELD — digits only, no prefix, no counter, no hints
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PhoneField = ({ value, onChange, error }) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.toString().trim().length > 0

  const borderColor = error
    ? '#e63946'
    : focused
    ? '#e67e22'
    : hasValue
    ? 'rgba(255,255,255,0.5)'
    : 'rgba(255,255,255,0.12)'

  const boxShadow = error
    ? '0 0 0 3px rgba(230,57,70,0.12)'
    : focused
    ? '0 0 0 3px rgba(230,126,34,0.15)'
    : 'none'

  const bgColor = focused
    ? 'rgba(255,255,255,0.08)'
    : hasValue
    ? 'rgba(255,255,255,0.07)'
    : 'rgba(255,255,255,0.04)'

  return (
    <div className="field">
      <label className={`field-lbl ${error ? 'field-lbl-err' : ''}`}>Phone Number *</label>
      <div
        className="field-box"
        style={{ borderColor, boxShadow, backgroundColor: bgColor, transition: 'all 0.2s ease' }}
      >
        <input
          type="tel"
          name="phone"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
            onChange({ target: { name: 'phone', value: raw } })
          }}
          placeholder="07X XXX XXXX"
          autoComplete="new-password"
          spellCheck={false}
          className="field-inp"
          maxLength={10}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
            WebkitBoxShadow: `0 0 0 9999px ${bgColor} inset`,
            caretColor: '#e67e22',
            backgroundColor: 'transparent',
          }}
        />
      </div>
      {error && (
        <div className="field-err-msg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GATE PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GatePage = ({ navigate, onSocialLogin }) => {
  const [socialLoading, setSocialLoading] = useState(false)
  const [error, setError] = useState('')

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('')
      setSocialLoading(true)
      try {
        const res = await googleAuth(tokenResponse.access_token)
        onSocialLogin(res)
      } catch (e) {
        setError(e?.response?.data?.message || 'Google sign-in failed')
      } finally { setSocialLoading(false) }
    },
    onError: () => { setError('Google sign-in failed'); setSocialLoading(false) },
    flow: 'implicit',
  })

  const onFacebookSuccess = async (fbResponse) => {
    setError('')
    setSocialLoading(true)
    try {
      const accessToken = fbResponse?.accessToken
      if (!accessToken) throw new Error('Facebook token not found')
      const res = await facebookAuth(accessToken)
      onSocialLogin(res)
    } catch (e) {
      setError(e?.response?.data?.message || 'Facebook sign-in failed')
    } finally { setSocialLoading(false) }
  }

  return (
    <>
      <style>{GATE_CSS}</style>
      <div className="gate-page">
        <div className="gate-bg">
          <div className="gate-orb gate-orb1" />
          <div className="gate-orb gate-orb2" />
          <div className="gate-orb gate-orb3" />
          <div className="gate-grid" />
        </div>
        <div className="gate-side-accent">
          <div className="gsa-line" />
          <div className="gsa-dot" />
          <div className="gsa-line gsa-line2" />
        </div>
        <div className="gate-wrapper">
          <button className="gate-back" onClick={() => navigate('/cart')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Return to Cart
          </button>
          <div className="gate-card">
            <div className="gate-card-glow" />
            <div className="gate-logo-wrap"><MadaraLogo size="lg" /></div>
            <div className="gate-divider-row">
              <div className="gate-divider-line" />
              <span className="gate-divider-label">SECURE CHECKOUT</span>
              <div className="gate-divider-line" />
            </div>
            <div className="gate-headline">
              <h1 className="gate-title">How would you like<br />to continue?</h1>
              <p className="gate-subtitle">Sign in for a seamless checkout experience</p>
            </div>
            {error && <div className="gate-error"><span>⚠️</span> {error}</div>}
            {socialLoading && (
              <div className="gate-social-loading">
                <div className="gate-spinner" /> Signing you in...
              </div>
            )}
            <button className="gate-btn gate-btn-primary"
              onClick={() => navigate('/customer/login?redirect=/checkout')} disabled={socialLoading}>
              <div className="gate-btn-icon gate-btn-icon-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="gate-btn-text">
                <span className="gate-btn-label">Sign In to My Account</span>
                <span className="gate-btn-sub">Already have an account</span>
              </div>
              <div className="gate-btn-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button className="gate-btn gate-btn-secondary"
              onClick={() => navigate('/customer/register?redirect=/checkout')} disabled={socialLoading}>
              <div className="gate-btn-icon gate-btn-icon-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#e67e22" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <div className="gate-btn-text">
                <span className="gate-btn-label">Create New Account</span>
                <span className="gate-btn-sub">New to Madara Motors</span>
              </div>
              <div className="gate-btn-arrow gate-btn-arrow-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <div className="gate-or-row">
              <div className="gate-or-line" />
              <span className="gate-or-text">or continue with</span>
              <div className="gate-or-line" />
            </div>
            <div className="gate-social-row">
              <button className="gate-social-btn" onClick={() => googleLogin()} disabled={socialLoading}>
                <GoogleIcon /><span className="gate-social-label">Google</span>
              </button>
              <FacebookLogin
                appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                onSuccess={onFacebookSuccess}
                onFail={() => setError('Facebook sign-in failed')}
                render={(renderProps) => (
                  <button className="gate-social-btn" onClick={renderProps.onClick} disabled={socialLoading}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="gate-social-label">Facebook</span>
                  </button>
                )}
              />
            </div>
            <div className="gate-footer-note">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="gate-footer-link">Terms</Link>{' '}&{' '}
              <Link to="/privacy" className="gate-footer-link">Privacy Policy</Link>
            </div>
          </div>
          <div className="gate-bottom-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Your payment & personal data is 100% secure</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN CHECKOUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Checkout = () => {
  const { cartItems, clearCart } = useCart()
  const { isLoggedIn, customer, login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]                   = useState(null)
  const [orderResult, setOrderResult]     = useState(null)
  const [savedFormData, setSavedFormData] = useState(null)
  const [loading, setLoading]             = useState(false)
  const [errors, setErrors]               = useState({})

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    phone: '', address: '', city: '',
    saveInfo: false, emailOffers: true,
  })

  // ── Step init ──
  useEffect(() => {
    if (cartItems.length === 0) { navigate('/cart'); return }
    setStep(isLoggedIn ? 'form' : 'gate')
  }, [isLoggedIn])

  // ━━━ Auth fill: ONLY email from customer, everything else EMPTY ━━━
  useEffect(() => {
    if (!isLoggedIn || !customer) return
    setForm(p => ({
      ...p,
      email:     customer.email || '',  // only email pre-filled
      firstName: '',                    // user must type
      lastName:  '',                    // user must type
      phone:     '',                    // user must type
      address:   '',                    // user must type
      city:      '',                    // user must type
    }))
  }, [isLoggedIn, customer])

  // ── Empty cart guard ──
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'thankyou') navigate('/cart')
  }, [cartItems, step])

  const handleSocialLogin = (res) => {
    try {
      const data = res?.data ?? res ?? null
      if (!data) return
      const token = data.token || data.accessToken || data.access_token || null
      if (!token) return
      const customerData = data.customer || data.user || data.data || {}
      login(customerData, token)
      setStep('form')
    } catch (e) { console.error('Social login error:', e) }
  }

  const subtotal = cartItems.reduce(
    (s, i) => s + Number(i.price ?? i.sellingPrice ?? 0) * Number(i.qty || 1), 0
  )

 const handleChange = (e) => {
  let { name, value, type, checked } = e.target

  if (name === 'phone') {
    value = value.replace(/[^0-9]/g, '')
    if (value.startsWith('0')) {
      value = value.substring(1)
    }
    value = value.slice(0, 9)
  }

  setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
}

  // ━━━ VALIDATION ━━━
  const validate = () => {
    const e = {}

    // First Name
    if (!form.firstName.trim())
      e.firstName = 'First name is required'
    else if (form.firstName.trim().length < 2)
      e.firstName = 'First name must be at least 2 characters'

    // Last Name
    if (!form.lastName.trim())
      e.lastName = 'Last name is required'
    else if (form.lastName.trim().length < 2)
      e.lastName = 'Last name must be at least 2 characters'

    // Email
    if (!form.email.trim())
      e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Enter a valid email address'

    // Phone — 10 digits, starts with 0
   if (!form.phone.trim()) {
  e.phone = 'Phone number is required'
} else if (!/^[0-9]{9}$/.test(form.phone.trim())) {
  e.phone = 'Enter a valid 9-digit number (e.g. 771234567)'}

    // Address
    if (!form.address.trim())
      e.address = 'Address is required'
    else if (form.address.trim().length < 5)
      e.address = 'Please enter a complete address'

    // City
    if (!form.city.trim())
      e.city = 'City is required'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validate()) {
      const firstErr = document.querySelector('.field-err-msg')
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setLoading(true)
    setSavedFormData({ ...form })

    if (form.saveInfo) {
      // Never save email
      localStorage.setItem('mm_saved_info', JSON.stringify({
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone,
        address:   form.address,
        city:      form.city,
      }))
    } else {
      localStorage.removeItem('mm_saved_info')
    }

    try {
      const payload = {
        customerEmail: form.email.trim(),
        firstName:     form.firstName.trim(),
        lastName:      form.lastName.trim(),
        phone:         form.phone.trim(),
        address:       form.address.trim(),
        city:          form.city.trim(),
        emailOffers:   form.emailOffers,
        pickupOnly:    true,
        items: cartItems.map(i => ({
          productId:   Number(i.id),
          productCode: i.productCode,
          productName: i.productName,
          quantity:    Number(i.qty || 1),
          price:       Number(i.price ?? i.sellingPrice ?? 0),
        })),
        subtotal,
        total: subtotal,
      }
      const res = await api.post('/orders', payload)
      setOrderResult(res.data)
      clearCart()
      setStep('thankyou')
    } catch (err) {
      alert(`Order failed! ${err.response?.data?.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  if (step === null) return null

  // ━━━ GATE ━━━
  if (step === 'gate') return <GatePage navigate={navigate} onSocialLogin={handleSocialLogin} />

  // ━━━ THANK YOU ━━━
  if (step === 'thankyou') {
    const D           = savedFormData || form
    const orderId     = orderResult?.orderId || orderResult?.id || 'MM-' + Date.now().toString().slice(-6)
    const hour        = new Date().getHours()
    const day         = new Date().getDay()
    const afterHours  = hour >= 18 || hour < 8 || day === 0
    const orderStatus = orderResult?.status || 'PENDING'
    const isPickedUp  = ['PICKED_UP', 'COMPLETED', 'COLLECTED'].includes(orderStatus)

    const steps = [
      { key: 'received', done: true,       n: '✓', title: 'Order Received',      desc: 'Your order has been placed successfully',                                                                                 time: 'Just now' },
      { key: 'review',   done: false,      n: '2', title: 'Team Review',         desc: 'Our team verifies stock & prepares your order',                                                                           time: afterHours ? 'Next working day' : 'Today' },
      { key: 'email',    done: false,      n: '3', title: 'Confirmation Email',   desc: afterHours ? 'Next working day — Mon to Sat, 8:00 AM – 6:00 PM' : "Within today's working hours — 8:00 AM to 6:00 PM",  time: afterHours ? 'Next day' : 'Today' },
      { key: 'pickup',   done: isPickedUp, n: isPickedUp ? '✓' : '4', title: isPickedUp ? 'Order Collected ✅' : 'Ready for Pickup', desc: isPickedUp ? 'You have successfully collected your order!' : 'Visit Puththal Rd, Wariyapola to collect your order', time: isPickedUp ? 'Completed' : 'Within 7 days', isPickup: true, isPickedUp },
    ]

    return (
      <>
        <style>{CSS}</style>
        <div className="ty-page">
          <div className="ty-bg-orb ty-orb1" /><div className="ty-bg-orb ty-orb2" /><div className="ty-bg-orb ty-orb3" />
          <div className="ty-grid-overlay" />
          <div className="ty-wrapper">
            <div className="ty-top-bar">
              <MadaraLogo />
              <div className="ty-order-chip"><span className="ty-order-dot" />Order #{orderId}</div>
            </div>
            <div className="ty-hero">
              <div className="ty-hero-bg" />
              <div className="ty-hero-content">
                <div className="ty-anim-wrap">
                  <div className="ty-ring ty-ring1" /><div className="ty-ring ty-ring2" /><div className="ty-ring ty-ring3" />
                  <div className="ty-check-circle">
                    <svg viewBox="0 0 52 52" width="48" height="48">
                      <circle className="chk-circle" cx="26" cy="26" r="24" fill="none" stroke="white" strokeWidth="2.5" />
                      <path className="chk-tick" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16" />
                    </svg>
                  </div>
                </div>
                <div className="ty-hero-text">
                  <h1 className="ty-hero-title">Order Placed Successfully! 🎉</h1>
                  <p className="ty-hero-sub">Thank you <span className="ty-hero-name">{D.firstName}</span>! Your order is now pending team review.</p>
                </div>
              </div>
            </div>
            <div className="ty-content-grid">
              <div className="ty-left-col">
                <div className="ty-info-card">
                  <div className="ty-info-card-head"><span className="ty-ic-icon">📋</span><span className="ty-ic-title">Order Details</span></div>
                  <div className="ty-detail-grid">
                    {[
                      { icon: '📛', label: 'Full Name', val: `${D.firstName} ${D.lastName}`.trim() },
                      { icon: '📧', label: 'Email',     val: D.email || '—' },
                      { icon: '📞', label: 'Phone',     val: D.phone || '—' },
                      { icon: '📍', label: 'Address',   val: D.address && D.city ? `${D.address}, ${D.city}` : D.address || D.city || '—' },
                    ].map((r, i) => (
                      <div key={i} className="ty-detail-row">
                        <div className="ty-dr-icon">{r.icon}</div>
                        <div className="ty-dr-body"><div className="ty-dr-label">{r.label}</div><div className="ty-dr-val">{r.val}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ty-note ty-note-green">
                  <div className="ty-note-icon">📩</div>
                  <div className="ty-note-body">
                    <div className="ty-note-title" style={{ color: '#4ade80' }}>Confirmation email on the way</div>
                    <div className="ty-note-text">Sent to <span className="ty-note-em">{D.email}</span> within <span style={{ color: '#4ade80', fontWeight: '700' }}>{afterHours ? 'next working hours' : "today's working hours"}</span> (Mon–Sat, 8AM–6PM).</div>
                  </div>
                </div>
                <div className="ty-note ty-note-orange">
                  <div className="ty-note-icon">🏪</div>
                  <div className="ty-note-body">
                    <div className="ty-note-title" style={{ color: '#e67e22' }}>Shop Pickup Only — Wariyapola</div>
                    <div className="ty-note-text">Collect from <span className="ty-note-em">Puththal Rd, Wariyapola</span> within <span className="ty-note-em">7 days</span>. Call <span style={{ color: '#e67e22', fontWeight: '700' }}>+94 76 992 4173</span>.</div>
                  </div>
                </div>
                <div className="ty-btn-row">
                  <button className="ty-btn ty-btn-primary" onClick={() => navigate('/')}><span>🏠</span><span>Back to Home</span></button>
                  <button className="ty-btn ty-btn-secondary" onClick={() => navigate('/parts-catalog')}><span>🔍</span><span>Continue Shopping</span></button>
                </div>
              </div>
              <div className="ty-right-col">
                <div className="ty-timeline-card">
                  <div className="ty-timeline-head"><span className="ty-tl-dot" /><span className="ty-tl-title">What Happens Next</span></div>
                  {steps.map((s, i) => (
                    <div key={s.key} className="ty-tl-item">
                      <div className="ty-tl-left">
                        <div className={['ty-tl-node', s.done && !s.isPickedUp ? 'ty-tl-node-done' : '', s.isPickedUp ? 'ty-tl-node-pickup' : ''].join(' ')}>
                          {s.done ? (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-5.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>) : s.n}
                        </div>
                        {i < steps.length - 1 && <div className={`ty-tl-line ${s.done ? 'ty-tl-line-done' : ''}`} />}
                      </div>
                      <div className="ty-tl-right" style={{ paddingBottom: i < steps.length - 1 ? '24px' : 0 }}>
                        <div className="ty-tl-header">
                          <span className={['ty-tl-name', s.done && !s.isPickedUp ? 'ty-tl-name-done' : '', s.isPickedUp ? 'ty-tl-name-pickup' : ''].join(' ')}>{s.title}</span>
                          <span className={['ty-tl-time', s.done && !s.isPickedUp ? 'ty-tl-time-done' : '', s.isPickedUp ? 'ty-tl-time-pickup' : ''].join(' ')}>{s.time}</span>
                        </div>
                        <div className="ty-tl-desc">{s.desc}</div>
                        {s.isPickup && !s.isPickedUp && <div className="ty-pickup-note"><span>📌</span><span>Updates when our team marks your order as collected</span></div>}
                        {s.isPickup && s.isPickedUp  && <div className="ty-pickup-done"><span>🎊</span><span>Order successfully collected!</span></div>}
                      </div>
                    </div>
                  ))}
                  <div className="ty-shop-info">
                    <div className="ty-si-row"><span>📍</span><span>Puththal Rd, Wariyapola</span></div>
                    <div className="ty-si-row"><span>🕐</span><span>Mon–Sat, 8:00 AM – 6:00 PM</span></div>
                    <div className="ty-si-row"><span>📞</span><span style={{ color: '#e67e22', fontWeight: '700' }}>+94 76 992 4173</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ━━━ FORM ━━━
  return (
    <>
      <style>{CSS}</style>
      <div className="form-page">
        <nav className="fnav">
          <div className="fnav-inner">
            <MadaraLogo />
            <div className="crumbs">
              <span className="cr-done" onClick={() => navigate('/cart')}>Cart</span>
              <span className="cr-sep">›</span>
              <span className="cr-active">Order Details</span>
              <span className="cr-sep">›</span>
              <span className="cr-next">Confirmation</span>
            </div>
          </div>
        </nav>
        <div className="flayout">
          <div className="fleft">

            {/* ── Card 1: Contact ── */}
            <div className="fcard">
              <div className="fcard-head">
                <div className="fcard-head-l">
                  <div className="step-n">1</div>
                  <div>
                    <div className="fcard-ttl">Contact Details</div>
                    <div className="fcard-sub">Your personal information</div>
                  </div>
                </div>
              </div>
              <div className="fcard-body">
                <div className="f2col">
                  {/* firstName & lastName — always empty, user types */}
                  <Field
                    label="First Name *" name="firstName"
                    value={form.firstName} onChange={handleChange}
                    error={errors.firstName} placeholder="Your first name"
                  />
                  <Field
                    label="Last Name *" name="lastName"
                    value={form.lastName} onChange={handleChange}
                    error={errors.lastName} placeholder="Your last name"
                  />
                </div>

                {/* Email — readOnly when logged in, shows gmail, lock icon */}
                <Field
                  label="Email Address *" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  error={errors.email} placeholder="your@email.com"
                  hint="Order confirmation will be sent to this address"
                  readOnly={isLoggedIn && !!form.email}
                />

                {/* Phone — plain digits only, no prefix, no counter */}
               <Field label="Phone Number *" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="7X XXX XXXX" prefix="🇱🇰 +94" />

                <Checkbox
                  checked={form.emailOffers}
                  onChange={() => setForm(p => ({ ...p, emailOffers: !p.emailOffers }))}
                  label="Email me with news and offers from Madara Motors"
                />
              </div>
            </div>

            {/* ── Card 2: Pickup ── */}
            <div className="fcard">
              <div className="fcard-head">
                <div className="fcard-head-l">
                  <div className="step-n">2</div>
                  <div>
                    <div className="fcard-ttl">Pickup Information</div>
                    <div className="fcard-sub">Your address for our records</div>
                  </div>
                </div>
                <div className="pickup-badge">🏪 Pickup Only</div>
              </div>
              <div className="pstrip">
                {[
                  { icon: '📍', label: 'Location', val: 'Puththal Rd, Wariyapola' },
                  { icon: '🕐', label: 'Hours',    val: 'Mon–Sat 8AM–6PM' },
                  { icon: '📞', label: 'Call Us',  val: '+94 76 992 4173' },
                ].map((r, i) => (
                  <React.Fragment key={i}>
                    <div className="pstrip-item">
                      <span className="pstrip-icon">{r.icon}</span>
                      <div><div className="pstrip-lbl">{r.label}</div><div className="pstrip-val">{r.val}</div></div>
                    </div>
                    {i < 2 && <div className="pstrip-div" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="fcard-body">
                <Field
                  label="Address *" name="address"
                  value={form.address} onChange={handleChange}
                  error={errors.address} placeholder="No. 123, Street name, Area"
                />
                <Field
                  label="City *" name="city"
                  value={form.city} onChange={handleChange}
                  error={errors.city} placeholder="Your city"
                />
                <Checkbox
                  checked={form.saveInfo}
                  onChange={() => setForm(p => ({ ...p, saveInfo: !p.saveInfo }))}
                  label="Save this information for next time"
                  sublabel="Saved locally on this device"
                />
                {form.saveInfo && (
                  <div className="save-preview">
                    <div className="sp-head"><span>💾</span><span className="sp-title">Information to be saved</span></div>
                    <div className="sp-grid">
                      {[
                        { l: 'Name',    v: `${form.firstName} ${form.lastName}`.trim() || '—' },
                        { l: 'Phone',   v: form.phone   || '—' },
                        { l: 'Address', v: form.address || '(fill above)' },
                        { l: 'City',    v: form.city    || '(fill above)' },
                      ].map((r, i) => (
                        <div key={i} className={`sp-item ${!r.v || r.v === '—' || r.v.startsWith('(') ? 'sp-item-empty' : ''}`}>
                          <div className="sp-label">{r.l}</div>
                          <div className={`sp-val ${r.v.startsWith('(') ? 'sp-val-hint' : ''}`}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="factions">
              <button className="btn-back" onClick={() => navigate('/cart')}>← Return to cart</button>
              <button
                className={`btn-place ${loading ? 'btn-place-loading' : ''}`}
                disabled={loading}
                onClick={handlePlaceOrder}
              >
                {loading
                  ? <><span className="bspin" /> Placing Order...</>
                  : <><span>🛒</span> Place Order Request</>}
              </button>
            </div>

            <div className="sec-note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Order reviewed by our team — confirmation within <strong className="txt-orange">next shop opening hours</strong></span>
            </div>

            <div className="ffooter">
              <Link to="/contact"       className="flink">Contact</Link><span className="fdot">·</span>
              <Link to="/parts-catalog" className="flink">Parts Catalog</Link><span className="fdot">·</span>
              <Link to="/about"         className="flink">About Us</Link>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="fright">
            <div className="sum-card">
              <div className="sum-head">
                <span className="sum-ttl">Order Summary</span>
                <span className="sum-badge">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="sum-items">
                {cartItems.map((item, i) => {
                  const price = Number(item.price ?? item.sellingPrice ?? 0)
                  const qty   = Number(item.qty || 1)
                  return (
                    <div key={i} className="sum-item">
                      <div className="sim-wrap">
                        <img src={getImageUrl(item.imageUrl)} alt={item.productName}
                          className="sim-img" onError={e => { e.target.src = NO_IMAGE }} />
                        <span className="sim-qty">{qty}</span>
                      </div>
                      <div className="sim-info">
                        <div className="sim-name">{item.productName}</div>
                        {item.productCode && <div className="sim-code">#{item.productCode}</div>}
                      </div>
                      <div className="sim-price">{formatLKR(price * qty)}</div>
                    </div>
                  )
                })}
              </div>
              <div className="sum-totals">
                <div className="sum-row"><span className="sum-lbl">Subtotal</span><span className="sum-val">{formatLKR(subtotal)}</span></div>
                <div className="sum-row"><span className="sum-lbl">Pickup</span><span className="sum-free">FREE</span></div>
              </div>
              <div className="sum-grand">
                <span className="sg-label">Total</span>
                <div className="sg-right">
                  <div className="sg-cur">LKR</div>
                  <div className="sg-amt">{formatLKR(subtotal)}</div>
                </div>
              </div>
              <div className="sum-trust">
                {[{ icon: '🔒', label: 'Secure' }, { icon: '✅', label: 'Genuine' }, { icon: '📞', label: 'Support' }, { icon: '🏆', label: 'Quality' }].map((t, i) => (
                  <div key={i} className="trust-item">
                    <span className="trust-icon">{t.icon}</span>
                    <span className="trust-lbl">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GATE CSS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GATE_CSS = `
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
@keyframes gateOrbFloat  { 0%,100%{transform:translateY(0) scale(1);}     50%{transform:translateY(-40px) scale(1.06);} }
@keyframes gateOrbFloat2 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(30px) rotate(8deg);} }
@keyframes gateCardIn    { from{opacity:0;transform:translateY(28px) scale(.97);} to{opacity:1;transform:translateY(0) scale(1);} }
@keyframes gateFadeUp    { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
@keyframes accentPulse   { 0%,100%{opacity:.3;height:80px;} 50%{opacity:.8;height:120px;} }
@keyframes dotFloat      { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
@keyframes spinAnim      { to{transform:rotate(360deg);} }
.gate-page { min-height:100vh; background:#060608; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif; padding:40px 20px; }
.gate-bg   { position:absolute; inset:0; pointer-events:none; }
.gate-orb  { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
.gate-orb1 { width:700px; height:700px; top:-250px; left:-200px; background:radial-gradient(circle,rgba(230,126,34,.14) 0%,rgba(211,84,0,.05) 45%,transparent 70%); animation:gateOrbFloat 9s ease-in-out infinite; }
.gate-orb2 { width:500px; height:500px; bottom:-150px; right:-100px; background:radial-gradient(circle,rgba(120,50,220,.09) 0%,transparent 65%); animation:gateOrbFloat2 12s ease-in-out infinite; }
.gate-orb3 { width:350px; height:350px; top:30%; right:15%; background:radial-gradient(circle,rgba(230,126,34,.05) 0%,transparent 65%); animation:gateOrbFloat 7s ease-in-out infinite reverse; }
.gate-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px); background-size:56px 56px; }
.gate-side-accent { position:absolute; left:48px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; pointer-events:none; z-index:1; }
.gsa-line  { width:1px; height:80px; background:linear-gradient(180deg,transparent,rgba(230,126,34,.4),transparent); animation:accentPulse 4s ease-in-out infinite; }
.gsa-line2 { animation-delay:2s; }
.gsa-dot   { width:6px; height:6px; border-radius:50%; background:#e67e22; box-shadow:0 0 12px rgba(230,126,34,.6); animation:dotFloat 3s ease-in-out infinite; }
.gate-wrapper { position:relative; z-index:10; width:100%; max-width:460px; display:flex; flex-direction:column; align-items:center; gap:16px; }
.gate-back { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:999px; padding:10px 20px; font-size:13px; font-weight:600; color:#888; cursor:pointer; transition:all .2s ease; font-family:inherit; align-self:flex-start; }
.gate-back:hover { color:#e67e22; border-color:rgba(230,126,34,.25); background:rgba(230,126,34,.05); }
.gate-card { width:100%; position:relative; background:rgba(12,12,14,.92); border:1px solid rgba(255,255,255,.09); border-radius:28px; padding:40px 36px 32px; backdrop-filter:blur(28px); animation:gateCardIn .6s cubic-bezier(.34,1.56,.64,1) both; overflow:hidden; }
.gate-card-glow { position:absolute; top:-60px; left:50%; transform:translateX(-50%); width:300px; height:120px; border-radius:50%; background:radial-gradient(ellipse,rgba(230,126,34,.1) 0%,transparent 70%); pointer-events:none; }
.gate-logo-wrap { display:flex; justify-content:center; margin-bottom:28px; animation:gateFadeUp .5s ease .1s both; }
.gate-divider-row { display:flex; align-items:center; gap:12px; margin-bottom:22px; animation:gateFadeUp .5s ease .15s both; }
.gate-divider-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent); }
.gate-divider-label { font-size:10px; font-weight:800; letter-spacing:2px; color:#e67e22; white-space:nowrap; }
.gate-headline { text-align:center; margin-bottom:24px; animation:gateFadeUp .5s ease .2s both; }
.gate-title    { font-size:26px; font-weight:900; color:#fff; letter-spacing:-.5px; line-height:1.3; margin-bottom:10px; }
.gate-subtitle { font-size:14px; color:#555; line-height:1.6; }
.gate-error { display:flex; align-items:center; gap:8px; background:rgba(231,76,60,.1); border:1px solid rgba(231,76,60,.2); color:#e74c3c; padding:12px 16px; border-radius:12px; font-size:13px; font-weight:600; margin-bottom:16px; }
.gate-social-loading { display:flex; align-items:center; justify-content:center; gap:10px; font-size:13px; color:#888; padding:12px; background:rgba(255,255,255,.03); border-radius:12px; margin-bottom:16px; }
.gate-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.15); border-top-color:#e67e22; border-radius:50%; animation:spinAnim .75s linear infinite; }
.gate-btn { width:100%; display:flex; align-items:center; gap:14px; border:none; border-radius:16px; padding:16px 18px; cursor:pointer; transition:all .25s ease; font-family:inherit; position:relative; overflow:hidden; margin-bottom:12px; }
.gate-btn:disabled { opacity:.6; cursor:not-allowed; }
.gate-btn-primary  { background:linear-gradient(135deg,#f39c12 0%,#e67e22 50%,#d35400 100%); box-shadow:0 8px 32px rgba(230,126,34,.35); animation:gateFadeUp .5s ease .25s both; }
.gate-btn-primary:hover:not(:disabled)   { transform:translateY(-2px); box-shadow:0 14px 44px rgba(230,126,34,.55); }
.gate-btn-secondary { background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.1) !important; animation:gateFadeUp .5s ease .3s both; }
.gate-btn-secondary:hover:not(:disabled) { background:rgba(255,255,255,.07); border-color:rgba(230,126,34,.3) !important; transform:translateY(-1px); }
.gate-btn-icon-primary   { width:38px; height:38px; border-radius:11px; background:rgba(255,255,255,.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.gate-btn-icon-secondary { width:38px; height:38px; border-radius:11px; background:rgba(230,126,34,.1);  display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.gate-btn-text  { flex:1; text-align:left; }
.gate-btn-label { display:block; font-size:15px; font-weight:800; color:#fff; letter-spacing:-.1px; margin-bottom:2px; }
.gate-btn-sub   { font-size:12px; color:rgba(255,255,255,.45); }
.gate-btn-secondary .gate-btn-label { color:#ddd; }
.gate-btn-secondary .gate-btn-sub   { color:#555; }
.gate-btn-arrow       { color:rgba(255,255,255,.5); transition:transform .25s; }
.gate-btn-arrow-muted { color:#444; }
.gate-btn-primary:hover:not(:disabled)   .gate-btn-arrow { transform:translateX(4px); color:white; }
.gate-btn-secondary:hover:not(:disabled) .gate-btn-arrow { transform:translateX(4px); color:#e67e22; }
.gate-or-row { display:flex; align-items:center; gap:14px; margin:4px 0 14px; animation:gateFadeUp .5s ease .35s both; }
.gate-or-line { flex:1; height:1px; background:rgba(255,255,255,.07); }
.gate-or-text { font-size:12px; color:#444; font-weight:600; white-space:nowrap; }
.gate-social-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; animation:gateFadeUp .5s ease .4s both; }
.gate-social-btn { display:flex; align-items:center; justify-content:center; gap:10px; padding:13px 16px; border-radius:13px; background:rgba(255,255,255,.05); border:1.5px solid rgba(255,255,255,.1); cursor:pointer; transition:all .22s ease; font-family:inherit; }
.gate-social-btn:hover:not(:disabled) { background:rgba(255,255,255,.09); border-color:rgba(255,255,255,.2); transform:translateY(-2px); }
.gate-social-btn:disabled { opacity:.5; cursor:not-allowed; }
.gate-social-label { font-size:14px; font-weight:700; color:#ddd; }
.gate-footer-note  { text-align:center; font-size:12px; color:#444; line-height:1.6; padding-top:16px; border-top:1px solid rgba(255,255,255,.05); animation:gateFadeUp .5s ease .45s both; }
.gate-footer-link  { color:#666; font-weight:600; text-decoration:none; transition:color .2s; }
.gate-footer-link:hover { color:#e67e22; }
.gate-bottom-note { display:flex; align-items:center; gap:8px; font-size:12px; color:#444; font-weight:500; animation:gateFadeUp .5s ease .5s both; }
@media(max-width:520px){
  .gate-card { padding:32px 20px 28px; }
  .gate-title { font-size:22px; }
  .gate-side-accent { display:none; }
  .gate-social-row { grid-template-columns:1fr; }
}
`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORM + THANK YOU CSS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CSS = `
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
.ty-page,.form-page,.fnav,.fcard,.sum-card,button,input,label {
  font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;
}
@keyframes orbFloat    { 0%,100%{transform:translateY(0) scale(1);opacity:.6}  50%{transform:translateY(-30px) scale(1.08);opacity:1} }
@keyframes orbFloat2   { 0%,100%{transform:translateY(0) scale(1);opacity:.4}  50%{transform:translateY(20px) scale(.95);opacity:.7} }
@keyframes checkCircle { from{stroke-dashoffset:160} to{stroke-dashoffset:0} }
@keyframes checkTick   { from{stroke-dashoffset:50}  to{stroke-dashoffset:0} }
@keyframes spin        { to{transform:rotate(360deg)} }
@keyframes fadeUp      { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulseRing   { 0%{transform:scale(.8);opacity:.8} 100%{transform:scale(1.6);opacity:0} }
@keyframes heroIn      { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn     { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
@keyframes glowPulse   { 0%,100%{box-shadow:0 0 30px rgba(230,126,34,.3)} 50%{box-shadow:0 0 60px rgba(230,126,34,.6)} }
@keyframes greenPulse  { 0%,100%{box-shadow:0 0 20px rgba(74,222,128,.3)}  50%{box-shadow:0 0 40px rgba(74,222,128,.6)} }
@keyframes shake       { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

.chk-circle { stroke-dasharray:160; stroke-dashoffset:160; animation:checkCircle .8s ease .4s forwards; }
.chk-tick   { stroke-dasharray:50;  stroke-dashoffset:50;  animation:checkTick .5s ease 1.2s forwards; }
.bspin { display:inline-block; width:16px; height:16px; border:2.5px solid rgba(255,255,255,.25); border-top-color:white; border-radius:50%; animation:spin .75s linear infinite; }

.ty-page        { min-height:100vh; background:#060608; position:relative; overflow:hidden; padding:0 0 60px; }
.ty-bg-orb      { position:absolute; border-radius:50%; pointer-events:none; filter:blur(80px); }
.ty-orb1        { width:600px; height:600px; top:-200px; left:-150px; background:radial-gradient(circle,rgba(230,126,34,.18) 0%,rgba(230,126,34,.05) 50%,transparent 70%); animation:orbFloat 8s ease-in-out infinite; }
.ty-orb2        { width:500px; height:500px; bottom:-100px; right:-100px; background:radial-gradient(circle,rgba(120,50,200,.1) 0%,rgba(100,30,180,.04) 50%,transparent 70%); animation:orbFloat2 10s ease-in-out infinite; }
.ty-orb3        { width:300px; height:300px; top:40%; left:60%; background:radial-gradient(circle,rgba(230,126,34,.06) 0%,transparent 70%); animation:orbFloat 12s ease-in-out infinite reverse; }
.ty-grid-overlay{ position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px); background-size:52px 52px; }
.ty-wrapper     { position:relative; z-index:10; max-width:1100px; margin:0 auto; padding:28px 32px; }
.ty-top-bar     { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; animation:fadeUp .4s ease both; }
.ty-order-chip  { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:#888; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); padding:9px 18px; border-radius:999px; }
.ty-order-dot   { width:8px; height:8px; border-radius:50%; background:#4ade80; box-shadow:0 0 8px rgba(74,222,128,.6); animation:greenPulse 2s ease infinite; }
.ty-hero        { position:relative; border-radius:28px; padding:48px 40px; margin-bottom:24px; overflow:hidden; animation:heroIn .6s ease .1s both; background:linear-gradient(135deg,rgba(230,126,34,.12) 0%,rgba(211,84,0,.06) 40%,rgba(20,20,25,.8) 100%); border:1px solid rgba(230,126,34,.2); }
.ty-hero-bg     { position:absolute; inset:0; background:radial-gradient(ellipse at 20% 50%,rgba(230,126,34,.15) 0%,transparent 60%); pointer-events:none; }
.ty-hero-content{ position:relative; z-index:2; display:flex; align-items:center; gap:32px; }
.ty-anim-wrap   { position:relative; flex-shrink:0; width:100px; height:100px; display:flex; align-items:center; justify-content:center; }
.ty-ring        { position:absolute; border-radius:50%; border:2px solid rgba(230,126,34,.3); animation:pulseRing 2.5s ease-out infinite; width:100px; height:100px; }
.ty-ring1{animation-delay:0s} .ty-ring2{animation-delay:.8s} .ty-ring3{animation-delay:1.6s}
.ty-check-circle{ width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#f39c12,#e67e22,#d35400); display:flex; align-items:center; justify-content:center; box-shadow:0 12px 40px rgba(230,126,34,.5); animation:glowPulse 3s ease infinite; position:relative; z-index:2; }
.ty-hero-title  { font-size:32px; font-weight:900; color:#fff; letter-spacing:-.8px; line-height:1.2; margin-bottom:12px; }
.ty-hero-sub    { font-size:16px; color:#888; line-height:1.65; }
.ty-hero-name   { color:#e67e22; font-weight:700; }
.ty-content-grid{ display:grid; grid-template-columns:1fr 380px; gap:20px; align-items:start; }
.ty-left-col    { display:flex; flex-direction:column; gap:16px; }
.ty-right-col   { position:sticky; top:24px; }
.ty-info-card   { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:22px; overflow:hidden; animation:slideIn .5s ease .3s both; }
.ty-info-card-head { display:flex; align-items:center; gap:12px; padding:18px 24px; background:rgba(255,255,255,.03); border-bottom:1px solid rgba(255,255,255,.06); }
.ty-ic-icon  { font-size:20px; }
.ty-ic-title { font-size:14px; font-weight:800; color:#ddd; text-transform:uppercase; letter-spacing:.8px; }
.ty-detail-grid { padding:8px 0; }
.ty-detail-row  { display:flex; align-items:flex-start; gap:16px; padding:16px 24px; border-bottom:1px solid rgba(255,255,255,.04); transition:background .2s; }
.ty-detail-row:last-child { border-bottom:none; }
.ty-detail-row:hover { background:rgba(255,255,255,.02); }
.ty-dr-icon  { font-size:20px; flex-shrink:0; margin-top:1px; }
.ty-dr-label { font-size:10px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:.8px; margin-bottom:5px; }
.ty-dr-val   { font-size:15px; font-weight:600; color:#e0e0e0; line-height:1.4; }
.ty-note        { display:flex; gap:16px; align-items:flex-start; border-radius:18px; padding:20px; animation:fadeUp .5s ease .4s both; }
.ty-note-green  { background:rgba(74,222,128,.05);  border:1px solid rgba(74,222,128,.15); }
.ty-note-orange { background:rgba(230,126,34,.06);  border:1px solid rgba(230,126,34,.15); }
.ty-note-icon   { font-size:24px; flex-shrink:0; margin-top:1px; }
.ty-note-title  { font-size:14px; font-weight:800; margin-bottom:7px; }
.ty-note-text   { font-size:13px; color:#666; line-height:1.7; }
.ty-note-em     { color:#aaa; font-weight:600; }
.ty-btn-row     { display:grid; grid-template-columns:1fr 1fr; gap:14px; animation:fadeUp .5s ease .5s both; }
.ty-btn         { display:flex; align-items:center; justify-content:center; gap:10px; padding:16px 24px; border-radius:16px; border:none; font-size:15px; font-weight:700; font-family:inherit; cursor:pointer; transition:all .25s ease; }
.ty-btn-primary   { background:linear-gradient(135deg,#f39c12,#e67e22,#d35400); color:white; box-shadow:0 8px 28px rgba(230,126,34,.35); }
.ty-btn-primary:hover   { transform:translateY(-3px); box-shadow:0 16px 44px rgba(230,126,34,.55); }
.ty-btn-secondary { background:rgba(255,255,255,.05); color:#ccc; border:1px solid rgba(255,255,255,.1); }
.ty-btn-secondary:hover { background:rgba(255,255,255,.09); color:#fff; transform:translateY(-3px); }
.ty-timeline-card  { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:22px; padding:24px; animation:slideIn .5s ease .35s both; }
.ty-timeline-head  { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
.ty-tl-dot   { width:8px; height:8px; border-radius:50%; background:#e67e22; box-shadow:0 0 12px rgba(230,126,34,.6); }
.ty-tl-title { font-size:11px; font-weight:800; color:#e67e22; text-transform:uppercase; letter-spacing:1.2px; }
.ty-tl-item  { display:flex; gap:14px; }
.ty-tl-left  { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
.ty-tl-node  { width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.05); border:2px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#555; flex-shrink:0; }
.ty-tl-node-done   { background:linear-gradient(135deg,#f39c12,#e67e22)!important; border-color:transparent!important; color:white!important; box-shadow:0 4px 20px rgba(230,126,34,.5); }
.ty-tl-node-pickup { background:linear-gradient(135deg,#22c55e,#16a34a)!important; border-color:transparent!important; color:white!important; box-shadow:0 4px 20px rgba(34,197,94,.5)!important; }
.ty-tl-line      { width:2px; flex:1; min-height:20px; background:rgba(255,255,255,.06); margin:6px 0; border-radius:2px; }
.ty-tl-line-done { background:linear-gradient(180deg,#e67e22,rgba(255,255,255,.06)); }
.ty-tl-right   { padding-top:6px; flex:1; min-width:0; }
.ty-tl-header  { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:5px; }
.ty-tl-name         { font-size:14px; font-weight:700; color:#888; }
.ty-tl-name-done    { color:#e67e22!important; }
.ty-tl-name-pickup  { color:#4ade80!important; }
.ty-tl-time { font-size:10px; font-weight:700; color:#333; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); padding:3px 9px; border-radius:999px; white-space:nowrap; flex-shrink:0; }
.ty-tl-time-done    { color:#e67e22!important; border-color:rgba(230,126,34,.3)!important; }
.ty-tl-time-pickup  { color:#4ade80!important; border-color:rgba(74,222,128,.3)!important; }
.ty-tl-desc    { font-size:12px; color:#444; line-height:1.55; }
.ty-pickup-note{ display:flex; align-items:flex-start; gap:7px; margin-top:8px; padding:10px 14px; background:rgba(230,126,34,.05); border:1px dashed rgba(230,126,34,.2); border-radius:10px; font-size:11px; color:#666; line-height:1.5; }
.ty-pickup-done{ display:flex; align-items:center; gap:8px; margin-top:8px; padding:10px 14px; background:rgba(74,222,128,.07); border:1px solid rgba(74,222,128,.2); border-radius:10px; font-size:13px; font-weight:700; color:#4ade80; }
.ty-shop-info  { margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,.07); display:flex; flex-direction:column; gap:10px; }
.ty-si-row     { display:flex; align-items:center; gap:10px; font-size:13px; color:#666; font-weight:500; }

.form-page { min-height:100vh; background:#080808; color:white; }
.fnav      { background:rgba(8,8,8,.96); border-bottom:1px solid #141414; padding:15px 40px; position:sticky; top:0; z-index:100; backdrop-filter:blur(24px); }
.fnav-inner{ max-width:1180px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
.crumbs    { display:flex; align-items:center; gap:8px; font-size:13px; }
.cr-done   { color:#e67e22; cursor:pointer; font-weight:600; }
.cr-done:hover { opacity:.7; }
.cr-active { color:white; font-weight:800; }
.cr-next   { color:#383838; }
.cr-sep    { color:#282828; font-size:16px; }
.flayout   { max-width:1180px; margin:0 auto; display:grid; grid-template-columns:1fr 375px; gap:28px; padding:36px 40px 80px; align-items:start; }
.fleft     { display:flex; flex-direction:column; gap:16px; }
.fcard            { background:#0d0d0d; border:1px solid #1c1c1c; border-radius:22px; overflow:hidden; transition:border-color .3s; }
.fcard:focus-within { border-color:rgba(230,126,34,.2); }
.fcard-head       { display:flex; align-items:center; justify-content:space-between; padding:20px 26px; background:#111; border-bottom:1px solid #191919; }
.fcard-head-l     { display:flex; align-items:center; gap:14px; }
.fcard-ttl        { font-size:16px; font-weight:800; color:#fff; }
.fcard-sub        { font-size:12px; color:#666; margin-top:3px; }
.step-n           { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#f39c12,#e67e22); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; color:white; flex-shrink:0; box-shadow:0 4px 16px rgba(230,126,34,.35); }
.pickup-badge     { font-size:12px; font-weight:700; color:#e67e22; background:rgba(230,126,34,.08); border:1px solid rgba(230,126,34,.18); padding:7px 14px; border-radius:999px; }
.fcard-body       { padding:26px; display:flex; flex-direction:column; gap:18px; }
.f2col            { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.field      { display:flex; flex-direction:column; gap:7px; }
.field-lbl  { font-size:11px; font-weight:700; color:rgba(255,255,255,.5); text-transform:uppercase; letter-spacing:.8px; }
.field-lbl-err { color:#e63946 !important; }
.field-box  { display:flex; align-items:center; border:1.5px solid rgba(255,255,255,.12); border-radius:13px; overflow:hidden; transition:all 0.2s ease; background:rgba(255,255,255,.04); }
.field-pre  { padding:0 15px; font-size:13px; font-weight:600; color:rgba(255,255,255,.4); background:rgba(255,255,255,.03); min-height:52px; display:flex; align-items:center; border-right:1px solid rgba(255,255,255,.08); flex-shrink:0; white-space:nowrap; }
.field-disabled { opacity:0.5; cursor:not-allowed; }
.field-inp  {
  flex:1; padding:15px 17px; border:none; outline:none;
  font-size:15px; font-weight:500; font-family:inherit;
  min-height:52px; width:100%; background:transparent;
  color:#ffffff !important; -webkit-text-fill-color:#ffffff !important;
}
.field-inp::placeholder { color:rgba(255,255,255,.2); -webkit-text-fill-color:rgba(255,255,255,.2); }
.field-inp:-webkit-autofill,
.field-inp:-webkit-autofill:hover,
.field-inp:-webkit-autofill:focus,
.field-inp:-webkit-autofill:active {
  -webkit-text-fill-color:#ffffff !important;
  transition:background-color 9999s ease-in-out 0s;
}
.field-err-msg { display:flex; align-items:center; gap:5px; font-size:12px; color:#e63946; font-weight:600; animation:shake .3s ease; }
.field-hint    { font-size:12px; color:rgba(255,255,255,.3); line-height:1.4; }
.checkbox-wrap    { display:flex; align-items:flex-start; gap:12px; cursor:pointer; }
.checkbox-box     { width:20px; height:20px; border-radius:6px; flex-shrink:0; margin-top:2px; border:2px solid #2a2a2a; background:transparent; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.checkbox-checked { background:linear-gradient(135deg,#f39c12,#e67e22)!important; border-color:transparent!important; box-shadow:0 0 16px rgba(230,126,34,.35); }
.checkbox-label   { font-size:14px; color:#ccc; font-weight:500; line-height:1.4; user-select:none; }
.checkbox-sub     { font-size:12px; color:#555; margin-top:3px; user-select:none; }
.pstrip      { display:flex; background:#0a0a0a; border-bottom:1px solid #191919; }
.pstrip-item { flex:1; padding:16px 18px; display:flex; gap:11px; align-items:flex-start; }
.pstrip-div  { width:1px; background:#191919; flex-shrink:0; }
.pstrip-icon { font-size:18px; flex-shrink:0; margin-top:1px; }
.pstrip-lbl  { font-size:10px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:.8px; margin-bottom:4px; }
.pstrip-val  { font-size:12px; color:#ccc; font-weight:600; line-height:1.4; }
.save-preview { background:rgba(230,126,34,.04); border:1px solid rgba(230,126,34,.12); border-radius:14px; padding:16px; animation:fadeUp .3s ease both; }
.sp-head  { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
.sp-title { font-size:11px; font-weight:800; color:#e67e22; text-transform:uppercase; letter-spacing:.8px; }
.sp-grid  { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.sp-item  { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.04); border-radius:10px; padding:12px; }
.sp-item-empty { opacity:.6; }
.sp-label { font-size:10px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:.6px; margin-bottom:5px; }
.sp-val      { font-size:13px; font-weight:600; color:#ccc; }
.sp-val-hint { color:#444!important; font-style:italic; font-size:12px!important; }
.factions  { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.btn-back  { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:15px 28px; font-size:14px; font-weight:700; font-family:inherit; color:#888; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:8px; white-space:nowrap; }
.btn-back:hover { color:#e67e22; border-color:rgba(230,126,34,.3); background:rgba(230,126,34,.05); }
.btn-place { flex:1; padding:15px 32px; background:linear-gradient(135deg,#f39c12,#e67e22,#d35400); border:none; border-radius:14px; color:white; font-size:15px; font-weight:800; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all .3s; box-shadow:0 8px 28px rgba(230,126,34,.32); }
.btn-place:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 16px 44px rgba(230,126,34,.5); }
.btn-place-loading { opacity:.78; cursor:not-allowed; }
.sec-note  { display:flex; align-items:center; gap:10px; padding:15px 20px; background:#0d0d0d; border:1px solid #1c1c1c; border-radius:14px; font-size:13px; color:#666; }
.txt-orange { color:#e67e22; font-weight:600; }
.ffooter   { display:flex; align-items:center; justify-content:center; gap:10px; padding-top:4px; }
.flink     { font-size:13px; color:#666; font-weight:500; text-decoration:none; transition:color .2s; }
.flink:hover { color:#e67e22; }
.fdot      { color:#282828; font-size:14px; }
.fright    { position:sticky; top:80px; }
.sum-card  { background:#0d0d0d; border:1px solid #1c1c1c; border-radius:22px; overflow:hidden; }
.sum-head  { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:#111; border-bottom:1px solid #191919; }
.sum-ttl   { font-size:16px; font-weight:800; color:#fff; }
.sum-badge { font-size:12px; font-weight:700; color:#666; background:#191919; border:1px solid #242424; padding:5px 12px; border-radius:999px; }
.sum-items { padding:20px 24px; display:flex; flex-direction:column; gap:16px; border-bottom:1px solid #191919; max-height:360px; overflow-y:auto; }
.sum-item  { display:flex; align-items:center; gap:14px; }
.sim-wrap  { position:relative; flex-shrink:0; }
.sim-img   { width:60px; height:60px; border-radius:13px; object-fit:cover; background:#191919; border:1px solid #242424; display:block; }
.sim-qty   { position:absolute; top:-9px; right:-9px; background:linear-gradient(135deg,#f39c12,#e67e22); color:white; width:22px; height:22px; border-radius:50%; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(230,126,34,.45); }
.sim-info  { flex:1; min-width:0; }
.sim-name  { font-size:13px; font-weight:700; color:#e0e0e0; line-height:1.4; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sim-code  { font-size:11px; color:#3a3a3a; }
.sim-price { font-size:14px; font-weight:800; color:#fff; flex-shrink:0; white-space:nowrap; }
.sum-totals{ padding:16px 24px; display:flex; flex-direction:column; gap:10px; border-bottom:1px solid #191919; }
.sum-row   { display:flex; justify-content:space-between; align-items:center; }
.sum-lbl   { font-size:14px; color:#666; }
.sum-val   { font-size:14px; color:#ccc; font-weight:600; }
.sum-free  { font-size:14px; font-weight:800; color:#4ade80; }
.sum-grand { display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #191919; }
.sg-label  { font-size:18px; font-weight:800; color:#fff; }
.sg-right  { text-align:right; }
.sg-cur    { font-size:11px; color:#555; margin-bottom:2px; font-weight:600; letter-spacing:.5px; }
.sg-amt    { font-size:26px; font-weight:900; color:#fff; letter-spacing:-.5px; }
.sum-trust { display:grid; grid-template-columns:repeat(4,1fr); padding:16px 24px; }
.trust-item{ display:flex; flex-direction:column; align-items:center; gap:6px; padding:8px 4px; }
.trust-icon{ font-size:22px; }
.trust-lbl { font-size:10px; font-weight:700; color:#444; text-transform:uppercase; letter-spacing:.6px; }

::-webkit-scrollbar       { width:4px; height:4px; }
::-webkit-scrollbar-track { background:#0a0a0a; }
::-webkit-scrollbar-thumb { background:#e67e22; border-radius:10px; }

@media(max-width:960px){
  .ty-content-grid { grid-template-columns:1fr; }
  .ty-right-col    { position:relative; top:auto; }
  .ty-hero-title   { font-size:24px; }
  .ty-hero-content { flex-direction:column; text-align:center; }
  .ty-wrapper      { padding:20px; }
}
@media(max-width:900px){
  .flayout  { grid-template-columns:1fr; padding:24px 20px 60px; }
  .fright   { position:relative; top:auto; }
  .fnav     { padding:14px 20px; }
  .f2col    { grid-template-columns:1fr; }
  .factions { flex-direction:column-reverse; }
  .btn-place,.btn-back { width:100%; justify-content:center; }
  .ty-btn-row { grid-template-columns:1fr; }
}
@media(max-width:480px){
  .ty-hero    { padding:28px 20px; }
  .ty-hero-title { font-size:20px; }
  .sp-grid    { grid-template-columns:1fr; }
  .pstrip     { flex-direction:column; }
  .pstrip-div { width:100%; height:1px; }
}
`

export default Checkout