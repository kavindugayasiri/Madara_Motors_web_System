import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setLoading(true);

    if (!email) {
      alert("Please enter your email!");
      setLoading(false);
      return;
    }

    try {

      const response = await axios.post("http://localhost:8080/api/auth/admin-forgot-password", null, {
        params: {
          email: email
        }
      });


      setMessage("✅ " + (response.data.message || "Reset link sent! Please check your inbox."));
      
    } catch (error) {
      console.error(error);
      


      const errorMsg = error.response?.data?.message || error.response?.data || "User not found or server issue.";
      setMessage("❌ Error: " + errorMsg);

    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        
        <div className="fp-header">
          <button className="back-btn" onClick={() => navigate('/login')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18L9 12L15 6" />
            </svg>
          </button>
          <h2 className="fp-title">Forgot password</h2>
        </div>

        <div className="fp-image-container">
            <img 
                src="https://cdni.iconscout.com/illustration/premium/thumb/forgot-password-4571933-3805751.png" 
                alt="Forgot Password" 
                className="fp-image" 
            />
        </div>

        <p className="fp-desc">
          Enter your email address to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field"
              placeholder="admin@autolanka.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="fp-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          
          {message && (
            <p style={{ 
                textAlign: "center", 
                marginTop: "15px", 
                color: message.startsWith("✅") ? "#2e7d32" : "#d32f2f",
                fontWeight: "bold",
                fontSize: "14px",
                background: message.startsWith("✅") ? "#e8f5e9" : "#ffebee",
                padding: "10px",
                borderRadius: "8px"
            }}>
                {message}
            </p>
          )}

          <div className="fp-footer">
            <span className="try-link" onClick={() => navigate('/login')}>
                Back to Login
            </span>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ForgotPassword;