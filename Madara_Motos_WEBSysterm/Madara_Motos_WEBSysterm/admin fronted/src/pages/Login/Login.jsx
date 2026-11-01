import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ gmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const [isSuspended, setIsSuspended] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [lockedRole, setLockedRole] = useState(''); 

  useEffect(() => {
    setFormData({ gmail: '', password: '' });
    setError('');
  }, []); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSuspended(false);
    setRequestStatus(null);
    setLockedRole('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setIsSuspended(false);
    setRequestStatus(null);
    setLockedRole('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        gmail: formData.gmail,
        password: formData.password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.message === "OTP_SENT") {
        navigate('/verify-code', { state: { gmail: formData.gmail } });
      }

    } catch (err) {
      console.error("Login Error:", err);
      setFormData({ ...formData, password: '' }); 

      if (err.response && err.response.data) {
        const msg = err.response.data.message;
        

        const role = err.response.data.role; 
        if (role) {
            setLockedRole(role);
        }

        if (msg === "ACCOUNT_SUSPENDED") {
          setError("Your account is temporarily suspended.");
          setIsSuspended(true); 
        } 
        else if (msg === "ACCOUNT_LOCKED") {
          setError("This account is currently locked due to multiple failed attempts.");
          setIsSuspended(true); 
        } 
        else if (msg === "ACCOUNT_LOCKED_NOW") {
          setError("Too many failed attempts! Your account has been locked.");
          setIsSuspended(true); 
        } 
        else if (msg === "INVALID_CREDENTIALS") {
          const remaining = err.response.data.remainingAttempts;
          if (remaining !== undefined) {
             setError(`Invalid Password! You have ${remaining} attempts left.`);
          } else {
             setError("Invalid Email or Password");
          }
        } 
        else {
          setError(err.response.data.error || "Invalid Email or Password");
        }

      } else {
        setError("Server Connection Failed. Please check the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestActivation = async () => {
    try {
        const res = await axios.post('http://localhost:8080/api/notifications/request-activation', { email: formData.gmail });
        setRequestStatus({ type: 'success', text: res.data.message });
        setIsSuspended(false); 
    } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to send request.";
        setRequestStatus({ type: 'error', text: errorMessage });
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      <div className="login-card">
        <div className="logo-wrapper">
          <div className="logo-box">V</div>
        </div>
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">
          Please enter your credentials to access the Staff Portal.
        </p>

        {error && (
          <div className="error-box" style={{
            color: '#ff4d4d', 
            textAlign: 'center', 
            fontSize: '14px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {requestStatus && (
          <div style={{
            color: requestStatus.type === 'success' ? '#15803d' : '#b91c1c',
            textAlign: 'center',
            fontSize: '13px',
            backgroundColor: requestStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${requestStatus.type === 'success' ? '#86efac' : '#fca5a5'}`,
            fontWeight: 'bold'
          }}>
            {requestStatus.text}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="login-input-group">
            <span className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b9bb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input 
              type="email" 
              name="gmail" 
              placeholder="Email Address" 
              value={formData.gmail} 
              onChange={handleChange}
              autoComplete="new-password"
              required 
            />
          </div>

          <div className="login-input-group">
            <span className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b9bb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange}
              autoComplete="new-password"
              required 
            />
          </div>

          <div className="forgot-password-link">
            <span onClick={() => navigate('/forgot-password')} style={{cursor: 'pointer'}}>Forgot Password?</span>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "CHECKING..." : "LOGIN & VERIFY"} 
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            )}
          </button>
        </form>

        {isSuspended && !requestStatus && (
          lockedRole === 'Manager' ? (
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                  width: '100%',
                  marginTop: '15px',
                  padding: '12px',
                  background: '#fff7ed', 
                  border: '1px solid #fcd34d',
                  color: '#d97706',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.2s'
              }}
            >
              Account Locked. Unlock via Forgot Password
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestActivation}
              style={{
                  width: '100%',
                  marginTop: '15px',
                  padding: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#ef4444',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.2s'
              }}
            >
              Request Reactivation from Manager
            </button>
          )
        )}

        <div className="divider"></div>
        <p className="not-staff">Not a staff member?</p>
        <button className="back-website-btn" onClick={() => navigate('/')}>
            Back to Website
        </button>
      </div>
    </div>
  );
};

export default Login;