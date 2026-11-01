import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Package, Tag, Car, Wrench,
  AlertTriangle, CheckCircle, Hash,
  Star, TrendingUp, Clock, Shield,
  Layers, Zap, Info, BarChart3
} from 'lucide-react';

// ════════════════════════════════════════
// PARTICLE FIELD
// ════════════════════════════════════════
const ParticleField = ({ accent }) => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 10 + 6,
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
            backgroundColor: accent,
            opacity: 0.08,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

// ════════════════════════════════════════
// CATEGORY → THEME
// ════════════════════════════════════════
const getCatTheme = (cat) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('engine'))
    return { hex: '#ef4444', name: 'Engine',     grad: 'from-red-600 to-orange-600'    };
  if (c.includes('body'))
    return { hex: '#10b981', name: 'Body',       grad: 'from-emerald-600 to-teal-600'  };
  if (c.includes('brake'))
    return { hex: '#f43f5e', name: 'Brakes',    grad: 'from-rose-600 to-pink-600'     };
  if (c.includes('electric') || c.includes('battery'))
    return { hex: '#eab308', name: 'Electrical',grad: 'from-yellow-500 to-amber-500'  };
  if (c.includes('suspension'))
    return { hex: '#06b6d4', name: 'Suspension',grad: 'from-cyan-600 to-sky-600'       };
  if (c.includes('filter'))
    return { hex: '#8b5cf6', name: 'Filter',    grad: 'from-violet-600 to-purple-600' };
  if (c.includes('light') || c.includes('lighting'))
    return { hex: '#facc15', name: 'Lighting',  grad: 'from-yellow-400 to-amber-400'  };
  if (c.includes('oil') || c.includes('lubric'))
    return { hex: '#f59e0b', name: 'Lubricants',grad: 'from-amber-500 to-orange-500'  };
  if (c.includes('cool'))
    return { hex: '#38bdf8', name: 'Cooling',    grad: 'from-sky-500 to-blue-500'      };
  return   { hex: '#f97316', name: 'General',    grad: 'from-orange-500 to-amber-500'  };
};

// ════════════════════════════════════════
// DETAIL ROW
// ════════════════════════════════════════
const DetailRow = ({ icon: Icon, label, value, accent, mono, last }) => (
  <div
    className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.025] transition-colors duration-200"
    style={{ borderBottom: last ? 'none' : '1px solid var(--border-color)' }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
      style={{
        background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
        border: `1px solid ${accent}25`,
      }}
    >
      <Icon size={15} style={{ color: accent }} />
    </div>
    <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
      <span className="text-[11px] font-black uppercase tracking-[0.12em] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span
        className="text-sm font-bold truncate"
        style={{ color: mono ? accent : 'var(--text-main)', fontFamily: mono ? 'monospace' : 'inherit' }}
      >
        {value}
      </span>
    </div>
  </div>
);

