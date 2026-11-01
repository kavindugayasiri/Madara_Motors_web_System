import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./OtpVerification.css";

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = location.state?.gmail || location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(40);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userEmail) {
      alert("Email not found. Please login again.");
      navigate("/login");
      return;
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      alert("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {

      const response = await axios.post("http://localhost:8080/api/auth/admin-verify-otp", {
        gmail: userEmail,
        otp: code
      });

      console.log("OTP VERIFY RESPONSE:", response.data);

      const message = response.data?.message;
      const finalUserId =
        response.data?.userId ||
        response.data?.id ||
        response.data?.user?.id;

      const role =
        response.data?.role ||
        response.data?.user?.role;

      const email =
        response.data?.gmail ||
        response.data?.email ||
        response.data?.user?.gmail ||
        response.data?.user?.email ||
        userEmail;

      if (!finalUserId) {
        alert("Backend Error: User ID is missing!");
        return;
      }

      if (!role) {
        alert("Authorized, but Role is undefined!");
        return;
      }

      if (message === "VERIFIED" || message === "AUTHORIZED" || role) {
        localStorage.setItem("userId", finalUserId);
        localStorage.setItem("role", role);
        localStorage.setItem("email", email);
        localStorage.setItem("sessionLoginTime", new Date().toLocaleString());

        if (role === "Manager") {
          navigate("/manager-dashboard");
        } else if (role === "Stock Keeper" || role === "Store Keeper" || role === "StockKeeper" || role === "StoreKeeper") {
          navigate("/store-dashboard");
        } else if (role === "Cashier" || role === "SalesPerson" || role === "Sales Person") {
          navigate("/sales-dashboard");
        } else {
          alert(`Authorized, but unknown role: ${role}`);
        }
      } else {
        alert("Verification failed!");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      alert(err.response?.data?.message || "Invalid Security Code!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/auth/resend-otp", {
        gmail: userEmail
      });

      if (response.data.message === "OTP_RESENT_SUCCESSFULLY" || response.data.message === "OTP_SENT") {
        setTimer(40);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        alert("A new verification code has been sent to your email!");
      } else {
        alert("OTP resend request sent.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert("Failed to resend code. Please try again later.");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <button className="back-arrow" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18L9 12L15 6" />
            </svg>
          </button>
          <h3>Verification code</h3>
        </div>

        <div className="otp-text-area">
          <p>Please enter the 6 digit code sent to:</p>
          <span className="email-highlight">{userEmail}</span>
        </div>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="otp-field"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button className="otp-verify-btn" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify code"}
        </button>

        <div className="otp-footer">
          <span className="timer">00:{timer < 10 ? `0${timer}` : timer}</span>
          <button
            className={`resend-btn ${canResend ? "active" : ""}`}
            onClick={handleResend}
            disabled={!canResend}
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;