import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, Package, RefreshCw, ChevronRight, 
  BellRing, ShieldAlert 
} from 'lucide-react';

// Configuration for urgent levels
const urgencyConfig = {
  critical: { 
    color: '#ef4444', 
    bg: 'rgba(239,68,68,0.1)', 
    border: 'rgba(239,68,68,0.3)', 
    label: 'Critical' 
  },
  high: { 
    color: '#f97316', 
    bg: 'rgba(249,115,22,0.1)', 
    border: 'rgba(249,115,22,0.3)', 
    label: 'High' 
  },
  medium: { 
    color: '#eab308', 
    bg: 'rgba(234,179,8,0.1)', 
    border: 'rgba(234,179,8,0.3)', 
    label: 'Medium' 
  },
};

const LowStockAlert = ({ onNavigate }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/api/spareparts/low-stock')
      .then(response => {
        setLowStockItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching low stock items:", error);
        setLoading(false);
      });
  }, []);

  const getUrgency = (current, min) => {
    const ratio = current / (min || 1); 
    if (ratio <= 0.3) return 'critical';
    if (ratio <= 0.6) return 'high';
    return 'medium';
  };

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
      `}</style>

      <div className="relative overflow-hidden rounded-3xl border flex flex-col h-full p-5 sm:p-6 group/card transition-all duration-300"
        style={{ 
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}>

        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* ══ HEADER ══ */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--text-main)' }}>Low Stock Alerts</h2>
              <p className="text-[10px] mt-0.5 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {lowStockItems.length} Items need reorder
              </p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate && onNavigate('low-stock')} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer group/btn"
            style={{ 
              backgroundColor: 'var(--bg-main)',
              borderColor: 'var(--border-color)' 
            }}
          >
            <span className="text-[11px] font-black text-orange-500 group-hover/btn:text-orange-400">View all</span>
            <ChevronRight size={12} className="text-orange-500 group-hover/btn:text-orange-400" />
          </button>
        </div>

        {/* ══ CONTENT ══ */}
        <div className="flex-1 space-y-3 custom-scrollbar overflow-y-auto pb-2">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-orange-500 border-l-transparent animate-spin mb-3"></div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Checking Inventory...</p>
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <ShieldAlert size={24} className="text-emerald-500" />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Inventory Healthy</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>All parts sufficiently stocked</p>
            </div>
          ) : (
            lowStockItems.slice(0, 5).map((item, i) => {
              const current = item.stockQty || 0;
              const min = item.lowStockLimeted || 10; 
              const urgency = getUrgency(current, min);
              const styles = urgencyConfig[urgency];
              const percent = Math.min(Math.max((current / min) * 100, 0), 100);

              return (
                <div
                  key={item.productCode}
                  className="relative group p-4 rounded-2xl border transition-all duration-300"
                  style={{ 
                    opacity: 0,
                    animationName: 'slideInUp',
                    animationDuration: '0.5s',
                    animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animationDelay: `${i * 80}ms`,
                    animationFillMode: 'forwards',
                    backgroundColor: 'var(--bg-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  {/* TOP ROW */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                           style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                        <Package size={14} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate transition-colors" style={{ color: 'var(--text-main)' }}>
                          {item.productName}
                        </h3>
                        <p className="text-[10px] font-mono tracking-wide" style={{ color: 'var(--text-muted)' }}>
                          {item.productCode}
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-[10px] px-2.5 py-1 rounded-lg border font-black uppercase tracking-wider whitespace-nowrap ml-2"
                          style={{ 
                            color: styles.color, 
                            backgroundColor: styles.bg, 
                            borderColor: styles.border 
                          }}>
                       {styles.label}
                    </span>
                  </div>

                  {/* BOTTOM ROW */}
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full overflow-hidden mb-2 relative border"
                         style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: styles.color,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <BellRing size={10} style={{ color: styles.color }} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Stock Warning</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text-main)' }}>{current}</span>
                         <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/</span>
                         <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{min} units</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default LowStockAlert;