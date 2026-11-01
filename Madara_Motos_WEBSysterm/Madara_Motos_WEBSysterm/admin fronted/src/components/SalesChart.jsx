import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
  Area, AreaChart, Cell
} from 'recharts';
import { Loader2, Activity, BarChart2, TrendingUp, Zap, Target } from 'lucide-react';

// ✅ Animated dot for line chart
const AnimatedDot = (props) => {
  const { cx, cy, stroke } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="var(--bg-card)" stroke={stroke} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={8} fill={stroke} opacity={0.15} />
    </g>
  );
};

// ✅ Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="p-4 rounded-2xl shadow-2xl"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
        minWidth: '180px',
      }}
    >
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="w-1.5 h-4 rounded-full bg-orange-500" />
        <p className="font-black text-sm" style={{ color: 'var(--text-main)' }}>{label} Overview</p>
      </div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
          </div>
          <span className="text-xs font-black" style={{ color: 'var(--text-main)' }}>
            {entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ✅ Mini stat pill
const MiniStat = ({ label, value, color, icon: Icon }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold"
    style={{
      backgroundColor: `${color}10`,
      borderColor: `${color}25`,
      color,
    }}
  >
    <Icon size={11} />
    <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
    <span style={{ color }}>{value}</span>
  </div>
);

const SalesChart = () => {
  const [chartData, setChartData]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [timeRange, setTimeRange]   = useState('6M');
  const [chartType, setChartType]   = useState('Area');
  const [animKey, setAnimKey]       = useState(0);   // re-mount chart on change
  const [headerVisible, setHeaderVisible] = useState(false);

  const [targetOrders, setTargetOrders] = useState(() => {
    const s = localStorage.getItem('globalTargetOrders');
    return s ? parseInt(s, 10) : 100;
  });

  useEffect(() => {
    const fn = () => {
      const s = localStorage.getItem('globalTargetOrders');
      if (s) setTargetOrders(parseInt(s, 10));
    };
    window.addEventListener('storage', fn);
    return () => window.removeEventListener('storage', fn);
  }, []);

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 100);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8080/api/sales/all');
        let sales = [];
        if (res.status === 200 && res.data)
          sales = Array.isArray(res.data) ? res.data : (res.data.content || []);

        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const monthsToFetch = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
        let d = new Date(); d.setDate(1);
        d.setMonth(d.getMonth() - (monthsToFetch - 1));

        let monthsData = [];
        for (let i = 0; i < monthsToFetch; i++) {
          monthsData.push({ month: monthNames[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear(), orders: 0, partsSold: 0, target: targetOrders });
          d.setMonth(d.getMonth() + 1);
        }

        sales.forEach(sale => {
          const sd = new Date(sale.saleDate || sale.createdAt);
          const mo = monthsData.find(m => m.monthIndex === sd.getMonth() && m.year === sd.getFullYear());
          if (mo) {
            mo.orders += 1;
            mo.partsSold += (sale.items || []).reduce((s, it) => s + (it.qty || it.quantity || 1), 0);
          }
        });

        setChartData(monthsData);
        setAnimKey(k => k + 1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [timeRange, targetOrders]);

  const maxOrders   = chartData.length ? Math.max(...chartData.map(d => d.orders))   : 0;
  const maxParts    = chartData.length ? Math.max(...chartData.map(d => d.partsSold)) : 0;
  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const totalParts  = chartData.reduce((s, d) => s + d.partsSold, 0);
  const leftAxisMax  = Math.ceil(Math.max(targetOrders, maxOrders) * 1.3);
  const rightAxisMax = Math.ceil(leftAxisMax * (14 / 3));

  // bar colors per month
  const barColors  = ['#f97316','#a855f7','#3b82f6','#10b981','#f59e0b','#ec4899',
                       '#06b6d4','#84cc16','#f97316','#a855f7','#3b82f6','#10b981'];

  return (
    <>
      <style>{`
        @keyframes header-in {
          from { opacity:0; transform: translateY(-12px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes chart-fade {
          from { opacity:0; transform: scaleY(0.96); }
          to   { opacity:1; transform: scaleY(1); }
        }
        @keyframes pill-in {
          from { opacity:0; transform: translateX(-8px); }
          to   { opacity:1; transform: translateX(0); }
        }
        @keyframes pulse-live {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.4); }
        }
        .chart-wrap { animation: chart-fade 0.6s ease both; }
        .toggle-btn { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .toggle-btn:hover:not(.active) { transform: scale(1.06); }
      `}</style>

      <div className="h-full flex flex-col transition-colors duration-300">

        {/* ✅ Header */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(-12px)',
            transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Title */}
          <div>
            <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              {/* Live pulse dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              <Activity size={18} className="text-orange-500" />
              Store Activity
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Monthly orders and items sold trend
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Mini stats */}
            {!loading && (
              <div className="flex gap-2" style={{ animation: 'pill-in 0.5s ease 0.4s both' }}>
                <MiniStat label="Orders" value={totalOrders} color="#a855f7" icon={Zap} />
                <MiniStat label="Parts"  value={totalParts}  color="#f97316" icon={Target} />
              </div>
            )}

            {/* Time range */}
            <div
              className="flex rounded-xl p-1"
              style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}
            >
              {['3M','6M','12M'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`toggle-btn px-3 py-1.5 text-xs font-bold rounded-lg ${timeRange === r ? 'active' : ''}`}
                  style={{
                    backgroundColor: timeRange === r ? '#f97316' : 'transparent',
                    color: timeRange === r ? '#fff' : 'var(--text-muted)',
                    boxShadow: timeRange === r ? '0 2px 8px #f9731640' : 'none',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Chart type */}
            <div
              className="hidden sm:flex rounded-xl p-1"
              style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}
            >
              {[
                { key: 'Area', Icon: TrendingUp },
                { key: 'Bar',  Icon: BarChart2  },
              ].map(({ key, Icon }) => (
                <button
                  key={key}
                  onClick={() => setChartType(key)}
                  className={`toggle-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${chartType === key ? 'active' : ''}`}
                  style={{
                    backgroundColor: chartType === key ? '#f97316' : 'transparent',
                    color: chartType === key ? '#fff' : 'var(--text-muted)',
                    boxShadow: chartType === key ? '0 2px 8px #f9731640' : 'none',
                  }}
                >
                  <Icon size={13} /> {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ Chart area */}
        <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <Activity size={20} className="text-orange-500 absolute inset-0 m-auto" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Loading Chart...
              </span>
            </div>
          ) : (
            <div key={animKey} className="chart-wrap h-full">
            <ResponsiveContainer width="100%" height={350}>

                {chartType === 'Area' ? (
                  /* ━━━━━━━━ AREA / LINE CHART ━━━━━━━━ */
                  <AreaChart data={chartData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad-parts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="grad-orders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#a855f7" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />

                    <XAxis
                      dataKey="month"
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#a855f7"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      domain={[0, leftAxisMax]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#f97316"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={10}
                      domain={[0, rightAxisMax]}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }} />

                    {/* Target reference line */}
                    <ReferenceLine
                      yAxisId="left"
                      y={targetOrders}
                      stroke="#3b82f6"
                      strokeDasharray="6 3"
                      strokeWidth={1.5}
                      label={{ value: `Target ${targetOrders}`, position: 'insideTopRight', fontSize: 10, fill: '#3b82f6' }}
                    />

                    {/* Parts Sold Area */}
                    <Area
                      yAxisId="right"
                      type="monotone"
                      name="Parts Sold"
                      dataKey="partsSold"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fill="url(#grad-parts)"
                      dot={<AnimatedDot stroke="#f97316" />}
                      activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                    />

                    {/* Orders Area */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      name="Orders (Invoices)"
                      dataKey="orders"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      fill="url(#grad-orders)"
                      dot={<AnimatedDot stroke="#a855f7" />}
                      activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>

                ) : (
                  /* ━━━━━━━━ BAR CHART ━━━━━━━━ */
                  <BarChart data={chartData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }} barGap={4}>
                    <defs>
                      <linearGradient id="bar-parts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#f97316" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.5} />
                      </linearGradient>
                      <linearGradient id="bar-orders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#a855f7" stopOpacity={1} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis yAxisId="left"  stroke="#a855f7" fontSize={11} tickLine={false} axisLine={false} dx={-10} domain={[0, leftAxisMax]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={11} tickLine={false} axisLine={false} dx={10} domain={[0, rightAxisMax]} />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-color)', opacity: 0.3, radius: 8 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }} />

                    <ReferenceLine
                      yAxisId="left"
                      y={targetOrders}
                      stroke="#3b82f6"
                      strokeDasharray="6 3"
                      strokeWidth={1.5}
                      label={{ value: `Target`, position: 'insideTopRight', fontSize: 10, fill: '#3b82f6' }}
                    />

                    <Bar yAxisId="right" name="Parts Sold" dataKey="partsSold" fill="url(#bar-parts)" radius={[6,6,0,0]} barSize={18} />
                    <Bar yAxisId="left"  name="Orders (Invoices)" dataKey="orders"    fill="url(#bar-orders)" radius={[6,6,0,0]} barSize={18} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SalesChart;