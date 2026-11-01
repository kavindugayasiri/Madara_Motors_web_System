import React, { useState, useEffect } from 'react';
import { Star, Search } from 'lucide-react';

// ════════════════════════════════════════
// BRAND DATA - Direct CDN URLs (reliable)
// ════════════════════════════════════════
const vehicleTypes = [
  {
    type: 'Car', emoji: '🚗', label: 'Cars',
    brands: [
      { name: 'Toyota',     logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
      { name: 'Honda',      logo: 'https://www.carlogos.org/car-logos/honda-logo.png' },
      { name: 'Nissan',     logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
      { name: 'Suzuki',     logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png' },
      { name: 'BMW',        logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
      { name: 'Mercedes',   logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
      { name: 'Hyundai',    logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
      { name: 'Mazda',      logo: 'https://www.carlogos.org/car-logos/mazda-logo.png' },
      { name: 'Mitsubishi', logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
      { name: 'Kia',        logo: 'https://www.carlogos.org/car-logos/kia-logo.png' },
      { name: 'Audi',       logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
      { name: 'Volkswagen', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo.png' },
    ],
  },
  {
    type: 'Van', emoji: '🚐', label: 'Vans',
    brands: [
      { name: 'Toyota',     logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
      { name: 'Nissan',     logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
      { name: 'Mitsubishi', logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
      { name: 'Mercedes',   logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
      { name: 'Ford',       logo: 'https://www.carlogos.org/car-logos/ford-logo.png' },
      { name: 'Honda',      logo: 'https://www.carlogos.org/car-logos/honda-logo.png' },
      { name: 'Hyundai',    logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
    ],
  },
  {
    type: 'SUV', emoji: '🚙', label: 'Jeeps / SUVs',
    brands: [
      { name: 'Toyota',     logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
      { name: 'Jeep',       logo: 'https://www.carlogos.org/car-logos/jeep-logo.png' },
      { name: 'BMW',        logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
      { name: 'Mitsubishi', logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
      { name: 'Nissan',     logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
      { name: 'Land Rover', logo: 'https://www.carlogos.org/car-logos/land-rover-logo.png' },
      { name: 'Suzuki',     logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png' },
      { name: 'Kia',        logo: 'https://www.carlogos.org/car-logos/kia-logo.png' },
      { name: 'Hyundai',    logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
    ],
  },
  {
    type: 'Lorry', emoji: '🚛', label: 'Lorries / Trucks',
    brands: [
      { name: 'Isuzu',         logo: 'https://www.carlogos.org/car-logos/isuzu-logo.png' },
      { name: 'Tata',          logo: 'https://www.carlogos.org/car-logos/tata-logo.png' },
      { name: 'Mercedes',      logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
      { name: 'Volvo',         logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
      { name: 'Mitsubishi',    logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
      { name: 'Nissan',        logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
      { name: 'Ashok Leyland', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Ashok_Leyland_Logo.svg' },
      { name: 'Hino',          logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Hino_Motors_logo.svg' },
    ],
  },
  {
    type: 'Bus', emoji: '🚌', label: 'Buses',
    brands: [
      { name: 'Ashok Leyland', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Ashok_Leyland_Logo.svg' },
      { name: 'Tata',          logo: 'https://www.carlogos.org/car-logos/tata-logo.png' },
      { name: 'Isuzu',         logo: 'https://www.carlogos.org/car-logos/isuzu-logo.png' },
      { name: 'Mercedes',      logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
      { name: 'Volvo',         logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
      { name: 'Toyota',        logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
    ],
  },
  {
    type: 'Pickup', emoji: '🛻', label: 'Pickups',
    brands: [
      { name: 'Toyota',     logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
      { name: 'Ford',       logo: 'https://www.carlogos.org/car-logos/ford-logo.png' },
      { name: 'Nissan',     logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
      { name: 'Mitsubishi', logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
      { name: 'Isuzu',      logo: 'https://www.carlogos.org/car-logos/isuzu-logo.png' },
      { name: 'Tata',       logo: 'https://www.carlogos.org/car-logos/tata-logo.png' },
      { name: 'Mahindra',   logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Mahindra_Rise_Logo.svg' },
    ],
  },
  {
    type: 'Tractor', emoji: '🚜', label: 'Tractors',
    brands: [
      { name: 'Mahindra',   logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Mahindra_Rise_Logo.svg' },
      { name: 'John Deere', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/John_Deere_logo.svg' },
      { name: 'Kubota',     logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Kubota_logo.svg' },
      { name: 'Tata',       logo: 'https://www.carlogos.org/car-logos/tata-logo.png' },
    ],
  },
  {
    type: 'Heavy', emoji: '🏗️', label: 'Heavy Machinery',
    brands: [
      { name: 'CAT',      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Caterpillar_logo.svg' },
      { name: 'Komatsu',  logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Komatsu_logo.svg' },
      { name: 'Hitachi',  logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Hitachi_logo.svg' },
      { name: 'JCB',      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/JCB_logo.svg' },
      { name: 'Volvo',    logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
    ],
  },
];

// ════════════════════════════════════════
// PARTICLE FIELD
// ════════════════════════════════════════
const ParticleField = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            backgroundColor: '#f97316',
            opacity: 0.12,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '65px 65px',
        }}
      />
    </div>
  );
};

// ════════════════════════════════════════
// BRAND LETTER AVATAR (Fallback)
// ════════════════════════════════════════
const brandColors = [
  { bg: '#1e1b4b', text: '#818cf8', border: '#4338ca' }, // Indigo
  { bg: '#1a1a2e', text: '#60a5fa', border: '#2563eb' }, // Blue
  { bg: '#1a0a00', text: '#fb923c', border: '#ea580c' }, // Orange
  { bg: '#0a1a0a', text: '#4ade80', border: '#16a34a' }, // Green
  { bg: '#1a0a1a', text: '#c084fc', border: '#9333ea' }, // Purple
  { bg: '#1a1a0a', text: '#facc15', border: '#ca8a04' }, // Yellow
  { bg: '#1a0a0a', text: '#f87171', border: '#dc2626' }, // Red
  { bg: '#0a1a1a', text: '#22d3ee', border: '#0891b2' }, // Cyan
];

const getBrandColor = (name) =>
  brandColors[name.charCodeAt(0) % brandColors.length];

// ════════════════════════════════════════
// BRAND CARD
// ════════════════════════════════════════
const BrandCard = ({ brand, index }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const bc = getBrandColor(brand.name);

  return (
    <div
      className="relative cursor-default"
      style={{
        animation: `brandEntrance 0.55s cubic-bezier(0.34,1.56,0.64,1) both`,
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-[1px] rounded-2xl transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, rgba(249,115,22,0.5), transparent 60%, rgba(249,115,22,0.2))`,
          opacity: hovered ? 1 : 0,
          borderRadius: '16px',
        }}
      />

      <div
        className="relative rounded-2xl border overflow-hidden transition-all duration-400"
        style={{
          backgroundColor: hovered ? 'rgba(249,115,22,0.05)' : 'var(--bg-card)',
          borderColor: hovered
            ? 'rgba(249,115,22,0.4)'
            : 'var(--border-color)',
          transform: hovered
            ? 'translateY(-5px) scale(1.03)'
            : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 20px 50px rgba(249,115,22,0.15), 0 0 0 1px rgba(249,115,22,0.15)'
            : 'none',
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-400"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(249,115,22,0.8), transparent)',
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Radial bg */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-400"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 65%)',
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-5 gap-4">

          {/* Logo Box */}
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center 
                       justify-center overflow-hidden transition-all duration-400"
            style={{
              backgroundColor: imgError ? bc.bg : '#ffffff',
              border: imgError
                ? `1px solid ${bc.border}40`
                : '1px solid var(--border-color)',
              transform: hovered ? 'rotate(-4deg) scale(1.08)' : 'rotate(0) scale(1)',
              boxShadow: hovered
                ? imgError
                  ? `0 0 20px ${bc.border}40`
                  : '0 4px 20px rgba(0,0,0,0.1)'
                : 'none',
              padding: imgError ? '0' : '8px',
            }}
          >
            {!imgError ? (
              <img
                src={brand.logo}
                alt={brand.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain transition-transform duration-400"
                style={{
                  transform: hovered ? 'scale(1.1)' : 'scale(1)',
                  filter: hovered ? 'brightness(1.05)' : 'brightness(1)',
                }}
              />
            ) : (
              /* Fallback Letter */
              <div
                className="w-full h-full flex items-center justify-center 
                           rounded-2xl font-black text-2xl"
                style={{
                  backgroundColor: bc.bg,
                  color: bc.text,
                  textShadow: `0 0 20px ${bc.text}60`,
                }}
              >
                {brand.name.charAt(0)}
              </div>
            )}

            {/* Shine overlay */}
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br 
                         from-white/10 to-transparent pointer-events-none 
                         transition-opacity duration-400"
              style={{ opacity: hovered ? 1 : 0 }}
            />
          </div>

          {/* Brand Name */}
          <h3
            className="text-xs font-bold tracking-wide text-center 
                       transition-colors duration-300"
            style={{ color: hovered ? 'var(--text-main)' : 'var(--text-muted)' }}
          >
            {brand.name}
          </h3>
        </div>

        {/* Bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-400"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(249,115,22,0.8), transparent)',
            opacity: hovered ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// FILTER TAB
// ════════════════════════════════════════
const FilterTab = ({ active, onClick, emoji, label }) => (
  <button
    onClick={onClick}
    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl 
               font-bold text-xs transition-all duration-250 
               hover:scale-105 overflow-hidden"
    style={active ? {
      background: 'linear-gradient(135deg, #f97316, #ea580c)',
      color: '#ffffff',
      boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
      border: '1px solid rgba(249,115,22,0.5)',
    } : {
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border-color)',
    }}
  >
    {active && (
      <div
        className="absolute inset-0 bg-gradient-to-r from-white/0 
                   via-white/10 to-white/0 pointer-events-none"
        style={{ animation: 'shimmerSlide 2s ease infinite' }}
      />
    )}
    <span className="text-base">{emoji}</span>
    <span className="relative z-10">{label}</span>
  </button>
);

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export default function Brands() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch]       = useState('');

  const getAllUniqueBrands = () => {
    const map = new Map();
    vehicleTypes.flatMap((v) => v.brands).forEach((b) => {
      if (!map.has(b.name)) map.set(b.name, b);
    });
    return Array.from(map.values());
  };

  const baseBrands =
    activeTab === 'All'
      ? getAllUniqueBrands()
      : vehicleTypes.find((v) => v.type === activeTab)?.brands || [];

  const displayed = baseBrands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalBrands = getAllUniqueBrands().length;

  return (
    <>
      <style>{`
        @keyframes brandEntrance {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.9);
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
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.9); opacity: 0;   }
        }
        @keyframes shimmerSlide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%);  }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .shimmer-brand {
          background: linear-gradient(
            90deg,
            #ffffff 0%, #fb923c 20%,
            #f97316 40%, #fb923c 60%,
            #ffffff 80%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 4s linear infinite;
        }
        .float-icon { animation: floatY 3.5s ease-in-out infinite; }
        .icon-ring {
          position: relative;
          display: inline-block;
        }
        .icon-ring::after {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 28px;
          border: 1.5px solid rgba(249,115,22,0.6);
          animation: pulseRing 2.2s ease-out infinite;
        }
        .search-box:focus-within {
          border-color: rgba(249,115,22,0.45) !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.08) !important;
        }
        .search-box:focus-within .s-icon { color: #f97316 !important; }
        .header-in { animation: fadeUp 0.7s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .filter-in { animation: fadeUp 0.7s cubic-bezier(0.34,1.2,0.64,1) 0.1s forwards; opacity:0; }
        .grid-in   { animation: fadeUp 0.5s ease 0.2s forwards; opacity:0; }
        .foot-in   { animation: fadeUp 0.5s ease 0.4s forwards; opacity:0; }
      `}</style>

      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}
      >
        <ParticleField />

        {/* Ambient */}
        <div
          className="fixed top-[-100px] left-1/2 -translate-x-1/2 
                     w-[650px] h-[380px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.05) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16">

          {/* ═══════ HEADER ═══════ */}
          <div className="header-in pt-12 pb-8 text-center">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="icon-ring">
                <div
                  className="float-icon w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
                    border: '1px solid rgba(249,115,22,0.3)',
                    boxShadow: '0 8px 32px rgba(249,115,22,0.2)',
                  }}
                >
                  <Star
                    size={36}
                    strokeWidth={1.5}
                    style={{
                      color: '#f97316',
                      filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.6))',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-orange-500/60" />
              <span className="text-[11px] font-black text-orange-400 uppercase tracking-[0.25em]">
                Vehicle Brands
              </span>
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-orange-500/60" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3">
              <span className="shimmer-brand">Supported</span>
              <span style={{ color: 'var(--text-main)' }}> Brands</span>
            </h1>

            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
              Premium vehicle brands supported across all categories 
              in our spare parts inventory.
            </p>

            {/* Stat pills */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[
                { label: 'Total Brands',    value: totalBrands,         hex: '#f97316' },
                { label: 'Vehicle Types',   value: vehicleTypes.length,  hex: '#fb923c' },
                { label: 'Showing',         value: displayed.length,     hex: '#10b981' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl 
                             border text-xs font-bold"
                  style={{
                    backgroundColor: `${s.hex}10`,
                    borderColor: `${s.hex}25`,
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', opacity: 0.8 }}>{s.label}</span>
                  <span style={{ color: s.hex }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ FILTER TABS ═══════ */}
          <div className="filter-in mb-8">

            {/* Search */}
            <div className="max-w-sm mx-auto mb-5">
              <div
                className="search-box relative flex items-center rounded-2xl 
                           border transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Search
                  size={15}
                  className="s-icon absolute left-4 transition-colors pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brands..."
                  className="w-full bg-transparent pl-10 pr-10 py-3 text-sm focus:outline-none"
                  style={{ color: 'var(--text-main)' }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 text-xs px-2 py-0.5 rounded-lg 
                               transition-colors font-bold"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              <FilterTab
                active={activeTab === 'All'}
                onClick={() => setActiveTab('All')}
                emoji="🌐"
                label="All Brands"
              />
              {vehicleTypes.map((v) => (
                <FilterTab
                  key={v.type}
                  active={activeTab === v.type}
                  onClick={() => setActiveTab(v.type)}
                  emoji={v.emoji}
                  label={v.label}
                />
              ))}
            </div>
          </div>

          {/* ═══════ BRAND GRID ═══════ */}
          {displayed.length > 0 ? (
            <div
              className="grid-in grid grid-cols-3 sm:grid-cols-4 
                         md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3"
            >
              {displayed.map((brand, i) => (
                <BrandCard key={`${brand.name}-${i}`} brand={brand} index={i} />
              ))}
            </div>
          ) : (
            /* Empty */
            <div
              className="flex flex-col items-center justify-center py-24 
                         border border-dashed rounded-2xl"
              style={{
                borderColor: 'rgba(249,115,22,0.15)',
                backgroundColor: 'rgba(249,115,22,0.02)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center 
                           mb-4 border"
                style={{
                  backgroundColor: 'rgba(249,115,22,0.08)',
                  borderColor: 'rgba(249,115,22,0.2)',
                  animation: 'floatY 3s ease-in-out infinite',
                }}
              >
                <Star size={24} style={{ color: '#f97316' }} />
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>No brands found</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                No results for "{search}"
              </p>
              <button
                onClick={() => setSearch('')}
                className="text-xs font-bold px-4 py-2 rounded-xl border 
                           hover:scale-105 transition-all"
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

          {/* ═══════ FOOTER ═══════ */}
          {displayed.length > 0 && (
            <div className="foot-in mt-10 flex items-center justify-center gap-3">
              <div
                className="h-px flex-1 max-w-xs"
                style={{
                  background:
                    'linear-gradient(to right, transparent, rgba(249,115,22,0.25))',
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
                  {displayed.length} brands · {activeTab === 'All' ? 'All vehicles' : activeTab}
                </p>
              </div>
              <div
                className="h-px flex-1 max-w-xs"
                style={{
                  background:
                    'linear-gradient(to left, transparent, rgba(249,115,22,0.25))',
                }}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}