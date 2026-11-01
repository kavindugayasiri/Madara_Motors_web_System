import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Settings, Wrench, Zap, CircleDashed, ShieldAlert,
  Package, Droplets, Sun, Wind, CarFront,
  Disc, Battery, Layers, Speaker, Search
} from 'lucide-react';

// ════════════════════════════════════════
// PARTICLE FIELD
// ════════════════════════════════════════
const ParticleField = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
    color: ['#f97316', '#fb923c', '#fdba74', '#ffffff'][
      Math.floor(Math.random() * 4)
    ],
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: 0.15,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '70px 70px',
        }}
      />
    </div>
  );
};

// ════════════════════════════════════════
// CATEGORY STYLE ENGINE
// ════════════════════════════════════════
const getCategoryStyle = (categoryName) => {
  const name = (categoryName || '').toLowerCase();

  const matchers = [
    { keys: ['engine', 'motor', 'piston'],
      icon: Settings, hex: '#ef4444' },
    { keys: ['light', 'lighting', 'lamp', 'led', 'headlight'],
      icon: Sun, hex: '#facc15' },
    { keys: ['audio', 'sound', 'speaker', 'music'],
      icon: Speaker, hex: '#a855f7' },
    { keys: ['cool', 'cooling', 'ac', 'air', 'hvac'],
      icon: Wind, hex: '#38bdf8' },
    { keys: ['lube', 'lubric', 'oil', 'fluid', 'grease'],
      icon: Droplets, hex: '#f59e0b' },
    { keys: ['brake', 'disc', 'rotor', 'pad'],
      icon: Disc, hex: '#f43f5e' },
    { keys: ['suspension', 'shock', 'strut', 'spring'],
      icon: Wrench, hex: '#06b6d4' },
    { keys: ['body', 'exterior', 'panel', 'bumper', 'door'],
      icon: CarFront, hex: '#10b981' },
    { keys: ['battery', 'electric', 'wire', 'alternator', 'starter'],
      icon: Battery, hex: '#eab308' },
    { keys: ['tire', 'tyre', 'wheel', 'rim', 'alloy'],
      icon: CircleDashed, hex: '#f97316' },
    { keys: ['filter', 'air filter', 'fuel filter', 'cabin'],
      icon: ShieldAlert, hex: '#8b5cf6' },
    { keys: ['interior', 'seat', 'dashboard', 'carpet'],
      icon: Layers, hex: '#ec4899' },
    { keys: ['exhaust', 'muffler', 'pipe'],
      icon: Zap, hex: '#64748b' },
  ];

  for (const m of matchers) {
    if (m.keys.some((k) => name.includes(k))) {
      return { icon: m.icon, hex: m.hex };
    }
  }

  const fallbacks = [
    { icon: Package,     hex: '#f97316' },
    { icon: Wrench,      hex: '#06b6d4' },
    { icon: Zap,         hex: '#a855f7' },
    { icon: ShieldAlert, hex: '#10b981' },
    { icon: Settings,    hex: '#f43f5e' },
    { icon: Layers,      hex: '#ec4899' },
  ];
  return fallbacks[name.length % fallbacks.length];
};

// ════════════════════════════════════════
// STAT PILL
// ════════════════════════════════════════
const StatPill = ({ label, value, hex }) => (
  <div
    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold"
    style={{
      backgroundColor: `${hex}10`,
      borderColor: `${hex}25`,
    }}
  >
    <span style={{ color: 'var(--text-muted)' }} className="font-medium text-xs">{label}</span>
    <span style={{ color: hex }}>{value}</span>
  </div>
);

