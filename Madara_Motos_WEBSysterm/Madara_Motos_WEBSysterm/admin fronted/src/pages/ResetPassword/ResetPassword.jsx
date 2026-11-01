import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import axios from "axios";
import "./ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // URL එකෙන් Token එක ගන්නවා
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    // 1. Validation Checks
    if (!password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!token) {
      setMessage("Error: Invalid or missing token. Please request a new reset link.");
      return;
    }

    setLoading(true); 

    try {
      // 🟢 මෙන්න මෙතන API ලින්ක් එක '/admin-reset-password' කියලා වෙනස් කළා!
      await axios.post("http://localhost:8080/api/auth/admin-reset-password", null, {
        params: {
          token: token,
          newPassword: password
        }
      });

      alert("✅ Password reset successful! Please login with your new password.");
      navigate("/login"); 

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data || "Token expired or invalid.";
      setMessage("❌ Error: " + errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        
        <div className="reset-header">
          <button className="back-arrow" onClick={() => navigate("/login")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18L9 12L15 6" />
            </svg>
          </button>
          <h3>Create new password</h3>
        </div>

        <div className="reset-image">
          <img 
            src="https://cdni.iconscout.com/illustration/premium/thumb/reset-password-2975817-2476893.png" 
            alt="Reset Password" 
            className="reset-img-style"
          />
        </div>

        <div className="reset-text">
          <p>New password must be different from last password</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="New Password" 
              className="reset-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              placeholder="Confirm Password" 
              className="reset-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save password"}
          </button>

          {message && <p style={{ color: "red", textAlign: "center", marginTop: "10px", fontWeight: "bold" }}>{message}</p>}
          
        </form>

      </div>
    </div>
  );
};

export default ResetPassword;