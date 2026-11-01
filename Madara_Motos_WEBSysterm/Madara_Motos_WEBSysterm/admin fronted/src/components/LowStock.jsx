import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ── Icons ──────────────────────────────────────────────
const IconAlert = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconBox = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconSearch = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconSpark = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);
const IconTrend = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const IconRefresh = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);
const IconChevron = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconZap = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

// ── Urgency Config ──────────────────────────────────────
const getUrgency = (current, min) => {
  const ratio = current / (min || 1);
  if (ratio <= 0.3) return {
    level: 'Critical',
    color: '#ef4444', glow: 'rgba(239,68,68,0.2)',
    bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
    track: 'rgba(239,68,68,0.15)', rank: 3,
    gradient: 'linear-gradient(90deg,#ef4444,#dc2626)',
  };
  if (ratio <= 0.6) return {
    level: 'High',
    color: '#f97316', glow: 'rgba(249,115,22,0.2)',
    bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)',
    track: 'rgba(249,115,22,0.15)', rank: 2,
    gradient: 'linear-gradient(90deg,#f97316,#ea580c)',
  };
  return {
    level: 'Medium',
    color: '#eab308', glow: 'rgba(234,179,8,0.2)',
    bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)',
    track: 'rgba(234,179,8,0.15)', rank: 1,
    gradient: 'linear-gradient(90deg,#eab308,#ca8a04)',
  };
};

// ── Animated Counter ────────────────────────────────────
const AnimCounter = ({ target, duration = 900 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <span>{val}</span>;
};

// ── Progress Bar ────────────────────────────────────────
const ProgressBar = ({ pct, gradient, track }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{
      width: '100%', height: '6px', borderRadius: '99px',
      background: track, overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', borderRadius: '99px',
        background: gradient, width: `${width}%`,
        transition: 'width 1.1s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
          animation: 'ls_shimmer 2s infinite',
        }}/>
      </div>
    </div>
  );
};

// ── Stat Card ───────────────────────────────────────────
const StatCard = ({ label, value, color, glow, bg, border, icon, subtitle, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      flex: 1, minWidth: '170px',
      background: 'var(--bg-card)',
      border: `1px solid ${vis ? border : 'var(--border-color)'}`,
      borderRadius: '20px', padding: '24px 22px',
      position: 'relative', overflow: 'hidden',
      boxShadow: vis ? `0 0 30px ${glow}` : 'none',
      transform: vis ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
      opacity: vis ? 1 : 0,
      transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{
        position: 'absolute', top: '-25px', right: '-25px',
        width: '90px', height: '90px', borderRadius: '50%',
        background: color, filter: 'blur(35px)', opacity: 0.1, pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-muted)', opacity: 0.6, textTransform: 'uppercase', marginBottom: '3px' }}>
              {label}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{subtitle}</p>
          </div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: bg, border: `1px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {icon}
          </div>
        </div>

        <div style={{
          fontSize: '46px', fontWeight: 900, color: 'var(--text-main)',
          lineHeight: 1, marginBottom: '12px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <AnimCounter target={value} />
        </div>

        <div style={{ height: '2px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: vis ? '55%' : '0%',
            background: `linear-gradient(90deg,${color},transparent)`,
            borderRadius: '99px',
            transition: 'width 1.2s ease 0.4s',
          }}/>
        </div>
      </div>
    </div>
  );
};

// ── Stock Row ───────────────────────────────────────────
const StockRow = ({ item, index }) => {
  const [hov, setHov] = useState(false);
  const [exp, setExp] = useState(false);
  const current = item.stockQty || 0;
  const min = item.lowStockLimeted || 10;
  const needed = Math.max(0, min - current);
  const pct = Math.max(4, Math.min((current / min) * 100, 100));
  const u = getUrgency(current, min);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); }}
      style={{
        background: hov ? 'var(--card-hover-bg)' : 'var(--bg-card)',
        border: `1px solid ${hov ? u.border : 'var(--border-color)'}`,
        borderRadius: '16px', marginBottom: '8px',
        boxShadow: hov ? `0 6px 24px ${u.glow}` : 'none',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        overflow: 'hidden',
        animation: `ls_slideIn 0.4s ease ${index * 0.05}s both`,
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: hov ? u.gradient : 'transparent',
        transition: 'background 0.22s',
      }}/>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.5fr 0.6fr',
        alignItems: 'center', gap: '16px',
        padding: '18px 20px 18px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: u.bg, border: `1.5px solid ${u.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: hov ? `0 0 14px ${u.glow}` : 'none',
          }}>
            <IconBox size={20} color={u.color}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '14px', fontWeight: 800, color: 'var(--text-main)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginBottom: '3px',
            }}>
              {item.productName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
              {item.productCode}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 9px', borderRadius: '7px',
              background: u.bg, border: `1px solid ${u.border}`,
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.8px',
              color: u.color, textTransform: 'uppercase',
            }}>
              <IconZap size={9}/> {u.level}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
              {current} / {min}
            </span>
          </div>
          <ProgressBar pct={pct} gradient={u.gradient} track={u.track}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', opacity: 0.6 }}>{pct.toFixed(0)}% remaining</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', opacity: 0.6 }}>Min: {min} units</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <div style={{
            textAlign: 'right', padding: '8px 14px', borderRadius: '10px',
            background: 'var(--bg-main)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '2px', opacity: 0.6 }}>
              TO ORDER
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: u.color }}>+{needed}</div>
          </div>
          <button
            onClick={() => setExp(!exp)}
            style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: exp ? u.bg : 'var(--bg-main)',
              border: `1px solid ${exp ? u.border : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: exp ? u.color : 'var(--text-muted)',
              transform: exp ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'all 0.3s',
            }}
          >
            <IconChevron size={14}/>
          </button>
        </div>
      </div>

      <div style={{
        maxHeight: exp ? '110px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.32s ease',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px',
          padding: '0 20px 16px 24px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '14px',
        }}>
          {[
            { label: 'Current',  value: `${current} units`, color: u.color },
            { label: 'Minimum',  value: `${min} units`,     color: 'var(--text-muted)' },
            { label: 'Shortage', value: `${needed} units`,  color: '#ef4444' },
            { label: 'Health',   value: `${pct.toFixed(0)}%`, color: '#22d3ee' },
          ].map(d => (
            <div key={d.label} style={{
              background: 'var(--bg-main)', borderRadius: '9px',
              padding: '9px 12px', border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', opacity: 0.6, fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>
                {d.label.toUpperCase()}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: d.color }}>{d.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── MAIN ───────────────────────────────────────────────
const LowStock = () => {
  const [searchQuery, setSearchQuery]     = useState('');
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filterLevel, setFilterLevel]     = useState('ALL');
  const [sortBy, setSortBy]               = useState('urgency');
  const [focused, setFocused]             = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/api/spareparts/low-stock')
      .then(r => { setLowStockItems(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const criticalCount = lowStockItems.filter(i => (i.stockQty / (i.lowStockLimeted || 10)) <= 0.3).length;
  const highCount     = lowStockItems.filter(i => { const r = i.stockQty / (i.lowStockLimeted || 10); return r > 0.3 && r <= 0.6; }).length;
  const medCount      = lowStockItems.filter(i => (i.stockQty / (i.lowStockLimeted || 10)) > 0.6).length;

  const filtered = lowStockItems
    .filter(item => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || (item.productName||'').toLowerCase().includes(q) || (item.productCode||'').toLowerCase().includes(q);
      if (!matchQ) return false;
      if (filterLevel === 'ALL') return true;
      return getUrgency(item.stockQty||0, item.lowStockLimeted||10).level === filterLevel;
    })
    .sort((a, b) => {
      if (sortBy === 'urgency') return getUrgency(b.stockQty||0,b.lowStockLimeted||10).rank - getUrgency(a.stockQty||0,a.lowStockLimeted||10).rank;
      if (sortBy === 'name')    return (a.productName||'').localeCompare(b.productName||'');
      if (sortBy === 'stock')   return (a.stockQty||0) - (b.stockQty||0);
      return 0;
    });

  const filterColors = { ALL:'var(--text-muted)', Critical:'#ef4444', High:'#f97316', Medium:'#eab308' };

  return (
    <>
      <style>{`
        @keyframes ls_slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ls_shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes ls_pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes ls_spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ls_float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>

      <div style={{
        padding: '28px 32px',
        fontFamily: "'Inter',-apple-system,sans-serif",
        backgroundColor: 'var(--bg-main)',
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '10px', color: 'var(--text-muted)', opacity: 0.6,
            fontWeight: 700, letterSpacing: '1.2px', marginBottom: '10px',
          }}>
            <span>DASHBOARD</span>
            <span>›</span>
            <span style={{ color: '#f97316' }}>INVENTORY ALERTS</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px', margin: 0 }}>
                  Inventory Alerts
                </h1>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '99px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#ef4444', boxShadow: '0 0 8px #ef4444',
                    animation: 'ls_pulse 1.5s infinite',
                  }}/>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#ef4444', letterSpacing: '1.5px' }}>
                    LIVE · ACTION REQUIRED
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
                Items below minimum stock threshold · Reorder immediately
              </p>
            </div>

            <button
              onClick={() => { setLoading(true); axios.get('http://localhost:8080/api/spareparts/low-stock').then(r=>{setLowStockItems(r.data);setLoading(false);}).catch(()=>setLoading(false)); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', borderRadius: '12px',
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <IconRefresh size={14}/> Refresh
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <StatCard label="Critical Stock"   subtitle="Immediate action needed" value={criticalCount} color="#ef4444" glow="rgba(239,68,68,0.1)"   bg="rgba(239,68,68,0.08)"   border="rgba(239,68,68,0.2)"   icon={<IconAlert size={20} color="#ef4444"/>}           delay={0}  />
          <StatCard label="High Priority"    subtitle="Order within 24 hrs"    value={highCount}            color="#f97316" glow="rgba(249,115,22,0.1)"  bg="rgba(249,115,22,0.08)"  border="rgba(249,115,22,0.2)"  icon={<IconAlert size={20} color="#f97316"/>}           delay={80} />
          <StatCard label="Medium Priority"  subtitle="Monitor closely"        value={medCount}             color="#eab308" glow="rgba(234,179,8,0.1)"   bg="rgba(234,179,8,0.08)"   border="rgba(234,179,8,0.2)"   icon={<IconSpark size={20} color="#eab308"/>}           delay={160}/>
          <StatCard label="Total Low Stock"  subtitle="All items below min"    value={lowStockItems.length} color="#22d3ee" glow="rgba(34,211,238,0.1)"  bg="rgba(34,211,238,0.08)"  border="rgba(34,211,238,0.2)"  icon={<IconBox size={20} color="#22d3ee"/>}             delay={240}/>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
        }}>

          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex', flexWrap: 'wrap', gap: '14px',
            alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconAlert size={16} color="#f97316"/>
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Low Stock Records</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                  {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{
                display: 'flex', gap: '4px',
                background: 'var(--bg-main)', padding: '4px',
                borderRadius: '10px', border: '1px solid var(--border-color)',
              }}>
                {['ALL','Critical','High','Medium'].map(lv => (
                  <button key={lv}
                    onClick={() => setFilterLevel(lv)}
                    style={{
                      padding: '5px 12px', borderRadius: '7px', fontSize: '11px',
                      fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: filterLevel===lv ? `${lv==='ALL' ? '#3b82f6' : filterColors[lv]}20` : 'transparent',
                      color: filterLevel===lv ? (lv==='ALL' ? '#3b82f6' : filterColors[lv]) : 'var(--text-muted)',
                      transition: 'all 0.18s',
                    }}
                  >{lv}</button>
                ))}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-main)',
                border: `1.5px solid ${focused ? '#f97316' : 'var(--border-color)'}`,
                borderRadius: '12px', padding: '8px 14px',
                minWidth: '220px', transition: 'all 0.2s',
              }}>
                <IconSearch size={14} color="var(--text-muted)"/>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Search part or code..."
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    color: 'var(--text-main)', fontSize: '12px', width: '100%',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 24px', minHeight: '300px', position: 'relative' }}>
            {loading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-card)', opacity: 0.9, backdropFilter: 'blur(4px)',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '3px solid var(--border-color)', borderTopColor: '#f97316',
                  animation: 'ls_spin 0.9s linear infinite', marginBottom: '12px',
                }}/>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Loading inventory...
                </p>
              </div>
            )}

            {!loading && filtered.map((item, i) => (
              <StockRow key={item.productCode || i} item={item} index={i}/>
            ))}

            {!loading && filtered.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                border: '2px dashed var(--border-color)', borderRadius: '16px',
              }}>
                <div style={{ fontSize: '44px', marginBottom: '12px' }}>📦</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {searchQuery ? 'No matching items' : 'All stock levels are healthy!'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6 }}>
                  {searchQuery ? 'Try a different term' : 'No items below minimum threshold'}
                </p>
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-main)', opacity: 0.8,
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> of{' '}
              <strong style={{ color: 'var(--text-main)' }}>{lowStockItems.length}</strong> low stock items
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', opacity: 0.6 }}>Auto-refresh: every 5 min</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LowStock;