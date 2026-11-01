import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './VerifyCode.css';

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const gmail = location.state?.gmail || location.state?.email || '';

  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef([]);


  useEffect(() => {
    if (!gmail) {
      alert("Email not found. Please login again.");
      navigate('/login', { replace: true }); 
      return;
    }

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [gmail, navigate]);


  useEffect(() => {

    window.history.pushState(null, null, window.location.href);

    const handleBackButton = (event) => {

      window.history.pushState(null, null, window.location.href);
    };


    window.addEventListener('popstate', handleBackButton);


    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const value = element.value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];

    pastedData.forEach((val, i) => {
      if (i < 6) newOtp[i] = val;
    });

    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join('');

    if (finalOtp.length < 6) {
      setError('Please enter the full 6-digit code.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {

      const response = await axios.post('http://localhost:8080/api/auth/admin-verify-otp', {
        gmail: gmail,
        otp: finalOtp
      });

      console.log("VERIFY RESPONSE:", response.data);

      const userId =
        response.data?.userId ||
        response.data?.id ||
        response.data?.user?.id;

      const role =
        response.data?.role ||
        response.data?.user?.role;

      const userEmail =
        response.data?.gmail ||
        response.data?.email ||
        response.data?.user?.gmail ||
        response.data?.user?.email ||
        gmail;

      if (!userId) {
        setError("Authorized, but User ID is missing!");
        setLoading(false);
        return;
      }

      if (!role) {
        setError("Authorized, but Role is undefined!");
        setLoading(false);
        return;
      }

      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("sessionLoginTime", new Date().toLocaleString());

      setSuccessMsg("Verification successful! Redirecting...");

      setTimeout(() => {

        if (role === 'Manager') {
          navigate('/manager-dashboard', { replace: true });
        } else if (
          role === 'Stock Keeper' ||
          role === 'Store Keeper' ||
          role === 'StoreKeeper' ||
          role === 'StockKeeper'
        ) {
          navigate('/store-dashboard', { replace: true });
        } else if (
          role === 'Cashier' ||
          role === 'SalesPerson' ||
          role === 'Sales Person'
        ) {
          navigate('/sales-dashboard', { replace: true });
        } else {
          setError(`Authorized, but unknown role: ${role}`);
          setLoading(false);
        }
      }, 800);

    } catch (err) {
      console.error("OTP Verify Error:", err);
      setError(err.response?.data?.message || 'Incorrect Code! Verification Failed.');
      triggerShake();
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccessMsg('Sending new OTP...');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/resend-otp', {
        gmail: gmail
      });

      if (response.status === 200) {
        setSuccessMsg('A new OTP has been sent to your email!');
        setOtp(new Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setSuccessMsg('');
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="verify-container">
      <div className={`verify-card ${shake ? 'shake-animation' : ''}`}>
        <div style={{ marginBottom: '20px' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M8 11h8"/>
            <path d="M12 15V7"/>
          </svg>
        </div>

        <h2 className="verify-title">Security Check</h2>
        <p className="verify-subtitle">
          Enter the security code sent to <br />
          <span className="highlight-email">{gmail}</span>
        </p>

        {error && (
          <div className="error-msg" style={{ color: '#ff4d4d', fontWeight: 'bold', marginBottom: '15px' }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="success-msg" style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: '15px' }}>
            ✔️ {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="otp-input-group" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="otp-box"
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button type="submit" className="verify-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Identity'}
          </button>
        </form>

        <p className="timer-text">
          Didn't receive code?
          <span
            className="resend-link"
            style={{ color: '#ff6b00', cursor: 'pointer', marginLeft: '5px' }}
            onClick={handleResendOTP}
          >
            Resend
          </span>
        </p>

        <p
          style={{ marginTop: '20px', cursor: 'pointer', color: '#666', fontSize: '0.8rem' }}
          onClick={() => navigate('/login', { replace: true })} 
        >
          Cancel Authentication
        </p>
      </div>
    </div>
  );
};

export default VerifyCode;