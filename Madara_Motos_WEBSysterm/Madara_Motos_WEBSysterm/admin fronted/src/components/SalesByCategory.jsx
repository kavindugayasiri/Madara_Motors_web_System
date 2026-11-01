import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PieChart, TrendingUp, ArrowUpRight, Zap, BarChart2 } from 'lucide-react';

// ══════════════════════════════════════════════
// 🎨 INTERSECTION OBSERVER HOOK
// ══════════════════════════════════════════════
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
};

// ══════════════════════════════════════════════
// 🔢 ANIMATED COUNTER
// ══════════════════════════════════════════════
const AnimatedCounter = ({ target, duration = 1400 }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView || target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}</span>;
};

// ══════════════════════════════════════════════
// 📊 ANIMATED PROGRESS BAR
// ══════════════════════════════════════════════
const AnimatedBar = ({ percent, color, delay = 0 }) => {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="relative w-full h-2.5 rounded-full overflow-hidden"
      style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all ease-out"
        style={{
          width: inView ? `${percent}%` : '0%',
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow: hovered
            ? `0 0 16px ${color}80, 0 0 30px ${color}30`
            : `0 0 8px ${color}50`,
          transitionDuration: '1400ms',
          transitionDelay: `${delay}ms`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            animation: inView ? `bar-shine 2.5s ease-in-out ${delay + 1400}ms infinite` : 'none',
          }}
        />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
// 🍩 ANIMATED DONUT CHART
// ══════════════════════════════════════════════
const DonutChart = ({ chartData, totalProducts, conicGradientStr }) => {
  const [ref, inView] = useInView(0.2);
  const [rotated, setRotated] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (inView) {
      setTimeout(() => setRotated(true), 100);
    }
  }, [inView]);

  return (
    <div ref={ref} className="flex justify-center items-center py-4 mb-6 relative">
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '170px', height: '170px',
          background: conicGradientStr,
          filter: 'blur(20px)',
          opacity: rotated ? 0.18 : 0,
          transition: 'opacity 1s ease',
          animation: rotated ? 'donut-rotate 12s linear infinite' : 'none',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '150px', height: '150px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          animation: 'glow-breathe 3s ease-in-out infinite',
        }}
      />
      <div
        className="relative rounded-full transition-all duration-700 cursor-pointer"
        style={{
          width: '140px', height: '140px',
          background: conicGradientStr,
          transform: rotated
            ? hovered ? 'scale(1.06) rotate(0deg)' : 'scale(1) rotate(0deg)'
            : 'scale(0.5) rotate(-180deg)',
          opacity: rotated ? 1 : 0,
          transition: 'transform 0.9s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease, box-shadow 0.3s ease',
          boxShadow: hovered
            ? '0 0 40px rgba(249,115,22,0.35), 0 0 80px rgba(249,115,22,0.12)'
            : '0 0 24px rgba(249,115,22,0.15)',
          animation: rotated ? 'donut-float 6s ease-in-out infinite 1s' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'repeating-conic-gradient(rgba(0,0,0,0.1) 0deg 1deg, transparent 1deg 60deg)',
          }}
        />
        <div
          className="absolute rounded-full flex flex-col items-center justify-center transition-all duration-300"
          style={{
            inset: '14px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div
            className="mb-0.5 transition-all duration-300"
            style={{
              filter: hovered ? 'drop-shadow(0 0 8px #f97316)' : 'drop-shadow(0 0 4px #f9731680)',
              transform: hovered ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <TrendingUp size={15} className="text-orange-500" />
          </div>
          <span
            className="font-black leading-none"
            style={{
              fontSize: '26px',
              color: 'var(--text-main)',
              textShadow: hovered ? '0 0 20px rgba(249,115,22,0.6)' : 'none',
              transition: 'text-shadow 0.3s ease',
            }}
          >
            <AnimatedCounter target={totalProducts} />
          </span>
          <span
            className="font-black uppercase tracking-widest mt-0.5"
            style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.15em' }}
          >
            Units
          </span>
        </div>
      </div>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 rounded-full pointer-events-none"
          style={{
            height: i % 3 === 0 ? '8px' : '4px',
            background: i % 3 === 0 ? 'rgba(249,115,22,0.3)' : 'var(--border-color)',
            top: '50%',
            left: '50%',
            transformOrigin: '0 80px',
            transform: `rotate(${i * 30}deg) translateX(-50%)`,
            opacity: rotated ? 1 : 0,
            transition: `opacity 0.4s ease ${i * 40 + 600}ms`,
          }}
        />
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════
// 📋 CATEGORY ROW
// ══════════════════════════════════════════════
const CategoryRow = ({ cat, index, totalProducts }) => {
  const [ref, inView] = useInView(0.05);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-20px)',
        transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms,
                     transform 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms`,
      }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex-shrink-0 w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: cat.color,
              boxShadow: hovered ? `0 0 8px ${cat.color}, 0 0 14px ${cat.color}60` : `0 0 4px ${cat.color}60`,
              transform: hovered ? 'scale(1.4)' : 'scale(1)',
            }}
          />
          <span
            className="text-[13px] font-bold truncate max-w-[140px] transition-colors duration-200"
            style={{ color: hovered ? 'var(--text-main)' : 'var(--text-muted)' }}
          >
            {cat.name}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[11px] font-medium transition-colors duration-200"
            style={{ color: hovered ? 'var(--text-main)' : 'var(--text-muted)' }}
          >
            {cat.count} units
          </span>
          <span
            className="text-[13px] font-black tabular-nums transition-all duration-200"
            style={{
              color: cat.color,
              textShadow: hovered ? `0 0 10px ${cat.color}80` : 'none',
            }}
          >
            {cat.percent}%
          </span>
        </div>
      </div>
      <AnimatedBar percent={cat.percent} color={cat.color} delay={index * 90 + 300} />
    </div>
  );
};

// ══════════════════════════════════════════════
// 🚀 MAIN COMPONENT
// ══════════════════════════════════════════════
const SalesByCategory = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadDots, setLoadDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setLoadDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const [resSales, resParts] = await Promise.allSettled([
          axios.get('http://localhost:8080/api/sales/all'),
          axios.get('http://localhost:8080/api/spareparts/all')
        ]);

        let sales = [];
        let partsMap = {};

        if (resParts.status === 'fulfilled' && resParts.value.data) {
          const parts = Array.isArray(resParts.value.data) ? resParts.value.data : (resParts.value.data.content || []);
          parts.forEach(p => {
            if (p.productCode) partsMap[p.productCode] = p.partCategory || 'Uncategorized';
          });
        }

        if (resSales.status === 'fulfilled' && resSales.value.data) {
          sales = Array.isArray(resSales.value.data) ? resSales.value.data : (resSales.value.data.content || []);
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let categoryCounts = {};
        let totalQty = 0;

        sales.forEach(sale => {
          const saleDate = new Date(sale.saleDate || sale.createdAt);
          if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            (sale.items || []).forEach(item => {
              const cat = item.partCategory || item.category || partsMap[item.productCode] || 'Other';
              const qty = item.qty || item.quantity || 1;
              categoryCounts[cat] = (categoryCounts[cat] || 0) + qty;
              totalQty += qty;
            });
          }
        });

        const sortedCats = Object.keys(categoryCounts)
          .map(cat => ({ name: cat, count: categoryCounts[cat] }))
          .sort((a, b) => b.count - a.count);

        const palette = ['#f97316', '#fb923c', '#fdba74', '#ea580c', '#c2410c', '#9ca3af'];

        let finalData = [];
        let otherCount = 0;

        sortedCats.forEach((item, index) => {
          if (index < 5) {
            finalData.push({
              name: item.name, count: item.count,
              percent: Math.round((item.count / totalQty) * 100),
              rawPercent: (item.count / totalQty) * 100,
              color: palette[index],
            });
          } else {
            otherCount += item.count;
          }
        });

        if (otherCount > 0) {
          finalData.push({
            name: 'Other Categories', count: otherCount,
            percent: Math.round((otherCount / totalQty) * 100),
            rawPercent: (otherCount / totalQty) * 100,
            color: palette[5],
          });
        }

        setChartData(finalData);
        setTotalProducts(totalQty);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  let conicGradientStr = 'conic-gradient(var(--border-color) 0% 100%)';
  if (chartData.length > 0) {
    let current = 0;
    const stops = chartData.map(d => {
      const start = current;
      const end = current + d.rawPercent;
      current = end;
      return `${d.color} ${start}% ${end}%`;
    }).join(', ');
    conicGradientStr = `conic-gradient(${stops})`;
  }

  return (
    <>
      <style>{`
        @keyframes bar-shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
        @keyframes donut-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes donut-float { 0%, 100% { transform: scale(1) translateY(0px); } 50% { transform: scale(1) translateY(-5px); } }
        @keyframes glow-breathe { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        @keyframes sbc-fade-down { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sbc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sbc-ping { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes sbc-load-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
        .sbc-fade-down { animation: sbc-fade-down 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>

      <div
        className="relative overflow-hidden rounded-3xl border flex flex-col h-full transition-colors duration-300"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, var(--text-main) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative flex flex-col h-full p-5 sm:p-6">
          <div className="sbc-fade-down flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
                  borderColor: 'rgba(249,115,22,0.25)',
                  boxShadow: '0 0 20px rgba(249,115,22,0.1)',
                  animation: 'glow-breathe 4s ease-in-out infinite',
                }}
              >
                <BarChart2 size={17} className="text-orange-500" />
              </div>
              <div >
                <h2 className="text-[15px] font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                  Sales by Category
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 rounded-full bg-emerald-500" style={{ animation: 'sbc-ping 1.8s ease-out infinite' }} />
                    <div className="relative w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    This Month
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (onNavigate) {
                  sessionStorage.setItem('scrollToCategory', 'true');
                  onNavigate('analytics'); 
                }
              }} 
              className="group flex items-center gap-1.5 text-[12px] font-black px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer"
              style={{
                color: '#f97316',
                background: 'rgba(249,115,22,0.08)',
                borderColor: 'rgba(249,115,22,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(249,115,22,0.15)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(249,115,22,0.2)';
                e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(249,115,22,0.08)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)';
              }}
            >
              View All
              <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: '#f97316', animation: 'sbc-spin 1s linear infinite' }} />
                <div className="absolute inset-2 rounded-full border-2 border-transparent" style={{ borderTopColor: 'rgba(249,115,22,0.35)', animation: 'sbc-spin 1.5s linear infinite reverse' }} />
                <Zap size={14} className="text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Calculating{loadDots}</p>
                <div className="mt-3 mx-auto rounded-full overflow-hidden" style={{ width: '100px', height: '3px', background: 'var(--border-color)' }}>
                  <div style={{ height: '100%', width: '50%', background: 'linear-gradient(90deg, transparent, #f97316, transparent)', animation: 'sbc-load-bar 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
          ) : totalProducts === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-3 opacity-50">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border" style={{ background: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                <PieChart size={26} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-black" style={{ color: 'var(--text-main)' }}>No Sales Data</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>No records for this month</p>
              </div>
            </div>
          ) : (
            <>
              <DonutChart chartData={chartData} totalProducts={totalProducts} conicGradientStr={conicGradientStr} />
              <div className="flex-1 space-y-4 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(249,115,22,0.2) transparent' }}>
                {chartData.map((cat, index) => (
                  <CategoryRow key={index} cat={cat} index={index} totalProducts={totalProducts} />
                ))}
              </div>
              <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <BarChart2 size={11} /> Based on sold units
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" style={{ animation: 'sbc-ping 2s ease-out infinite' }} />
                  <span className="text-[11px] font-black" style={{ color: '#f97316' }}>Updated Live</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SalesByCategory;