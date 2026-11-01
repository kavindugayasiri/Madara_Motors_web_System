import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Users, Mail, Briefcase, ShieldCheck, Wrench,
  Loader2, BadgeCheck, TrendingUp, Activity, Package, 
  CircleDollarSign, Store
} from 'lucide-react';

// ✨ Animated Counter Hook
const useCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return count;
};

// ✨ Particle Background
const ParticleField = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-blue-500/20 animate-pulse"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

// Pre-defined role themes
const ROLE_THEMES_EXACT = {
  'Manager': {
    gradient: 'from-purple-600 via-purple-500 to-indigo-600',
    gradientHex: ['#9333ea', '#a855f7', '#4f46e5'],
    glowColor: 'rgba(168,85,247,0.4)',
    borderColor: 'rgba(168,85,247,0.3)',
    bgColor: 'rgba(168,85,247,0.08)',
    textColor: '#c084fc',
    icon: <ShieldCheck size={12} />,
    statColor: 'purple',
  },
  'SalesPerson': {
    gradient: 'from-sky-600 via-blue-500 to-cyan-500',
    gradientHex: ['#0284c7', '#3b82f6', '#06b6d4'],
    glowColor: 'rgba(14,165,233,0.4)',
    borderColor: 'rgba(14,165,233,0.3)',
    bgColor: 'rgba(14,165,233,0.08)',
    textColor: '#38bdf8',
    icon: <CircleDollarSign size={12} />,
    statColor: 'sky',
  },
  'StoreKeeper': {
    gradient: 'from-rose-600 via-pink-500 to-fuchsia-600',
    gradientHex: ['#e11d48', '#ec4899', '#c026d3'],
    glowColor: 'rgba(236,72,153,0.4)',
    borderColor: 'rgba(236,72,153,0.3)',
    bgColor: 'rgba(236,72,153,0.08)',
    textColor: '#f472b6',
    icon: <Store size={12} />,
    statColor: 'pink',
  },
  'Cashier': {
    gradient: 'from-orange-600 via-amber-500 to-yellow-500',
    gradientHex: ['#ea580c', '#f59e0b', '#eab308'],
    glowColor: 'rgba(249,115,22,0.4)',
    borderColor: 'rgba(249,115,22,0.3)',
    bgColor: 'rgba(249,115,22,0.08)',
    textColor: '#fb923c',
    icon: <Briefcase size={12} />,
    statColor: 'amber',
  },
  'Mechanic': {
    gradient: 'from-emerald-600 via-green-500 to-teal-500',
    gradientHex: ['#059669', '#22c55e', '#14b8a6'],
    glowColor: 'rgba(16,185,129,0.4)',
    borderColor: 'rgba(16,185,129,0.3)',
    bgColor: 'rgba(16,185,129,0.08)',
    textColor: '#34d399',
    icon: <Wrench size={12} />,
    statColor: 'emerald',
  },
  'Sales Executive': {
    gradient: 'from-sky-600 via-blue-500 to-cyan-500',
    gradientHex: ['#0284c7', '#3b82f6', '#06b6d4'],
    glowColor: 'rgba(14,165,233,0.4)',
    borderColor: 'rgba(14,165,233,0.3)',
    bgColor: 'rgba(14,165,233,0.08)',
    textColor: '#38bdf8',
    icon: <BadgeCheck size={12} />,
    statColor: 'sky',
  },
  'Stock Keeper': {
    gradient: 'from-rose-600 via-pink-500 to-fuchsia-600',
    gradientHex: ['#e11d48', '#ec4899', '#c026d3'],
    glowColor: 'rgba(236,72,153,0.4)',
    borderColor: 'rgba(236,72,153,0.3)',
    bgColor: 'rgba(236,72,153,0.08)',
    textColor: '#f472b6',
    icon: <Package size={12} />,
    statColor: 'pink',
  },
};

const FALLBACK_COLORS = [
  {
    gradient: 'from-teal-600 via-cyan-500 to-blue-500',
    gradientHex: ['#0d9488', '#06b6d4', '#3b82f6'],
    glowColor: 'rgba(20,184,166,0.4)',
    borderColor: 'rgba(20,184,166,0.3)',
    bgColor: 'rgba(20,184,166,0.08)',
    textColor: '#2dd4bf',
    icon: <BadgeCheck size={12} />,
    statColor: 'teal',
  },
];

const dynamicRoleCache = {};
let fallbackIndex = 0;

const getRoleTheme = (role) => {
  if (!role) return FALLBACK_COLORS[0];
  if (ROLE_THEMES_EXACT[role]) return ROLE_THEMES_EXACT[role];
  const lowerRole = role.toLowerCase();
  for (const [key, theme] of Object.entries(ROLE_THEMES_EXACT)) {
    if (key.toLowerCase() === lowerRole) return theme;
  }
  if (dynamicRoleCache[role]) return dynamicRoleCache[role];
  const newTheme = FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
  dynamicRoleCache[role] = newTheme;
  fallbackIndex++;
  return newTheme;
};

