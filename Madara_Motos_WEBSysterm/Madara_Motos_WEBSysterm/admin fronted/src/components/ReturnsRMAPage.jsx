import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Search, Package, DollarSign, X, Eye, 
  FileText, ArrowRightLeft, TrendingDown, Calendar,
  ChevronRight, AlertCircle
} from 'lucide-react';

const ReturnsRMAPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [focused, setFocused] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [rmaList, setRmaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/returns/all');
        const data = Array.isArray(response.data) ? response.data : (response.data.content || []);
        const formattedData = data.map(r => {
          let type = 'Product';
          if (r.returnType === 'Cash Return' || r.returnType === 'Cash') type = 'Cash';
          return {
            id: String(r.id || `RMA-${Math.floor(Math.random() * 9000) + 1000}`),
            date: r.returnDate || new Date().toISOString(),
            invoice: String(r.billId || 'N/A'),
            itemCode: String(r.productCode || 'N/A'),
            itemName: String(r.productName || 'Unknown'),
            qty: Number(r.quantity || 1),
            returnType: type,
            refundAmt: Number(r.refundAmount || 0)
          };
        });
        setRmaList(formattedData.reverse());
      } catch (error) {
        console.error("Error fetching returns data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const filteredList = rmaList.filter(r => {
    const query = searchQuery.toLowerCase();
    const searchMatch = r.id.toLowerCase().includes(query) ||
                        r.invoice.toLowerCase().includes(query) ||
                        r.itemName.toLowerCase().includes(query) ||
                        r.itemCode.toLowerCase().includes(query);
    const typeMatch = filterType === 'All' || r.returnType === filterType;
    const dateMatch = !filterDate || r.date.startsWith(filterDate);
    return searchMatch && typeMatch && dateMatch;
  });

  const totalRefund = rmaList.reduce((sum, r) => sum + (r.returnType === 'Cash' ? r.refundAmt : 0), 0);

  const summaryCards = [
    {
      title: "Total Returned Bills",
      count: new Set(rmaList.map(r => r.invoice)).size,
      icon: <FileText size={18}/>,
      color: '#f59e0b',
      darkColor: '#d97706',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      bgGrad: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
      border: 'rgba(245,158,11,0.22)',
      shadow: 'rgba(245,158,11,0.18)',
      sub: 'Unique invoices',
    },
    {
      title: "Cash Returns",
      count: rmaList.filter(r => r.returnType === 'Cash').length,
      icon: <DollarSign size={18}/>,
      color: '#10b981',
      darkColor: '#059669',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      bgGrad: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
      border: 'rgba(16,185,129,0.22)',
      shadow: 'rgba(16,185,129,0.18)',
      sub: `Rs. ${totalRefund.toLocaleString()} refunded`,
    },
    {
      title: "Product Exchanges",
      count: rmaList.filter(r => r.returnType === 'Product').length,
      icon: <ArrowRightLeft size={18}/>,
      color: '#3b82f6',
      darkColor: '#2563eb',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      bgGrad: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
      border: 'rgba(59,130,246,0.22)',
      shadow: 'rgba(59,130,246,0.18)',
      sub: 'Items exchanged',
    },
    {
      title: "Total Items Returned",
      count: rmaList.reduce((sum, r) => sum + r.qty, 0),
      icon: <Package size={18}/>,
      color: '#8b5cf6',
      darkColor: '#7c3aed',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      bgGrad: 'linear-gradient(145deg, #faf5ff 0%, #ede9fe 100%)',
      border: 'rgba(139,92,246,0.22)',
      shadow: 'rgba(139,92,246,0.18)',
      sub: 'Units returned',
    },
  ];

  return (
    <>
      <style>{`
        /* ═══════════════════════════════
           KEYFRAMES
        ═══════════════════════════════ */
        @keyframes rmaBorderFlow {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes rmaShimmerLoop {
          0%,100% { left: -60%; opacity: 0; }
          40%      { left: 110%; opacity: 1; }
          41%      { opacity: 0; }
        }
        @keyframes rmaBlobFloat {
          0%,100% { transform: translate(0,0)      scale(1);    }
          50%      { transform: translate(5px,-7px) scale(1.08); }
        }
        @keyframes rmaSpinner {
          to { transform: rotate(360deg); }
        }
        @keyframes rmaGlowPulse {
          0%,100% { box-shadow: 0 8px 24px rgba(249,115,22,0.35); }
          50%      { box-shadow: 0 8px 40px rgba(249,115,22,0.65); }
        }
        @keyframes rmaDotPulse {
          0%,100% { transform: scale(1);   opacity: 1;   }
          50%      { transform: scale(1.5); opacity: 0.5; }
        }
        @keyframes rmaRowIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        @keyframes rmaLoadBar {
          0%   { width: 0%;    }
          100% { width: 100%;  }
        }
        @keyframes rmaCardCountIn {
          from { opacity: 0; transform: translateY(8px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes rmaSkeletonPulse {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }

        /* ═══════════════════════════════
           SUMMARY CARDS
        ═══════════════════════════════ */
        .rma-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          cursor: default;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rma-card:hover {
          transform: translateY(-8px) scale(1.025) !important;
        }
        .rma-card:hover .rma-card-shimmer {
          animation: rmaShimmerLoop 0.8s ease forwards !important;
        }
        .rma-card:hover .rma-card-icon-wrap {
          transform: rotate(-8deg) scale(1.12) !important;
        }
        .rma-card-icon-wrap {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rma-card-shimmer {
          position: absolute;
          top: 0; left: -60%;
          width: 45%; height: 100%;
          transform: skewX(-15deg);
          pointer-events: none;
          z-index: 4;
          opacity: 0;
        }
        .rma-card-count {
          animation: rmaCardCountIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .rma-skeleton {
          animation: rmaSkeletonPulse 1.5s ease infinite;
          border-radius: 4px;
          display: inline-block;
        }

        /* ═══════════════════════════════
           TABLE ROWS
        ═══════════════════════════════ */
        .rma-tr {
          transition: all 0.22s ease;
          animation: rmaRowIn 0.35s ease both;
        }
        .rma-tr:hover {
          background: linear-gradient(90deg, rgba(249,115,22,0.04), transparent) !important;
          transform: translateX(3px);
        }
        .rma-tr:hover .rma-invoice-pill {
          background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.06)) !important;
          border-color: rgba(249,115,22,0.4) !important;
          color: #f97316 !important;
        }
        .rma-tr:hover .rma-view-btn {
          background: linear-gradient(135deg, #f97316, #ea580c) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 6px 18px rgba(249,115,22,0.32) !important;
          transform: translateY(-1px) scale(1.05) !important;
        }

        /* ═══════════════════════════════
           MISC
        ═══════════════════════════════ */
        .rma-view-btn {
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rma-invoice-pill {
          transition: all 0.22s ease;
        }
        .rma-search-box {
          transition: all 0.25s ease;
        }
        .rma-search-box:focus-within {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important;
        }
        .rma-select {
          appearance: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .rma-select:hover  { border-color: #f97316 !important; }
        .rma-select:focus  { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important; outline: none; }
        .rma-date-input    { transition: border-color 0.2s ease; }
        .rma-date-input:hover { border-color: #f97316 !important; }
        .rma-date-input:focus { border-color: #f97316 !important; outline: none; box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important; }
        .rma-modal-row { transition: background 0.18s ease; border-radius: 10px; }
        .rma-modal-row:hover { background: var(--bg-main) !important; }
        .custom-scrollbar::-webkit-scrollbar { height: 5px; width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ padding: '0 20px', fontFamily: "'Inter', sans-serif" }}
      >

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            PAGE HEADER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <motion.div
              animate={{ rotate: [0, -15, 15, -8, 8, 0] }}
              transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                padding: '11px', borderRadius: '14px',
                color: '#fff', flexShrink: 0,
                animation: 'rmaGlowPulse 3s ease-in-out infinite',
              }}
            >
              <RotateCcw size={22} />
            </motion.div>
            <div>
              <h1 style={{
                margin: 0, color: 'var(--text-main)',
                fontSize: '24px', fontWeight: 900,
                letterSpacing: '-0.5px', lineHeight: 1.2,
              }}>
                Returns & RMAs Log
              </h1>
              <p style={{
                margin: '3px 0 0', color: 'var(--text-muted)',
                fontSize: '12px', fontWeight: 500,
              }}>
                Shop-wide summary of returned items, product exchanges & cash refunds.
              </p>
            </div>
          </div>

          {/* Live badge */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.06))',
              border: '1.5px solid rgba(249,115,22,0.28)',
              padding: '6px 14px', borderRadius: '20px',
              fontSize: '12px', color: '#f97316', fontWeight: '700',
            }}
          >
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#f97316', display: 'inline-block',
              animation: 'rmaDotPulse 1.4s ease infinite',
            }} />
            Live Records
          </motion.div>
        </motion.div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            SUMMARY CARDS  (compact)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}>
          {summaryCards.map((card, i) => (
            <motion.div
              key={i}
              className="rma-card"
              initial={{ opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              transition={{ delay: i * 0.07, duration: 0.4, type: 'spring', stiffness: 220 }}
              style={{
                background: card.bgGrad,
                border: `1.5px solid ${card.border}`,
                boxShadow: `0 4px 20px ${card.shadow}`,
              }}
            >
              {/* Animated top bar */}
              <div style={{
                height: '3px',
                background: card.gradient,
                backgroundSize: '200% 100%',
                animation: `rmaBorderFlow 3s linear infinite ${i * 0.5}s`,
                borderRadius: '16px 16px 0 0',
              }} />

              {/* Shimmer */}
              <div className="rma-card-shimmer"
                style={{ background: `linear-gradient(90deg, transparent, ${card.color}12, transparent)` }}
              />

              {/* BG blob */}
              <div style={{
                position: 'absolute', right: '-16px', bottom: '-16px',
                width: '85px', height: '85px', borderRadius: '50%',
                background: `radial-gradient(circle, ${card.color}18 0%, transparent 70%)`,
                pointerEvents: 'none', zIndex: 1,
                animation: `rmaBlobFloat 4s ease-in-out infinite ${i * 0.6}s`,
              }} />

              {/* Bottom accent */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${card.color}35, transparent)`,
                borderRadius: '0 0 16px 16px',
                pointerEvents: 'none', zIndex: 1,
              }} />

              {/* Content */}
              <div style={{ padding: '14px 16px 16px', position: 'relative', zIndex: 5 }}>

                {/* Icon row */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <div className="rma-card-icon-wrap" style={{
                    background: `linear-gradient(135deg, ${card.color}20, ${card.color}38)`,
                    color: card.color,
                    padding: '9px', borderRadius: '11px',
                    display: 'flex',
                    boxShadow: `0 4px 14px ${card.color}28`,
                    border: `1.5px solid ${card.color}25`,
                  }}>
                    {card.icon}
                  </div>

                  {/* Status badge */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 280 }}
                    style={{
                      background: loading
                        ? 'rgba(100,116,139,0.08)'
                        : card.count === 0
                          ? 'rgba(100,116,139,0.08)'
                          : `${card.color}18`,
                      border: `1px solid ${
                        loading || card.count === 0
                          ? 'rgba(100,116,139,0.18)'
                          : card.color + '32'
                      }`,
                      padding: '3px 8px', borderRadius: '20px',
                      fontSize: '9px', fontWeight: '800',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      color: loading || card.count === 0 ? '#94a3b8' : card.color,
                    }}
                  >
                    {loading ? '...' : card.count === 0 ? 'Empty' : 'Active'}
                  </motion.div>
                </div>

                {/* Label */}
                <p style={{
                  margin: '0 0 4px',
                  color: 'var(--text-muted)',
                  fontSize: '10px', fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: '0.7px',
                }}>{card.title}</p>

                {/* Count */}
                <motion.h2
                  key={`${card.count}-${i}`}
                  className="rma-card-count"
                  initial={{ opacity: 0, y: 6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 240, delay: 0.18 + i * 0.07 }}
                  style={{
                    margin: '0 0 5px',
                    fontSize: '28px', fontWeight: '900',
                    color: card.darkColor, lineHeight: 1,
                    letterSpacing: '-1px',
                  }}
                >
                  {loading ? (
                    <span className="rma-skeleton" style={{
                      width: '42px', height: '6px',
                      background: `${card.color}30`,
                      verticalAlign: 'middle',
                    }} />
                  ) : card.count}
                </motion.h2>

                {/* Sub */}
                <p style={{
                  margin: 0, fontSize: '11px',
                  color: 'var(--text-muted)', fontWeight: '600',
                }}>{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            MAIN TABLE CONTAINER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 35px rgba(0,0,0,0.05)',
          }}
        >

          {/* ── TOOLBAR ── */}
          <div style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', flexWrap: 'wrap',
            gap: '10px', alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-main)',
          }}>

            {/* Left title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.14), rgba(249,115,22,0.06))',
                border: '1px solid rgba(249,115,22,0.2)',
                padding: '7px', borderRadius: '9px',
                color: '#f97316', display: 'flex',
              }}>
                <TrendingDown size={15} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '13px', color: 'var(--text-main)' }}>
                  Return Records
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {filteredList.length} of {rmaList.length} records
                </p>
              </div>
            </div>

            {/* Right filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>

              {/* Search */}
              <div className="rma-search-box" style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: 'var(--bg-card)',
                border: `1.5px solid ${focused ? '#f97316' : 'var(--border-color)'}`,
                borderRadius: '10px', padding: '8px 12px',
                minWidth: '230px',
                boxShadow: focused ? '0 0 0 3px rgba(249,115,22,0.12)' : 'none',
              }}>
                <Search size={14} color={focused ? '#f97316' : 'var(--text-muted)'}
                  style={{ transition: '0.2s', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search invoice, item..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--text-main)', fontSize: '12px',
                    width: '100%', fontWeight: 500,
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 0,
                    display: 'flex', transition: '0.2s',
                  }}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Type filter */}
              <select
                className="rma-select"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '12px', fontWeight: '600',
                }}
              >
                <option value="All">All Return Types</option>
                <option value="Cash">Cash Returns</option>
                <option value="Product">Product Exchanges</option>
              </select>

              {/* Date filter */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Calendar size={13} style={{
                  position: 'absolute', left: '10px',
                  color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1,
                }} />
                <input
                  type="date"
                  className="rma-date-input"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 30px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '12px', fontWeight: '600',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{
                  width: '40px', height: '40px',
                  border: '3px solid rgba(249,115,22,0.15)',
                  borderTop: '3px solid #f97316',
                  borderRadius: '50%',
                  animation: 'rmaSpinner 0.75s linear infinite',
                  margin: '0 auto 14px',
                }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '13px', margin: 0 }}>
                  Loading return records...
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, var(--bg-main), var(--bg-card))',
                    borderBottom: '2px solid var(--border-color)',
                  }}>
                    {[
                      { label: 'Invoice Details', align: 'left'   },
                      { label: 'Return Type',     align: 'center' },
                      { label: 'Returned Item',   align: 'left'   },
                      { label: 'Return Amount',   align: 'right'  },
                      { label: 'Action',          align: 'center' },
                    ].map((h, i) => (
                      <th key={i} style={{
                        padding: '13px 18px',
                        color: 'var(--text-muted)',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.8px',
                        textAlign: h.align,
                        whiteSpace: 'nowrap',
                      }}>{h.label}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '55px 20px', textAlign: 'center' }}>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1,   opacity: 1 }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                        >
                          <div style={{
                            background: 'rgba(249,115,22,0.08)',
                            border: '2px solid rgba(249,115,22,0.15)',
                            padding: '18px', borderRadius: '50%',
                            color: '#f97316',
                          }}>
                            <AlertCircle size={28} />
                          </div>
                          <p style={{ margin: 0, fontWeight: '800', color: 'var(--text-main)', fontSize: '14px' }}>
                            No Records Found
                          </p>
                          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px' }}>
                            No return records match your search criteria
                          </p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((rma, idx) => (
                      <motion.tr
                        key={idx}
                        className="rma-tr"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1,  x: 0   }}
                        transition={{ delay: idx * 0.045, duration: 0.28 }}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          background: hoveredRow === idx
                            ? 'linear-gradient(90deg, rgba(249,115,22,0.04), transparent)'
                            : 'var(--bg-card)',
                          animationDelay: `${idx * 0.045}s`,
                        }}
                      >

                        {/* 1. INVOICE */}
                        <td style={{ padding: '14px 18px' }}>
                          <div
                            className="rma-invoice-pill"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border-color)',
                              padding: '6px 11px', borderRadius: '9px',
                              color: 'var(--text-main)',
                              fontWeight: '800', fontSize: '12px',
                              marginBottom: '5px',
                            }}
                          >
                            <FileText size={13} color="#f97316" />
                            {rma.invoice}
                          </div>
                          <div style={{
                            fontSize: '11px', color: 'var(--text-muted)',
                            fontWeight: '600', display: 'flex',
                            alignItems: 'center', gap: '4px',
                          }}>
                            <Calendar size={10} />
                            {new Date(rma.date).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </div>
                        </td>

                        {/* 2. RETURN TYPE */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          {rma.returnType === 'Cash' ? (
                            <span style={{
                              background: 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(16,185,129,0.07))',
                              color: '#059669',
                              border: '1.5px solid rgba(16,185,129,0.28)',
                              padding: '6px 12px', borderRadius: '20px',
                              fontSize: '10.5px', fontWeight: '800',
                              textTransform: 'uppercase',
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              letterSpacing: '0.3px',
                              boxShadow: '0 2px 8px rgba(16,185,129,0.14)',
                            }}>
                              <DollarSign size={12} /> Cash Return
                            </span>
                          ) : (
                            <span style={{
                              background: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(59,130,246,0.07))',
                              color: '#2563eb',
                              border: '1.5px solid rgba(59,130,246,0.28)',
                              padding: '6px 12px', borderRadius: '20px',
                              fontSize: '10.5px', fontWeight: '800',
                              textTransform: 'uppercase',
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              letterSpacing: '0.3px',
                              boxShadow: '0 2px 8px rgba(59,130,246,0.14)',
                            }}>
                              <Package size={12} /> Product Return
                            </span>
                          )}
                        </td>

                        {/* 3. ITEM */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{
                            fontWeight: '800',
                            color: 'var(--text-main)',
                            marginBottom: '5px',
                            fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '7px',
                          }}>
                            {rma.itemName}
                            <span style={{
                              color: '#f97316',
                              background: 'rgba(249,115,22,0.1)',
                              border: '1px solid rgba(249,115,22,0.2)',
                              padding: '1px 7px', borderRadius: '7px',
                              fontSize: '11px', fontWeight: '800',
                            }}>×{rma.qty}</span>
                          </div>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            padding: '2px 7px', borderRadius: '6px',
                            fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '600',
                          }}>
                            <Package size={9} /> {rma.itemCode}
                          </div>
                        </td>

                        {/* 4. AMOUNT */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{
                            fontWeight: '900',
                            color: rma.returnType === 'Cash' ? '#059669' : 'var(--text-main)',
                            fontSize: '15px',
                            letterSpacing: '-0.3px',
                          }}>
                            Rs. {Number(rma.refundAmt || 0).toLocaleString()}
                          </div>
                          <div style={{
                            fontSize: '10px', color: 'var(--text-muted)',
                            fontWeight: '600', marginTop: '2px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'flex-end', gap: '3px',
                          }}>
                            {rma.returnType === 'Cash'
                              ? <><DollarSign size={9}/> Refunded</>
                              : <><Package size={9}/> Item Value</>
                            }
                          </div>
                        </td>

                        {/* 5. ACTION */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            className="rma-view-btn"
                            onClick={() => { setSelectedReturn(rma); setShowViewModal(true); }}
                            style={{
                              background: 'var(--bg-main)',
                              border: '1.5px solid var(--border-color)',
                              padding: '7px 14px', borderRadius: '9px',
                              color: 'var(--text-main)',
                              fontWeight: '700', fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                            }}
                          >
                            <Eye size={13} /> View <ChevronRight size={11} />
                          </button>
                        </td>

                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* ── FOOTER ── */}
          {!loading && filteredList.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '8px',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                Showing{' '}
                <strong style={{ color: 'var(--text-main)' }}>{filteredList.length}</strong>
                {' '}of{' '}
                <strong style={{ color: 'var(--text-main)' }}>{rmaList.length}</strong>
                {' '}records
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                padding: '5px 12px', borderRadius: '20px',
                fontSize: '12px', color: '#059669', fontWeight: '700',
              }}>
                <DollarSign size={12} />
                Total Refunded: Rs. {totalRefund.toLocaleString()}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            VIEW MODAL
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <AnimatePresence>
          {showViewModal && selectedReturn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.52)',
                backdropFilter: 'blur(8px)',
                display: 'flex', justifyContent: 'center',
                alignItems: 'center', zIndex: 1000, padding: '20px',
              }}
              onClick={e => { if (e.target === e.currentTarget) setShowViewModal(false); }}
            >
              <motion.div
                initial={{ scale: 0.82, opacity: 0, y: 28 }}
                animate={{ scale: 1,    opacity: 1, y: 0  }}
                exit={{ scale: 0.82, opacity: 0, y: 28 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                style={{
                  background: 'var(--bg-card)',
                  width: '100%', maxWidth: '440px',
                  borderRadius: '24px', overflow: 'hidden',
                  border: '1.5px solid var(--border-color)',
                  boxShadow: '0 30px 70px rgba(0,0,0,0.22)',
                }}
              >

                {/* Modal Header */}
                <div style={{
                  padding: '20px 22px',
                  borderBottom: '1px solid var(--border-color)',
                  background: 'linear-gradient(135deg, var(--bg-main), var(--bg-card))',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', right: '-18px', top: '-18px',
                    width: '90px', height: '90px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      padding: '10px', borderRadius: '13px',
                      color: 'white',
                      boxShadow: '0 6px 18px rgba(249,115,22,0.35)',
                    }}>
                      <RotateCcw size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '17px', fontWeight: '900' }}>
                        Return Summary
                      </h3>
                      <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600' }}>
                        {selectedReturn.id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowViewModal(false)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      width: '32px', height: '32px',
                      borderRadius: '50%', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.borderColor = '#fca5a5';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bg-card)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Invoice Ref',   value: selectedReturn.invoice, color: '#f97316' },
                    { label: 'Return Date',   value: new Date(selectedReturn.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }), color: 'var(--text-main)' },
                    { label: 'Return Type',   value: `${selectedReturn.returnType} Return`, color: selectedReturn.returnType === 'Cash' ? '#10b981' : '#3b82f6' },
                    { label: 'Item Returned', value: selectedReturn.itemName, color: 'var(--text-main)', sub: `${selectedReturn.itemCode} · Qty: ${selectedReturn.qty}` },
                  ].map((row, i) => (
                    <motion.div
                      key={i}
                      className="rma-modal-row"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1,  x: 0  }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '11px 12px',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>
                        {row.label}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: row.color, fontSize: '13px', fontWeight: '800' }}>
                          {row.value}
                        </div>
                        {row.sub && (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                            {row.sub}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Total */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1,  y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center',
                      background: selectedReturn.returnType === 'Cash'
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))'
                        : 'var(--bg-main)',
                      padding: '16px 14px', borderRadius: '14px',
                      marginTop: '4px',
                      border: selectedReturn.returnType === 'Cash'
                        ? '1.5px solid rgba(16,185,129,0.2)'
                        : '1.5px solid var(--border-color)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '800' }}>
                      Total Value
                    </span>
                    <span style={{
                      color: selectedReturn.returnType === 'Cash' ? '#059669' : 'var(--text-main)',
                      fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px',
                    }}>
                      Rs. {Number(selectedReturn.refundAmt || 0).toLocaleString()}
                    </span>
                  </motion.div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </>
  );
};

export default ReturnsRMAPage;