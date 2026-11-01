import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  ArrowUpRight, TrendingUp, TrendingDown,
  Package, Zap, Star, Layers, Calendar
} from 'lucide-react';

const useInView = (threshold = 0.05) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const AnimatedCounter = ({ target, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView || target === 0) return;
    let s = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      s += step;
      if (s >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target, duration]);
  return <span ref={ref}>{count}</span>;
};

const AnimatedStockBar = ({ percent, color, delay = 0 }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="w-14 h-1 rounded-full overflow-hidden flex-shrink-0"
      style={{ background: 'var(--border-color, rgba(0,0,0,0.08))' }}
    >
      <div
        className="h-full rounded-full relative"
        style={{
          width: inView ? `${percent}%` : '0%',
          background: color,
          boxShadow: `0 0 4px ${color}50`,
          transition: `width 1000ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)',
            animation: inView ? `tp-shine 2s ease-in-out ${delay + 1000}ms infinite` : 'none',
          }}
        />
      </div>
    </div>
  );
};

const AnimatedRow = ({ children, delay = 0, highlighted = false }) => {
  const [ref, inView] = useInView(0.04);
  const [hov, setHov] = useState(false);
  return (
    <tr
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="cursor-default"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-16px)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     background 0.2s ease`,
        background: hov
          ? 'rgba(249,115,22,0.04)'
          : highlighted
          ? 'rgba(249,115,22,0.02)'
          : 'transparent',
        borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.05))',
      }}
    >
      {children}
    </tr>
  );
};