// ════════════════════════════════════════
// MINI STAT CARD
// ════════════════════════════════════════
const MiniStat = ({ icon: Icon, label, value, hex }) => (
  <div
    className="relative overflow-hidden rounded-2xl border p-4 text-center group hover:scale-105 transition-all duration-300"
    style={{
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-color)',
    }}
  >
    <div
      className="absolute -top-3 -right-3 w-10 h-10 rounded-full blur-lg opacity-10 group-hover:opacity-20 transition-opacity"
      style={{ backgroundColor: hex }}
    />
    <Icon size={18} className="mx-auto mb-2 relative z-10" style={{ color: hex }} />
    <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
      {label}
    </p>
    <p className="text-xs font-black relative z-10" style={{ color: hex }}>
      {value}
    </p>
  </div>
);

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
const ProductDetails = () => {
  const { id } = useParams();
  const [part, setPart]     = useState(null);
  const [imgErr, setImgErr] = useState(false);
  const [tab, setTab]       = useState('details');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8080/api/spareparts/${id}`)
        .then(res => setPart(res.data))
        .catch(err => console.log(err));
    }
  }, [id]);

  if (!part) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="flex flex-col items-center gap-4">
        <Loader size={28} color="#f97316" />
        <div className="text-center">
          <p className="text-sm font-black mb-1" style={{ color: 'var(--text-main)' }}>Loading Part Details</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fetching from database...</p>
        </div>
      </div>
    </div>
  );

  const theme  = getCatTheme(part.partCategory);
  const accent = theme.hex;
  const stockQty = part.stockQty ?? part.quantity ?? 0;
  const isLow  = stockQty > 0 && stockQty <= (part.lowStockLimited ?? 5);
  const isOut  = stockQty === 0;

  const stockColor = isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const stockLabel = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';

  const details = [
    { icon: Layers,  label: 'Category',     value: part.partCategory,  mono: false },
    { icon: Star,    label: 'Brand',        value: part.brand,         mono: false },
    { icon: Car,     label: 'Model',        value: part.model,         mono: false },
    { icon: Wrench,  label: 'Vehicle Type', value: part.vehicleType,   mono: false },
    { icon: Hash,    label: 'Product Code', value: part.productCode,   mono: true  },
    { icon: Shield,  label: 'Warranty',     value: part.warranty || 'Standard', mono: false },
  ].filter(d => d.value);

  return (
    <>
      <style>{`
        @keyframes pageIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmerFlow { 0% { background-position:-200% center; } 100% { background-position: 200% center; } }
        @keyframes floatUpDown { 0%,100% { transform:translateY(0px) rotate(-1deg); } 50% { transform:translateY(-10px) rotate(1deg); } }
        .page-enter { animation:pageIn 0.7s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .product-title {
          background: linear-gradient(135deg, var(--text-main) 0%, ${accent} 40%, var(--text-main) 60%, ${accent} 100%);
          background-size: 300% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmerFlow 6s linear infinite;
        }
        .img-animate { animation: floatUpDown 5s ease-in-out infinite; filter: drop-shadow(0 12px 30px ${accent}40); }
      `}</style>

      <div className="min-h-screen relative overflow-x-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', fontFamily: "'Inter', sans-serif" }}>
        <ParticleField accent={accent} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">

          {/* ══ BACK BUTTON ══ */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2.5 mb-10 px-5 py-2.5 rounded-2xl border font-bold text-sm transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: accent }}
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1.5 transition-transform duration-300" />
            Back to Inventory
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-4">
              <div
                className="img-card relative rounded-3xl border overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', minHeight: '380px' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />

                <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider"
                    style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
                    <Layers size={10} /> {part.partCategory || 'General'}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border"
                    style={{ backgroundColor: `${stockColor}12`, borderColor: `${stockColor}30`, color: stockColor }}>
                    {isOut || isLow ? <AlertTriangle size={10} /> : <CheckCircle size={10} />} {stockLabel}
                  </div>
                </div>

                <div className="flex items-center justify-center" style={{ padding: '80px 32px 40px' }}>
                  {!imgErr && part.imageUrl && part.imageUrl !== 'null' ? (
                    <img src={`http://localhost:8080/images/${part.imageUrl}`} alt={part.productName} onError={() => setImgErr(true)} className="img-animate relative z-10 max-h-56 w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: `${accent}10`, border: `2px dashed ${accent}30` }}>
                        <Wrench size={36} style={{ color: `${accent}80` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MiniStat icon={Package} label="Stock" value={`${stockQty} units`} hex={stockColor} />
                <MiniStat icon={TrendingUp} label="Price" value={`LKR ${(part.sellingPrice || 0).toLocaleString()}`} hex={accent} />
                <MiniStat icon={Clock} label="Delivery" value="2-3 Days" hex="#6366f1" />
              </div>

              <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: stockColor }}>Stock Level</p>
                <p className="text-2xl font-black mb-3" style={{ color: 'var(--text-main)' }}>{stockQty} <span className="text-sm font-bold opacity-50">units</span></p>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((stockQty / 50) * 100, 100)}%`, background: stockColor }} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-[2px] w-10 rounded-full" style={{ background: accent }} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>{part.brand} {part.vehicleType && `· ${part.vehicleType}`}</span>
                </div>
                <h1 className="product-title text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">{part.productName}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border" style={{ backgroundColor: `${accent}10`, borderColor: `${accent}25`, color: accent }}><Hash size={11} />{part.productCode}</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Selling Price</p>
                <p className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: accent }}>LKR {(part.sellingPrice || 0).toLocaleString()}</p>
              </div>

              <div>
                <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
                  {[{ id: 'details', label: 'Details', icon: Info }, { id: 'description', label: 'Description', icon: BarChart3 }].map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200`} style={{ color: tab === t.id ? accent : 'var(--text-muted)', borderBottom: tab === t.id ? `2px solid ${accent}` : '2px solid transparent' }}>
                      <t.icon size={13} /> {t.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-b-2xl border border-t-0 overflow-hidden" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                  {tab === 'details' ? (
                    details.map((d, i) => <DetailRow key={d.label} {...d} accent={accent} last={i === details.length - 1} />)
                  ) : (
                    <div className="p-6"><p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{part.description || 'No additional description provided.'}</p></div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

const Loader = ({ size, color }) => (
  <div className="relative">
    <div className="w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg" style={{ borderColor: `${color}40`, backgroundColor: 'var(--bg-card)' }}>
      <Package size={size} className="animate-spin" style={{ color }} />
    </div>
  </div>
);

export default ProductDetails;