// ════════════════════════════════════════
// CATEGORY CARD
// ════════════════════════════════════════
const CategoryCard = ({ name, index, isSelected, onClick }) => {
  const { icon: Icon, hex } = getCategoryStyle(name);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative cursor-pointer"
      style={{
        animation: `cardEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) both`,
        animationDelay: `${index * 60}ms`,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer Glow Ring */}
      <div
        className="absolute -inset-[1px] rounded-2xl transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${hex}60, transparent 60%, ${hex}30)`,
          opacity: hovered || isSelected ? 1 : 0,
        }}
      />

      {/* Card Body */}
      <div
        className="relative rounded-2xl border overflow-hidden transition-all duration-500"
        style={{
          backgroundColor: hovered || isSelected ? `${hex}08` : 'var(--bg-card)',
          borderColor:
            hovered || isSelected
              ? `${hex}50`
              : 'var(--border-color)',
          transform: hovered
            ? 'translateY(-6px) scale(1.02)'
            : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? `0 20px 60px ${hex}25, 0 0 0 1px ${hex}20`
            : isSelected
            ? `0 0 0 2px ${hex}60, 0 8px 30px ${hex}15`
            : 'none',
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${hex}, transparent)`,
            opacity: hovered || isSelected ? 1 : 0,
          }}
        />

        {/* Radial glow bg */}
        <div
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${hex}12 0%, transparent 65%)`,
            opacity: hovered || isSelected ? 1 : 0,
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center justify-center p-7 gap-5">

          {/* Icon */}
          <div className="relative">
            {/* Icon glow blob */}
            <div
              className="absolute inset-0 rounded-2xl blur-lg transition-all duration-500"
              style={{
                backgroundColor: hex,
                opacity: hovered ? 0.35 : 0,
                transform: hovered ? 'scale(1.4)' : 'scale(1)',
              }}
            />

            <div
              className="relative w-16 h-16 rounded-2xl flex items-center 
                         justify-center transition-all duration-500"
              style={{
                backgroundColor:
                  hovered || isSelected
                    ? `${hex}18`
                    : 'var(--bg-main)',
                border: `1px solid ${
                  hovered || isSelected
                    ? hex + '35'
                    : 'var(--border-color)'
                }`,
                transform: hovered
                  ? 'rotate(-6deg) scale(1.1)'
                  : 'rotate(0deg) scale(1)',
                boxShadow: hovered ? `inset 0 0 20px ${hex}20` : 'none',
              }}
            >
              <Icon
                size={32}
                strokeWidth={1.5}
                style={{
                  color: hovered || isSelected ? hex : 'var(--text-muted)',
                  transition: 'color 0.4s ease',
                  filter: hovered
                    ? `drop-shadow(0 0 8px ${hex}80)`
                    : 'none',
                }}
              />
            </div>
          </div>

          {/* Name */}
          <h3
            className="text-sm font-bold tracking-wide transition-all 
                       duration-300 text-center"
            style={{
              color: hovered || isSelected ? 'var(--text-main)' : 'var(--text-muted)',
            }}
          >
            {name}
          </h3>
        </div>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] 
                     transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${hex}, transparent)`,
            opacity: hovered || isSelected ? 1 : 0,
          }}
        />

        {/* Selected dot badge */}
        {isSelected && (
          <div
            className="absolute top-3 right-3 w-5 h-5 rounded-full 
                       flex items-center justify-center"
            style={{
              backgroundColor: hex,
              boxShadow: `0 0 10px ${hex}60`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/spareparts/categories')
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = categories.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.92);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes shimmerText {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0;   }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin360 {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }

        .shimmer-orange {
          background: linear-gradient(
            90deg,
            var(--text-main) 0%, #fb923c 20%,
            #f97316 40%, #fb923c 60%,
            var(--text-main) 80%, #fb923c 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 4s linear infinite;
        }

        .float-icon  { animation: floatY   3.5s ease-in-out infinite; }
        .header-anim { animation: fadeSlideDown 0.7s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .search-anim {
          animation: fadeSlideUp 0.7s cubic-bezier(0.34,1.2,0.64,1) 0.15s forwards;
          opacity: 0;
        }
        .grid-anim {
          animation: fadeSlideUp 0.5s ease 0.3s forwards;
          opacity: 0;
        }
        .footer-anim {
          animation: fadeSlideUp 0.5s ease 0.5s forwards;
          opacity: 0;
        }

        /* Pulse ring around header icon */
        .icon-pulse-wrap { position: relative; display: inline-block; }
        .icon-pulse-wrap::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 28px;
          border: 1.5px solid #f97316;
          animation: pulseRing 2.2s ease-out infinite;
          pointer-events: none;
        }

        /* Search focus glow */
        .search-box:focus-within {
          border-color: rgba(249,115,22,0.45) !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
        }
        .search-box:focus-within .search-icon {
          color: #f97316 !important;
        }
      `}</style>

      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-main)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <ParticleField />

        {/* Ambient blobs */}
        <div
          className="fixed top-[-120px] left-1/2 -translate-x-1/2 
                     w-[700px] h-[420px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.05) 0%, transparent 70%)' }}
        />
        <div
          className="fixed bottom-0 left-0 w-96 h-96 rounded-full 
                     blur-3xl pointer-events-none"
          style={{ background: 'rgba(249,115,22,0.03)' }}
        />
        <div
          className="fixed bottom-0 right-0 w-96 h-96 rounded-full 
                     blur-3xl pointer-events-none"
          style={{ background: 'rgba(251,146,60,0.03)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16">

          {/* ══════════════════════════
              HEADER
          ══════════════════════════ */}
          <div className="header-anim pt-12 pb-10 text-center">

            {/* Floating Icon */}
            <div className="flex justify-center mb-7">
              <div className="icon-pulse-wrap">
                <div
                  className="float-icon w-20 h-20 rounded-3xl flex items-center 
                             justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
                    border: '1px solid rgba(249,115,22,0.3)',
                    boxShadow:
                      '0 8px 32px rgba(249,115,22,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <Layers
                    size={36}
                    strokeWidth={1.5}
                    style={{
                      color: '#f97316',
                      filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.6))',
                    }}
                  />
                  {/* Shine */}
                  <div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br 
                               from-white/10 to-transparent pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500/60" />
              <span className="text-[11px] font-black text-orange-400 uppercase tracking-[0.25em]">
                Spare Parts
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-500/60" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className="shimmer-orange">Inventory</span>
              <span style={{ color: 'var(--text-main)' }}> Categories</span>
            </h1>

            <p className="text-sm font-medium max-w-md mx-auto mb-7" style={{ color: 'var(--text-muted)' }}>
              Browse all spare part categories available in the system.
            </p>

            {/* Stat Pills */}
            {!loading && (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <StatPill
                  label="Total"
                  value={`${categories.length} Categories`}
                  hex="#f97316"
                />
                <StatPill
                  label="Showing"
                  value={`${filtered.length} Results`}
                  hex="#fb923c"
                />
                {selected && (
                  <StatPill
                    label="Selected"
                    value={selected}
                    hex="#10b981"
                  />
                )}
              </div>
            )}
          </div>

          {/* ══════════════════════════
              SEARCH BAR
          ══════════════════════════ */}
          <div className="search-anim mb-10">
            <div className="relative max-w-lg mx-auto">
              {/* Outer blur glow */}
              <div
                className="absolute -inset-[1px] rounded-2xl blur-sm 
                           pointer-events-none opacity-0 
                           transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(249,115,22,0.4), transparent)',
                }}
              />

              <div
                className="search-box relative flex items-center rounded-2xl 
                           border transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Search
                  size={16}
                  className="search-icon absolute left-4 transition-colors duration-300 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full bg-transparent pl-11 pr-12 py-4 text-sm focus:outline-none"
                  style={{ color: 'var(--text-main)' }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-4 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════
              GRID / LOADING / EMPTY
          ══════════════════════════ */}
          {loading ? (
            /* Loading */
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl border flex items-center justify-center"
                  style={{
                    borderColor: 'rgba(249,115,22,0.2)',
                    backgroundColor: 'rgba(249,115,22,0.05)',
                  }}
                >
                  <Settings
                    size={32}
                    style={{
                      color: '#f97316',
                      animation: 'spin360 2s linear infinite',
                    }}
                  />
                </div>
                <div
                  className="absolute inset-0 rounded-2xl blur-xl"
                  style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}
                />
              </div>
              <div className="text-center">
                <p className="text-base font-bold mb-1" style={{ color: 'var(--text-main)' }}>
                  Loading Categories
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Fetching from inventory system...
                </p>
              </div>
              {/* Skeleton */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-3xl mt-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl h-36 animate-pulse"
                    style={{
                      backgroundColor: 'var(--border-color)',
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

          ) : filtered.length > 0 ? (
            /* Grid */
            <div
              className="grid-anim grid grid-cols-2 sm:grid-cols-3 
                         md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {filtered.map((name, i) => (
                <CategoryCard
                  key={name}
                  name={name}
                  index={i}
                  isSelected={selected === name}
                  onClick={() =>
                    setSelected(selected === name ? null : name)
                  }
                />
              ))}
            </div>

          ) : (
            /* Empty */
            <div
              className="flex flex-col items-center justify-center py-28 
                         border border-dashed rounded-2xl"
              style={{
                borderColor: 'rgba(249,115,22,0.15)',
                backgroundColor: 'rgba(249,115,22,0.02)',
                animation: 'fadeSlideUp 0.4s ease forwards',
              }}
            >
              <div
                className="float-icon w-16 h-16 rounded-2xl flex items-center 
                           justify-center mb-4 border"
                style={{
                  backgroundColor: 'rgba(249,115,22,0.08)',
                  borderColor: 'rgba(249,115,22,0.2)',
                }}
              >
                <Package size={28} style={{ color: '#f97316' }} />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-main)' }}>
                No categories found
              </h3>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                No results matching "{search}"
              </p>
              <button
                onClick={() => setSearch('')}
                className="text-xs font-bold px-4 py-2 rounded-xl border 
                           transition-all duration-200 hover:scale-105"
                style={{
                  color: '#f97316',
                  borderColor: 'rgba(249,115,22,0.3)',
                  backgroundColor: 'rgba(249,115,22,0.08)',
                }}
              >
                Clear Search
              </button>
            </div>
          )}

          {/* ══════════════════════════
              FOOTER COUNT
          ══════════════════════════ */}
          {!loading && filtered.length > 0 && (
            <div className="footer-anim mt-10 flex items-center justify-center gap-3">
              <div
                className="h-px flex-1 max-w-xs"
                style={{
                  background:
                    'linear-gradient(to right, transparent, rgba(249,115,22,0.2))',
                }}
              />
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full 
                               rounded-full opacity-75"
                    style={{ backgroundColor: '#f97316' }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#f97316' }}
                  />
                </span>
                <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  {filtered.length} of {categories.length} categories shown
                </p>
              </div>
              <div
                className="h-px flex-1 max-w-xs"
                style={{
                  background:
                    'linear-gradient(to left, transparent, rgba(249,115,22,0.2))',
                }}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}