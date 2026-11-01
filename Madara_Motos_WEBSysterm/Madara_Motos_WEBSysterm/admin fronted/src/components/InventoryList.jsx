import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PartCard from './PartCard';
import {
  Loader2, PackageSearch, RefreshCcw,
  Search, Package, AlertTriangle, CheckCircle
} from 'lucide-react';

const InventoryList = () => {
  const navigate = useNavigate();
  const [parts, setParts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sortBy, setSortBy]     = useState('default');

  const fetchParts = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/spareparts/all')
      .then(res => { 
        const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setParts(data); 
        setLoading(false); 
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchParts(); }, []);

  const categories = ['All', ...new Set(parts.map(p => p.partCategory).filter(Boolean))];

  const filtered = parts
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch =
        (p.productName || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.productCode || '').toLowerCase().includes(q);
      const matchCat = filterCat === 'All' || p.partCategory === filterCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'stock-asc')  return a.stockQty - b.stockQty;
      if (sortBy === 'name')       return a.productName?.localeCompare(b.productName);
      return 0;
    });

  const lowStock = parts.filter(p => (p.stockQty || p.quantity || 0) <= (p.lowStockLimeted || 5)).length;
  const inStock  = parts.filter(p => (p.stockQty || p.quantity || 0) > 0).length;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-title {
          background: linear-gradient(90deg, var(--text-main) 0%,#fb923c 25%,#f97316 50%,#fb923c 75%,var(--text-main) 100%);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .header-in { animation:fadeUp 0.6s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .card-in   { animation:fadeUp 0.5s ease 0.1s forwards; opacity:0; }
        .grid-in   { animation:fadeUp 0.5s ease 0.2s forwards; opacity:0; }
        .search-box:focus-within {
          border-color:rgba(249,115,22,0.5) !important;
          box-shadow:0 0 0 3px rgba(249,115,22,0.08) !important;
        }
        .search-box:focus-within .s-icon { color:#f97316 !important; }
      `}</style>

      <div className="min-h-screen relative transition-colors duration-300" style={{ backgroundColor:'var(--bg-main)', fontFamily:"'Inter',sans-serif" }}>
        
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-72 rounded-full blur-3xl pointer-events-none"
             style={{ background:'radial-gradient(ellipse,rgba(249,115,22,0.04) 0%,transparent 70%)' }} />
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
             style={{
               backgroundImage:`linear-gradient(var(--border-color) 1px,transparent 1px), linear-gradient(90deg,var(--border-color) 1px,transparent 1px)`,
               backgroundSize:'65px 65px',
             }} />

        <div className="relative z-10 p-6 space-y-6">

          {/* ══ HEADER ══ */}
          <div className="header-in">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px w-8 bg-gradient-to-r from-orange-500 to-transparent" />
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                    Inventory Management
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  <span className="shimmer-title">Vehicle Parts</span>
                  <span style={{ color: 'var(--text-main)' }}> Inventory</span>
                </h1>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
                  Manage and track all spare parts in stock
                </p>
              </div>

              <button
                onClick={fetchParts}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 hover:scale-105 group"
                style={{ backgroundColor:'rgba(249,115,22,0.08)', borderColor:'rgba(249,115,22,0.25)', color:'#f97316' }}
              >
                <RefreshCcw size={15} className="group-hover:rotate-180 transition-transform duration-500" />
                Refresh
              </button>
            </div>
          </div>

          {/* ══ STAT CARDS ══ */}
          {!loading && (
            <div className="card-in grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Package, label: 'Total Parts', value: parts.length, hex:'#f97316' },
                { icon: CheckCircle, label: 'In Stock', value: inStock, hex:'#10b981' },
                { icon: AlertTriangle, label: 'Low Stock', value: lowStock, hex:'#ef4444' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="relative overflow-hidden rounded-2xl border p-5 hover:scale-[1.02] transition-all duration-200 group"
                  style={{ backgroundColor:'var(--bg-card)', borderColor:'var(--border-color)' }}
                >
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                       style={{ backgroundColor:s.hex }} />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 rounded-xl" style={{ backgroundColor:`${s.hex}15` }}>
                      <s.icon size={22} style={{ color:s.hex }} />
                    </div>
                    <div>
                      <p className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>{s.value}</p>
                      <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: s.hex, opacity: 0.8 }}>
                        {s.label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ SEARCH + FILTER ══ */}
          {!loading && (
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 group">
                <div className="search-box relative flex items-center rounded-2xl border transition-all duration-300"
                     style={{ backgroundColor:'var(--bg-card)', borderColor:'var(--border-color)' }}>
                  <Search size={15} className="s-icon absolute left-4 transition-colors pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, brand, code..."
                    className="w-full bg-transparent pl-10 pr-10 py-3 text-sm focus:outline-none"
                    style={{ color: 'var(--text-main)' }}
                  />
                  {search && (
                    <button onClick={() => setSearch('')}
                            className="absolute right-3 text-xs px-2 py-0.5 rounded-lg transition-colors font-bold"
                            style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>✕</button>
                  )}
                </div>
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border rounded-2xl px-4 py-3 text-sm focus:outline-none cursor-pointer transition-all duration-200 appearance-none"
                style={{ backgroundColor:'var(--bg-card)', borderColor:'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="stock-asc">Stock: Low → High</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
          )}

          {/* Category Filters */}
          {!loading && (
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="px-3.5 py-2 rounded-xl text-[11px] font-bold border transition-all duration-200 hover:scale-105"
                  style={filterCat === cat ? {
                    background:'linear-gradient(135deg,#f97316,#ea580c)', borderColor:'rgba(249,115,22,0.5)', color:'white', boxShadow:'0 4px 15px rgba(249,115,22,0.3)',
                  } : {
                    backgroundColor:'var(--bg-card)', borderColor:'var(--border-color)', color:'var(--text-muted)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* ══ LOADING ══ */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 size={28} style={{ color:'#f97316' }} className="animate-spin" />
              <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Loading Inventory</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed rounded-2xl"
                 style={{ borderColor:'var(--border-color)', backgroundColor:'var(--bg-card)' }}>
              <PackageSearch size={32} className="mb-3" style={{ color:'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>No parts found</p>
              <button onClick={() => { setSearch(''); setFilterCat('All'); }}
                      className="text-xs font-bold px-4 py-2 rounded-xl border hover:scale-105 transition-all mt-4"
                      style={{ color:'#f97316', borderColor:'rgba(249,115,22,0.3)', backgroundColor:'rgba(249,115,22,0.08)' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  Showing <span style={{ color: 'var(--text-main)' }}>{filtered.length}</span> of <span style={{ color: 'var(--text-main)' }}>{parts.length}</span> parts
                </p>
              </div>

              <div className="grid-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filtered.map((part, i) => (
                  <PartCard 
                    key={part.id || part.productCode} 
                    part={part} 
                    index={i} 
                    onViewDetails={() => navigate(`/part-details/${part.id}`)} 
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default InventoryList;