import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    setTimeout(() => navigate('/forgot-password'), 0);
  }

  // 6 individual OTP boxes
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [mounted, setMounted]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [timer, setTimer]         = useState(600);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  // Countdown
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError('');
    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split('').forEach((d, i) => { newDigits[i] = d; });
    setOtpDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otp = otpDigits.join('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setLoading(true);
    setError('');

    try {
      await verifyOtp({ email, otp });
      setSuccess(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { email, otp } });
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP code.');
      // Shake & clear
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(600);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    navigate('/forgot-password', { state: { email } });
  };

  const allFilled = otp.length === 6;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-15px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(230,126,34,0.3); }
          50%       { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(230,126,34,0); }
        }
        @keyframes successBounce {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
        @keyframes timerSpin {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 113; }
        }
        .otp-box {
          width: 52px !important;
          height: 58px !important;
          text-align: center !important;
          font-size: 24px !important;
          font-weight: 800 !important;
          border: 2.5px solid #e2e8f0 !important;
          border-radius: 14px !important;
          outline: none !important;
          transition: all 0.25s !important;
          color: #1e293b !important;
          background: #f8fafc !important;
          caret-color: #e67e22 !important;
        }
        .otp-box:focus {
          border-color: #e67e22 !important;
          background: #fff7ed !important;
          box-shadow: 0 0 0 4px rgba(230,126,34,0.15) !important;
          transform: translateY(-3px) scale(1.05) !important;
        }
        .otp-box.filled {
          border-color: #22c55e !important;
          background: #f0fdf4 !important;
          color: #15803d !important;
        }
        .otp-box.error-state {
          border-color: #ef4444 !important;
          background: #fef2f2 !important;
          animation: errorShake 0.5s ease !important;
        }
        .verify-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 30px rgba(230,126,34,0.45) !important;
        }
        .resend-btn:hover { color: #e67e22 !important; }
      `}</style>

      <Navbar />

      <div style={styles.page}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />

        {/* Floating envelope particles */}
        {['✉️','📨','📧'].map((icon, i) => (
          <div key={i} style={{
            position: 'absolute',
            top:  ['12%','70%','35%'][i],
            left: ['7%','88%','3%'][i],
            fontSize: ['26px','20px','16px'][i],
            animation: `floatBubble ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
            opacity: 0.2, pointerEvents: 'none',
          }}>{icon}</div>
        ))}

        <div style={{
          ...styles.card,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <div style={styles.topStripe} />

          {/* Progress Steps */}
          <div style={styles.stepsRow}>
            {['Email','Verify','Reset'].map((s, i) => (
              <React.Fragment key={i}>
                <div style={styles.stepItem}>
                  <div style={{
                    ...styles.stepCircle,
                    backgroundColor: i === 0 ? '#22c55e' : i === 1 ? '#e67e22' : '#e2e8f0',
                    color: i < 2 ? '#fff' : '#94a3b8',
                    transform: i === 1 ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: i === 1 ? '0 4px 12px rgba(230,126,34,0.4)' : 'none',
                  }}>
                    {i === 0 ? '✓' : i + 1}
                  </div>
                  <span style={{
                    ...styles.stepLabel,
                    color: i === 1 ? '#e67e22' : i === 0 ? '#22c55e' : '#94a3b8',
                    fontWeight: i === 1 ? '700' : '500',
                  }}>{s}</span>
                </div>
                {i < 2 && <div style={{
                  ...styles.stepLine,
                  background: i === 0
                    ? 'linear-gradient(90deg, #22c55e, #e67e22)'
                    : '#e2e8f0',
                }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Brand */}
          <div style={styles.logoArea}>
            <div style={styles.logoBox}>M</div>
            <div>
              <div style={styles.brandName}>Madara Motors</div>
              <div style={styles.portalName}>Email Verification</div>
            </div>
          </div>

          {/* Success or Icon */}
          <div style={styles.iconWrapper}>
            {success ? (
              <div style={{ animation: 'successBounce 0.5s ease', fontSize: '64px' }}>
                ✅
              </div>
            ) : (
              <div style={styles.iconRing}>
                <div style={styles.iconCircle}>
                  <span style={{ fontSize: '36px' }}>✉️</span>
                </div>
              </div>
            )}
          </div>

          <h2 style={styles.title}>
            {success ? 'Verified!' : 'Check Your Email'}
          </h2>
          <p style={styles.subtitle}>
            {success
              ? 'OTP verified successfully. Redirecting...'
              : "We've sent a secure 6-digit verification code to"}
          </p>

          {!success && (
            <div style={styles.emailBadge}>
              <span>📧</span>
              <strong>{email}</strong>
            </div>
          )}

          {error && (
            <div style={{ ...styles.errorBox, animation: 'errorShake 0.5s ease' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleVerify}>
              {/* OTP Boxes */}
              <div style={styles.otpLabel}>
                <span>🔢</span> Verification Code
              </div>
              <div style={styles.otpRow} onPaste={handlePaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`otp-box${digit ? ' filled' : ''}${error ? ' error-state' : ''}`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div style={styles.timerRow}>
                {canResend ? (
                  <button
                    type="button"
                    className="resend-btn"
                    style={styles.resendBtn}
                    onClick={handleResend}
                  >
                    🔄 Resend OTP Code
                  </button>
                ) : (
                  <span style={styles.timerText}>
                    ⏱ Resend code in{' '}
                    <strong style={{ color: timer < 15 ? '#ef4444' : '#e67e22' }}>
                      {String(Math.floor(timer / 60)).padStart(2, '0')}:
                      {String(timer % 60).padStart(2, '0')}
                    </strong>
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="verify-btn"
                style={{
                  ...styles.submitBtn,
                  opacity: (loading || !allFilled) ? 0.7 : 1,
                  cursor: (loading || !allFilled) ? 'not-allowed' : 'pointer',
                  background: allFilled
                    ? 'linear-gradient(135deg, #e67e22, #d35400)'
                    : 'linear-gradient(135deg, #94a3b8, #64748b)',
                }}
                disabled={loading || !allFilled}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ animation: 'dotBounce 1.2s infinite 0s',   fontSize: '8px' }}>●</span>
                    <span style={{ animation: 'dotBounce 1.2s infinite 0.2s', fontSize: '8px' }}>●</span>
                    <span style={{ animation: 'dotBounce 1.2s infinite 0.4s', fontSize: '8px' }}>●</span>
                    <span style={{ marginLeft: '8px' }}>Verifying...</span>
                  </span>
                ) : (
                  '✓ Verify Code'
                )}
              </button>
            </form>
          )}

          <div style={styles.linksContainer}>
            <Link to="/forgot-password" style={styles.backLink}>← Use a different email</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  page: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #fff7ed 0%, #f5f7fa 50%, #fde8d0 100%)',
    padding: '40px 20px', position: 'relative', overflow: 'hidden', minHeight: '85vh',
  },
  blob1: {
    position: 'absolute', top: '-100px', right: '-100px',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(230,126,34,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-80px', left: '-80px',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: '#fff', borderRadius: '28px',
    padding: '0 0 40px', width: '100%', maxWidth: '480px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.1), 0 8px 20px rgba(230,126,34,0.08)',
    position: 'relative', overflow: 'hidden',
  },
  topStripe: {
    height: '5px',
    background: 'linear-gradient(90deg, #22c55e, #e67e22, #22c55e)',
    backgroundSize: '200% auto',
    animation: 'shimmer 3s linear infinite',
    borderRadius: '28px 28px 0 0',
    marginBottom: '28px',
  },
  stepsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '28px', padding: '0 35px',
  },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  stepCircle: {
    width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', transition: 'all 0.3s',
  },
  stepLabel: { fontSize: '11px', transition: 'all 0.3s' },
  stepLine: { flex: 1, height: '3px', marginBottom: '22px', transition: 'all 0.3s' },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '20px', padding: '0 35px',
  },
  logoBox: {
    width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    borderRadius: '12px', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '20px',
    boxShadow: '0 4px 12px rgba(230,126,34,0.35)',
  },
  brandName: { fontWeight: '700', fontSize: '17px', color: '#1a1a2e' },
  portalName: { fontSize: '12px', color: '#94a3b8' },
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
    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    border: '3px solid rgba(59,130,246,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: '26px', fontWeight: '800', margin: '0 0 8px',
    color: '#0f172a', textAlign: 'center', padding: '0 35px',
  },
  subtitle: {
    color: '#64748b', marginBottom: '12px', fontSize: '14px',
    lineHeight: '1.6', textAlign: 'center', padding: '0 35px',
  },
  emailBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', background: '#fff7ed',
    border: '1.5px solid #fed7aa', color: '#c2410c',
    padding: '8px 20px', borderRadius: '20px',
    fontSize: '14px', marginBottom: '24px',
    margin: '0 35px 24px',
  },
  errorBox: {
    background: '#fef2f2', color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '12px 18px', borderRadius: '12px',
    marginBottom: '20px', fontSize: '14px', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '8px',
    margin: '0 35px 20px',
  },
  otpLabel: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '14px', fontWeight: '700', color: '#334155',
    marginBottom: '14px', padding: '0 35px',
  },
  otpRow: {
    display: 'flex', gap: '10px', justifyContent: 'center',
    marginBottom: '20px', padding: '0 35px',
  },
  timerRow: {
    textAlign: 'center', marginBottom: '20px', padding: '0 35px',
  },
  timerText: { fontSize: '14px', color: '#64748b' },
  resendBtn: {
    background: 'none', border: 'none',
    color: '#94a3b8', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', transition: 'color 0.3s',
  },
  submitBtn: {
    width: 'calc(100% - 70px)', padding: '16px',
    color: 'white', border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: '700',
    transition: 'all 0.3s',
    boxShadow: '0 8px 24px rgba(230,126,34,0.3)',
    margin: '0 35px',
    letterSpacing: '0.5px',
  },
  linksContainer: {
    marginTop: '24px', textAlign: 'center', padding: '0 35px',
    borderTop: '1px solid #f1f5f9', paddingTop: '20px',
  },
  backLink: {
    color: '#94a3b8', fontWeight: '600',
    textDecoration: 'none', fontSize: '14px',
    transition: 'color 0.3s',
  },
};

export default VerifyOTP;