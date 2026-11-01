import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ResetPassword = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email;
  const otp       = location.state?.otp;

  if (!email || !otp) {
    setTimeout(() => navigate('/forgot-password'), 0);
  }

  const [form, setForm]           = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [mounted, setMounted]     = useState(false);
  const [showPass, setShowPass]   = useState({ new: false, confirm: false });
  const [strength, setStrength]   = useState(0);
  const [focused, setFocused]     = useState({ new: false, confirm: false });

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  // Password strength calculator
  const calcStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 6)  s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
    if (field === 'newPassword') setStrength(calcStrength(value));
  };

  const strengthInfo = [
    { label: 'Too Weak',  color: '#ef4444', width: '20%'  },
    { label: 'Weak',      color: '#f97316', width: '40%'  },
    { label: 'Fair',      color: '#eab308', width: '60%'  },
    { label: 'Good',      color: '#22c55e', width: '80%'  },
    { label: 'Strong',    color: '#15803d', width: '100%' },
  ];
  const currentStrength = strength > 0 ? strengthInfo[Math.min(strength - 1, 4)] : null;

  const passwordsMatch = form.newPassword && form.confirmPassword
    && form.newPassword === form.confirmPassword;

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setLoading(false);
      return setError('Passwords do not match!');
    }
    if (form.newPassword.length < 6) {
      setLoading(false);
      return setError('Password must be at least 6 characters.');
    }

    try {
      await resetPassword({ email, otp, newPassword: form.newPassword });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/customer/login'), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please try again.');
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
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
          50%       { box-shadow: 0 0 0 14px rgba(16,185,129,0); }
        }
        @keyframes successPop {
          0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
          60%  { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes confetti {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes strengthFill {
          from { width: 0; }
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-15px); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
        .rp-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16,185,129,0.12) !important;
          background: #f0fdf4 !important;
        }
        .rp-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 30px rgba(16,185,129,0.4) !important;
        }
      `}</style>

      <Navbar />

      <div style={styles.page}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />

        {/* Floating lock icons */}
        {['🔐','🛡️','✨'].map((icon, i) => (
          <div key={i} style={{
            position: 'absolute',
            top:  ['10%','68%','38%'][i],
            left: ['6%','87%','4%'][i],
            fontSize: ['26px','20px','18px'][i],
            animation: `floatBubble ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 1.3}s`,
            opacity: 0.2, pointerEvents: 'none',
          }}>{icon}</div>
        ))}

        <div style={{
          ...styles.card,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>

          {/* Top stripe — green theme */}
          <div style={{
            ...styles.topStripe,
            background: 'linear-gradient(90deg, #10b981, #22c55e, #10b981)',
            backgroundSize: '200% auto',
            animation: 'shimmer 3s linear infinite',
          }} />

          {/* Progress Steps */}
          <div style={styles.stepsRow}>
            {['Email','Verify','Reset'].map((s, i) => (
              <React.Fragment key={i}>
                <div style={styles.stepItem}>
                  <div style={{
                    ...styles.stepCircle,
                    backgroundColor: i < 2 ? '#22c55e' : '#10b981',
                    color: '#fff',
                    transform: i === 2 ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: i === 2 ? '0 4px 12px rgba(16,185,129,0.4)' : 'none',
                  }}>✓</div>
                  <span style={{
                    ...styles.stepLabel,
                    color: i === 2 ? '#10b981' : '#22c55e',
                    fontWeight: i === 2 ? '700' : '500',
                  }}>{s}</span>
                </div>
                {i < 2 && <div style={{
                  ...styles.stepLine,
                  background: 'linear-gradient(90deg, #22c55e, #10b981)',
                }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Brand */}
          <div style={styles.logoArea}>
            <div style={{
              ...styles.logoBox,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
            }}>M</div>
            <div>
              <div style={styles.brandName}>Madara Motors</div>
              <div style={styles.portalName}>Create New Password</div>
            </div>
          </div>

          {/* Success or Icon */}
          <div style={styles.iconWrapper}>
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '72px', animation: 'successPop 0.6s ease' }}>🎉</div>
                <div style={styles.confettiRow}>
                  {['🟠','🟢','🔵','🟡','🔴'].map((c, i) => (
                    <span key={i} style={{
                      animation: `confetti 1s ease ${i * 0.1}s forwards`,
                      display: 'inline-block', fontSize: '12px',
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                ...styles.iconRing,
                background: 'rgba(16,185,129,0.08)',
                animation: 'pulse 2.5s ease-in-out infinite',
              }}>
                <div style={{
                  ...styles.iconCircle,
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '3px solid rgba(16,185,129,0.3)',
                }}>
                  <span style={{ fontSize: '36px' }}>🔐</span>
                </div>
              </div>
            )}
          </div>

          <h2 style={styles.title}>
            {success ? 'Password Reset!' : 'Create New Password'}
          </h2>
          <p style={styles.subtitle}>
            {success
              ? 'Your password has been reset successfully. Redirecting to login...'
              : 'Your new password must be different from previously used passwords.'}
          </p>

          {!success && (
            <div style={styles.emailBadge}>
              <span>👤</span>
              <strong>{email}</strong>
            </div>
          )}

          {error && (
            <div style={{ ...styles.errorBox, animation: 'errorShake 0.5s ease' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={styles.successBox}>
              ✅ {success} Redirecting in 3 seconds...
            </div>
          )}

          {!success && (
            <form onSubmit={handleReset}>

              {/* New Password */}
              <div style={styles.field}>
                <label style={styles.label}>
                  <span>🔒</span> New Password
                </label>
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: focused.new ? '#10b981' : '#e2e8f0',
                  boxShadow: focused.new ? '0 0 0 4px rgba(16,185,129,0.12)' : 'none',
                }}>
                  <input
                    type={showPass.new ? 'text' : 'password'}
                    className="rp-input"
                    style={styles.input}
                    placeholder="At least 6 characters"
                    value={form.newPassword}
                    onChange={e => handleChange('newPassword', e.target.value)}
                    onFocus={() => setFocused(f => ({ ...f, new: true }))}
                    onBlur={() => setFocused(f => ({ ...f, new: false }))}
                    required
                    autoFocus
                    disabled={!!success}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPass(p => ({ ...p, new: !p.new }))}
                  >
                    {showPass.new ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Strength Bar */}
                {form.newPassword && (
                  <div style={styles.strengthContainer}>
                    <div style={styles.strengthTrack}>
                      <div style={{
                        ...styles.strengthFill,
                        width: currentStrength?.width || '0%',
                        backgroundColor: currentStrength?.color || '#e2e8f0',
                        animation: 'strengthFill 0.4s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', color: currentStrength?.color, fontWeight: '700' }}>
                      {currentStrength?.label}
                    </span>
                  </div>
                )}

                {/* Password Requirements */}
                {form.newPassword && (
                  <div style={styles.requirements}>
                    {[
                      { check: form.newPassword.length >= 6,       label: 'At least 6 characters' },
                      { check: /[A-Z]/.test(form.newPassword),     label: 'Uppercase letter'      },
                      { check: /[0-9]/.test(form.newPassword),     label: 'Number'                },
                      { check: /[^A-Za-z0-9]/.test(form.newPassword), label: 'Special character'  },
                    ].map((req, i) => (
                      <div key={i} style={{
                        ...styles.reqItem,
                        color: req.check ? '#15803d' : '#94a3b8',
                      }}>
                        <span>{req.check ? '✓' : '○'}</span>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={styles.field}>
                <label style={styles.label}>
                  <span>🔑</span> Confirm New Password
                </label>
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: form.confirmPassword
                    ? (passwordsMatch ? '#22c55e' : '#ef4444')
                    : focused.confirm ? '#10b981' : '#e2e8f0',
                  boxShadow: focused.confirm ? '0 0 0 4px rgba(16,185,129,0.12)' : 'none',
                }}>
                  <input
                    type={showPass.confirm ? 'text' : 'password'}
                    className="rp-input"
                    style={styles.input}
                    placeholder="Repeat new password"
                    value={form.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    onFocus={() => setFocused(f => ({ ...f, confirm: true }))}
                    onBlur={() => setFocused(f => ({ ...f, confirm: false }))}
                    required
                    disabled={!!success}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                  >
                    {showPass.confirm ? '🙈' : '👁️'}
                  </button>
                  {form.confirmPassword && (
                    <span style={{ paddingRight: '12px', fontSize: '18px' }}>
                      {passwordsMatch ? '✅' : '❌'}
                    </span>
                  )}
                </div>
                {form.confirmPassword && !passwordsMatch && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0', fontWeight: '600' }}>
                    Passwords do not match
                  </p>
                )}
                {passwordsMatch && (
                  <p style={{ color: '#15803d', fontSize: '12px', margin: '6px 0 0', fontWeight: '600' }}>
                    ✓ Passwords match!
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="rp-btn"
                style={{
                  ...styles.submitBtn,
                  opacity: (loading || !passwordsMatch) ? 0.7 : 1,
                  cursor: (loading || !passwordsMatch) ? 'not-allowed' : 'pointer',
                  background: passwordsMatch
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #94a3b8, #64748b)',
                }}
                disabled={loading || !passwordsMatch}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ animation: 'dotBounce 1.2s infinite 0s',   fontSize: '8px' }}>●</span>
                    <span style={{ animation: 'dotBounce 1.2s infinite 0.2s', fontSize: '8px' }}>●</span>
                    <span style={{ animation: 'dotBounce 1.2s infinite 0.4s', fontSize: '8px' }}>●</span>
                    <span style={{ marginLeft: '8px' }}>Resetting Password...</span>
                  </span>
                ) : (
                  '🔐 Save New Password'
                )}
              </button>
            </form>
          )}

          <div style={styles.linksContainer}>
            <Link to="/customer/login" style={styles.backLink}>← Back to Login</Link>
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
    background: 'linear-gradient(135deg, #f0fdf4 0%, #f5f7fa 50%, #dcfce7 100%)',
    padding: '40px 20px', position: 'relative', overflow: 'hidden', minHeight: '85vh',
  },
  blob1: {
    position: 'absolute', top: '-100px', right: '-100px',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-80px', left: '-80px',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: '#fff', borderRadius: '28px',
    padding: '0 0 40px', width: '100%', maxWidth: '480px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.1), 0 8px 20px rgba(16,185,129,0.08)',
    position: 'relative', overflow: 'hidden',
  },
  topStripe: {
    height: '5px', borderRadius: '28px 28px 0 0', marginBottom: '28px',
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
  stepLine: { flex: 1, height: '3px', marginBottom: '22px' },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '20px', padding: '0 35px',
  },
  logoBox: {
    width: '44px', height: '44px', borderRadius: '12px',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 'bold', fontSize: '20px',
  },
  brandName: { fontWeight: '700', fontSize: '17px', color: '#1a1a2e' },
  portalName: { fontSize: '12px', color: '#94a3b8' },
  iconWrapper: {
    display: 'flex', justifyContent: 'center',
    marginBottom: '20px', padding: '0 35px',
  },
  iconRing: {
    width: '96px', height: '96px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  iconCircle: {
    width: '72px', height: '72px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  confettiRow: { display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '8px' },
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
    gap: '8px', background: '#f0fdf4',
    border: '1.5px solid #bbf7d0', color: '#15803d',
    padding: '8px 20px', borderRadius: '20px',
    fontSize: '14px', margin: '0 35px 24px',
  },
  errorBox: {
    background: '#fef2f2', color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '12px 18px', borderRadius: '12px',
    fontSize: '14px', fontWeight: '600',
    margin: '0 35px 20px',
  },
  successBox: {
    background: '#f0fdf4', color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '12px 18px', borderRadius: '12px',
    fontSize: '14px', fontWeight: '600',
    margin: '0 35px 20px',
  },
  field: { marginBottom: '20px', padding: '0 35px' },
  label: {
    display: 'flex', alignItems: 'center', gap: '6px',
    marginBottom: '9px', fontWeight: '700',
    fontSize: '14px', color: '#334155',
  },
  inputWrapper: {
    display: 'flex', alignItems: 'center',
    border: '2px solid #e2e8f0', borderRadius: '14px',
    overflow: 'hidden', transition: 'all 0.3s',
    background: '#f8fafc',
  },
  input: {
    flex: 1, padding: '14px 16px',
    border: 'none', outline: 'none',
    fontSize: '15px', color: '#1e293b',
    background: 'transparent',
  },
  eyeBtn: {
    padding: '0 12px', background: 'transparent',
    border: 'none', cursor: 'pointer', fontSize: '18px',
    flexShrink: 0,
  },
  strengthContainer: {
    display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px',
  },
  strengthTrack: {
    flex: 1, height: '6px', background: '#e2e8f0',
    borderRadius: '999px', overflow: 'hidden',
  },
  strengthFill: {
    height: '100%', borderRadius: '999px',
    transition: 'width 0.4s ease, background-color 0.4s ease',
  },
  requirements: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '6px', marginTop: '10px',
  },
  reqItem: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', fontWeight: '600', transition: 'color 0.3s',
  },
  submitBtn: {
    width: 'calc(100% - 70px)', padding: '16px',
    color: 'white', border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: '700',
    transition: 'all 0.3s',
    boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
    margin: '0 35px',
    letterSpacing: '0.5px',
  },
  linksContainer: {
    marginTop: '24px', textAlign: 'center',
    padding: '20px 35px 0', borderTop: '1px solid #f1f5f9',
  },
  backLink: {
    color: '#94a3b8', fontWeight: '600',
    textDecoration: 'none', fontSize: '14px',
    transition: 'color 0.3s',
  },
};

export default ResetPassword;