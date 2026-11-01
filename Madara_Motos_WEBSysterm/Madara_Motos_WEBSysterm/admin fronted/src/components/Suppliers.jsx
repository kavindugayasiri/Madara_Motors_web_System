import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ── Icons ──────────────────────────────────────────────
const ITruck = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IBuilding = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M2 6h20"/><path d="M9 2v4"/><path d="M15 2v4"/>
  </svg>
);
const IPhone = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
  </svg>
);
const IMail = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const ISearch = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IHash = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const IStar = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IGlobe = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IMapPin = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);
const IChevron = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ── Avatar Colors ───────────────────────────────────────
const avatarPalette = [
  ['#f97316','#dc2626'], ['#3b82f6','#6366f1'], ['#22c55e','#16a34a'],
  ['#a855f7','#7c3aed'], ['#06b6d4','#0284c7'], ['#f59e0b','#d97706'],
  ['#ec4899','#db2777'], ['#14b8a6','#0d9488'],
];

// ── Stat Card ───────────────────────────────────────────
const StatCard = ({ label, value, color, glow, bg, border, icon, subtitle, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: '160px', padding: '22px 20px', borderRadius: '20px',
        background: hov ? `var(--card-hover-bg)` : 'var(--bg-card)',
        border: `1px solid ${hov ? color + '55' : 'var(--border-color)'}`,
        boxShadow: vis ? `0 0 ${hov ? '30px' : '15px'} ${glow}` : 'none',
        transform: vis ? `translateY(${hov ? '-3px' : '0'})` : 'translateY(12px)',
        opacity: vis ? 1 : 0,
        transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative', overflow: 'hidden', cursor: 'default',
      }}
    >
      <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:color, filter:'blur(35px)', opacity: hov?0.2:0.05, pointerEvents:'none' }}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
          <div>
            <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'2px', color:'var(--text-muted)', opacity:0.6, textTransform:'uppercase', marginBottom:'2px' }}>{label}</p>
            <p style={{ fontSize:'10px', color:'var(--text-muted)', fontWeight:500 }}>{subtitle}</p>
          </div>
          <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:bg, border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize:'44px', fontWeight:900, color, lineHeight:1, marginBottom:'12px', textShadow:`0 0 20px ${glow}` }}>{value}</div>
        <div style={{ height:'2px', borderRadius:'99px', background:'var(--border-color)', overflow:'hidden' }}>
          <div style={{ height:'100%', width: vis?'60%':'0%', background:`linear-gradient(90deg,${color},transparent)`, borderRadius:'99px', transition:'width 1.2s ease 0.3s' }}/>
        </div>
      </div>
    </div>
  );
};

