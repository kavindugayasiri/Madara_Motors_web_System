import React, { useState, useEffect } from 'react';
import { getMyOrders, cancelOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MyOrders = () => {
    const [orders, setOrders]               = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(null);
    const { customer } = useAuth();

    useEffect(() => {
        if (customer?.email) fetchOrders();
        else setLoading(false);
    }, [customer]);

    const fetchOrders = async () => {
        setLoading(true); setError(null);
        try {
            const res = await getMyOrders(customer.email);
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setError("Could not load orders. Please try again.");
            setOrders([]);
        } finally { setLoading(false); }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        setCancelLoading(orderId);
        try {
            await cancelOrder(orderId);
            alert("Order cancelled successfully.");
            fetchOrders();
        } catch {
            alert("Could not cancel. Order may already be processed.");
        } finally { setCancelLoading(null); }
    };

    const canCancel = (orderDate) => {
        if (!orderDate) return false;
        return (new Date() - new Date(orderDate)) / 3600000 < 24;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-LK', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch { return dateStr; }
    };

    const formatPrice = (price) => {
        const val = Number(price || 0);
        return `Rs. ${val.toLocaleString('en-LK', {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
        })}`;
    };

 const getStatusInfo = (status) => {
        const s = status?.toUpperCase();
        if (s === 'VERIFIED')   return { cls: 'confirmed',  label: 'Verified',   icon: '✓' };
        if (s === 'COMPLETED')  return { cls: 'completed',  label: 'Completed',  icon: '🏁' };
        if (s === 'PICKED UP')  return { cls: 'completed',  label: 'Picked Up',  icon: '✅' };
        if (s === 'CANCELLED')  return { cls: 'cancelled',  label: 'Cancelled',  icon: '✕' };
        if (s === 'PROCESSING') return { cls: 'processing', label: 'Processing', icon: '⚙' };
        if (s === 'READY')      return { cls: 'ready',      label: 'Ready',      icon: '📦' };
        return { cls: 'pending', label: 'Pending', icon: '⏳' };
    };

   const getOrderSteps = (status, orderDate, updatedAt) => {
        const s = status?.toUpperCase() || 'PENDING';
        
        // Formatter helper for timeline times
        const formatTimelineTime = (dateString) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleString('en-LK', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });
        };

        const placedTime = formatTimelineTime(orderDate) || 'Just now';
        
   
        const updatedTime = formatTimelineTime(updatedAt) || formatTimelineTime(orderDate) || 'Done';

        const isVerified  = ['VERIFIED', 'COMPLETED', 'READY', 'PICKED UP'].includes(s);
        const isCompleted = ['COMPLETED', 'READY', 'PICKED UP'].includes(s);
        const isPickedUp  = s === 'PICKED UP';
        const isCancelled = s === 'CANCELLED';

        // Base step 1: Always done if order exists
        let steps = [
            { 
                key: 'received', num: '1', 
                done: true, active: true,
                title: 'Order Received', 
                desc: 'System acknowledged your request',
                time: placedTime, 
                icon: '📋' 
            }
        ];

        // If cancelled, show a different timeline
        if (isCancelled) {
             steps.push({ 
                key: 'cancelled', num: '✕', 
                done: false, active: true,
                title: 'Order Cancelled', 
                desc: 'This order has been cancelled.',
                time: updatedTime, 
                icon: '✕' 
            });
            return steps;
        }

        // Step 2: Stock Verification
        steps.push({ 
            key: 'review', num: '2', 
            done: isVerified, active: !isCancelled,
            title: 'Stock Verification', 
            desc: isVerified ? 'Parts availability confirmed' : 'Checking parts availability',
        
            time: isVerified ? updatedTime : 'Pending', 
            icon: '🔍' 
        });

        // Step 3: Confirmation/Completion
        steps.push({ 
            key: 'email', num: '3', 
            done: isCompleted, active: isVerified,
            title: 'Order Ready', 
            desc: isCompleted ? 'Order processed and ready' : 'Preparing your order',
          
            time: isCompleted ? updatedTime : (isVerified ? 'Processing...' : 'Awaiting'), 
            icon: '📦' 
        });

        // Step 4: Pickup
        steps.push({ 
            key: 'pickup', num: isPickedUp ? '✓' : '4', 
            done: isPickedUp, active: isCompleted,
            title: isPickedUp ? 'Collected' : 'Ready for Pickup',
            desc: isPickedUp ? 'Order successfully handed over' : 'Visit shop to collect',
      
            time: isPickedUp ? updatedTime : (isCompleted ? 'Awaiting Customer' : 'Pending'), 
            icon: isPickedUp ? '✅' : '🏪' 
        });

        return steps;
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="mo-root">
                <Navbar />

                {/* Decorative BG */}
                <div className="mo-bg">
                    <div className="mo-mesh" />
                    <div className="mo-blob mo-blob-1" />
                    <div className="mo-blob mo-blob-2" />
                    <div className="mo-blob mo-blob-3" />
                    <div className="mo-blob mo-blob-4" />
                    <div className="mo-dots-pattern" />
                    <div className="mo-grid-lines" />
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`mo-particle mo-p${i+1}`} />
                    ))}
                </div>

                <div className="mo-container">

                    {/* ══ HEADER ══ */}
                    <div className="mo-header">
                        <div className="mo-title-group">
                            <div className="mo-icon-box">
                                <div className="mo-icon-ring" />
                                <svg width="26" height="26" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="mo-main-title">My Orders</h1>
                                <div className="mo-subtitle-row">
                                    <div className="mo-live-dot">
                                        <span className="mo-live-ping" />
                                        <span className="mo-live-core" />
                                    </div>
                                    <p className="mo-subtitle">Track your vehicle parts requests</p>
                                </div>
                            </div>
                        </div>
                        <button className="mo-refresh" onClick={fetchOrders}>
                            <span className="mo-refresh-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor"
                                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 4v6h-6"/>
                                    <path d="M1 20v-6h6"/>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                </svg>
                            </span>
                            Refresh
                        </button>
                    </div>

                    {/* ══ STATS ══ */}
                    {!loading && !error && orders.length > 0 && (
                        <div className="mo-stats-grid">
                            {[
                                { icon:'📦', val:orders.length,
                                  label:'Total Orders', color:'#e67e22',
                                  glow:'rgba(230,126,34,0.2)', delay:'0s' },
                                { icon:'⏳',
                                  val:orders.filter(o=>o.status?.toUpperCase()==='PENDING').length,
                                  label:'Pending', color:'#f59e0b',
                                  glow:'rgba(245,158,11,0.2)', delay:'0.08s' },
                                { icon:'✅',
                                  val:orders.filter(o=>['COMPLETED','CONFIRMED'].includes(o.status?.toUpperCase())).length,
                                  label:'Completed', color:'#22c55e',
                                  glow:'rgba(34,197,94,0.2)', delay:'0.16s' },
                                { icon:'💰',
                                  val:formatPrice(orders.reduce((s,o)=>s+Number(o.totalAmount||0),0)),
                                  label:'Total Spent', color:'#e67e22',
                                  glow:'rgba(230,126,34,0.2)', delay:'0.24s' },
                            ].map((s, i) => (
                                <div key={i} className="mo-stat-card"
                                    style={{ animationDelay: s.delay }}>
                                    <div className="mo-stat-glow"
                                        style={{ background: s.glow }} />
                                    <div className="mo-stat-icon-wrap"
                                        style={{ background:`${s.color}12`, border:`1.5px solid ${s.color}28` }}>
                                        <span className="mo-stat-emoji">{s.icon}</span>
                                    </div>
                                    <div className="mo-stat-info">
                                        <span className="mo-stat-val"
                                            style={{ color: s.color }}>{s.val}</span>
                                        <span className="mo-stat-label">{s.label}</span>
                                    </div>
                                    <div className="mo-stat-shine" />
                                    <div className="mo-stat-bar"
                                        style={{ background:`linear-gradient(90deg,${s.color}35,transparent)` }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ══ LOADING ══ */}
                    {loading && (
                        <div className="mo-loader-container">
                            <div className="mo-loader-card">
                                <div className="mo-loader-wrap">
                                    <div className="mo-spinner-track" />
                                    <div className="mo-spinner-outer" />
                                    <div className="mo-spinner-inner" />
                                    <div className="mo-spinner-dot" />
                                    <span className="mo-loader-emoji">⚙️</span>
                                </div>
                                <div className="mo-loader-dots">
                                    <span /><span /><span />
                                </div>
                                <p className="mo-loader-text">Fetching your orders...</p>
                                <div className="mo-loader-bar-wrap">
                                    <div className="mo-loader-bar" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ ERROR ══ */}
                    {error && !loading && (
                        <div className="mo-error-card">
                            <div className="mo-error-icon-wrap">
                                <div className="mo-error-ring" />
                                <span className="mo-error-emoji">⚠️</span>
                            </div>
                            <h3>Connection Error</h3>
                            <p>{error}</p>
                            <button onClick={fetchOrders} className="mo-retry-btn">
                                <span>↺</span> Try Again
                            </button>
                        </div>
                    )}

                    {/* ══ EMPTY ══ */}
                    {!loading && !error && orders.length === 0 && (
                        <div className="mo-empty-state">
                            <div className="mo-empty-visual">
                                <div className="mo-empty-orbit mo-eo-3" />
                                <div className="mo-empty-orbit mo-eo-2" />
                                <div className="mo-empty-orbit mo-eo-1" />
                                <div className="mo-empty-icon-wrap">
                                    <div className="mo-empty-icon">🛒</div>
                                </div>
                            </div>
                            <h3>No Orders Yet</h3>
                            <p>You haven't purchased any vehicle parts yet.</p>
                            <button className="mo-shop-btn"
                                onClick={() => window.location.href='/parts-catalog'}>
                                🔧 Browse Parts Catalog
                            </button>
                        </div>
                    )}

                    {/* ══ ORDER LIST ══ */}
                    {!loading && !error && orders.length > 0 && (
                        <div className="mo-list">
                            {orders.map((order, idx) => {
                                const orderId    = order.id;
                                const status     = order.status || 'PENDING';
                                const orderDate  = order.orderDate;
                                const total      = order.totalAmount || 0;
                                const isExpanded = expandedOrder === orderId;
                                const statusInfo = getStatusInfo(status);
                               const steps = getOrderSteps(status, orderDate, order.updatedAt);

                                return (
                                    <div key={orderId}
                                        className={`mo-card ${isExpanded ? 'mo-card-active' : ''}`}
                                        style={{ animationDelay: `${idx * 0.08}s` }}>

                                        {/* Accent + Glow */}
                                        <div className="mo-card-accent" />
                                        <div className="mo-card-glow" />

                                        {/* ── Card Header ── */}
                                        <div className="mo-card-header"
                                            onClick={() => setExpandedOrder(isExpanded ? null : orderId)}>

                                            <div className="mo-left">
                                                <div className="mo-order-num-badge">
                                                    <span className="mo-id-label">ORDER</span>
                                                    <span className="mo-id-val">#{orderId}</span>
                                                </div>
                                                <div className="mo-date">
                                                    <svg width="12" height="12" viewBox="0 0 24 24"
                                                        fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <polyline points="12 6 12 12 16 14"/>
                                                    </svg>
                                                    {formatDate(orderDate)}
                                                </div>
                                            </div>

                                            <div className="mo-right">
                                                <div className={`mo-status-badge status-${statusInfo.cls}`}>
                                                    <span className="mo-dot" />
                                                    {statusInfo.label}
                                                </div>
                                                <span className="mo-price">{formatPrice(total)}</span>
                                                <div className={`mo-chevron ${isExpanded ? 'rotated' : ''}`}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24"
                                                        fill="none" stroke="currentColor"
                                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="6 9 12 15 18 9"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Expanded Body ── */}
                                        {isExpanded && (
                                            <div className="mo-card-body">
                                                <div className="mo-grid-layout">

                                                    {/* Left: Items */}
                                                    <div className="mo-col-left">
                                                        <h4 className="mo-section-title">
                                                            <span className="mo-title-dot"/>
                                                            Order Items
                                                        </h4>
                                                        <div className="mo-items-list">
                                                            {order.items?.length > 0 ? (
                                                                order.items.map((item, i) => (
                                                                    <div key={i} className="mo-item-row"
                                                                        style={{ animationDelay:`${i*0.06}s` }}>
                                                                        <div className="mo-item-icon">⚙️</div>
                                                                        <div className="mo-item-details">
                                                                            <span className="mo-item-name">
                                                                                {item.productName || 'Unknown Part'}
                                                                            </span>
                                                                            <div className="mo-item-meta">
                                                                                <span className="mo-code">
                                                                                    #{item.productCode || 'N/A'}
                                                                                </span>
                                                                                <span className="mo-qty">
                                                                                    × {item.quantity || 1}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mo-item-cost">
                                                                            {formatPrice((item.price||0)*(item.quantity||1))}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="mo-no-data">No item details available</div>
                                                            )}
                                                        </div>

                                                        <div className="mo-totals-box">
                                                            <div className="mo-row">
                                                                <span>Subtotal</span>
                                                                <span>{formatPrice(total)}</span>
                                                            </div>
                                                            <div className="mo-row">
                                                                <span>Pickup Fee</span>
                                                                <span className="mo-free">FREE</span>
                                                            </div>
                                                            <div className="mo-row total">
                                                                <span>Total Paid</span>
                                                                <span>{formatPrice(total)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Timeline */}
                                                    <div className="mo-col-right">
                                                        <h4 className="mo-section-title">
                                                            <span className="mo-title-dot"/>
                                                            Tracking Status
                                                        </h4>
                                                        <div className="mo-timeline">
                                                            {steps.map((step, si) => (
                                                                <div key={step.key}
                                                                    className={`mo-step ${step.done?'done':''} ${step.active?'active':''}`}
                                                                    style={{ animationDelay:`${si*0.1}s` }}>
                                                                    <div className="mo-step-left">
                                                                        <div className="mo-step-node">
                                                                            {step.done && <div className="mo-node-pulse"/>}
                                                                            {step.done ? (
                                                                                <svg width="11" height="11" viewBox="0 0 24 24"
                                                                                    fill="none" stroke="currentColor"
                                                                                    strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                                                    <polyline points="20 6 9 17 4 12"/>
                                                                                </svg>
                                                                            ) : (
                                                                                <span>{step.num}</span>
                                                                            )}
                                                                        </div>
                                                                        {si < steps.length-1 && (
                                                                            <div className={`mo-step-line ${step.done?'line-done':''}`}>
                                                                                {step.done && <div className="mo-line-flow"/>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="mo-step-content">
                                                                        <div className="mo-step-head">
                                                                            <span className="mo-step-icon">{step.icon}</span>
                                                                            <span className="mo-step-title">{step.title}</span>
                                                                            <span className="mo-step-time">{step.time}</span>
                                                                        </div>
                                                                        <p className="mo-step-desc">{step.desc}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                       <div className="mo-actions-box">
                                                        {status?.toUpperCase() === 'CANCELLED' ? (
                                                            <div className="mo-cancelled-msg">
                                                                ✕ This order is cancelled
                                                            </div>
                                                        ) : canCancel(orderDate) && !['CANCELLED', 'COMPLETED', 'PICKED UP', 'READY'].includes(status?.toUpperCase()) ? (
                                                            <button className="mo-btn-cancel"
                                                                disabled={cancelLoading === orderId}
                                                                onClick={() => handleCancelOrder(orderId)}>
                                                                {cancelLoading === orderId
                                                                    ? '⏳ Processing...'
                                                                    : '✕ Cancel Order'}
                                                            </button>
                                                        ) : (
                                                            <div className="mo-info-msg">
                                                                {canCancel(orderDate) 
                                                                    ? '⚠️ Order is already processed and cannot be cancelled' 
                                                                    : '⚠️ Cancellation window closed (24h)'}
                                                            </div>
                                                        )}
                                                        
                                                        <button className="mo-btn-help"
                                                            onClick={() => window.location.href='/contact'}>
                                                            💬 Need Help?
                                                        </button>
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
    --bg:           #f0f4ff;
    --bg-2:         #ffffff;
    --card-bg:      #ffffff;
    --card-border:  #e4eaf6;
    --card-shadow:  rgba(80,100,160,0.09);
    --primary:      #e67e22;
    --primary-2:    #d35400;
    --primary-light:#fff4eb;
    --primary-glow: rgba(230,126,34,0.18);
    --text:         #1a202c;
    --text-2:       #4a5568;
    --muted:        #94a3b8;
    --success:      #16a34a;
    --success-bg:   #f0fdf4;
    --danger:       #dc2626;
    --danger-bg:    #fef2f2;
    --warning:      #d97706;
    --warning-bg:   #fffbeb;
    --blue:         #3b82f6;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

.mo-root {
    min-height:100vh;
    background: linear-gradient(135deg,#f0f4ff 0%,#fdf4ec 50%,#f0f7ff 100%);
    color:var(--text);
    font-family:'Inter',sans-serif;
    position:relative;
    overflow-x:hidden;
}

/* ══ BG ══ */
.mo-bg {
    position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
}
.mo-mesh {
    position:absolute;inset:0;
    background:
        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(230,126,34,0.06) 0%,transparent 60%),
        radial-gradient(ellipse 60% 50% at 80% 90%, rgba(59,130,246,0.05) 0%,transparent 60%),
        radial-gradient(ellipse 50% 40% at 50% 50%, rgba(34,197,94,0.03) 0%,transparent 60%);
}
.mo-blob {
    position:absolute;border-radius:50%;
    filter:blur(70px);pointer-events:none;
}
.mo-blob-1 {
    width:700px;height:700px;top:-200px;left:-150px;
    background:radial-gradient(circle,rgba(230,126,34,0.10) 0%,transparent 65%);
    animation:blobFloat 16s ease-in-out infinite;
}
.mo-blob-2 {
    width:550px;height:550px;bottom:-150px;right:-100px;
    background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 65%);
    animation:blobFloat 20s ease-in-out infinite reverse;
}
.mo-blob-3 {
    width:400px;height:400px;top:40%;left:55%;
    background:radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 65%);
    animation:blobFloat 13s ease-in-out infinite 4s;
}
.mo-blob-4 {
    width:300px;height:300px;top:20%;right:10%;
    background:radial-gradient(circle,rgba(230,126,34,0.05) 0%,transparent 65%);
    animation:blobFloat 10s ease-in-out infinite 2s;
}
.mo-dots-pattern {
    position:absolute;inset:0;
    background-image:radial-gradient(circle,rgba(99,115,180,0.08) 1.5px,transparent 1.5px);
    background-size:30px 30px;
    mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%);
}
.mo-grid-lines {
    position:absolute;inset:0;
    background-image:
        linear-gradient(rgba(99,115,180,0.04) 1px,transparent 1px),
        linear-gradient(90deg,rgba(99,115,180,0.04) 1px,transparent 1px);
    background-size:80px 80px;
}
.mo-particle {
    position:absolute;border-radius:50%;
    animation:particleFloat 8s ease-in-out infinite;
}
.mo-p1{width:10px;height:10px;background:#e67e22;opacity:0.12;top:8%;left:10%;animation-duration:9s;}
.mo-p2{width:6px;height:6px;background:#3b82f6;opacity:0.10;top:20%;left:85%;animation-duration:12s;animation-delay:1s;}
.mo-p3{width:14px;height:14px;background:#e67e22;opacity:0.08;top:65%;left:6%;animation-duration:11s;animation-delay:2s;border-radius:3px;}
.mo-p4{width:8px;height:8px;background:#22c55e;opacity:0.10;top:78%;left:88%;animation-duration:7s;animation-delay:0.5s;}
.mo-p5{width:12px;height:12px;background:#f59e0b;opacity:0.09;top:42%;left:4%;animation-duration:14s;animation-delay:3s;border-radius:3px;}
.mo-p6{width:5px;height:5px;background:#e67e22;opacity:0.12;top:12%;left:52%;animation-duration:6s;animation-delay:1.5s;}
.mo-p7{width:16px;height:16px;background:#3b82f6;opacity:0.07;top:55%;left:91%;animation-duration:13s;animation-delay:4s;border-radius:4px;}
.mo-p8{width:7px;height:7px;background:#22c55e;opacity:0.10;top:85%;left:42%;animation-duration:5s;}
.mo-p9{width:9px;height:9px;background:#e67e22;opacity:0.08;top:30%;left:75%;animation-duration:10s;animation-delay:2.5s;}
.mo-p10{width:11px;height:11px;background:#f59e0b;opacity:0.07;top:92%;left:18%;animation-duration:8s;animation-delay:1s;border-radius:3px;}

/* ══ CONTAINER ══ */
.mo-container {
    position:relative;z-index:1;
    max-width:1100px;margin:0 auto;
    padding:56px 28px 100px;
}

/* ══ HEADER ══ */
.mo-header {
    display:flex;justify-content:space-between;align-items:center;
    margin-bottom:44px;
    animation:headerIn 0.7s cubic-bezier(0.22,1,0.36,1);
}
.mo-title-group{display:flex;align-items:center;gap:20px;}

.mo-icon-box {
    width:64px;height:64px;border-radius:20px;
    background:linear-gradient(135deg,var(--primary),var(--primary-2));
    display:flex;align-items:center;justify-content:center;
    color:#fff;position:relative;flex-shrink:0;
    box-shadow:0 10px 30px rgba(230,126,34,0.35),0 3px 10px rgba(230,126,34,0.15);
    animation:iconFloat 4s ease-in-out infinite;
}
.mo-icon-ring {
    position:absolute;inset:-6px;border-radius:26px;
    border:2px solid rgba(230,126,34,0.2);
    animation:ringPulse 3s ease-in-out infinite;
}

.mo-main-title {
    font-size:32px;font-weight:900;letter-spacing:-1px;
    background:linear-gradient(135deg,#1a202c 0%,var(--primary) 70%,var(--primary-2) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.mo-subtitle-row{display:flex;align-items:center;gap:8px;margin-top:5px;}
.mo-live-dot{position:relative;width:8px;height:8px;flex-shrink:0;}
.mo-live-ping {
    position:absolute;inset:0;border-radius:50%;
    background:#22c55e;animation:livePing 1.8s ease-out infinite;
}
.mo-live-core{position:relative;width:8px;height:8px;border-radius:50%;background:#22c55e;}
.mo-subtitle{font-size:13px;color:var(--muted);font-weight:500;}

.mo-refresh {
    background:#fff;
    border:1.5px solid var(--card-border);
    color:var(--text-2);
    padding:12px 24px;border-radius:14px;
    cursor:pointer;display:flex;align-items:center;gap:10px;
    font-size:13px;font-weight:700;font-family:'Inter',sans-serif;
    box-shadow:0 3px 12px var(--card-shadow);
    transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
    position:relative;overflow:hidden;
}
.mo-refresh::before {
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,var(--primary-light),transparent);
    opacity:0;transition:opacity 0.3s;
}
.mo-refresh:hover::before{opacity:1;}
.mo-refresh:hover {
    color:var(--primary);border-color:rgba(230,126,34,0.35);
    transform:translateY(-2px);
    box-shadow:0 8px 24px rgba(230,126,34,0.18);
}
.mo-refresh:active{transform:translateY(0);}
.mo-refresh-icon{display:flex;align-items:center;transition:transform 0.5s ease;}
.mo-refresh:hover .mo-refresh-icon{transform:rotate(180deg);}

/* ══ STATS ══ */
.mo-stats-grid {
    display:grid;grid-template-columns:repeat(4,1fr);
    gap:16px;margin-bottom:44px;
}
.mo-stat-card {
    background:#fff;
    border:1.5px solid var(--card-border);
    border-radius:20px;
    padding:22px 20px;
    display:flex;align-items:center;gap:16px;
    position:relative;overflow:hidden;
    box-shadow:0 3px 16px var(--card-shadow);
    transition:all 0.35s cubic-bezier(0.4,0,0.2,1);
    animation:statIn 0.5s cubic-bezier(0.22,1,0.36,1) backwards;
    cursor:default;
}
.mo-stat-card:hover {
    transform:translateY(-6px) scale(1.01);
    box-shadow:0 16px 40px rgba(99,115,155,0.15);
    border-color:rgba(230,126,34,0.2);
}
.mo-stat-glow {
    position:absolute;top:-30px;right:-30px;
    width:120px;height:120px;border-radius:50%;
    filter:blur(35px);pointer-events:none;
    transition:opacity 0.3s;opacity:0.6;
}
.mo-stat-card:hover .mo-stat-glow{opacity:1;}
.mo-stat-icon-wrap {
    width:52px;height:52px;border-radius:16px;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
    transition:transform 0.3s;
}
.mo-stat-card:hover .mo-stat-icon-wrap{transform:scale(1.1) rotate(-5deg);}
.mo-stat-emoji{font-size:23px;}
.mo-stat-info{display:flex;flex-direction:column;min-width:0;flex:1;}
.mo-stat-val {
    font-size: clamp(16px, 1.8vw, 22px); 
    font-weight: 900;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.mo-stat-label {
    font-size:10px;color:var(--muted);text-transform:uppercase;
    letter-spacing:1.2px;margin-top:4px;font-weight:700;
}
.mo-stat-shine {
    position:absolute;inset:0;
    background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.7) 50%,transparent 65%);
    transform:translateX(-100%);transition:transform 0.7s ease;
}
.mo-stat-card:hover .mo-stat-shine{transform:translateX(100%);}
.mo-stat-bar {
    position:absolute;bottom:0;left:0;right:0;height:3px;
    border-radius:0 0 20px 20px;
}

/* ══ LOADING ══ */
.mo-loader-container {
    display:flex;align-items:center;justify-content:center;
    padding:80px 0;
}
.mo-loader-card {
    background:#fff;border:1.5px solid var(--card-border);
    border-radius:24px;padding:50px 60px;
    display:flex;flex-direction:column;align-items:center;gap:20px;
    box-shadow:0 8px 32px var(--card-shadow);
    animation:fadeUp 0.5s ease-out;
}
.mo-loader-wrap {
    position:relative;width:80px;height:80px;
    display:flex;align-items:center;justify-content:center;
}
.mo-spinner-track {
    position:absolute;inset:0;border-radius:50%;
    border:3px solid rgba(230,126,34,0.08);
}
.mo-spinner-outer {
    position:absolute;inset:0;border-radius:50%;
    border:3px solid transparent;border-top-color:var(--primary);
    animation:spin 1s linear infinite;
}
.mo-spinner-inner {
    position:absolute;inset:14px;border-radius:50%;
    border:2px solid transparent;border-bottom-color:var(--primary-2);
    animation:spin 0.65s linear infinite reverse;
}
.mo-spinner-dot {
    position:absolute;inset:29px;border-radius:50%;
    background:var(--primary);opacity:0.3;
    animation:pulse 1s ease-in-out infinite;
}
.mo-loader-emoji{
    font-size:22px;position:relative;z-index:2;
    animation:emojiSpin 3s linear infinite;
}
.mo-loader-dots{display:flex;gap:7px;}
.mo-loader-dots span {
    width:8px;height:8px;border-radius:50%;
    background:linear-gradient(135deg,var(--primary),var(--primary-2));
    animation:dotBounce 1.2s ease-in-out infinite;
}
.mo-loader-dots span:nth-child(2){animation-delay:0.18s;}
.mo-loader-dots span:nth-child(3){animation-delay:0.36s;}
.mo-loader-text{color:var(--muted);font-size:14px;font-weight:600;}
.mo-loader-bar-wrap {
    width:140px;height:3px;background:rgba(230,126,34,0.1);border-radius:10px;overflow:hidden;
}
.mo-loader-bar {
    height:100%;width:40%;border-radius:10px;
    background:linear-gradient(90deg,transparent,var(--primary),transparent);
    animation:barSweep 1.5s ease-in-out infinite;
}

/* ══ ERROR ══ */
.mo-error-card {
    text-align:center;padding:70px 40px;
    background:var(--danger-bg);
    border:1.5px solid rgba(220,38,38,0.12);
    border-radius:24px;
    box-shadow:0 4px 24px rgba(220,38,38,0.07);
    animation:fadeUp 0.4s ease-out;
}
.mo-error-icon-wrap{position:relative;display:inline-flex;margin-bottom:18px;}
.mo-error-ring {
    position:absolute;inset:-10px;border-radius:50%;
    border:2px dashed rgba(220,38,38,0.2);
    animation:spin 8s linear infinite;
}
.mo-error-emoji{font-size:54px;}
.mo-error-card h3{color:var(--danger);font-size:20px;margin-bottom:10px;font-weight:800;}
.mo-error-card p{color:var(--text-2);margin-bottom:28px;}
.mo-retry-btn {
    padding:12px 32px;background:var(--danger);
    color:#fff;border:none;border-radius:12px;
    cursor:pointer;font-weight:700;font-size:14px;
    font-family:'Inter',sans-serif;
    box-shadow:0 6px 18px rgba(220,38,38,0.28);
    transition:all 0.25s;display:inline-flex;align-items:center;gap:8px;
}
.mo-retry-btn:hover{background:#b91c1c;transform:translateY(-2px);box-shadow:0 10px 28px rgba(220,38,38,0.38);}

/* ══ EMPTY ══ */
.mo-empty-state {
    text-align:center;padding:90px 40px;
    background:#fff;border:1.5px dashed var(--card-border);
    border-radius:28px;
    box-shadow:0 4px 24px var(--card-shadow);
    animation:fadeUp 0.5s ease-out;
}
.mo-empty-visual {
    position:relative;width:130px;height:130px;
    margin:0 auto 36px;
    display:flex;align-items:center;justify-content:center;
}
.mo-empty-orbit {
    position:absolute;border-radius:50%;
    border:1.5px solid rgba(230,126,34,0.12);
}
.mo-eo-1{inset:22px;animation:spin 6s linear infinite;border-style:dashed;}
.mo-eo-2{inset:8px;animation:spin 10s linear infinite reverse;}
.mo-eo-3{inset:-6px;animation:spin 15s linear infinite;border-color:rgba(230,126,34,0.07);}
.mo-empty-icon-wrap {
    width:70px;height:70px;border-radius:20px;
    background:linear-gradient(135deg,var(--primary-light),#fff);
    border:1.5px solid rgba(230,126,34,0.15);
    display:flex;align-items:center;justify-content:center;
    z-index:2;position:relative;
    box-shadow:0 8px 24px rgba(230,126,34,0.12);
    animation:iconFloat 3s ease-in-out infinite;
}
.mo-empty-icon{font-size:36px;}
.mo-empty-state h3{font-size:24px;font-weight:800;margin-bottom:12px;color:var(--text);}
.mo-empty-state p{color:var(--muted);margin-bottom:32px;font-size:15px;}
.mo-shop-btn {
    padding:15px 40px;
    background:linear-gradient(135deg,var(--primary),var(--primary-2));
    color:#fff;border:none;border-radius:14px;
    font-weight:800;cursor:pointer;font-size:14px;
    font-family:'Inter',sans-serif;
    box-shadow:0 10px 28px rgba(230,126,34,0.32);
    transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
    position:relative;overflow:hidden;
}
.mo-shop-btn::before{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);
    transform:translateX(-100%);transition:transform 0.5s;
}
.mo-shop-btn:hover::before{transform:translateX(100%);}
.mo-shop-btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 16px 40px rgba(230,126,34,0.40);}

/* ══ ORDER CARDS ══ */
.mo-list{display:flex;flex-direction:column;gap:14px;}

.mo-card {
    background:#fff;
    border:1.5px solid var(--card-border);
    border-radius:22px;overflow:hidden;
    transition:all 0.4s cubic-bezier(0.4,0,0.2,1);
    animation:cardIn 0.55s cubic-bezier(0.22,1,0.36,1) backwards;
    position:relative;
    box-shadow:0 3px 16px var(--card-shadow);
}
.mo-card-accent {
    position:absolute;left:0;top:0;bottom:0;width:4px;
    background:linear-gradient(180deg,var(--primary),var(--primary-2),rgba(230,126,34,0.3));
    opacity:0;transition:opacity 0.35s;
    border-radius:22px 0 0 22px;
}
.mo-card-glow {
    position:absolute;left:-40px;top:50%;transform:translateY(-50%);
    width:100px;height:100px;border-radius:50%;
    background:rgba(230,126,34,0.06);filter:blur(20px);
    opacity:0;transition:opacity 0.35s;pointer-events:none;
}
.mo-card:hover .mo-card-accent{opacity:0.45;}
.mo-card:hover .mo-card-glow{opacity:1;}
.mo-card-active .mo-card-accent{opacity:1;}
.mo-card-active .mo-card-glow{opacity:1;}

.mo-card:hover:not(.mo-card-active) {
    border-color:rgba(230,126,34,0.22);
    transform:translateY(-3px);
    box-shadow:0 12px 36px rgba(99,115,155,0.14);
}
.mo-card-active {
    border-color:rgba(230,126,34,0.32);
    box-shadow:0 0 0 3px rgba(230,126,34,0.08),0 20px 50px rgba(99,115,155,0.14);
}

/* Card Header */
.mo-card-header {
    padding:22px 28px 22px 38px;
    display:flex;justify-content:space-between;align-items:center;
    cursor:pointer;user-select:none;
    transition:background 0.2s;
    position:relative;
}
.mo-card-header::after{
    content:'';position:absolute;bottom:0;left:36px;right:28px;
    height:1px;background:transparent;transition:background 0.3s;
}
.mo-card-active .mo-card-header::after{
    background:linear-gradient(90deg,var(--primary-light),transparent);
}
.mo-card-header:hover{background:rgba(230,126,34,0.015);}

.mo-left{display:flex;flex-direction:column;gap:8px;}
.mo-order-num-badge{display:flex;align-items:baseline;gap:10px;}
.mo-id-label{
    font-size:10px;font-weight:800;color:var(--muted);
    letter-spacing:2px;text-transform:uppercase;
}
.mo-id-val{
    font-size:26px;font-weight:900;color:var(--primary);
    letter-spacing:-0.5px;
    background:linear-gradient(135deg,var(--primary),var(--primary-2));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.mo-date{
    display:flex;align-items:center;gap:6px;
    font-size:12px;color:var(--muted);font-weight:500;
}
.mo-right{display:flex;align-items:center;gap:18px;}

/* Status */
.mo-status-badge {
    padding:7px 14px;border-radius:30px;
    font-size:12px;font-weight:700;
    display:flex;align-items:center;gap:7px;
    letter-spacing:0.2px;
}
.mo-dot{
    width:7px;height:7px;border-radius:50%;background:currentColor;
    animation:dotBlink 2.5s ease-in-out infinite;
}
.status-pending{color:var(--warning);background:var(--warning-bg);border:1.5px solid rgba(217,119,6,0.18);}
.status-confirmed,.status-ready{color:var(--success);background:var(--success-bg);border:1.5px solid rgba(22,163,74,0.18);}
.status-completed{color:#64748b;background:#f8fafc;border:1.5px solid #e2e8f0;}
.status-cancelled{color:var(--danger);background:var(--danger-bg);border:1.5px solid rgba(220,38,38,0.18);}
.status-processing{color:var(--primary);background:var(--primary-light);border:1.5px solid rgba(230,126,34,0.18);}

.mo-price{
    font-size:18px;font-weight:900;color:var(--text);
    letter-spacing:-0.5px;
}
.mo-chevron {
    color:var(--muted);
    transition:transform 0.4s cubic-bezier(0.4,0,0.2,1),
               color 0.3s,background 0.3s,border-color 0.3s;
    background:var(--bg);border-radius:50%;
    width:36px;height:36px;
    display:flex;align-items:center;justify-content:center;
    border:1.5px solid var(--card-border);
    flex-shrink:0;
}
.mo-chevron.rotated{
    transform:rotate(180deg);
    color:var(--primary);
    background:var(--primary-light);
    border-color:rgba(230,126,34,0.28);
}

/* ── Body ── */
.mo-card-body {
    border-top:1.5px solid #f1f5f9;
    background:linear-gradient(135deg,#fafbff 0%,#fffaf7 100%);
    padding:32px 32px 32px 38px;
    animation:bodyExpand 0.4s cubic-bezier(0.4,0,0.2,1);
}
.mo-grid-layout{display:grid;grid-template-columns:1.2fr 1fr;gap:48px;}

.mo-section-title{
    font-size:11px;font-weight:800;color:var(--muted);
    text-transform:uppercase;letter-spacing:1.6px;margin-bottom:18px;
    display:flex;align-items:center;gap:10px;
}
.mo-title-dot{
    width:8px;height:8px;border-radius:50%;
    background:linear-gradient(135deg,var(--primary),var(--primary-2));
    box-shadow:0 0 10px rgba(230,126,34,0.45);flex-shrink:0;
    animation:dotGlow 2s ease-in-out infinite;
}

/* Items */
.mo-items-list{
    background:#fff;border-radius:16px;
    border:1.5px solid var(--card-border);
    overflow:hidden;margin-bottom:16px;
    box-shadow:0 2px 10px rgba(99,115,155,0.06);
}
.mo-item-row{
    display:flex;align-items:center;gap:14px;
    padding:14px 18px;
    border-bottom:1px solid #f8fafc;
    transition:background 0.2s,transform 0.2s;
    animation:itemIn 0.4s cubic-bezier(0.22,1,0.36,1) backwards;
}
.mo-item-row:last-child{border-bottom:none;}
.mo-item-row:hover{background:#fffbf7;transform:translateX(3px);}
.mo-item-icon{
    width:44px;height:44px;
    background:linear-gradient(135deg,var(--primary-light),#fff);
    border:1.5px solid rgba(230,126,34,0.15);
    border-radius:12px;
    display:flex;align-items:center;justify-content:center;
    font-size:18px;flex-shrink:0;
    box-shadow:0 2px 8px rgba(230,126,34,0.08);
    transition:transform 0.2s;
}
.mo-item-row:hover .mo-item-icon{transform:scale(1.08) rotate(-3deg);}
.mo-item-details{flex:1;min-width:0;}
.mo-item-name{
    display:block;font-size:14px;font-weight:700;color:var(--text);
    margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.mo-item-meta{display:flex;gap:10px;font-size:12px;}
.mo-code{
    background:#f1f5f9;color:#64748b;
    padding:2px 8px;border-radius:6px;
    font-family:'Courier New',monospace;border:1px solid #e2e8f0;
}
.mo-qty{color:var(--primary);font-weight:700;}
.mo-item-cost{font-weight:800;color:var(--text);font-size:14px;white-space:nowrap;}
.mo-no-data{padding:28px;text-align:center;color:var(--muted);font-size:13px;}

/* Totals */
.mo-totals-box{
    background:#fff;border-radius:14px;
    padding:18px 20px;
    border:1.5px solid var(--card-border);
    box-shadow:0 2px 8px rgba(99,115,155,0.05);
}
.mo-row{
    display:flex;justify-content:space-between;
    font-size:14px;color:var(--text-2);margin-bottom:10px;font-weight:500;
}
.mo-row:last-child{margin-bottom:0;}
.mo-row.total{
    border-top:1.5px solid #f1f5f9;padding-top:14px;margin-top:6px;
    font-weight:800;color:var(--text);font-size:16px;
}
.mo-free{color:var(--success);font-weight:700;}

/* Timeline */
.mo-timeline{display:flex;flex-direction:column;margin-bottom:24px;}
.mo-step{
    display:flex;align-items:flex-start;position:relative;
    animation:stepIn 0.4s cubic-bezier(0.22,1,0.36,1) backwards;
}
.mo-step-left{
    display:flex;flex-direction:column;align-items:center;
    width:36px;flex-shrink:0;margin-right:14px;
}
.mo-step-node{
    width:36px;height:36px;border-radius:50%;
    background:#f8fafc;border:2px solid #e2e8f0;
    display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:800;color:var(--muted);
    flex-shrink:0;z-index:2;position:relative;
    transition:all 0.45s cubic-bezier(0.4,0,0.2,1);
}
.mo-node-pulse{
    position:absolute;inset:-5px;border-radius:50%;
    border:2px solid rgba(230,126,34,0.2);
    animation:nodePulse 2s ease-in-out infinite;
}
.mo-step.done .mo-step-node{
    background:linear-gradient(135deg,var(--primary),var(--primary-2));
    border-color:var(--primary);color:#fff;
    box-shadow:0 4px 16px rgba(230,126,34,0.32);
}
.mo-step.active:not(.done) .mo-step-node{
    border-color:var(--primary);color:var(--primary);
    background:var(--primary-light);
    box-shadow:0 0 0 4px rgba(230,126,34,0.10);
}
.mo-step-line{
    width:2px;flex:1;min-height:22px;
    background:#e2e8f0;margin:4px 0;border-radius:2px;
    position:relative;overflow:hidden;
    transition:background 0.4s;
}
.mo-step-line.line-done{
    background:linear-gradient(180deg,var(--primary),rgba(230,126,34,0.25));
}
.mo-line-flow{
    position:absolute;top:-100%;width:100%;height:100%;
    background:linear-gradient(180deg,rgba(255,255,255,0.6),transparent);
    animation:lineFlow 2s ease-in-out infinite;
}
.mo-step-content{padding:4px 0 26px;flex:1;min-width:0;}
.mo-step-head{
    display:flex;align-items:center;gap:8px;
    margin-bottom:4px;flex-wrap:wrap;
}
.mo-step-icon{font-size:15px;flex-shrink:0;}
.mo-step-title{
    font-size:14px;font-weight:700;color:#94a3b8;flex:1;
    transition:color 0.3s;
}
.mo-step.done .mo-step-title{color:var(--primary);}
.mo-step.active:not(.done) .mo-step-title{color:var(--text);}
.mo-step-time{
    font-size:11px;color:var(--muted);
    background:#f1f5f9;padding:2px 9px;
    border-radius:20px;border:1px solid #e2e8f0;
    white-space:nowrap;flex-shrink:0;font-weight:600;
}
.mo-step-desc{font-size:12px;color:var(--muted);line-height:1.6;}

/* Actions */
.mo-actions-box{display:flex;flex-direction:column;gap:10px;}
.mo-btn-cancel{
    width:100%;padding:13px;border-radius:12px;
    border:1.5px solid rgba(220,38,38,0.22);
    background:var(--danger-bg);color:var(--danger);
    font-weight:700;cursor:pointer;transition:all 0.25s;
    font-size:13px;font-family:'Inter',sans-serif;
}
.mo-btn-cancel:hover:not(:disabled){
    background:#fee2e2;border-color:rgba(220,38,38,0.4);
    box-shadow:0 4px 16px rgba(220,38,38,0.12);
    transform:translateY(-1px);
}
.mo-btn-cancel:disabled{opacity:0.5;cursor:not-allowed;}
.mo-btn-help{
    width:100%;padding:13px;border-radius:12px;
    border:1.5px solid var(--card-border);
    background:#fff;color:var(--text-2);
    font-weight:600;cursor:pointer;transition:all 0.25s;
    font-size:13px;font-family:'Inter',sans-serif;
    box-shadow:0 2px 8px var(--card-shadow);
}
.mo-btn-help:hover{
    border-color:rgba(230,126,34,0.28);color:var(--primary);
    background:var(--primary-light);transform:translateY(-1px);
    box-shadow:0 4px 16px rgba(230,126,34,0.10);
}
.mo-cancelled-msg,.mo-info-msg{
    text-align:center;padding:13px;font-size:13px;
    border-radius:12px;font-weight:600;
}
.mo-cancelled-msg{background:var(--danger-bg);color:var(--danger);border:1.5px solid rgba(220,38,38,0.13);}
.mo-info-msg{background:#f8fafc;color:var(--muted);border:1.5px solid var(--card-border);}

/* ══ ANIMATIONS ══ */
@keyframes spin         { to{transform:rotate(360deg)} }
@keyframes pulse        { 0%,100%{opacity:0.5;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.1)} }
@keyframes blobFloat    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(24px,-24px) scale(1.06)} }
@keyframes particleFloat{ 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-22px) rotate(25deg)} }
@keyframes iconFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
@keyframes ringPulse    { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.08)} }
@keyframes livePing     { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
@keyframes dotBlink     { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes dotBounce    { 0%,100%{opacity:0.3;transform:scale(0.7)} 50%{opacity:1;transform:scale(1.1)} }
@keyframes dotGlow      { 0%,100%{box-shadow:0 0 6px rgba(230,126,34,0.3)} 50%{box-shadow:0 0 14px rgba(230,126,34,0.7)} }
@keyframes emojiSpin    { 0%,90%,100%{transform:rotate(0deg)} 95%{transform:rotate(360deg)} }
@keyframes barSweep     { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
@keyframes nodePulse    { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
@keyframes lineFlow     { 0%{top:-100%} 100%{top:200%} }
@keyframes headerIn     { from{opacity:0;transform:translateY(-24px)} to{opacity:1;transform:translateY(0)} }
@keyframes statIn       { from{opacity:0;transform:translateY(20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes cardIn       { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes bodyExpand   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes itemIn       { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
@keyframes stepIn       { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeUp       { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

/* ══ RESPONSIVE ══ */
@media(max-width:900px){.mo-stats-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:768px){
    .mo-container{padding:28px 16px 80px;}
    .mo-header{flex-direction:column;align-items:flex-start;gap:16px;}
    .mo-refresh{align-self:stretch;justify-content:center;}
    .mo-grid-layout{grid-template-columns:1fr;gap:28px;}
    .mo-card-header{padding:18px 20px 18px 26px;flex-wrap:wrap;gap:12px;}
    .mo-right{width:100%;justify-content:space-between;}
    .mo-main-title{font-size:26px;}
    .mo-card-body{padding:24px 20px 24px 24px;}
}
@media(max-width:480px){
    .mo-stats-grid{grid-template-columns:1fr 1fr;gap:10px;}
    .mo-stat-card{padding:16px 14px;gap:12px;}
    .mo-stat-val{font-size:18px;}
    .mo-id-val{font-size:22px;}
}
`;

export default MyOrders;