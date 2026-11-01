import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);

  
    window.history.pushState(null, null, window.location.href);

    const handleBackButton = () => {
     
      navigate('/customer/login', { replace: true });
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

   
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

   
    const COOLDOWN_MINUTES = 10;
    const COOLDOWN_TIME_MS = COOLDOWN_MINUTES * 60 * 1000; 
    const lastSentTime = localStorage.getItem(`otp_time_${email}`); 

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
      await sendOtp({ email });
      localStorage.setItem(`otp_time_${email}`, Date.now().toString());

     
      navigate('/verify-otp', { state: { email }, replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Error sending OTP. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-18px) rotate(3deg); }
          66%       { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(230,126,34,0.4); }
          50%       { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(230,126,34,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
        @keyframes bgMove {
          0%   { transform: scale(1) translate(0, 0); }
          50%  { transform: scale(1.1) translate(-2%, -2%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .fp-input:focus {
          border-color: #e67e22 !important;
          box-shadow: 0 0 0 4px rgba(230,126,34,0.12) !important;
          background: #fff !important;
        }
        .fp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(230,126,34,0.45) !important;
        }
        .fp-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .back-link:hover {
          color: #e67e22 !important;
          letter-spacing: 0.5px;
        }
      `}</style>

      <Navbar />

      <div style={styles.page}>

        {/* ── Animated Background Blobs ── */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.blob3} />

        {/* ── Floating Gear Icons ── */}
        {['⚙️','🔩','🔧'].map((icon, i) => (
          <div key={i} style={{
            ...styles.floatingIcon,
            top:  ['15%','65%','40%'][i],
            left: ['8%','85%','5%'][i],
            fontSize: ['28px','22px','18px'][i],
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${4 + i}s`,
          }}>
            {icon}
          </div>
        ))}

        {/* ── Step Progress ── */}
        <div style={{
          ...styles.card,
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>

          <div style={styles.topStripe} />

          <div style={styles.stepsRow}>
            {['Email','Verify','Reset'].map((s, i) => (
              <React.Fragment key={i}>
                <div style={styles.stepItem}>
                  <div style={{
                    ...styles.stepCircle,
                    backgroundColor: i === 0 ? '#e67e22' : '#e2e8f0',
                    color:           i === 0 ? '#fff'    : '#94a3b8',
                    transform:       i === 0 ? 'scale(1.15)' : 'scale(1)',
                    boxShadow:       i === 0 ? '0 4px 12px rgba(230,126,34,0.4)' : 'none',
                  }}>
                    {i === 0 ? '✉' : i + 1}
                  </div>
                  <span style={{
                    ...styles.stepLabel,
                    color:      i === 0 ? '#e67e22' : '#94a3b8',
                    fontWeight: i === 0 ? '700' : '500',
                  }}>{s}</span>
                </div>
                {i < 2 && <div style={{
                  ...styles.stepLine,
                  backgroundColor: i === 0 ? '#e67e22' : '#e2e8f0',
                  opacity: i === 0 ? 0.3 : 1,
                }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={styles.logoArea}>
            <div style={styles.logoBox}>
              <span style={{ fontSize: '22px' }}>M</span>
            </div>
            <div>
              <div style={styles.brandName}>Madara Motors</div>
              <div style={styles.portalName}>Account Recovery</div>
            </div>
          </div>

          <div style={styles.iconWrapper}>
            <div style={styles.iconRing}>
              <div style={styles.iconCircle}>
                <span style={{ fontSize: '36px' }}>🔒</span>
              </div>
            </div>
          </div>

          <h2 style={styles.title}>Forgot Password?</h2>
          <p style={styles.subtitle}>
            No worries! Enter your registered email and we'll send you a secure OTP code instantly.
          </p>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendOTP}>
            <div style={styles.field}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📧</span>
                Registered Email Address
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focused ? '#e67e22' : error ? '#ef4444' : '#e2e8f0',
                boxShadow:   focused ? '0 0 0 4px rgba(230,126,34,0.12)' : 'none',
              }}>
                <input
                  type="email"
                  className="fp-input"
                  style={styles.input}
                  placeholder="e.g. your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  autoFocus
                />
                {email.includes('@') && email.includes('.') && (
                  <span style={styles.validCheck}>✓</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="fp-btn"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.85 : 1,
                cursor:  loading ? 'not-allowed' : 'pointer',
              }}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.dot1}>●</span>
                  <span style={styles.dot2}>●</span>
                  <span style={styles.dot3}>●</span>
                  <span style={{ marginLeft: '10px' }}>Sending OTP...</span>
                </span>
              ) : (
                <span>Send OTP Code &rarr;</span>
              )}
            </button>
          </form>

          <div style={styles.securityBadge}>
            <span>🔐</span>
            <span>Secured with 256-bit encryption</span>
          </div>

          <div style={styles.links}>
            {/* 🟢 3. මෙතනත් replace දැම්මා Back යද්දි History එක තියාගන්නෙ නැති වෙන්න */}
            <Link to="/customer/login" className="back-link" style={styles.backLink} replace>
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  page: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fef3e2 0%, #f5f7fa 50%, #fde8d0 100%)',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '85vh',
  },

  // Blobs
  blob1: {
    position: 'absolute', top: '-80px', right: '-80px',
    width: '320px', height: '320px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(230,126,34,0.15) 0%, transparent 70%)',
    animation: 'bgMove 8s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-60px', left: '-60px',
    width: '280px', height: '280px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(230,126,34,0.1) 0%, transparent 70%)',
    animation: 'bgMove 10s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute', top: '40%', left: '50%',
    width: '400px', height: '400px', borderRadius: '50%',
    transform: 'translate(-50%,-50%)',
    background: 'radial-gradient(circle, rgba(253,232,208,0.4) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  // Floating icons
  floatingIcon: {
    position: 'absolute',
    animation: 'floatBubble 5s ease-in-out infinite',
    pointerEvents: 'none',
    userSelect: 'none',
    opacity: 0.25,
  },

  // Card
  card: {
    background: '#ffffff',
    borderRadius: '28px',
    padding: '0 0 40px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.1), 0 8px 20px rgba(230,126,34,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  topStripe: {
    height: '5px',
    background: 'linear-gradient(90deg, #e67e22, #f39c12, #e67e22)',
    backgroundSize: '200% auto',
    animation: 'shimmer 3s linear infinite',
    borderRadius: '28px 28px 0 0',
    marginBottom: '28px',
  },

  // Steps
  stepsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    marginBottom: '28px',
    padding: '0 35px',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  stepCircle: {
    width: '36px', height: '36px',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700',
    transition: 'all 0.3s',
  },
  stepLabel: {
    fontSize: '11px',
    transition: 'all 0.3s',
  },
  stepLine: {
    flex: 1,
    height: '3px',
    marginBottom: '22px',
    transition: 'all 0.3s',
  },

  // Brand
  logoArea: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '20px', padding: '0 35px',
  },
  logoBox: {
    width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    borderRadius: '12px',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 'bold', fontSize: '20px',
    boxShadow: '0 4px 12px rgba(230,126,34,0.35)',
  },
  brandName: { fontWeight: '700', fontSize: '17px', color: '#1a1a2e' },
  portalName: { fontSize: '12px', color: '#94a3b8' },

  // Icon
  iconWrapper: {
    display: 'flex', justifyContent: 'center',
    marginBottom: '20px', padding: '0 35px',
  },
  iconRing: {
    width: '96px', height: '96px', borderRadius: '50%',
    background: 'rgba(230,126,34,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'pulse 2.5s ease-in-out infinite',
  },
  iconCircle: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #fff7ed, #fde8d0)',
    border: '3px solid rgba(230,126,34,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // Typography
  title: {
    fontSize: '26px', fontWeight: '800',
    margin: '0 0 8px', color: '#0f172a',
    textAlign: 'center', padding: '0 35px',
  },
  subtitle: {
    color: '#64748b', marginBottom: '28px', fontSize: '14px',
    lineHeight: '1.6', textAlign: 'center', padding: '0 35px',
  },

  // Error
  errorBox: {
    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '13px 18px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '10px',
    animation: 'errorShake 0.5s ease',
    margin: '0 35px 20px',
  },
  errorIcon: { fontSize: '18px', flexShrink: 0 },

  // Input
  field: { marginBottom: '20px', padding: '0 35px' },
  label: {
    display: 'flex', alignItems: 'center', gap: '6px',
    marginBottom: '9px', fontWeight: '700',
    fontSize: '14px', color: '#334155',
  },
  labelIcon: { fontSize: '16px' },
  inputWrapper: {
    display: 'flex', alignItems: 'center',
    border: '2px solid #e2e8f0',
    borderRadius: '14px', overflow: 'hidden',
    transition: 'all 0.3s',
    background: '#f8fafc',
  },
  input: {
    flex: 1, padding: '14px 16px',
    border: 'none', outline: 'none',
    fontSize: '15px', color: '#1e293b',
    background: 'transparent',
  },
  validCheck: {
    paddingRight: '14px', color: '#22c55e',
    fontSize: '18px', fontWeight: '900',
  },

  // Button
  submitBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    color: 'white', border: 'none',
    borderRadius: '14px', fontSize: '16px',
    fontWeight: '700', transition: 'all 0.3s',
    boxShadow: '0 8px 24px rgba(230,126,34,0.35)',
    margin: '0 35px', width: 'calc(100% - 70px)',
    letterSpacing: '0.5px',
  },

  // Loading dots
  loadingRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dot1: { animation: 'dotBounce 1.2s infinite 0s',   fontSize: '8px' },
  dot2: { animation: 'dotBounce 1.2s infinite 0.2s', fontSize: '8px', margin: '0 4px' },
  dot3: { animation: 'dotBounce 1.2s infinite 0.4s', fontSize: '8px' },

  // Security Badge
  securityBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', fontSize: '12px', color: '#94a3b8',
    margin: '18px 35px 0',
    padding: '10px', background: '#f8fafc',
    borderRadius: '10px', border: '1px solid #e2e8f0',
  },

  links: { marginTop: '20px', textAlign: 'center', padding: '0 35px' },
  backLink: {
    color: '#64748b', fontWeight: '600',
    textDecoration: 'none', fontSize: '14px',
    transition: 'all 0.3s',
  },
};

export default ForgotPassword;