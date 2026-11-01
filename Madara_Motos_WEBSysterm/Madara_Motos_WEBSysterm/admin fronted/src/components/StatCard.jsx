import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title, numericValue, change, changeType,
  icon, color, bgColor, prefix = '', suffix = '',
  delay = 0
}) => {
  const [visible, setVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      const duration = 1800;
      const steps = 80;
      const increment = numericValue / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  const formatDisplay = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const cardId = title.replace(/\s+/g, '-').toLowerCase();

  return (
    <>
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes value-pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes shimmer-slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .stat-card-${cardId}:hover .icon-wrap {
          transform: scale(1.1) rotate(-5deg);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`stat-card-${cardId} relative rounded-2xl p-5 overflow-hidden cursor-pointer border`}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: hovered ? `${bgColor}60` : 'var(--border-color)',
          animation: visible ? `card-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms both` : 'none',
          boxShadow: hovered
            ? `0 8px 32px ${bgColor}20, 0 2px 8px rgba(0,0,0,0.06)`
            : '0 2px 8px rgba(0,0,0,0.04)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* ✅ Subtle top color bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${bgColor}, transparent)`,
            opacity: hovered ? 1 : 0.4,
          }}
        />

        {/* ✅ Background radial glow */}
        <div
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top right, ${bgColor}12, transparent 65%)`,
            opacity: hovered ? 1 : 0.5,
          }}
        />

        {/* ✅ Shimmer on hover */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${bgColor}10 50%, transparent 60%)`,
              animation: 'shimmer-slide 0.8s ease',
            }}
          />
        )}

        {/* ✅ Top Row - Title + Icon */}
        <div className="relative flex items-start justify-between mb-4 z-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {title}
          </p>

          {/* Icon with pulse ring */}
          <div className="relative icon-wrap">
            {hovered && (
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  border: `2px solid ${bgColor}`,
                  animation: 'pulse-ring 1s ease-out infinite',
                }}
              />
            )}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                background: `${bgColor}15`,
                border: `1px solid ${bgColor}30`,
              }}
            >
              <div className={color}>{icon}</div>
            </div>
          </div>
        </div>

        {/* ✅ Value Display (Bigger and Centered without the graph) */}
        <div className="relative z-10 my-4">
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                {prefix}
              </span>
            )}
            <span
              className={`font-black ${color}`}
              style={{
                fontSize: '2.5rem', /* Made slightly bigger since graph is gone */
                lineHeight: 1,
                animation: visible && numericValue > 0
                  ? `value-pop 0.4s ease ${delay + 1400}ms both`
                  : 'none',
                textShadow: hovered ? `0 0 20px ${bgColor}50` : 'none',
                transition: 'text-shadow 0.3s ease',
              }}
            >
              {prefix === 'LKR'
                ? displayValue.toLocaleString()
                : formatDisplay(displayValue)}
            </span>
            {suffix && (
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {suffix}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Bottom divider line (Matches card theme color) */}
        <div
          className="relative z-10 h-px mt-6 mb-4 rounded-full transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, ${bgColor}60, transparent)`,
            width: hovered ? '100%' : '40%',
          }}
        />

        {/* ✅ Change badge (Only the badge, no "vs last month") */}
        <div className="relative flex items-center z-10">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              changeType === 'up'
                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                : changeType === 'down'
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-gray-500/10 border border-gray-500/20'
            }`}
            style={{
              color: changeType === 'neutral' ? 'var(--text-muted)' : undefined,
              transform: hovered ? 'translateX(5px)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            {changeType === 'up'
              ? <TrendingUp size={12} strokeWidth={3} />
              : changeType === 'down'
              ? <TrendingDown size={12} strokeWidth={3} />
              : <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />}
            <span>{change}</span>
          </div>
        </div>

      </div>
    </>
  );
};

export default StatCard;