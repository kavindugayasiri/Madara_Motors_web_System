import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { verifyCustomerEmail, resendCustomerOtp } from '../services/api'

const EmailVerify = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { formData } = location.state || {}

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

 
  useEffect(() => {
    if (!formData) navigate('/customer/register')
  }, [formData, navigate])

 
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

 
  const handleVerify = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await verifyCustomerEmail({
        email: formData.email,
        otp: otpCode,
      })

      const data = res.data
      console.log('Verify response:', data)

    
      setSuccess('✅ Email verified! Redirecting to login...')

      setTimeout(() => {
        navigate('/customer/login', {
          state: {
            email: formData.email,         // ✅ email pass
            password: formData.password,   // ✅ password pass
            verified: true,                // ✅ verified flag
            message: '🎉 Account verified successfully!',
          }
        })
      }, 1500)

    } catch (err) {
      console.error('Verify error:', err)
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Resend OTP
  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setSuccess('')

    try {
      await resendCustomerOtp({ email: formData.email })

      setSuccess('✅ New OTP sent to your email!')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      setCanResend(false)
      inputRefs.current[0]?.focus()

    } catch (err) {
      console.error('Resend error:', err)
      setError(err?.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setResendLoading(false)
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
              <div style={styles.portalName}>Email Verification</div>
            </div>
          </div>

          {/* Email Icon */}
          <div style={styles.emailIconWrap}>
            <div style={styles.emailIcon}>📧</div>
          </div>

          <h2 style={styles.title}>Check Your Email!</h2>
          <p style={styles.subtitle}>We sent a 6-digit OTP to</p>
          <p style={styles.emailText}>{formData?.email}</p>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>⚠️ {error}</div>
          )}

          {/* Success */}
          {success && (
            <div style={styles.successBox}>{success}</div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerify}>
            <div style={styles.otpRow} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  style={{
                    ...styles.otpInput,
                    borderColor: digit ? '#e67e22' : '#e5e7eb',
                    background: digit ? '#fff9f5' : 'white',
                  
                    ...(success ? { borderColor: '#16a34a', background: '#f0fdf4' } : {}),
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              style={{
                ...styles.verifyBtn,
                opacity: loading || success ? 0.7 : 1,
                cursor: loading || success ? 'not-allowed' : 'pointer',
              }}
              disabled={loading || !!success}
            >
              {loading
                ? '⏳ Verifying...'
                : success
                ? '✅ Verified!'
                : '✓ Verify Email'}
            </button>
          </form>

          {/* Resend */}
          <div style={styles.resendWrap}>
            {canResend && !success ? (
              <button
                style={styles.resendBtn}
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? '⏳ Sending...' : '🔄 Resend OTP'}
              </button>
            ) : !success ? (
              <p style={styles.countdownText}>
                Resend OTP in{' '}
                <span style={{ color: '#e67e22', fontWeight: '700' }}>
                  {countdown}s
                </span>
              </p>
            ) : null}
          </div>

          {/* Back to Register */}
          {!success && (
            <div style={styles.backWrap}>
              <button
                style={styles.backBtn}
                onClick={() => navigate('/customer/register')}
              >
                ← Back to Register
              </button>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}

const styles = {
  page: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa, #e8ecf0)',
    padding: '40px 20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '45px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  logoBox: {
    width: '44px',
    height: '44px',
    background: '#e67e22',
    borderRadius: '10px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  brandName: { fontWeight: '700', fontSize: '17px', color: '#1a1a2e' },
  portalName: { fontSize: '12px', color: '#888' },
  emailIconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  emailIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #fff5eb, #fde8cc)',
    borderRadius: '50%',
    fontSize: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #e67e22'
  },
  title: { fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 8px' },
  subtitle: { color: '#888', fontSize: '14px', margin: '0 0 4px' },
  emailText: {
    color: '#e67e22',
    fontWeight: '700',
    fontSize: '15px',
    marginBottom: '25px'
  },
  errorBox: {
    background: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #fecaca',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  successBox: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  otpRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '25px'
  },
  otpInput: {
    width: '50px',
    height: '56px',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1a2e',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  verifyBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  resendWrap: { marginBottom: '15px' },
  resendBtn: {
    background: 'none',
    border: '2px solid #e67e22',
    color: '#e67e22',
    padding: '10px 25px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  countdownText: { fontSize: '14px', color: '#888' },
  backWrap: { marginTop: '5px' },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
}

export default EmailVerify