const STAT_CARD_COLORS = {
  purple: { bg: 'from-purple-500/10 to-indigo-500/5', border: 'border-purple-500/20', icon: 'bg-purple-500/10 text-purple-400', hex: '#a855f7' },
  sky: { bg: 'from-sky-500/10 to-blue-500/5', border: 'border-sky-500/20', icon: 'bg-sky-500/10 text-sky-400', hex: '#0ea5e9' },
  amber: { bg: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/20', icon: 'bg-amber-500/10 text-amber-400', hex: '#f59e0b' },
  emerald: { bg: 'from-emerald-500/10 to-teal-500/5', border: 'border-emerald-500/20', icon: 'bg-emerald-500/10 text-emerald-400', hex: '#10b981' },
};

const AnimatedAvatar = ({ name, role, isOnline }) => {
  const theme = getRoleTheme(role);
  return (
    <div className="relative group/avatar flex-shrink-0">
      <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-all duration-500" style={{ background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)` }} />
      <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`} style={{ boxShadow: `0 4px 20px ${theme.glowColor}` }}>
        <span className="text-base font-black text-white tracking-tight z-10">{name ? name.charAt(0).toUpperCase() : 'U'}</span>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 to-transparent" />
      </div>
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, colorKey, delay }) => {
  const count = useCounter(typeof value === 'number' ? value : 0);
  const c = STAT_CARD_COLORS[colorKey] || STAT_CARD_COLORS['purple'];
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-4 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg group`} style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${c.hex} 0%, transparent 70%)` }} />
      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-2.5 rounded-xl ${c.icon} flex-shrink-0`}><Icon size={18} /></div>
        <div>
          <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-main)' }}>{count}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const theme = getRoleTheme(role);
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${theme.gradient} text-white text-[10px] font-black uppercase tracking-wider hover:scale-105 transition-transform duration-200 cursor-default shadow-lg`} style={{ boxShadow: `0 4px 15px ${theme.glowColor}` }}>
      {theme.icon}{role}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Active': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', pulse: true },
    'Hold': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400', pulse: false },
    'Offline': { bg: 'bg-gray-500/10', border: 'border-gray-700', text: 'text-gray-500', dot: 'bg-gray-600', pulse: false },
  };
  const s = styles[status] || styles['Offline'];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${s.border} ${s.bg}`}>
      <span className="relative flex h-2 w-2">
        {s.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-60`} />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      <span className={`text-[11px] font-bold tracking-wide ${s.text}`}>{status}</span>
    </div>
  );
};

const EmployeeRow = ({ employee, index, onHover, isHovered }) => {
  const theme = getRoleTheme(employee.role);
  return (
    <div
      className={`relative group overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer ${isHovered ? 'scale-[1.01] shadow-xl' : 'border-gray-800/60'}`}
      style={{
        animation: `slideUp 0.5s ease forwards`,
        animationDelay: `${index * 80}ms`,
        opacity: 0,
        backgroundColor: isHovered ? theme.bgColor : 'var(--bg-card)',
        borderColor: isHovered ? theme.borderColor : 'var(--border-color)',
        ...(isHovered && { boxShadow: `0 8px 32px ${theme.glowColor}` }),
      }}
      onMouseEnter={() => onHover(employee.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${theme.glowColor}, transparent)`, opacity: isHovered ? 1 : 0 }} />
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-opacity duration-300" style={{ background: `linear-gradient(180deg, ${theme.gradientHex?.[0] || '#3b82f6'}, ${theme.gradientHex?.[1] || '#6366f1'}, ${theme.gradientHex?.[0] || '#3b82f6'})`, opacity: isHovered ? 1 : 0 }} />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center p-4 xl:px-6 xl:py-4 relative z-10">
        <div className="col-span-4 flex items-center gap-4">
          <AnimatedAvatar name={employee.name} role={employee.role} isOnline={employee.online} />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold truncate transition-colors duration-300" style={{ color: isHovered ? 'var(--text-main)' : 'var(--text-main)' }}>{employee.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-lg border transition-all duration-300" style={{ backgroundColor: isHovered ? theme.bgColor : 'rgba(255,255,255,0.03)', borderColor: isHovered ? theme.borderColor : 'var(--border-color)', color: isHovered ? theme.textColor : 'var(--text-muted)' }}>
                {employee.employeeId || `EMP-${String(employee.id).padStart(3, '0')}`}
              </span>
            </div>
          </div>
        </div>
        <div className="col-span-3 flex items-center"><RoleBadge role={employee.role} /></div>
        <div className="col-span-3 flex items-center">
          <a href={`mailto:${employee.gmail}`} className="flex items-center gap-2.5 transition-all duration-300 group/mail" onClick={(e) => e.stopPropagation()}>
            <div className="p-1.5 rounded-lg transition-all duration-300 flex-shrink-0" style={{ backgroundColor: isHovered ? theme.bgColor : 'rgba(255,255,255,0.03)', color: isHovered ? theme.textColor : 'var(--text-muted)' }}><Mail size={13} /></div>
            <span className="truncate text-xs transition-all duration-300 font-medium" style={{ color: isHovered ? theme.textColor : 'var(--text-muted)' }}>{employee.gmail}</span>
          </a>
        </div>
        <div className="col-span-2 flex items-center justify-end"><StatusBadge status={employee.status || 'Offline'} /></div>
      </div>
    </div>
  );
};

