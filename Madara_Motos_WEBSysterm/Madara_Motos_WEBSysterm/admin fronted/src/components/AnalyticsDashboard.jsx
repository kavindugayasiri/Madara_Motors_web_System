import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Line, ComposedChart, Area
} from 'recharts';
import {
  TrendingUp, Package, PieChart, Calendar, MoreHorizontal,
  Activity, Target, Zap, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';

// ════════════════════════════════════════
// 🎨 ANIMATION HOOK
// ════════════════════════════════════════
const useInView = (threshold = 0.08) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ════════════════════════════════════════
// 🔢 ANIMATED NUMBER COUNTER
// ════════════════════════════════════════
const AnimatedCounter = ({ target, duration = 1400 }) => {
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
  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// ════════════════════════════════════════
// 📊 ANIMATED PROGRESS BAR
// ════════════════════════════════════════
const AnimatedBar = ({ percent, color, delay = 0 }) => {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref}
      className="w-full h-2 rounded-full overflow-hidden relative cursor-default"
      style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="h-full rounded-full transition-all ease-out relative"
        style={{
          width: inView ? `${percent}%` : '0%',
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: hov ? `0 0 16px ${color}80, 0 0 30px ${color}30` : `0 0 8px ${color}50`,
          transitionDuration: '1400ms',
          transitionDelay: `${delay}ms`,
        }}>
        <div className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)',
            animation: inView ? `ad-bar-shine 2.5s ease-in-out ${delay + 1400}ms infinite` : 'none',
          }} />
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// 💎 STAT CARD
// ════════════════════════════════════════
const StatCard = ({ icon: Icon, label, value, accent, sub, delay = 0 }) => {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="relative overflow-hidden rounded-2xl border cursor-default"
      style={{
        background: 'var(--bg-card)',
        borderColor: hov ? `${accent}35` : 'var(--border-color)',
        boxShadow: hov
          ? `0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px ${accent}20, 0 0 40px ${accent}08`
          : '0 4px 20px rgba(0,0,0,0.05)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     border-color 0.3s, box-shadow 0.3s`,
      }}>
      {/* Animated gradient bg */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${accent}12 0%, transparent 65%)`,
          opacity: hov ? 1 : 0.5,
        }} />
      {/* Shimmer sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.1) 50%,transparent 70%)',
          transform: hov ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.85s ease',
        }} />
      </div>
      <div className="relative z-10 p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 transition-all duration-300"
          style={{
            background: `${accent}12`,
            borderColor: `${accent}25`,
            transform: hov ? 'scale(1.12) rotate(-6deg)' : 'scale(1)',
            boxShadow: hov ? `0 8px 28px ${accent}35` : 'none',
          }}>
          <Icon size={24} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-4xl font-black leading-none tabular-nums" style={{ color: 'var(--text-main)' }}>
            <AnimatedCounter target={value} />
          </p>
          {sub && <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: `${accent}12`,
            opacity: hov ? 1 : 0,
            transform: hov ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-45deg)',
          }}>
          <ArrowUpRight size={15} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// 🍩 ANIMATED DONUT CHART
// ════════════════════════════════════════
const AnimatedDonut = ({ conicGradientStr, value }) => {
  const [ref, inView] = useInView(0.15);
  const [mounted, setMounted] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { if (inView) setTimeout(() => setMounted(true), 80); }, [inView]);
  return (
    <div ref={ref} className="flex justify-center items-center py-4 mb-4 relative">
      {/* Slow rotating blur glow */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: '190px', height: '190px',
        background: conicGradientStr, filter: 'blur(24px)',
        opacity: mounted ? 0.14 : 0,
        transition: 'opacity 1.2s ease',
        animation: mounted ? 'ad-donut-spin 16s linear infinite' : 'none',
      }} />
      {/* Pulse glow */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: '165px', height: '165px',
        background: 'radial-gradient(circle,rgba(249,115,22,0.1) 0%,transparent 70%)',
        animation: 'ad-breathe 3.5s ease-in-out infinite',
      }} />
      {/* Main donut */}
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="relative rounded-full cursor-pointer"
        style={{
          width: '160px', height: '160px',
          background: conicGradientStr,
          transform: mounted
            ? hov ? 'scale(1.07)' : 'scale(1)'
            : 'scale(0.35) rotate(-200deg)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 1s cubic-bezier(0.34,1.56,0.64,1), opacity 0.7s ease, box-shadow 0.3s',
          boxShadow: hov
            ? '0 0 50px rgba(249,115,22,0.4), 0 0 100px rgba(249,115,22,0.1)'
            : '0 0 30px rgba(249,115,22,0.15)',
          animation: mounted ? 'ad-donut-float 7s ease-in-out infinite 1.5s' : 'none',
        }}>
        {/* Separator lines */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'repeating-conic-gradient(rgba(0,0,0,0.1) 0deg 1deg,transparent 1deg 60deg)'
        }} />
        {/* Inner hole */}
        <div className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            inset: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.1)',
          }}>
          <TrendingUp size={14} className="text-orange-500 mb-0.5" style={{
            filter: hov ? 'drop-shadow(0 0 10px #f97316)' : 'drop-shadow(0 0 4px #f9731660)',
            transition: 'filter 0.3s',
          }} />
          <span className="text-[26px] font-black leading-none tabular-nums"
            style={{ color: 'var(--text-main)', textShadow: hov ? '0 0 24px rgba(249,115,22,0.6)' : 'none', transition: 'text-shadow 0.3s' }}>
            <AnimatedCounter target={value} />
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Units Sold
          </span>
        </div>
      </div>
      {/* Tick marks */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          width: '2px', height: i % 3 === 0 ? '9px' : '5px',
          background: i % 3 === 0 ? 'rgba(249,115,22,0.35)' : 'var(--border-color)',
          top: '50%', left: '50%',
          transformOrigin: '0 88px',
          transform: `rotate(${i * 30}deg) translateX(-50%)`,
          opacity: mounted ? 1 : 0,
          transition: `opacity 0.4s ease ${i * 45 + 700}ms`,
        }} />
      ))}
    </div>
  );
};

// ════════════════════════════════════════
// 🎭 ANIMATED TABLE ROW
// ════════════════════════════════════════
const AnimatedRow = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView(0.04);
  return (
    <tr ref={ref}
      className="border-b transition-colors group"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'transparent',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-18px)',
        transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, background-color 0.2s`,
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover-bg)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
      {children}
    </tr>
  );
};

