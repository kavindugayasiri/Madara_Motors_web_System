
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginCustomer, googleAuth, facebookAuth, sendOtp, verifyOtp, resetPassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.9 6 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.2-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.9 6 29.7 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.6 0 10.7-2.1 14.5-5.4l-6.7-5.5C29.8 34.9 27.1 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.7 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-3 5-5.5 6.6l.1.1 6.7 5.5C39.9 37.1 44 31.8 44 24c0-1.1-.1-2.2-.4-3.5z"/>
  </svg>
);

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // 🟢 View State
  const [view, setView] = useState('LOGIN');
  
  // 🟢 Form States
  const [form, setForm] = useState({ email: '', password: '' });
  const [resetForm, setResetForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  
  // 🟢 UI States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // 🟢 BROWSER NAVIGATION BLOCKER (Arrow Keys Disable)
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);

    const handleBackButton = () => {
      window.history.pushState(null, null, window.location.href);

    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);

  // Auto-fill from registration
  useEffect(() => {
    if (location.state?.email) {
      setForm(prev => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.password) {
      setForm(prev => ({ ...prev, password: location.state.password }));
    }
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
    }
  }, [location.state]);

  // ==========================================
  // 1. STANDARD LOGIN LOGIC
  // ==========================================
  const completeLogin = (res) => {
    try {
      const data = res?.data ?? res ?? null;
      if (!data) {
        setError('Invalid response from server');
        return;
      }

      const token = data.token || data.accessToken || data.access_token || null;
      if (!token) {
        setError('Authentication failed - no token received');
        return;
      }

      const customerData = data.customer || data.user || data.data || {};
      login(customerData, token);
      navigate('/'); 
    } catch (e) {
      setError('Login failed: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await loginCustomer({ email: form.email, password: form.password });
      completeLogin(res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. FORGOT PASSWORD LOGIC (🟢 REAL API CONNECTED)
  // ==========================================
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (!resetForm.email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    
    const COOLDOWN_MINUTES = 10;
    const COOLDOWN_TIME_MS = COOLDOWN_MINUTES * 60 * 1000; 
    const lastSentTime = localStorage.getItem(`otp_time_${resetForm.email}`); 

    if (lastSentTime) {
      const timePassed = Date.now() - parseInt(lastSentTime, 10);
      
      if (timePassed < COOLDOWN_TIME_MS) {
        const timeLeftMs = COOLDOWN_TIME_MS - timePassed;
        const minsLeft = Math.floor(timeLeftMs / 60000);
        const secsLeft = Math.floor((timeLeftMs % 60000) / 1000);
        
        setError(`Please wait ${minsLeft}m ${secsLeft}s before requesting a new OTP for this email.`);
        setLoading(false);
        return; 
      }
    }

    try {
     
      await sendOtp({ email: resetForm.email });
      
      
      localStorage.setItem(`otp_time_${resetForm.email}`, Date.now().toString());
      
      setSuccessMsg(`OTP code has been sent to ${resetForm.email}`);
      
      
      setTimeout(() => {
        setView('OTP');
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
     
      setError(err?.response?.data?.message || 'User with this email not found!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
    
      await verifyOtp({ email: resetForm.email, otp: resetForm.otp });
      
      setSuccessMsg('OTP Verified! Create a new password.');
      
      setTimeout(() => {
        setView('RESET');
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP code!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setLoading(false);
      return setError('Passwords do not match!');
    }
    if (resetForm.newPassword.length < 6) {
      setLoading(false);
      return setError('Password must be at least 6 characters.');
    }

    try {
    
      await resetPassword({ 
        email: resetForm.email, 
        otp: resetForm.otp, 
        newPassword: resetForm.newPassword 
      });
      
      setForm({ ...form, email: resetForm.email }); 
      setResetForm({ email: '', otp: '', newPassword: '', confirmPassword: '' });
      
      setView('LOGIN');
      setSuccessMsg('Password reset successful! Please sign in with your new password.');

    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SOCIAL LOGINS
  // ==========================================
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setSocialLoading(true);
      try {
        const res = await googleAuth(tokenResponse.access_token);
        completeLogin(res);
      } catch (e) {
        setError(e?.response?.data?.message || 'Google sign-in failed');
      } finally {
        setSocialLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in failed');
      setSocialLoading(false);
    },
    flow: 'implicit',
  });

  const onFacebookSuccess = async (fbResponse) => {
    setError('');
    setSocialLoading(true);
    try {
      const accessToken = fbResponse?.accessToken;
      if (!accessToken) throw new Error('Facebook token not found');
      const res = await facebookAuth(accessToken);
      completeLogin(res);
    } catch (e) {
      setError(e?.response?.data?.message || 'Facebook sign-in failed');
    } finally {
      setSocialLoading(false);
    }
  };

  const renderMessages = () => (
    <>
      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {successMsg && <div style={styles.successMsg}>✅ {successMsg}</div>}
    </>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.card}>

          <div style={styles.logoArea}>
            <div style={styles.logoBox}>M</div>
            <div>
              <div style={styles.brandName}>Madara Motors</div>
              <div style={styles.portalName}>Customer Portal</div>
            </div>
          </div>

          {/* ======================================= */}
          {/* VIEW: LOGIN */}
          {/* ======================================= */}
          {view === 'LOGIN' && (
            <div style={styles.viewWrapper}>
              <h2 style={styles.title}>Welcome Back! 👋</h2>
              <p style={styles.subtitle}>Sign in to your customer account</p>

              {renderMessages()}

              <form onSubmit={handleSubmit} autoComplete="off">
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    style={styles.input}
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="off"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    style={styles.input}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    {/* 🟢 මෙන්න මෙතන තමයි වෙනස් කළේ! වෙන පේජ් එකට යන්න හැදුවා. */}
                    <span 
                        onClick={() => navigate('/forgot-password')} 
                        style={styles.forgotLink}
                    >
                      Forgot password?
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    ...styles.submitBtn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={loading || socialLoading}
                >
                  {loading ? '⏳ Signing in...' : '🔑 Sign In'}
                </button>
              </form>

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
                  disabled={loading || socialLoading}
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
                      disabled={loading || socialLoading}
                    >
                      <span style={styles.fbIcon}>f</span>
                      <span style={styles.socialLabel}>Facebook</span>
                    </button>
                  )}
                />
              </div>

              {socialLoading && (
                <p style={styles.socialLoadingText}>⏳ Signing you in...</p>
              )}

              <div style={styles.links}>
                <p>
                  New customer?{' '}
                  <Link to="/customer/register" style={styles.linkText}>
                    Create Account →
                  </Link>
                </p>
                <p style={{ marginTop: '8px' }}>
                  <Link to="/" style={styles.linkText}>← Back to Home</Link>
                </p>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: FORGOT PASSWORD - EMAIL */}
          {/* ======================================= */}
          {view === 'EMAIL' && (
            <div style={styles.viewWrapper}>
              <h2 style={styles.title}>Reset Password 🔒</h2>
              <p style={styles.subtitle}>Enter your registered email to receive an OTP.</p>
              
              {renderMessages()}
              
              <form onSubmit={handleSendOTP} autoComplete="off">
                <div style={styles.field}>
                  <label style={styles.label}>Registered Email</label>
                  <input 
                    type="email" 
                    style={styles.input} 
                    placeholder="e.g. your@email.com" 
                    value={resetForm.email} 
                    onChange={e => setResetForm({ ...resetForm, email: e.target.value })} 
                    required 
                    autoFocus 
                    autoComplete="off"
                  />
                </div>
                <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? '⏳ Sending OTP...' : 'Send OTP'}
                </button>
              </form>
              <div style={styles.links}>
                <p><span style={styles.backLink} onClick={() => { setView('LOGIN'); setError(''); setSuccessMsg(''); }}>← Back to Login</span></p>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: FORGOT PASSWORD - OTP */}
          {/* ======================================= */}
          {view === 'OTP' && (
            <div style={styles.viewWrapper}>
              <h2 style={styles.title}>Enter OTP 💬</h2>
              <p style={styles.subtitle}>We've sent a 6-digit code to <b>{resetForm.email}</b></p>
              
              {renderMessages()}
              
              <form onSubmit={handleVerifyOTP} autoComplete="off">
                <div style={styles.field}>
                  <label style={styles.label}>Verification Code</label>
                  <input 
                    type="text" 
                    style={{...styles.input, letterSpacing: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold'}} 
                    placeholder="••••••" 
                    maxLength="6" 
                    value={resetForm.otp} 
                    onChange={e => setResetForm({ ...resetForm, otp: e.target.value.replace(/\D/g, '') })} 
                    required 
                    autoFocus 
                    autoComplete="off"
                  />
                </div>
                <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading || resetForm.otp.length < 6}>
                  {loading ? '⏳ Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <div style={styles.links}>
                <p><span style={styles.backLink} onClick={() => { setView('EMAIL'); setError(''); setSuccessMsg(''); }}>← Use a different email</span></p>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: FORGOT PASSWORD - RESET */}
          {/* ======================================= */}
          {view === 'RESET' && (
            <div style={styles.viewWrapper}>
              <h2 style={styles.title}>Create New Password ✨</h2>
              <p style={styles.subtitle}>Your new password must be different from previously used passwords.</p>
              
              {renderMessages()}
              
              <form onSubmit={handleResetPassword} autoComplete="off">
                <div style={styles.field}>
                  <label style={styles.label}>New Password</label>
                  <input 
                    type="password" 
                    style={styles.input} 
                    placeholder="At least 6 characters" 
                    value={resetForm.newPassword} 
                    onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} 
                    required 
                    autoFocus 
                    autoComplete="new-password"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input 
                    type="password" 
                    style={styles.input} 
                    placeholder="Repeat new password" 
                    value={resetForm.confirmPassword} 
                    onChange={e => setResetForm({ ...resetForm, confirmPassword: e.target.value })} 
                    required 
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? '⏳ Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  page: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%)', padding: '40px 20px' },
  card: { background: 'white', borderRadius: '20px', padding: '45px 40px', width: '100%', maxWidth: '430px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  logoArea: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' },
  logoBox: { width: '44px', height: '44px', background: '#e67e22', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' },
  brandName: { fontWeight: '700', fontSize: '17px', color: '#1a1a2e' },
  portalName: { fontSize: '12px', color: '#888' },
  title: { fontSize: '24px', fontWeight: '700', margin: '0 0 6px', color: '#1a1a2e' },
  subtitle: { color: '#888', marginBottom: '25px', fontSize: '14px', lineHeight: '1.5' },
  errorBox: { background: '#fff5f5', color: '#c0392b', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
  successMsg: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
  field: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '7px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  input: { width: '100%', padding: '13px 15px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.3s' },
  submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e67e22, #d35400)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.5px' },
  continueWrap: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, marginBottom: 16 },
  continueLine: { flex: 1, height: 1, background: '#e5e7eb' },
  continueText: { fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' },
  socialRow: { display: 'flex', gap: 12 },
  socialPill: { flex: 1, height: 46, borderRadius: 999, border: '1.5px solid #d1d5db', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  socialLabel: { color: '#111827', fontSize: 14, fontWeight: 600 },
  fbIcon: { width: 22, height: 22, borderRadius: '50%', background: '#1877F2', color: '#fff', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  socialLoadingText: { marginTop: 10, fontSize: 13, color: '#666', textAlign: 'center' },
  links: { marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#555' },
  linkText: { color: '#e67e22', fontWeight: '600', textDecoration: 'none' },
  forgotLink: { fontSize: '13px', color: '#e67e22', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' },
  backLink: { color: '#64748b', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
  viewWrapper: { animation: 'fadeIn 0.4s ease' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(styleSheet);

export default CustomerLogin;