// ── Supplier Card ───────────────────────────────────────
const SupplierCard = ({ supplier, index }) => {
  const [hov, setHov] = useState(false);
  const [exp, setExp] = useState(false);
  const colors = avatarPalette[index % avatarPalette.length];
  const initial = supplier.company ? supplier.company.charAt(0).toUpperCase() : 'S';
  const domain = supplier.email ? supplier.email.split('@')[1] : '';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); }}
      style={{
        background: hov ? 'var(--card-hover-bg)' : 'var(--bg-card)',
        border: `1px solid ${hov ? `${colors[0]}40` : 'var(--border-color)'}`,
        borderRadius: '18px', marginBottom: '8px',
        boxShadow: hov ? `0 8px 30px rgba(0,0,0,0.05), 0 0 0 1px ${colors[0]}20` : 'none',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        overflow: 'hidden', position: 'relative',
        animation: `sup_slideIn 0.4s ease ${index * 0.06}s both`,
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: hov ? `linear-gradient(${colors[0]},${colors[1]})` : 'transparent',
        transition: 'background 0.22s',
      }}/>

      {hov && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(105deg,transparent 40%,${colors[0]}05,transparent 60%)`,
        }}/>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr 1.8fr 1.6fr 0.3fr',
        alignItems: 'center', gap: '16px',
        padding: '18px 20px 18px 24px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Col 1: Avatar + Company + Rep */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '15px', flexShrink: 0,
            background: `linear-gradient(135deg,${colors[0]},${colors[1]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 900, color: '#fff',
            boxShadow: hov ? `0 6px 20px ${colors[0]}55` : `0 4px 12px ${colors[0]}30`,
            transition: 'box-shadow 0.22s',
            letterSpacing: '-0.5px',
          }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '14px', fontWeight: 800, color: hov ? 'var(--text-main)' : 'var(--text-main)',
              marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}>
              {supplier.company}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: colors[0], flexShrink: 0,
                boxShadow: `0 0 6px ${colors[0]}`,
              }}/>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {supplier.name}
              </span>
            </div>
          </div>
        </div>

        {/* Col 2: Supplier ID */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 11px', borderRadius: '9px',
            background: hov ? `${colors[0]}10` : 'var(--bg-main)',
            border: `1px solid ${hov ? colors[0] + '30' : 'var(--border-color)'}`,
            transition: 'all 0.22s',
          }}>
            <IHash size={11} color={hov ? colors[0] : 'var(--text-muted)'}/>
            <span style={{
              fontSize: '11px', fontFamily: 'monospace', fontWeight: 800,
              color: hov ? colors[0] : 'var(--text-muted)',
              letterSpacing: '0.5px', transition: 'color 0.22s',
            }}>
              {supplier.id}
            </span>
          </div>
        </div>

        {/* Col 3: Email */}
        <div>
          <a href={`mailto:${supplier.email}`} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: hov ? `${colors[0]}15` : 'var(--bg-main)',
              border: `1px solid ${hov ? colors[0] + '30' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.22s',
            }}>
              <IMail size={13} color={hov ? colors[0] : 'var(--text-muted)'}/>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color 0.2s' }}>
                {supplier.email || 'N/A'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop:'1px', opacity:0.6 }}>
                {domain ? `@${domain}` : ''}
              </div>
            </div>
          </a>
        </div>

        {/* Col 4: Phone */}
        <div>
          <a href={`tel:${supplier.phone?.replace(/\s+/g,'')}`} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: hov ? `${colors[0]}15` : 'var(--bg-main)',
              border: `1px solid ${hov ? colors[0] + '30' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.22s',
            }}>
              <IPhone size={13} color={hov ? colors[0] : 'var(--text-muted)'}/>
            </div>
            <span style={{
              fontSize: '13px', fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '0.3px', transition: 'color 0.2s',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {supplier.phone || 'N/A'}
            </span>
          </a>
        </div>

        {/* Col 5: Expand btn */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setExp(!exp)}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: exp ? `${colors[0]}15` : 'var(--bg-main)',
              border: `1px solid ${exp ? colors[0]+'30' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: exp ? colors[0] : 'var(--text-muted)',
              transform: exp ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'all 0.28s',
            }}
          >
            <IChevron size={13}/>
          </button>
        </div>
      </div>

      {/* ── Expanded Detail Panel ── */}
      <div style={{ maxHeight: exp ? '160px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px',
          padding: '0 20px 18px 24px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
        }}>
          {[
            { label: 'Supplier ID',  value: supplier.id,      icon: <IHash size={12} color={colors[0]}/>,      color: colors[0] },
            { label: 'Contact Rep',  value: supplier.name,    icon: <IBuilding size={12} color="var(--text-muted)"/>,    color: 'var(--text-main)' },
            { label: 'Address',      value: supplier.address, icon: <IMapPin size={12} color="#06b6d4"/>,      color: '#06b6d4' },
            { label: 'Phone',        value: supplier.phone,   icon: <IPhone size={12} color="#22c55e"/>,       color: '#22c55e' },
          ].map(d => (
            <div key={d.label} style={{
              padding: '10px 14px', borderRadius: '12px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'6px' }}>
                {d.icon}
                <span style={{ fontSize:'9px', fontWeight:800, letterSpacing:'1.2px', color:'var(--text-muted)', textTransform:'uppercase' }}>
                  {d.label}
                </span>
              </div>
              <div style={{ fontSize:'12px', fontWeight:800, color:d.color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={d.value}>
                {d.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── MAIN ───────────────────────────────────────────────
const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused]         = useState(false);
  const [suppliers, setSuppliers]     = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/api/suppliers')
      .then(res => {
        const formattedData = res.data.map(sup => ({
          id: `SUP-${String(sup.id).padStart(4, '0')}`, 
          name: sup.supplierName || 'Unknown Rep',
          company: sup.company || 'Unknown Company',
          phone: sup.contactNumber || 'N/A',
          email: sup.email || 'N/A',
          address: sup.address || 'Address Not Provided',
          rating: 4.8 
        }));
        setSuppliers(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching suppliers:", err);
        setLoading(false);
      });
  }, []);

  const filtered = suppliers.filter(s => {
    const q = searchQuery.toLowerCase();
    return !q ||
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
  });

  const uniqueCompaniesCount = [...new Set(suppliers.map(s => s.company))].length;
  const avgRating = suppliers.length > 0 ? (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1) : "0.0";

  return (
    <>
      <style>{`
        @keyframes sup_slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sup_float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes sup_pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div style={{
        padding: '28px 32px',
        fontFamily: "'Inter',-apple-system,sans-serif",
        backgroundColor: 'var(--bg-main)',
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1.2px', color:'var(--text-muted)', marginBottom:'12px', display:'flex', gap:'6px', opacity:0.7 }}>
            <span>DASHBOARD</span><span>›</span><span style={{color:'#f97316'}}>SUPPLIER NETWORK</span>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
              <div style={{
                width:'54px', height:'54px', borderRadius:'17px', flexShrink:0,
                background:'linear-gradient(135deg,#f97316,#dc2626)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 8px 28px rgba(249,115,22,0.3)',
                animation:'sup_float 4s ease infinite',
              }}>
                <ITruck size={24} color="#fff"/>
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'5px' }}>
                  <h1 style={{ fontSize:'26px', fontWeight:900, color:'var(--text-main)', letterSpacing:'-0.3px', margin:0 }}>
                    Supplier Network
                  </h1>
                  <div style={{
                    display:'flex', alignItems:'center', gap:'6px',
                    padding:'5px 12px', borderRadius:'99px',
                    background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.25)',
                  }}>
                    <ITruck size={11} color="#f97316"/>
                    <span style={{ fontSize:'10px', fontWeight:800, color:'#f97316', letterSpacing:'1px' }}>
                      {suppliers.length} PARTNERS
                    </span>
                  </div>
                </div>
                <p style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:500, margin:0 }}>
                  Read-only directory of all registered suppliers, distributors, and business partners
                </p>
              </div>
            </div>

            {/* Search */}
            <div style={{
              display:'flex', alignItems:'center', gap:'9px',
              background:'var(--bg-card)',
              border:`1.5px solid ${focused?'#f97316':'var(--border-color)'}`,
              borderRadius:'14px', padding:'9px 16px',
              minWidth:'280px', transition:'all 0.2s',
            }}>
              <ISearch size={14} color="var(--text-muted)"/>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search company, name or ID..."
                style={{ background:'none', border:'none', outline:'none', color:'var(--text-main)', fontSize:'13px', width:'100%' }}
              />
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display:'flex', gap:'14px', marginBottom:'28px', flexWrap:'wrap' }}>
          <StatCard label="Total Partners" subtitle="Registered suppliers" value={suppliers.length}
            color="#f97316" glow="rgba(249,115,22,0.15)" bg="rgba(249,115,22,0.1)" border="rgba(249,115,22,0.2)"
            icon={<ITruck size={20} color="#f97316"/>} delay={0}
          />
          <StatCard label="Companies" subtitle="Unique businesses" value={uniqueCompaniesCount}
            color="#3b82f6" glow="rgba(59,130,246,0.15)" bg="rgba(59,130,246,0.1)" border="rgba(59,130,246,0.2)"
            icon={<IBuilding size={20} color="#3b82f6"/>} delay={80}
          />
          <StatCard label="Avg. Rating" subtitle="Partner satisfaction" value={avgRating}
            color="#f59e0b" glow="rgba(245,158,11,0.15)" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.2)"
            icon={<IStar size={20} color="#f59e0b"/>} delay={160}
          />
          <StatCard label="Active Now" subtitle="Available partners" value={suppliers.length}
            color="#10b981" glow="rgba(16,185,129,0.15)" bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.2)"
            icon={<IGlobe size={20} color="#10b981"/>} delay={240}
          />
        </div>

        {/* ── MAIN PANEL ── */}
        <div style={{
          background:'var(--bg-card)',
          border:'1px solid var(--border-color)',
          borderRadius:'24px', overflow:'hidden',
          boxShadow:'0 10px 40px rgba(0,0,0,0.05)',
        }}>

          <div style={{
            display:'grid', gridTemplateColumns:'2fr 1.2fr 1.8fr 1.6fr 0.3fr',
            gap:'16px', padding:'14px 20px 14px 24px',
            borderBottom:'1px solid var(--border-color)',
            background:'var(--bg-main)', opacity: 0.8,
          }}>
            {['COMPANY & REP','SUPPLIER ID','EMAIL ADDRESS','CONTACT NUMBER',''].map((h, i) => (
              <div key={i} style={{ fontSize:'9px', fontWeight:800, letterSpacing:'1.5px', color:'var(--text-muted)', textTransform:'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          <div style={{ padding:'16px 0', minHeight: '300px', backgroundColor: 'var(--bg-card)' }}>
            {loading ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color: 'var(--text-muted)' }}>
                Loading Backend Data...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((s, i) => <SupplierCard key={s.id} supplier={s} index={i}/>)
            ) : (
              <div style={{ textAlign:'center', padding:'60px 20px', border:'2px dashed var(--border-color)', borderRadius:'18px', margin:'16px 24px' }}>
                <div style={{ fontSize:'44px', marginBottom:'12px', animation:'sup_float 3s ease infinite' }}>🔍</div>
                <h3 style={{ fontSize:'16px', fontWeight:800, color:'var(--text-main)', marginBottom:'6px' }}>
                  No suppliers found
                </h3>
                <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>
                  Try a different search term or add a new supplier to the database.
                </p>
              </div>
            )}
          </div>

          <div style={{
            padding:'14px 24px', borderTop:'1px solid var(--border-color)',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'var(--bg-main)', opacity: 0.8,
          }}>
            <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>
              Showing <strong style={{color:'var(--text-main)'}}>{filtered.length}</strong> of{' '}
              <strong style={{color:'var(--text-main)'}}>{suppliers.length}</strong> partners
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981', animation:'sup_pulse 2s infinite' }}/>
              <span style={{ fontSize:'10px', color:'var(--text-muted)' }}>Connected to Database</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Suppliers;