// ════════════════════════════════════════
// 🌟 GLOW ORB
// ════════════════════════════════════════
const GlowOrb = ({ color, size, top, left, opacity = 0.07 }) => (
  <div className="absolute rounded-full pointer-events-none blur-3xl"
    style={{ width: size, height: size, top, left, background: color, opacity }} />
);

// ════════════════════════════════════════
// ✨ FLOATING PARTICLES
// ════════════════════════════════════════
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="absolute rounded-full" style={{
        width: `${Math.random() * 3 + 2}px`,
        height: `${Math.random() * 3 + 2}px`,
        background: i % 3 === 0 ? '#f97316' : i % 3 === 1 ? '#fb923c' : '#fdba74',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: 0.15,
        animation: `ad-particle ${Math.random() * 7 + 6}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 5}s`,
      }} />
    ))}
  </div>
);

// ════════════════════════════════════════
// 🚀 MAIN COMPONENT
// ════════════════════════════════════════
const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [partsData, setPartsData] = useState([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadDots, setLoadDots] = useState('');

  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const endYear = Math.max(currentYear, startYear);
  const availableYears = Array.from(
    { length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString()
  ).reverse();

  const [selectedYear, setSelectedYear] = useState(endYear.toString());
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [chartType, setChartType] = useState('Area');
  const [targetOrders, setTargetOrders] = useState(() => {
    const s = localStorage.getItem('globalTargetOrders');
    return s ? parseInt(s, 10) : 100;
  });

  useEffect(() => {
    localStorage.setItem('globalTargetOrders', targetOrders);
  }, [targetOrders]);

  const [chartData, setChartData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [summary, setSummary] = useState({ orders: 0, itemsSold: 0 });

  const monthsList = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const catColors = ['#f97316','#fb923c','#fdba74','#ea580c','#c2410c','#9a3412','#7c2d12','#fed7aa','#ffedd5','#ea580c'];

  // Loading dots
  useEffect(() => {
    const t = setInterval(() => setLoadDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  // 🟢 ── SCROLL EFFECT ──
  useEffect(() => {
    if (!loading) {
      if (sessionStorage.getItem('scrollToCategory') === 'true') {
        setTimeout(() => {
          const targetSection = document.getElementById('analytics-category-section');
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            sessionStorage.removeItem('scrollToCategory');
          }
        }, 500); 
      }

      if (sessionStorage.getItem('scrollToTopProducts') === 'true') {
        setTimeout(() => {
          const targetSection = document.getElementById('analytics-top-products-section');
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            sessionStorage.removeItem('scrollToTopProducts');
          }
        }, 500); 
      }
    }
  }, [loading]);

  // ── FETCH ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadProgress(0);
        const pt = setInterval(() => setLoadProgress(p => Math.min(p + Math.random() * 18, 88)), 200);
        const [resSales, resParts] = await Promise.allSettled([
          axios.get('http://localhost:8080/api/sales/all'),
          axios.get('http://localhost:8080/api/spareparts/all')
        ]);
        clearInterval(pt);
        setLoadProgress(100);
        let sales = resSales.status === 'fulfilled' && resSales.value.data
          ? (Array.isArray(resSales.value.data) ? resSales.value.data : resSales.value.data.content || []) : [];
        let parts = resParts.status === 'fulfilled' && resParts.value.data
          ? (Array.isArray(resParts.value.data) ? resParts.value.data : resParts.value.data.content || []) : [];
        setSalesData(sales);
        setPartsData(parts);
        setTimeout(() => setLoading(false), 350);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── PROCESS ──
  useEffect(() => {
    if (!salesData.length) return;
    const filtered = salesData.filter(s => {
      const d = new Date(s.saleDate || s.createdAt);
      return d.getFullYear().toString() === selectedYear;
    });
    let itemsSoldTotal = 0, productCountMap = {}, categoryMap = {}, newChartData = [];

    if (viewMode === 'monthly') {
      newChartData = monthsList.map(m => ({ name: m, itemsSold: 0, orders: 0, target: targetOrders }));
      filtered.forEach(sale => {
        const d = new Date(sale.saleDate || sale.createdAt);
        const qty = (sale.items || []).reduce((s, i) => s + (i.qty || i.quantity || 1), 0);
        newChartData[d.getMonth()].itemsSold += qty;
        newChartData[d.getMonth()].orders += 1;
      });
    } else {
      const days = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0).getDate();
      for (let i = 1; i <= days; i++)
        newChartData.push({ name: `${i}`, itemsSold: 0, orders: 0, target: targetOrders });
      filtered.forEach(sale => {
        const d = new Date(sale.saleDate || sale.createdAt);
        if (d.getMonth().toString() === selectedMonth) {
          const idx = d.getDate() - 1;
          const qty = (sale.items || []).reduce((s, i) => s + (i.qty || i.quantity || 1), 0);
          if (newChartData[idx]) { newChartData[idx].itemsSold += qty; newChartData[idx].orders += 1; }
        }
      });
    }

    const salesForLists = viewMode === 'monthly' ? filtered :
      filtered.filter(s => new Date(s.saleDate || s.createdAt).getMonth().toString() === selectedMonth);

    salesForLists.forEach(sale => {
      (sale.items || []).forEach(item => {
        const code = item.productCode;
        const qty = item.qty || item.quantity || 1;
        itemsSoldTotal += qty;
        if (!productCountMap[code]) productCountMap[code] = { qty: 0 };
        productCountMap[code].qty += qty;
        const pInfo = partsData.find(p => p.productCode === code) || {};
        const cat = pInfo.partCategory || item.category || 'Other';
        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat] += qty;
      });
    });

    const sortedItems = Object.keys(productCountMap).map(code => {
      const pInfo = partsData.find(p => p.productCode === code) || {};
      return {
        code, name: pInfo.productName || code,
        category: pInfo.partCategory || 'Uncategorized',
        qty: productCountMap[code].qty,
        stock: pInfo.stockQty || pInfo.quantity || 0,
        trend: Math.floor(Math.random() * 20) + 1
      };
    }).sort((a, b) => b.qty - a.qty).slice(0, 10);

    const sortedCats = Object.keys(categoryMap)
      .map(cat => ({ name: cat, qty: categoryMap[cat] }))
      .sort((a, b) => b.qty - a.qty).slice(0, 10);

    setChartData(newChartData);
    setTopItems(sortedItems);
    setTopCategories(sortedCats);
    setSummary({ orders: salesForLists.length, itemsSold: itemsSoldTotal });
  }, [salesData, partsData, selectedYear, viewMode, selectedMonth, targetOrders]);

  // Axis
  const maxDataOrders = chartData.length > 0 ? Math.max(...chartData.map(d => d.orders)) : 0;
  const baseLeftMax = Math.max(targetOrders, maxDataOrders);
  const leftAxisMax = Math.ceil(baseLeftMax * 1.2);
  const rightAxisMax = Math.ceil(leftAxisMax * (14 / 3));

  // Donut
  let currentPercent = 0;
  const conicStops = topCategories.map((cat, i) => {
    const pct = summary.itemsSold > 0 ? (cat.qty / summary.itemsSold) * 100 : 0;
    const start = currentPercent; const end = currentPercent + pct; currentPercent = end;
    return `${catColors[i % catColors.length]} ${start}% ${end}%`;
  }).join(', ');
  const conicGradientStr = topCategories.length > 0
    ? `conic-gradient(${conicStops})` : 'conic-gradient(#1f2937 0% 100%)';

  // Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="border p-4 rounded-2xl shadow-2xl min-w-[210px]"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'rgba(249,115,22,0.5)',
        }}>
        <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <p className="font-black text-sm" style={{ color: 'var(--text-main)' }}>
            {viewMode === 'monthly' ? label : `Day ${label}`} Overview
          </p>
        </div>
        <div className="space-y-2.5">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {entry.name === 'Items Sold' ? 'Units' : entry.name}
                </span>
              </div>
              <span className="text-[13px] font-black tabular-nums" style={{ color: 'var(--text-main)' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── LOADING SCREEN ──
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-orange-500/10 animate-ping" />
          <div className="absolute w-20 h-20 rounded-full border border-orange-500/15 animate-pulse" />
          <div className="w-16 h-16 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#f97316', borderRightColor: 'rgba(249,115,22,0.25)', animation: 'ad-spin 0.9s linear infinite' }} />
          <div className="absolute"><Activity size={18} className="text-orange-500" /></div>
        </div>
        <div className="w-72 space-y-2">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${loadProgress}%`,
                background: 'linear-gradient(90deg,#ea580c,#f97316,#fb923c)',
                boxShadow: '0 0 14px rgba(249,115,22,0.6)',
              }} />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Loading Analytics{loadDots}
            </p>
            <p className="text-[11px] text-orange-500 font-black">{Math.round(loadProgress)}%</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // 🎨 MAIN RENDER
  // ═══════════════════════════════════════════
  return (
    <>
      <style>{`
        @keyframes ad-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ad-breathe { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
        @keyframes ad-donut-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ad-donut-float { 0%,100%{transform:scale(1) translateY(0)} 50%{transform:scale(1) translateY(-7px)} }
        @keyframes ad-bar-shine { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
        @keyframes ad-slide-up { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ad-slide-right { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ad-fade { from{opacity:0} to{opacity:1} }
        @keyframes ad-ping-slow { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes ad-glow { 0%,100%{box-shadow:0 0 20px rgba(249,115,22,0.15)} 50%{box-shadow:0 0 40px rgba(249,115,22,0.35)} }
        @keyframes ad-particle { 0%,100%{transform:translateY(0) scale(1);opacity:0.12} 50%{transform:translateY(-18px) scale(1.4);opacity:0.22} }
        @keyframes ad-header-in { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="space-y-6 pb-12">

        {/* ══════════════════════════════
            🔷 HEADER
        ══════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl border p-6"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            animation: 'ad-header-in 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          }}>
          <Particles />
          <GlowOrb color="#f97316" size="300px" top="-100px" left="-80px" opacity={0.08} />
          <GlowOrb color="#fb923c" size="220px" top="-60px" left="65%" opacity={0.05} />
          <GlowOrb color="#ea580c" size="180px" top="50%" left="85%" opacity={0.04} />
          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle,var(--text-main) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

          <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                style={{
                  background: 'rgba(249,115,22,0.1)',
                  borderColor: 'rgba(249,115,22,0.22)',
                  animation: 'ad-glow 3s ease-in-out infinite',
                }}>
                <Activity size={22} className="text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-0.5">
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                    Performance Analytics
                  </h1>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LIVE
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Sales operations and product movement tracking
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View mode */}
              <div className="flex border rounded-xl p-1" style={{ background: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                {[['monthly','Yearly'],['daily','Daily']].map(([mode, label]) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className="px-5 py-2 text-[11px] font-black rounded-lg transition-all duration-250"
                    style={{
                      color: viewMode === mode ? 'white' : 'var(--text-muted)',
                      background: viewMode === mode
                        ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent',
                      boxShadow: viewMode === mode ? '0 4px 16px rgba(249,115,22,0.35)' : 'none',
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Year */}
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                className="text-sm font-bold px-4 py-2.5 rounded-xl border focus:outline-none cursor-pointer hover:border-orange-500/30 transition-colors"
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Month */}
              {viewMode === 'daily' && (
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                  className="text-orange-500 text-sm font-bold px-4 py-2.5 rounded-xl border border-orange-500/20 focus:outline-none cursor-pointer hover:bg-orange-500/15 transition-colors"
                  style={{ background: 'rgba(249,115,22,0.08)', animation: 'ad-fade 0.3s ease forwards' }}>
                  {monthsList.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            📊 STAT CARDS
        ══════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StatCard icon={TrendingUp} label="Total Orders" value={summary.orders}
            accent="#a855f7"
            sub={`${viewMode === 'monthly' ? selectedYear : monthsList[parseInt(selectedMonth)]} performance`}
            delay={80} />
          <StatCard icon={Package} label="Items Sold" value={summary.itemsSold}
            accent="#f97316" sub="Total units moved" delay={180} />
        </div>

        {/* ══════════════════════════════
            📈 CHART
        ══════════════════════════════ */}
        <div className="relative overflow-hidden border rounded-2xl p-6 shadow-xl"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            animation: 'ad-slide-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}>
          <GlowOrb color="#f97316" size="260px" top="-90px" left="38%" opacity={0.04} />
          <GlowOrb color="#ea580c" size="200px" top="55%" left="-50px" opacity={0.04} />

          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.18)' }}>
                <Calendar size={16} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-base font-black" style={{ color: 'var(--text-main)' }}>
                  {viewMode === 'monthly' ? 'Performance by Month' : 'Daily Sales Movement'}
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Items sold & order volume</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Target */}
              <div className="flex items-center gap-2 rounded-xl px-4 py-2 border transition-colors hover:border-blue-500/30"
                style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.14)' }}>
                <Target size={12} className="text-blue-500 flex-shrink-0" />
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>Target (Orders):</span>
                <input type="number" value={targetOrders}
                  onChange={e => setTargetOrders(Number(e.target.value))}
                  className="bg-transparent text-blue-500 text-[13px] font-black w-14 focus:outline-none" />
              </div>
              {/* Chart type */}
              <div className="flex border rounded-xl p-1" style={{ background: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                {['Area','Bar'].map(type => (
                  <button key={type} onClick={() => setChartType(type)}
                    className="px-4 py-1.5 rounded-lg text-[11px] font-black transition-all duration-200"
                    style={{
                      color: chartType === type ? 'white' : 'var(--text-muted)',
                      background: chartType === type
                        ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent',
                      boxShadow: chartType === type ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
                    }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-[380px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <ComposedChart data={chartData} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <filter id="line-glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--border-color)" fontSize={11} tickLine={false} axisLine={false} dy={12}
                  tick={{ fill: 'var(--text-muted)', fontWeight: 700 }} />
                <YAxis yAxisId="left" stroke="#a855f7" fontSize={11} tickLine={false} axisLine={false} dx={-8}
                  domain={[0, leftAxisMax]} tick={{ fill: '#a855f780', fontWeight: 700 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={11} tickLine={false} axisLine={false} dx={8}
                  domain={[0, rightAxisMax]} tick={{ fill: '#f9731680', fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(249,115,22,0.2)', strokeWidth: 1, fill: 'rgba(249,115,22,0.05)' }} />
                <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '12px' }} iconType="circle"
                  formatter={v => <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{v}</span>} />

                <Line yAxisId="left" type="step" name="Target Orders" dataKey="target"
                  stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={false} />

                {chartType === 'Bar' ? (
                  <Bar yAxisId="right" name="Items Sold" dataKey="itemsSold"
                    fill="#f97316" radius={[6, 6, 0, 0]}
                    barSize={viewMode === 'monthly' ? 28 : 8} />
                ) : (
                  <Area yAxisId="right" type="monotone" name="Items Sold" dataKey="itemsSold"
                    fill="url(#colorItems)" stroke="#f97316" strokeWidth={2.5}
                    filter="url(#line-glow)"
                    activeDot={{ r: 6, fill: 'var(--bg-main)', stroke: '#f97316', strokeWidth: 2 }} />
                )}

                <Line yAxisId="left" type="monotone" name="Orders (Invoices)" dataKey="orders"
                  stroke="#a855f7" strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--bg-main)', stroke: '#a855f7', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--bg-main)', stroke: '#a855f7', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ══════════════════════════════
            📋 BOTTOM SECTION
        ══════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Top Products ── */}
          <div 
            id="analytics-top-products-section"
            className="xl:col-span-2 relative overflow-hidden border rounded-2xl p-6 flex flex-col shadow-xl"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              animation: 'ad-slide-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.2s both',
            }}>
            <GlowOrb color="#ea580c" size="200px" top="-60px" left="-50px" opacity={0.04} />

            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.18)' }}>
                  <Layers size={15} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-base font-black" style={{ color: 'var(--text-main)' }}>Top Selling Products</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Best performers {viewMode === 'monthly' ? 'this year' : 'this month'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-lg border" style={{ color: 'var(--text-muted)', background: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                Top {topItems.length}
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[580px]">
                <thead>
                  <tr className="text-[10px] font-black tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                    {['#','Product Name','Category','Units Sold','Stock','Trend'].map((h, i) => (
                      <th key={h} className={`pb-4 px-3 border-b ${i === 5 ? 'text-right' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topItems.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No data available</td></tr>
                  ) : topItems.map((item, i) => {
                    const sColor = item.stock > 50 ? '#10b981' : item.stock > 10 ? '#eab308' : '#ef4444';
                    const tUp = item.trend > 10;
                    return (
                      <AnimatedRow key={i} delay={i * 55}>
                        <td className="py-3.5 px-3">
                          {i === 0 ? <span className="text-base">🥇</span>
                            : i === 1 ? <span className="text-base">🥈</span>
                            : i === 2 ? <span className="text-base">🥉</span>
                            : <span className="text-[12px] font-black" style={{ color: 'var(--text-muted)' }}>
                                {(i + 1).toString().padStart(2, '0')}
                              </span>}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-[13px] max-w-[160px] truncate" style={{ color: 'var(--text-main)' }}>
                          {item.name}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wide"
                            style={{ color: 'var(--text-muted)', background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.14)' }}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-black text-[15px] tabular-nums" style={{ color: 'var(--text-main)' }}>
                          {item.qty}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-[13px] w-7 tabular-nums" style={{ color: sColor }}>
                              {item.stock}
                            </span>
                            <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                              <div className="h-full rounded-full" style={{
                                width: `${Math.min((item.stock / 200) * 100, 100)}%`,
                                background: sColor,
                                boxShadow: `0 0 6px ${sColor}60`,
                              }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border"
                            style={tUp
                              ? { color: '#34d399', background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }
                              : { color: '#fb923c', background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.2)' }}>
                            {tUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                            {item.trend}%
                          </span>
                        </td>
                      </AnimatedRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Sales by Category ── */}
          <div 
            id="analytics-category-section" 
            className="xl:col-span-1 relative overflow-hidden border rounded-2xl p-6 flex flex-col shadow-xl"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              animation: 'ad-slide-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.3s both',
            }}>
            <GlowOrb color="#f97316" size="210px" top="-60px" left="-60px" opacity={0.08} />
            <GlowOrb color="#ea580c" size="160px" top="55%" left="60%" opacity={0.05} />

            <div className="relative flex justify-between items-start mb-5">
              <div>
                <h3 className="text-base font-black" style={{ color: 'var(--text-main)' }}>Sales by Category</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 rounded-full bg-emerald-500"
                      style={{ animation: 'ad-ping-slow 1.8s ease-out infinite' }} />
                    <div className="relative w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                <MoreHorizontal size={15} />
              </button>
            </div>

            {/* Animated Donut */}
            <AnimatedDonut conicGradientStr={conicGradientStr} value={summary.itemsSold} />

            {/* Category bars */}
            <div className="relative flex-1 space-y-4 overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(249,115,22,0.2) transparent' }}>
              {topCategories.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No category data.</p>
              ) : topCategories.map((cat, i) => {
                const color = catColors[i % catColors.length];
                const percent = Math.round((cat.qty / summary.itemsSold) * 100) || 0;
                return (
                  <div key={i} className="group"
                    style={{
                      opacity: 0,
                      animation: `ad-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80 + 450}ms forwards`,
                    }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-[1.4]"
                          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}70` }} />
                        <span className="text-[12px] font-bold transition-colors truncate max-w-[110px]" style={{ color: 'var(--text-muted)' }}>
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{cat.qty} units</span>
                        <span className="text-[13px] font-black" style={{ color }}>{percent}%</span>
                      </div>
                    </div>
                    <AnimatedBar percent={percent} color={color} delay={i * 80 + 450} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;