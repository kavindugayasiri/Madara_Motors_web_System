
import React, { useState, useEffect, useRef } from 'react' // 🟢 useRef Import කළා
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { registerCustomer, googleAuth, facebookAuth } from '../services/api'
import { useGoogleLogin } from '@react-oauth/google'
import FacebookLogin from '@greatsumini/react-facebook-login'

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.9 6 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.2-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.9 6 29.7 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.6 0 10.7-2.1 14.5-5.4l-6.7-5.5C29.8 34.9 27.1 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.7 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-3 5-5.5 6.6l.1.1 6.7 5.5C39.9 37.1 44 31.8 44 24c0-1.1-.1-2.2-.4-3.5z"/>
  </svg>
)

const CustomerRegister = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState(1)
  const stepRef = useRef(1)

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)

  // 🟢 BROWSER NAVIGATION BLOCKER (Arrow Keys Disable - Fixed version)
  useEffect(() => {

    window.history.pushState(null, null, window.location.href);

    const handleBackButton = () => {
   
      window.history.pushState(null, null, window.location.href);
      
     
      if (stepRef.current === 2) {
        setError('');
        setStep(1); 
      } else {
        navigate('/customer/login', { replace: true }); 
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [navigate]);

  const updateForm = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  // Social Login Complete
  const completeLogin = (res) => {
    try {
      const data = res?.data ?? res ?? null
      if (!data) { setError('Invalid response from server'); return false }
      const token = data.token || data.accessToken || data.access_token || null
      if (!token) { setError('Authentication failed - no token received'); return false }
      const customerData = data.customer || data.user || data.data || {}
      login(customerData, token)
      navigate('/customer/dashboard')
      return true
    } catch (e) {
      setError('Login failed: ' + e.message)
      return false
    }
  }

  // Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('')
      setSocialLoading(true)
      try {
        const res = await googleAuth(tokenResponse.access_token)
        completeLogin(res)
      } catch (e) {
        setError(e?.response?.data?.message || 'Google sign-in failed')
      } finally {
        setSocialLoading(false)
      }
    },
    onError: () => { setError('Google sign-in failed'); setSocialLoading(false) },
    flow: 'implicit',
  })

  // Facebook Login
  const onFacebookSuccess = async (fbResponse) => {
    setError('')
    setSocialLoading(true)
    try {
      const accessToken = fbResponse?.accessToken
      if (!accessToken) throw new Error('Facebook access token not found')
      const res = await facebookAuth(accessToken)
      completeLogin(res)
    } catch (e) {
      setError(e?.response?.data?.message || 'Facebook sign-in failed')
    } finally {
      setSocialLoading(false)
    }
  }

  // Step 1 → Step 2
  const handleNext = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name is required!'); return }
    if (!form.email.trim()) { setError('Email is required!'); return }
    if (!form.phone.trim()) { setError('Phone is required!'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) { setError('Invalid email address!'); return }
    setStep(2)
  }

  // Step 2 Submit → OTP Page
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.password) { setError('Password is required!'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters!'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match!'); return }

    setLoading(true)
    try {
      // ✅ /api/customer/auth/register
      const res = await registerCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      })

      console.log('Register response:', res.data)

      navigate('/customer/verify-email', {
        replace: true,
        state: {
          formData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            password: form.password,
          },
          message: res.data?.message || 'OTP sent to your email!',
        }
      })

    } catch (err) {
      console.error('Register error:', err)
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed!'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.card}>

          {/* Logo */}
          <div style={styles.logoArea}>
            <div style={styles.logoBox}>M</div>
            <div>
              <div style={styles.brandName}>Madara Motors</div>
              <div style={styles.portalName}>Create Account</div>
            </div>
          </div>

          <h2 style={styles.title}>Join Us!</h2>
          <p style={styles.subtitle}>Create your free customer account</p>

          {/* Step Indicator */}
          <div style={styles.stepWrap}>
            <div style={styles.stepItem}>
              <div style={{
                ...styles.stepCircle,
                background: step >= 1 ? '#e67e22' : '#eee',
                color: step >= 1 ? 'white' : '#999',
              }}>1</div>
              <span style={styles.stepLabel}>Personal Info</span>
            </div>
            <div style={styles.stepLine} />
            <div style={styles.stepItem}>
              <div style={{
                ...styles.stepCircle,
                background: step >= 2 ? '#e67e22' : '#eee',
                color: step >= 2 ? 'white' : '#999',
              }}>2</div>
              <span style={styles.stepLabel}>Security</span>
            </div>
          </div>

          {/* Error */}
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} noValidate autoComplete="off">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Silva' },
                { key: 'email', label: 'Email Address', type: 'email', placeholder: 'john@email.com' },
                { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '07X XXX XXXX' },
                { key: 'address', label: 'Address (Optional)', type: 'text', placeholder: 'Colombo, Sri Lanka' },
              ].map((f) => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    type={f.type}
                    style={styles.input}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => updateForm(f.key, e.target.value)}
                    autoComplete="off"
                  />
                </div>
              ))}

              <button type="submit" style={styles.submitBtn}>
                Next Step →
              </button>

              <div style={styles.continueWrap}>
                <div style={styles.continueLine} />
                <span style={styles.continueText}>or continue with</span>
                <div style={styles.continueLine} />
              </div>

              <div style={styles.socialRow}>
                <button
                  type="button"
                  style={styles.socialPill}
                  onClick={() => googleLogin()}
                  disabled={socialLoading}
                >
                  <GoogleIcon size={20} />
                  <span style={styles.socialLabel}>Google</span>
                </button>

                <FacebookLogin
                  appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                  onSuccess={onFacebookSuccess}
                  onFail={() => setError('Facebook sign-in failed')}
                  render={(renderProps) => (
                    <button
                      type="button"
                      style={styles.socialPill}
                      onClick={renderProps.onClick}
                      disabled={socialLoading}
                    >
                      <span style={styles.fbIcon}>f</span>
                      <span style={styles.socialLabel}>Facebook</span>
                    </button>
                  )}
                />
              </div>

              {socialLoading && (
                <p style={styles.socialLoadingText}>Signing you in...</p>
              )}
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <div style={styles.infoBox}>
                📧 OTP verification code will be sent to<br />
                <strong>{form.email}</strong>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={styles.input}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  autoComplete="new-password"
                />
                {form.password.length > 0 && (
                  <div style={styles.strengthWrap}>
                    <div style={{
                      ...styles.strengthBar,
                      width: form.password.length >= 10 ? '100%'
                        : form.password.length >= 8 ? '66%'
                        : form.password.length >= 6 ? '33%' : '15%',
                      background: form.password.length >= 10 ? '#27ae60'
                        : form.password.length >= 8 ? '#f39c12'
                        : form.password.length >= 6 ? '#e67e22' : '#e74c3c',
                    }} />
                    <span style={styles.strengthText}>
                      {form.password.length >= 10 ? '💪 Strong'
                        : form.password.length >= 8 ? '👍 Good'
                        : form.password.length >= 6 ? '⚠️ Weak' : '❌ Too short'}
                    </span>
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  style={{
                    ...styles.input,
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword
                      ? '#e74c3c' : '#e5e7eb'
                  }}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => updateForm('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                    ❌ Passwords do not match
                  </span>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <span style={{ fontSize: '12px', color: '#27ae60', marginTop: '4px', display: 'block' }}>
                    ✅ Passwords match
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  style={styles.backBtn}
                  onClick={() => { setError(''); setStep(1) }}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.submitBtn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={loading}
                >
                  {loading ? '⏳ Sending OTP...' : '📧 Send OTP & Verify'}
                </button>
              </div>
            </form>
          )}

          <div style={styles.links}>
            <p>
              Already have an account?{' '}
              <Link to="/customer/login" style={styles.linkText} replace>Login Here</Link>
            </p>
            <p style={{ marginTop: '8px' }}>
              <Link to="/" style={styles.linkText} replace>← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const styles = {
  page: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa, #e8ecf0)', padding: '40px 20px' },
  card: { background: 'white', borderRadius: '20px', padding: '45px 40px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  logoArea: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  logoBox: { width: '44px', height: '44px', background: '#e67e22', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' },
  brandName: { fontWeight: '700', fontSize: '17px', color: '#1a1a2e' },
  portalName: { fontSize: '12px', color: '#888' },
  title: { fontSize: '24px', fontWeight: '700', margin: '0 0 6px', color: '#1a1a2e' },
  subtitle: { color: '#888', marginBottom: '20px', fontSize: '14px' },
  stepWrap: { display: 'flex', alignItems: 'center', marginBottom: '25px' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' },
  stepCircle: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' },
  stepLabel: { fontSize: '12px', color: '#888' },
  stepLine: { flex: 1, height: '2px', background: '#e5e7eb', margin: '0 10px 15px' },
  errorBox: { background: '#fff5f5', color: '#c0392b', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  infoBox: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  input: { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box', outline: 'none' },
  strengthWrap: { marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  strengthBar: { height: '4px', borderRadius: '2px', transition: 'all 0.3s ease', minWidth: '60px' },
  strengthText: { fontSize: '12px', color: '#666' },
  submitBtn: { flex: 1, width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e67e22, #d35400)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
  backBtn: { padding: '13px 20px', background: '#f3f4f6', color: '#555', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  continueWrap: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 16 },
  continueLine: { flex: 1, height: 1, background: '#e5e7eb' },
  continueText: { fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' },
  socialRow: { display: 'flex', gap: 12 },
  socialPill: { flex: 1, height: 46, borderRadius: 999, border: '1.5px solid #d1d5db', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  socialLabel: { color: '#111827', fontSize: 14, fontWeight: 600 },
  fbIcon: { width: 22, height: 22, borderRadius: '50%', background: '#1877F2', color: '#fff', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  socialLoadingText: { marginTop: 10, fontSize: 13, color: '#666', textAlign: 'center' },
  links: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#555' },
  linkText: { color: '#e67e22', fontWeight: '600', textDecoration: 'none' },
}

export default CustomerRegister