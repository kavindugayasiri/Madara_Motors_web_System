import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MyProfile = () => {
    const { customer, setCustomer } = useAuth();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    
    const [errors, setErrors] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || ''
            });
        }
    }, [customer]);

    // Validation Logic
    const validate = () => {
        let tempErrors = {};
        if (!form.name.trim()) tempErrors.name = "Full Name is required";
        const phoneRegex = /^(?:0|94|\+94)?7(0|1|2|4|5|6|7|8)\d{7}$/;
        if (form.phone && !phoneRegex.test(form.phone)) tempErrors.phone = "Invalid phone number";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await updateMyProfile(form);
            if (typeof setCustomer === 'function') setCustomer(res.data);
            setMessage({ type: 'success', text: 'Profile updated successfully! ✨' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const initial = form.name ? form.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="main-wrapper"> {/* මුළු පේජ් එකම wrap කරන්න */}
            <style>{CSS}</style>

            {/* ✅ 1. Navbar එක මෙතනට එනවා */}
            <Navbar />

            {/* Profile Content එක මැදට එනවා */}
            <div className="profile-container">
                <div className="profile-header">
                    <div className="header-icon">👤</div>
                    <h1>My Profile</h1>
                </div>

                <div className="profile-card">
                    <div className="profile-sidebar">
                        <div className="avatar-circle">{initial}</div>
                        <div className="sidebar-info">
                            <h2>{form.name || 'Customer'}</h2>
                            <p>{form.email}</p>
                        </div>
                    </div>

                    <div className="profile-form-area">
                        <form onSubmit={handleSubmit} noValidate>
                            {message.text && (
                                <div className={`alert ${message.type}`}>{message.text}</div>
                            )}

                            <div className="form-grid">
                                <div className="input-group full-width">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={errors.name ? 'input-error' : ''}
                                    />
                                    {errors.name && <span className="error-text">{errors.name}</span>}
                                </div>

                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" value={form.email} readOnly className="read-only" />
                                </div>

                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={errors.phone ? 'input-error' : ''}
                                    />
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </div>

                                <div className="input-group full-width">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        className={errors.address ? 'input-error' : ''}
                                    ></textarea>
                                    {errors.address && <span className="error-text">{errors.address}</span>}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="save-btn">
                                    {loading ? 'Saving...' : '💾 Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ✅ 2. Footer එක මෙතනට එනවා */}
            <Footer />
        </div>
    );
};
const CSS = `
.profile-container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 20px;
    font-family: 'Inter', sans-serif;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
}

.header-icon {
    font-size: 28px;
    background: #e67e22;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    color: white;
    box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
}

.profile-header h1 {
    color: #2c3e50;
    font-size: 24px;
    font-weight: 800;
}

/* Card Layout */
.profile-card {
    background: white;
    border-radius: 24px;
    display: grid;
    grid-template-columns: 280px 1fr;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    border: 1px solid #eee;
}

/* Sidebar */
.profile-sidebar {
    background: linear-gradient(180deg, #fef9f5 0%, #fdf0e3 100%);
    padding: 40px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-right: 1px solid #ffe5cc;
    gap: 12px;
}

.avatar-circle {
    width: 110px;
    height: 110px;
    background: linear-gradient(135deg, #e67e22, #d35400);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    color: white;
    font-weight: 800;
    position: relative;
    box-shadow: 0 10px 25px rgba(230, 126, 34, 0.4);
    margin-bottom: 8px;
}

.online-status {
    width: 18px;
    height: 18px;
    background: #2ecc71;
    border: 3px solid white;
    position: absolute;
    bottom: 6px;
    right: 6px;
    border-radius: 50%;
}

.sidebar-info h2 {
    font-size: 17px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
}

.sidebar-info p {
    font-size: 12px;
    color: #7f8c8d;
    margin: 4px 0 0 0;
    word-break: break-all;
}

.profile-badge {
    background: rgba(230, 126, 34, 0.12);
    color: #e67e22;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid rgba(230,126,34,0.2);
}

/* Sidebar Extra Info */
.sidebar-extra {
    width: 100%;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.extra-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #555;
    background: white;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid #eee;
    text-align: left;
}

.extra-item span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Form Area */
.profile-form-area {
    padding: 40px;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.full-width {
    grid-column: span 2;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-group label {
    font-size: 13px;
    font-weight: 700;
    color: #34495e;
}

.hint {
    font-size: 11px;
    color: #95a5a6;
    margin-top: 2px;
}

/* Input Wrapper with Icon */
.readonly-wrapper,
.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.readonly-icon,
.input-icon {
    position: absolute;
    left: 12px;
    font-size: 14px;
    z-index: 1;
}

.readonly-wrapper input,
.input-wrapper input {
    padding-left: 36px;
}

/* Inputs */
input, textarea {
    padding: 12px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 12px;
    font-size: 14px;
    transition: all 0.3s;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
}

input:focus, textarea:focus {
    border-color: #e67e22;
    outline: none;
    box-shadow: 0 0 0 4px rgba(230, 126, 34, 0.08);
}

.read-only {
    background: #f8f9fa;
    color: #95a5a6;
    cursor: not-allowed;
    border-color: #eee;
}

textarea {
    resize: vertical;
    min-height: 90px;
}

/* Actions */
.form-actions {
    margin-top: 30px;
    display: flex;
    justify-content: flex-end;
}

.save-btn {
    background: linear-gradient(135deg, #e67e22, #d35400);
    color: white;
    border: none;
    padding: 14px 35px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(230, 126, 34, 0.4);
}

.save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

/* Spinner */
.loading-text {
    display: flex;
    align-items: center;
    gap: 8px;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Alerts */
.alert {
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: 500;
}

.alert.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

/* Responsive */
@media (max-width: 768px) {
    .profile-card { 
        grid-template-columns: 1fr; 
    }
    .profile-sidebar { 
        border-right: none; 
        border-bottom: 1px solid #ffe5cc;
        padding: 30px 20px;
    }
    .form-grid { 
        grid-template-columns: 1fr; 
    }
    .full-width { 
        grid-column: span 1; 
    }
    .profile-form-area {
        padding: 25px 20px;
    }
}
.main-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #fcfcfc;
}

.profile-container {
    flex: 1; /* Footer එක හැමතිස්සෙම යටටම තල්ලු කරලා තියන්න උදව් වෙනවා */
    max-width: 1000px;
    margin: 40px auto;
    padding: 20px;
    width: 100%;
}
.error-text {
    color: #e74c3c;
    font-size: 11px;
    margin-top: 4px;
    font-weight: 500;
    display: block;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}

.alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
.alert.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
`;
export default MyProfile;