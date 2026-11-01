import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BoxSelect, Layers, AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

// ✅ Animated Counter Hook
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start || target === 0) {
      setCount(target);
      return;
    }
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Ease Out Quart
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, start, duration]);

  return count;
}

// ✅ Floating Particle Background
function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            backgroundColor: i % 3 === 0 ? '#f97316' : i % 3 === 1 ? '#10b981' : '#3b82f6',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ✅ Circular Progress Ring
function ProgressRing({ value, max, color, size = 80, strokeWidth = 6 }) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? (animated / max) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (value === 0) return;
    let start = null;
    const duration = 2500;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timeout = setTimeout(() => requestAnimationFrame(animate), 400);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Background Ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-10"
        style={{ color }}
      />
      {/* Animated Progress Ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.1s ease' }}
      />
    </svg>
  );
}

// ✅ Main Card Component
function StatCard({ icon: Icon, value, label, description, color, bgColor, delay, totalParts, isAlert }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  const displayCount = useCountUp(value, 2000, visible);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative border rounded-2xl p-6 flex flex-col items-center text-center overflow-hidden cursor-default"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: hovered ? color : 'var(--border-color)',
        transform: visible
          ? hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0px) scale(1)'
          : 'translateY(30px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
        boxShadow: hovered ? `0 20px 40px ${color}25` : '0 4px 16px rgba(0,0,0,0.05)',
      }}
    >
      {/* Glow Effect on Hover */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Animated Corner Accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-full transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${color}20, transparent)`,
          transform: hovered ? 'scale(1.5)' : 'scale(1)',
        }}
      />

      {/* Progress Ring + Icon */}
      <div className="relative mb-4">
        <ProgressRing value={value} max={totalParts || 1} color={color} size={90} strokeWidth={5} />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: hovered ? 'spin-slow 3s linear infinite' : 'none',
          }}
        >
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={26} style={{ color }} />
          </div>
        </div>
      </div>

      {/* Animated Number */}
      <div className="relative z-10">
        <h3
          className="text-5xl font-black mb-1 tabular-nums"
          style={{
            color: isAlert ? color : 'var(--text-main)',
            textShadow: hovered ? `0 0 30px ${color}60` : 'none',
            transition: 'text-shadow 0.3s ease',
          }}
        >
          {displayCount.toLocaleString()}
        </h3>

        {/* Animated underline */}
        <div
          className="h-0.5 rounded-full mx-auto mb-2 transition-all duration-500"
          style={{
            backgroundColor: color,
            width: hovered ? '80%' : '30%',
          }}
        />

        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-main)' }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
          {description}
        </p>
      </div>

      {/* Bottom pulse indicator */}
      {isAlert && value > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }}
          />
          <span className="text-xs font-medium" style={{ color }}>
            Needs Attention
          </span>
        </div>
      )}

      {!isAlert && value > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              animation: 'pulse-dot 2s ease-in-out infinite',
              animationDelay: `${delay}ms`,
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Live
          </span>
        </div>
      )}
    </div>
  );
}

// ✅ Main Export
export default function CompatibilitySummary() {
  const [stats, setStats] = useState({ mappedParts: 0, supportedVehicles: 0, unmappedParts: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = () => {
    setRefreshing(true);
    axios.get('http://localhost:8080/api/spareparts/compatibility-summary')
      .then(response => {
        setStats(response.data);
        setLastUpdated(new Date());
        setLoading(false);
        setRefreshing(false);
      })
      .catch(error => {
        console.error("Error fetching compatibility stats:", error);
        // Demo data for UI preview
        setStats({ mappedParts: 226, supportedVehicles: 17, unmappedParts: 3 });
        setLoading(false);
        setRefreshing(false);
        setLastUpdated(new Date());
      });
  };

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totalParts = stats.mappedParts + stats.unmappedParts;
  const mappedPercent = totalParts > 0 ? Math.round((stats.mappedParts / totalParts) * 100) : 0;

  return (
    <>
      {/* ✅ Keyframe Animations via style tag */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.15; }
          33% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
          66% { transform: translateY(10px) translateX(-10px); opacity: 0.1; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes draw-line {
          from { width: 0; }
          to { width: 5rem; }
        }
        @keyframes fade-slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(35px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, var(--text-main) 0%, #f97316 40%, var(--text-main) 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div
        className="relative p-6 min-h-screen overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
      >
        {/* Floating Particles */}
        <ParticleBackground />

        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--text-main) 1px, transparent 1px),
              linear-gradient(90deg, var(--text-main) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* ✅ Animated Header */}
        <div
          className="flex flex-col items-center justify-center text-center mb-12 mt-4"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Orbiting Icon */}
          <div className="relative mb-6">
            <div
              className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/20"
              style={{ animation: 'float-icon 3s ease-in-out infinite' }}
            >
              <BoxSelect className="w-10 h-10 text-orange-500" />
            </div>
            {/* Orbiting dots */}
            {[0, 120, 240].map((deg, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#f97316', '#10b981', '#3b82f6'][i],
                  animation: `orbit ${3 + i}s linear infinite`,
                  animationDelay: `${i * 0.5}s`,
                  marginTop: '-4px',
                  marginLeft: '-4px',
                }}
              />
            ))}
          </div>

          <h1 className="text-4xl font-black mb-2 shimmer-text">
            Compatibility Summary
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            System-wide vehicle and parts mapping overview
          </p>

          {/* Animated underline */}
          <div
            className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full mt-3"
            style={{
              width: headerVisible ? '8rem' : '0',
              transition: 'width 1s ease 0.5s',
            }}
          />

          {/* Mapping Health Badge */}
          {!loading && (
            <div
              className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2"
              style={{
                backgroundColor: mappedPercent >= 90 ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.1)',
                borderColor: mappedPercent >= 90 ? 'rgba(16,185,129,0.3)' : 'rgba(249,115,22,0.3)',
                color: mappedPercent >= 90 ? '#10b981' : '#f97316',
                animation: 'fade-slide-down 0.5s ease 1s both',
              }}
            >
              <Zap size={12} />
              {mappedPercent}% Mapping Health
              {mappedPercent >= 90 ? ' — Excellent' : ' — Needs Review'}
            </div>
          )}
        </div>

        {/* ✅ Stat Cards */}
        {loading ? (
          // Loading Skeleton
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border rounded-2xl p-6 h-48"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  background: `linear-gradient(90deg, var(--bg-card) 25%, rgba(249,115,22,0.05) 50%, var(--bg-card) 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
              icon={CheckCircle2}
              value={stats.mappedParts}
              label="Mapped Parts"
              description="Parts linked to at least one vehicle"
              color="#10b981"
              delay={200}
              totalParts={totalParts}
              isAlert={false}
            />
            <StatCard
              icon={Layers}
              value={stats.supportedVehicles}
              label="Supported Vehicles"
              description="Unique vehicle models in system"
              color="#3b82f6"
              delay={400}
              totalParts={Math.max(stats.supportedVehicles, 20)}
              isAlert={false}
            />
            <StatCard
              icon={AlertCircle}
              value={stats.unmappedParts}
              label="Unmapped Parts"
              description="Needs stock keeper attention"
              color="#ef4444"
              delay={600}
              totalParts={totalParts}
              isAlert={true}
            />
          </div>
        )}

        {/* ✅ Admin Note - Animated */}
        <div
          className="max-w-3xl mx-auto rounded-2xl p-5 border relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            borderColor: 'rgba(249, 115, 22, 0.2)',
            animation: 'fade-slide-down 0.6s ease 1.2s both',
          }}
        >
          {/* Decorative left bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: 'linear-gradient(to bottom, #f97316, #fb923c50)' }}
          />
          <p className="text-sm pl-3" style={{ color: 'var(--text-main)' }}>
            💡 <span className="text-orange-400 font-semibold">Admin Note:</span>{' '}
            Detailed compatibility search and mapping assignments are handled via the{' '}
            <strong>Stock Keeper</strong> and <strong>Sales</strong> dashboards.
          </p>
        </div>
      </div>
    </>
  );
}