const RoleFilterPill = ({ role, isActive, onClick }) => {
  const theme = role !== 'All' ? getRoleTheme(role) : null;
  return (
    <button onClick={onClick} className={`px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all duration-200 hover:scale-105 ${isActive && role === 'All' ? 'bg-blue-600 border-blue-500/50 text-white shadow-lg shadow-blue-500/20' : !isActive ? 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-600' : ''}`}
      style={isActive && role !== 'All' && theme ? { background: `linear-gradient(135deg, ${theme.gradientHex?.[0]}, ${theme.gradientHex?.[1]})`, borderColor: theme.borderColor, color: 'white', boxShadow: `0 4px 15px ${theme.glowColor}` } : { borderColor: 'var(--border-color)', color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
      {role}
    </button>
  );
};

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:8080/api/users/all')
      .then(response => { setEmployees(response.data); setLoading(false); })
      .catch(error => { console.error("Error fetching employees:", error); setLoading(false); });
  }, []);

  const availableRoles = ['All', ...new Set(employees.map(e => e.role).filter(Boolean))];
  const filtered = employees.filter(emp => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (emp.name || '').toLowerCase().includes(q) || (emp.employeeId || '').toLowerCase().includes(q) || (emp.role || '').toLowerCase().includes(q);
    const matchRole = filterRole === 'All' || emp.role === filterRole;
    return matchSearch && matchRole;
  });

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const holdCount = employees.filter(e => e.status === 'Hold').length;
  const onlineCount = employees.filter(e => e.online).length;

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .shimmer-text { background: linear-gradient(90deg, var(--text-main) 0%, #a78bfa 20%, #60a5fa 40%, #f472b6 60%, #a78bfa 80%, var(--text-main) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 5s linear infinite; }
      `}</style>

      <div className="w-full min-h-screen p-5 md:p-8 relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', fontFamily: "'Inter', sans-serif" }}>
        <ParticleField />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-8" style={{ animation: 'fadeIn 0.6s ease forwards' }}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-8 bg-gradient-to-r from-purple-500 to-transparent" />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Human Resources</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                  <span className="shimmer-text">Employee</span>
                  <span style={{ color: 'var(--text-main)' }}> Directory</span>
                </h1>
                <p className="text-sm font-medium max-w-lg" style={{ color: 'var(--text-muted)' }}>View staff accounts, job roles, and operational status in real-time.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={Users} label="Total Staff" value={employees.length} colorKey="purple" delay={0} />
              <StatCard icon={Activity} label="Active" value={activeCount} colorKey="emerald" delay={100} />
              <StatCard icon={Loader2} label="Hold Status" value={holdCount} colorKey="amber" delay={200} />
              <StatCard icon={BadgeCheck} label="Role Types" value={availableRoles.length - 1} colorKey="sky" delay={300} />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 group">
                <div className="relative flex items-center border transition-all duration-300 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <Search className="absolute left-4 transition-colors duration-300" size={16} style={{ color: 'var(--text-muted)' }} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent py-3.5 pl-11 pr-10 focus:outline-none text-sm" style={{ color: 'var(--text-main)' }} placeholder="Search by name, ID or role..." />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 text-xs font-bold px-2 py-0.5 rounded-md transition-colors" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>✕</button>}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                {availableRoles.map((role) => <RoleFilterPill key={role} role={role} isActive={filterRole === role} onClick={() => setFilterRole(role)} />)}
              </div>
            </div>
          </div>

          <div className="hidden xl:grid grid-cols-12 gap-4 px-6 py-3 mb-2">
            {[{ label: 'Employee Name & ID', span: 4 }, { label: 'System Role', span: 3 }, { label: 'Email Address', span: 3 }, { label: 'Account Status', span: 2, align: 'justify-end' }].map((col) => (
              <div key={col.label} className={`col-span-${col.span} flex items-center gap-2 ${col.align || ''}`}>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{col.label}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent" />
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Connecting to Database</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((employee, index) => <EmployeeRow key={employee.id} employee={employee} index={index} onHover={setHoveredId} isHovered={hoveredId === employee.id} />)}
              {filtered.length === 0 && (
                <div className="text-center py-24 border border-dashed rounded-2xl mt-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                  <Users size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>No employees found</h3>
                  <button onClick={() => { setSearchQuery(''); setFilterRole('All'); }} className="text-xs font-bold text-purple-400 border border-purple-500/30 px-4 py-2 rounded-xl mt-4 hover:bg-purple-500/10 transition-all">Clear Filters</button>
                </div>
              )}
            </div>
          )}

          {filtered.length > 0 && !loading && (
            <div className="mt-6 flex items-center justify-between py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Showing <span style={{ color: 'var(--text-main)' }}>{filtered.length}</span> of <span style={{ color: 'var(--text-main)' }}>{employees.length}</span> employees</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Live System Sync</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Employee;