import React, { useState, useEffect } from 'react';

// ── Icons ──────────────────────────────────────────────
const IReceipt = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const IPackage = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const ISearch = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ICheck = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IClock = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IBox = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
  </svg>
);
const ICalendar = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ITrendUp = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IChevron = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IRefresh = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);
const IZap = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

// ── Animated Counter ────────────────────────────────────
const AnimCounter = ({ target, duration = 800, prefix = '', suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <span>{prefix}{val}{suffix}</span>;
};

// ── Stat Card ───────────────────────────────────────────
const StatCard = ({ label, value, subtitle, color, glow, bg, border, icon, prefix = '', suffix = '', delay = 0 }) => {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: '200px', padding: '26px 24px',
        borderRadius: '22px', position: 'relative', overflow: 'hidden',
        background: hov
          ? `linear-gradient(145deg,${bg},var(--bg-main))`
          : 'var(--bg-card)',
        border: `1px solid ${hov ? color + '50' : 'var(--border-color)'}`,
        boxShadow: vis ? `0 0 ${hov ? '40px' : '20px'} ${glow}` : 'none',
        transform: vis ? `translateY(${hov ? '-4px' : '0'}) scale(${hov ? '1.01' : '1'})` : 'translateY(14px) scale(0.97)',
        opacity: vis ? 1 : 0,
        transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: 'default',
      }}
    >
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: color, filter: 'blur(40px)',
        opacity: hov ? 0.2 : 0.08, transition: 'opacity 0.3s', pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-muted)', opacity: 0.5, textTransform: 'uppercase', marginBottom: '3px' }}>
              {label}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{subtitle}</p>
          </div>
          <div style={{
            width: '44px', height: '44px', borderRadius: '13px',
            background: bg, border: `1px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: hov ? `0 0 16px ${glow}` : 'none', transition: 'box-shadow 0.3s',
          }}>
            {icon}
          </div>
        </div>

        <div style={{
          fontSize: '50px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1,
          marginBottom: '14px', fontVariantNumeric: 'tabular-nums',
        }}>
          <AnimCounter target={value} prefix={prefix} suffix={suffix} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ height: '2px', flex: 1, borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: vis ? '65%' : '0%',
              background: `linear-gradient(90deg,${color},transparent)`,
              borderRadius: '99px', transition: 'width 1.3s ease 0.3s',
            }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color, fontWeight: 700 }}>
            <ITrendUp size={11}/> Live
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Invoice Row ─────────────────────────────────────────
const InvoiceRow = ({ inv, index }) => {
  const [hov, setHov] = useState(false);
  const [exp, setExp] = useState(false);
  const isPaid = inv.status === 'Paid' || inv.status === 'Confirmed';
  const statusColor  = isPaid ? '#10b981' : '#f59e0b';
  const statusGlow   = isPaid ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)';
  const statusBg     = isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';
  const statusBorder = isPaid ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); }}
      style={{
        background: hov ? 'var(--card-hover-bg)' : 'var(--bg-card)',
        border: `1px solid ${hov ? 'var(--text-muted)' : 'var(--border-color)'}`,
        borderRadius: '18px', marginBottom: '8px',
        boxShadow: hov ? '0 8px 30px rgba(0,0,0,0.05)' : 'none',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        overflow: 'hidden', position: 'relative',
        animation: `inv_slideIn 0.4s ease ${index * 0.06}s both`,
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: hov ? `linear-gradient(${statusColor},${statusColor}88)` : 'transparent',
        transition: 'background 0.22s',
      }}/>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 2fr 1fr 0.3fr',
        alignItems: 'center', gap: '20px',
        padding: '18px 20px 18px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '13px', flexShrink: 0,
            background: statusBg, border: `1.5px solid ${statusBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: hov ? `0 0 16px ${statusGlow}` : 'none',
            transition: 'box-shadow 0.22s',
          }}>
            {isPaid ? <ICheck size={20} color={statusColor}/> : <IClock size={20} color={statusColor}/>}
          </div>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 900, color: 'var(--text-main)',
              marginBottom: '3px', fontFamily: 'monospace',
              letterSpacing: '-0.3px',
            }}>
              {inv.id}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <IClock size={10} color="var(--text-muted)"/>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {inv.time}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-muted)', opacity: 0.5, textTransform: 'uppercase', marginBottom: '8px' }}>
            Dispatched Items
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {inv.items.slice(0, 3).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 10px', borderRadius: '8px 0 0 8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRight: 'none',
                }}>
                  <IBox size={11} color="var(--text-muted)"/>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {item.code}
                  </span>
                </div>
                <div style={{
                  padding: '5px 8px', borderRadius: '0 8px 8px 0',
                  background: 'rgba(249,115,22,0.15)',
                  border: '1px solid rgba(249,115,22,0.25)',
                  fontSize: '11px', fontWeight: 900, color: '#f97316',
                }}>
                  ×{item.qty}
                </div>
              </div>
            ))}
            {inv.items.length > 3 && (
              <div style={{
                padding: '5px 10px', borderRadius: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
              }}>
                +{inv.items.length - 3} more
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-muted)', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Amount
          </p>
          <div style={{
            fontSize: '18px', fontWeight: 900, color: 'var(--text-main)',
          }}>
            {inv.amount}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            marginTop: '4px', padding: '2px 8px', borderRadius: '6px',
            background: statusBg, border: `1px solid ${statusBorder}`,
            fontSize: '9px', fontWeight: 800, color: statusColor,
            letterSpacing: '0.8px', textTransform: 'uppercase',
          }}>
            <IZap size={9}/> {inv.status}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {inv.items.length > 0 && (
            <button
              onClick={() => setExp(!exp)}
              style={{
                width: '32px', height: '32px', borderRadius: '9px',
                background: exp ? 'rgba(249,115,22,0.12)' : 'var(--bg-main)',
                border: `1px solid ${exp ? 'rgba(249,115,22,0.3)' : 'var(--border-color)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: exp ? '#f97316' : 'var(--text-muted)',
                transform: exp ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'all 0.3s', flexShrink: 0,
              }}
            >
              <IChevron size={14}/>
            </button>
          )}
        </div>
      </div>

      <div style={{
        maxHeight: exp ? `${inv.items.length * 48 + 40}px` : '0',
        overflow: 'hidden', transition: 'max-height 0.35s ease',
      }}>
        <div style={{
          padding: '0 20px 18px 24px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '14px',
        }}>
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            All Items ({inv.items.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '8px' }}>
            {inv.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px', borderRadius: '10px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IBox size={12} color="var(--text-muted)"/>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {item.code}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 900, color: '#f97316',
                  background: 'rgba(249,115,22,0.12)',
                  padding: '2px 8px', borderRadius: '6px',
                  border: '1px solid rgba(249,115,22,0.2)',
                }}>
                  ×{item.qty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN ───────────────────────────────────────────────
const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices]       = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);
  const [focused, setFocused]         = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:8080/api/sales/all');
      if (!response.ok) throw new Error('Failed to fetch');
      const backendData = await response.json();
      const todayStr = new Date().toDateString();

      const todaysSales = backendData.filter(sale =>
        new Date(sale.saleDate).toDateString() === todayStr
      );

      const formatted = todaysSales.map(sale => {
        const d = new Date(sale.saleDate);
        return {
          id: sale.billId || `#SALE-${sale.id}`,
          time: isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: `LKR ${sale.totalAmount ? sale.totalAmount.toLocaleString() : '0'}`,
          rawAmount: sale.totalAmount || 0,
          status: 'Paid',
          items: sale.items ? sale.items.map(item => ({ code: item.productCode || 'N/A', qty: item.qty || 0 })) : [],
        };
      }).reverse();

      setInvoices(formatted);
    } catch (err) {
      setError("Could not load today's bills.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) setInvoices([]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setIsLoading(true);
    fetchData();
  };

  const totalBills  = invoices.length;
  const totalItems  = invoices.reduce((s, inv) => s + inv.items.reduce((ss, i) => ss + i.qty, 0), 0);
  const totalRevenue = invoices.reduce((s, inv) => s + inv.rawAmount, 0);

  const filtered = invoices.filter(inv =>
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.items.some(item => (item.code || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <style>{`
        @keyframes inv_slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes inv_spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes inv_pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes inv_float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>

      <div style={{
        padding: '28px 32px',
        fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
        backgroundColor: 'var(--bg-main)',
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px',
            color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.6,
          }}>
            <span>DASHBOARD</span><span>›</span>
            <span style={{ color: '#f97316' }}>DAILY OPERATIONS</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px', flexShrink: 0,
                background: 'linear-gradient(135deg,#f97316,#dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(249,115,22,0.3)',
                animation: 'inv_float 4s ease infinite',
              }}>
                <IReceipt size={26} color="#fff"/>
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px', margin: 0, marginBottom: '5px' }}>
                  Daily Operations
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
                  Overview of today's generated bills and dispatched items
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', borderRadius: '12px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              }}>
                <ICalendar size={14} color="#10b981"/>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{today}</span>
              </div>
              <button
                onClick={handleRefresh}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 16px', borderRadius: '12px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <span style={{ animation: refreshing ? 'inv_spin 0.8s linear infinite' : 'none', display: 'flex' }}>
                  <IRefresh size={14}/>
                </span>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <StatCard
            label="Bills Generated" subtitle="Today's total invoices"
            value={totalBills} prefix={totalBills < 10 ? '0' : ''}
            color="#3b82f6" glow="rgba(59,130,246,0.1)"
            bg="rgba(59,130,246,0.1)" border="rgba(59,130,246,0.2)"
            icon={<IReceipt size={20} color="#3b82f6"/>}
            delay={0}
          />
          <StatCard
            label="Parts Dispatched" subtitle="Total units sent out"
            value={totalItems} prefix={totalItems < 10 ? '0' : ''}
            color="#f97316" glow="rgba(249,115,22,0.1)"
            bg="rgba(249,115,22,0.1)" border="rgba(249,115,22,0.2)"
            icon={<IPackage size={20} color="#f97316"/>}
            delay={100}
          />
          <StatCard
            label="Total Revenue" subtitle="Today's earnings"
            value={totalRevenue}
            color="#10b981" glow="rgba(16,185,129,0.1)"
            bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.2)"
            icon={<IZap size={20}/>}
            delay={200}
          />
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
        }}>

          <div style={{
            padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IReceipt size={16} color="#3b82f6"/>
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Dispatched Records
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                  {filtered.length} invoice{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-main)',
              border: `1.5px solid ${focused ? '#f97316' : 'var(--border-color)'}`,
              borderRadius: '12px', padding: '8px 14px',
              minWidth: '260px', transition: 'all 0.2s',
            }}>
              <ISearch size={14} color="var(--text-muted)"/>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search Invoice ID or Item Code..."
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-main)', fontSize: '12px', width: '100%',
                }}
              />
            </div>
          </div>

          <div style={{ padding: '20px 24px', minHeight: '300px', position: 'relative' }}>
            {isLoading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-card)', opacity: 0.9, backdropFilter: 'blur(4px)',
              }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  border: '3px solid var(--border-color)', borderTopColor: '#f97316',
                  animation: 'inv_spin 0.9s linear infinite', marginBottom: '12px',
                }}/>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Loading today's operations...
                </p>
              </div>
            )}

            {error && !isLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ padding: '20px', color: '#ef4444' }}>⚠️ {error}</div>
              </div>
            )}

            {!isLoading && !error && filtered.map((inv, i) => (
              <InvoiceRow key={inv.id} inv={inv} index={i}/>
            ))}

            {!isLoading && !error && filtered.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                border: '2px dashed var(--border-color)', borderRadius: '18px',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>🧾</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {searchQuery ? 'No matching invoices' : 'No Operations Yet'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6 }}>
                  {searchQuery ? 'Try a different search term' : "Today's generated bills will appear here."}
                </p>
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-main)', opacity: 0.8,
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> of{' '}
              <strong style={{ color: 'var(--text-main)' }}>{invoices.length}</strong> today's invoices
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}/>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Resets at midnight</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Invoices;