const TopProducts = ({ onNavigate }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadDots, setLoadDots] = useState('');

  // ✅ Current month & year — always fixed
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  // ✅ Display label — eg: "May 2026"
  const currentMonthLabel = `${monthNames[currentMonth]} ${currentYear}`;

  useEffect(() => {
    const t = setInterval(() =>
      setLoadDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const [resSales, resParts] = await Promise.allSettled([
          axios.get('http://localhost:8080/api/sales/all'),
          axios.get('http://localhost:8080/api/spareparts/all'),
        ]);

        let sales = [];
        let partsData = [];

        if (resSales.status === 'fulfilled' && resSales.value.data) {
          sales = Array.isArray(resSales.value.data)
            ? resSales.value.data
            : (resSales.value.data.content || []);
        }
        if (resParts.status === 'fulfilled' && resParts.value.data) {
          partsData = Array.isArray(resParts.value.data)
            ? resParts.value.data
            : (resParts.value.data.content || []);
        }

        // ✅ Filter ONLY current month & year
        const productSales = {};
        sales.forEach(sale => {
          const d = new Date(sale.saleDate || sale.createdAt);
          if (
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth
          ) {
            (sale.items || []).forEach(item => {
              const code = item.productCode;
              const qty = item.qty || item.quantity || 1;
              if (!productSales[code]) productSales[code] = { qty: 0 };
              productSales[code].qty += qty;
            });
          }
        });

        const top5 = Object.keys(productSales)
          .map(code => ({ code, qty: productSales[code].qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        const result = top5.map(item => {
          const info = partsData.find(p => p.productCode === item.code) || {};
          return {
            name: info.productName || item.code,
            category: info.partCategory || 'General',
            sold: item.qty,
            stock: info.stockQty || info.quantity || 0,
            trend: Math.floor(Math.random() * 20) + 1,
          };
        });

        setTopProducts(result);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  const getStock = (stock) => {
    if (stock > 50) return {
      color: '#10b981', bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.18)', label: 'Good'
    };
    if (stock > 10) return {
      color: '#eab308', bg: 'rgba(234,179,8,0.08)',
      border: 'rgba(234,179,8,0.18)', label: 'Low'
    };
    return {
      color: '#ef4444', bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.18)', label: 'Critical'
    };
  };

  const getRank = (i) => {
    if (i === 0) return { emoji: '🥇', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)' };
    if (i === 1) return { emoji: '🥈', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.25)' };
    if (i === 2) return { emoji: '🥉', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' };
    return {
      emoji: null,
      num: String(i + 1).padStart(2, '0'),
      bg: 'transparent',
      border: 'var(--border-color,rgba(0,0,0,0.08))'
    };
  };

  return (
    <>
      <style>{`
        @keyframes tp-shine { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
        @keyframes tp-fade-down { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tp-glow { 0%,100%{box-shadow:0 0 14px rgba(249,115,22,0.1)} 50%{box-shadow:0 0 24px rgba(249,115,22,0.22)} }
        @keyframes tp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes tp-ping { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.2);opacity:0} }
        @keyframes tp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes tp-sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
        @keyframes tp-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .tp-glow { animation: tp-glow 3s ease-in-out infinite; }
        .tp-float { animation: tp-float 3.5s ease-in-out infinite; }
        .tp-fade-down { animation: tp-fade-down 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>

      <div
        className="relative flex flex-col overflow-hidden rounded-2xl border transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-card, #fff)',
          borderColor: 'var(--border-color, rgba(0,0,0,0.08))',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        }}
      >
        {/* BG Orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(249,115,22,0.05) 0%,transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(249,115,22,0.03) 0%,transparent 70%)', filter: 'blur(24px)' }} />
        {/* Left accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ background: 'linear-gradient(180deg,rgba(249,115,22,0.55) 0%,rgba(249,115,22,0.08) 60%,transparent 100%)' }} />

        <div className="relative p-4 sm:p-5">

          {/* ══ HEADER ══ */}
          <div className="tp-fade-down flex justify-between items-center mb-4">

            {/* Left - Title */}
            <div className="flex items-center gap-2.5">
              <div
                className="tp-glow w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(249,115,22,0.04))',
                  borderColor: 'rgba(249,115,22,0.2)',
                }}
              >
                <Layers size={16} className="text-orange-400 tp-float" />
              </div>
              <div>
                <h3 className="text-[15px] font-black tracking-tight leading-tight"
                  style={{ color: 'var(--text-main, #111)' }}>
                  Top Selling Products
                </h3>
                {/* ✅ Current month label */}
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar size={10} style={{ color: 'var(--text-muted,#aaa)' }} />
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted,#aaa)' }}>
                    This month:{' '}
                    <span style={{ color: '#f97316', fontWeight: 900 }}>
                      {currentMonthLabel}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Badges */}
            <div className="flex items-center gap-1.5">
              {/* Live dot */}
              <div className="relative w-1.5 h-1.5 mr-0.5">
                <div className="absolute inset-0 rounded-full bg-emerald-500"
                  style={{ animation: 'tp-ping 1.6s ease-out infinite' }} />
                <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>

              {/* Top N */}
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-lg border"
                style={{
                  color: 'var(--text-muted,#888)',
                  background: 'var(--bg-main,rgba(0,0,0,0.03))',
                  borderColor: 'var(--border-color,rgba(0,0,0,0.07))',
                }}
              >
                Top {topProducts.length || 5}
              </span>

              {/* View All */}
              <button
                onClick={() => {
                  if (onNavigate) {
                    sessionStorage.setItem('scrollToTopProducts', 'true');
                    onNavigate('analytics');
                  }
                }}
                className="group flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer"
                style={{
                  color: '#f97316',
                  background: 'rgba(249,115,22,0.07)',
                  borderColor: 'rgba(249,115,22,0.18)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(249,115,22,0.13)';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(249,115,22,0.18)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(249,115,22,0.07)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View All
                <ArrowUpRight size={12}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* ══ CONTENT ══ */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{ borderTopColor: '#f97316', animation: 'tp-spin 0.9s linear infinite' }} />
                <div className="absolute inset-[5px] rounded-full border border-transparent"
                  style={{ borderTopColor: 'rgba(249,115,22,0.3)', animation: 'tp-spin 1.4s linear infinite reverse' }} />
                <Zap size={12} className="text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'var(--text-muted,#bbb)' }}>
                  Fetching {currentMonthLabel}{loadDots}
                </p>
                <div className="mt-2 mx-auto rounded-full overflow-hidden"
                  style={{ width: '80px', height: '2px', background: 'var(--border-color,rgba(0,0,0,0.06))' }}>
                  <div style={{
                    height: '100%', width: '45%',
                    background: 'linear-gradient(90deg,transparent,#f97316,transparent)',
                    animation: 'tp-sweep 1.4s ease-in-out infinite',
                  }} />
                </div>
              </div>
            </div>

          ) : topProducts.length === 0 ? (
            /* ✅ Empty - shows current month name */
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border"
                style={{
                  background: 'var(--bg-main,rgba(0,0,0,0.03))',
                  borderColor: 'var(--border-color,rgba(0,0,0,0.07))',
                }}>
                <Package size={20} style={{ color: 'var(--text-muted,#ccc)' }} />
              </div>
              <div className="text-center">
                <p className="text-xs font-black" style={{ color: 'var(--text-main,#555)' }}>
                  No Sales in {currentMonthLabel}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted,#bbb)' }}>
                  No products sold this month yet.
                </p>
              </div>
            </div>

          ) : (
            /* ══ TABLE ══ */
            <div className="overflow-x-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(249,115,22,0.12) transparent' }}>
              <table className="w-full border-collapse" style={{ minWidth: '480px' }}>

                {/* Head */}
                <thead>
                  <tr style={{
                    borderBottom: '1.5px solid var(--border-color,rgba(0,0,0,0.07))',
                    animation: 'tp-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
                  }}>
                    {[
                      { label: '#', ri: false },
                      { label: 'PRODUCT NAME', ri: false },
                      { label: 'CATEGORY', ri: false },
                      { label: 'SOLD', ri: false },
                      { label: 'STOCK', ri: false },
                      { label: 'TREND', ri: true },
                    ].map((h, hi) => (
                      <th
                        key={h.label}
                        className={`pb-2.5 text-[9px] font-black uppercase tracking-[0.1em]
                          ${h.ri ? 'text-right pr-1' : 'text-left'}
                          ${hi === 0 ? 'pl-1 w-10' : 'px-2'}`}
                        style={{ color: 'var(--text-muted,rgba(0,0,0,0.3))' }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {topProducts.map((item, i) => {
                    const stock = getStock(item.stock);
                    const rank = getRank(i);
                    const trendUp = item.trend >= 10;
                    const stockPct = Math.min((item.stock / 150) * 100, 100);

                    return (
                      <AnimatedRow key={i} delay={i * 65} highlighted={i === 0}>

                        {/* Rank */}
                        <td className="py-2.5 pl-1 pr-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center border"
                            style={{ background: rank.bg, borderColor: rank.border }}
                          >
                            {rank.emoji ? (
                              <span className="text-sm leading-none">{rank.emoji}</span>
                            ) : (
                              <span className="text-[11px] font-black"
                                style={{ color: 'var(--text-muted,#bbb)' }}>
                                {rank.num}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-2.5 px-2">
                          <p className="text-[13px] font-black leading-tight truncate"
                            style={{ maxWidth: '160px', color: 'var(--text-main,#111)' }}>
                            {item.name}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-2">
                          <span
                            className="inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border whitespace-nowrap"
                            style={{
                              color: 'var(--text-muted,#888)',
                              background: 'var(--bg-main,rgba(0,0,0,0.03))',
                              borderColor: 'var(--border-color,rgba(0,0,0,0.07))',
                            }}
                          >
                            {item.category}
                          </span>
                        </td>

                        {/* Sold */}
                        <td className="py-2.5 px-2">
                          <span className="text-[16px] font-black tabular-nums"
                            style={{ color: 'var(--text-main,#111)' }}>
                            <AnimatedCounter target={item.sold} />
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center justify-center px-2 py-0.5 rounded-md border"
                              style={{
                                background: stock.bg,
                                borderColor: stock.border,
                                minWidth: '34px',
                              }}
                            >
                              <span className="text-[13px] font-black tabular-nums leading-none"
                                style={{ color: stock.color }}>
                                <AnimatedCounter target={item.stock} />
                              </span>
                            </div>
                            <AnimatedStockBar
                              percent={stockPct}
                              color={stock.color}
                              delay={i * 65 + 350}
                            />
                          </div>
                        </td>

                        {/* Trend */}
                        <td className="py-2.5 pr-1 text-right">
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-lg border whitespace-nowrap"
                            style={trendUp ? {
                              color: '#10b981',
                              background: 'rgba(16,185,129,0.07)',
                              borderColor: 'rgba(16,185,129,0.18)',
                            } : {
                              color: '#f97316',
                              background: 'rgba(249,115,22,0.07)',
                              borderColor: 'rgba(249,115,22,0.18)',
                            }}
                          >
                            {trendUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                            {trendUp ? '+' : ''}{item.trend}%
                          </span>
                        </td>
                      </AnimatedRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ══ FOOTER ══ */}
          {!loading && topProducts.length > 0 && (
            <div
              className="mt-3 pt-3 flex items-center justify-between"
              style={{
                borderTop: '1px solid var(--border-color,rgba(0,0,0,0.05))',
                animation: 'tp-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both',
              }}
            >
              <div className="flex items-center gap-1.5">
                <Star size={10} className="text-orange-400 flex-shrink-0" />
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted,#bbb)' }}>
                  Top{' '}
                  <span className="font-black" style={{ color: 'var(--text-main,#333)' }}>
                    {topProducts.length}
                  </span>
                  {' · '}
                  {/* ✅ Current month in footer */}
                  <span style={{ color: '#f97316', fontWeight: 900 }}>
                    {currentMonthLabel}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-orange-400"
                  style={{ animation: 'tp-ping 2s ease-out infinite' }} />
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted,#bbb)' }}>
                  Live
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopProducts;