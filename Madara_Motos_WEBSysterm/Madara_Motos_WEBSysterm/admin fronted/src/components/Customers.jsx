import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// ============ PROVIDER ICONS ============
const GoogleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GmailIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const EmailIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

// ============ PROVIDER CONFIG ============
const PROVIDER_CONFIG = {
  GOOGLE: {
    label: "Google",
    icon: (s) => <GoogleIcon size={s} />,
    bg: "rgba(66,133,244,0.12)",
    border: "rgba(66,133,244,0.4)",
    color: "#7ab3ff",
  },
  GMAIL: {
    label: "Gmail",
    icon: (s) => <GmailIcon size={s} />,
    bg: "rgba(234,67,53,0.12)",
    border: "rgba(234,67,53,0.4)",
    color: "#ff8a80",
  },
  FACEBOOK: {
    label: "Facebook",
    icon: (s) => <FacebookIcon size={s} />,
    bg: "rgba(24,119,242,0.12)",
    border: "rgba(24,119,242,0.4)",
    color: "#64a8ff",
  },
  EMAIL: {
    label: "Email",
    icon: (s) => <EmailIcon size={s} />,
    bg: "rgba(158,158,158,0.12)",
    border: "rgba(158,158,158,0.3)",
    color: "#b0bec5",
  },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", color: "#00e676", bg: "rgba(0,230,118,0.12)", border: "rgba(0,230,118,0.3)", pulse: true },
  INACTIVE: { label: "Inactive", color: "#ff5252", bg: "rgba(255,82,82,0.12)", border: "rgba(255,82,82,0.3)", pulse: false },
  OFFLINE: { label: "Offline", color: "#78909c", bg: "rgba(120,144,156,0.12)", border: "rgba(120,144,156,0.25)", pulse: false },
  SUSPENDED: { label: "Suspended", color: "#ffa726", bg: "rgba(255,167,38,0.12)", border: "rgba(255,167,38,0.3)", pulse: false },
};

const detectProvider = (provider, email) => {
  if (provider && provider !== "LOCAL") return provider.toUpperCase();
  if (!email) return "EMAIL";
  if (email.includes("@gmail.com")) return "GMAIL";
  if (email.includes("@facebook.com")) return "FACEBOOK";
  return "EMAIL";
};

const avatarColors = [
  ["#667eea","#764ba2"],["#f093fb","#f5576c"],["#4facfe","#00f2fe"],
  ["#43e97b","#38f9d7"],["#fa709a","#fee140"],["#a18cd1","#fbc2eb"],
  ["#fccb90","#d57eeb"],["#a1c4fd","#c2e9fb"],
];

// ============ STAT CARD ============
const StatCard = ({ label, value, color, icon, active, onClick }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ y: -3, boxShadow: `0 14px 40px ${color}30` }}
    whileTap={{ scale: 0.97 }}
    animate={{
      background: active ? `linear-gradient(145deg, ${color}22, ${color}10)` : "var(--bg-card)",
      borderColor: active ? color : "var(--border-color)",
    }}
    style={{
      flex: 1, minWidth: "120px", padding: "16px 20px",
      borderRadius: "16px", border: "2px solid",
      cursor: "pointer", position: "relative", overflow: "hidden",
    }}
  >
    {active && (
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{
          position: "absolute", width: "60px", height: "60px",
          borderRadius: "50%", background: color,
          top: "-15px", right: "-15px", filter: "blur(20px)", zIndex: 0,
        }}
      />
    )}
    <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
      <motion.div
        key={value}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          fontSize: "30px", fontWeight: 900, color,
          lineHeight: 1, marginBottom: "5px",
          fontFamily: "'Inter', monospace",
        }}
      >
        {value}
      </motion.div>
      <div style={{
        fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "1px",
      }}>
        {label}
      </div>
      {active && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "30px" }}
          style={{ height: "2px", background: color, borderRadius: "4px", marginTop: "8px" }}
        />
      )}
    </div>
  </motion.div>
);

// ============ FILTER CHIP ============
const FilterChip = ({ label, active, onClick, color, count }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "7px 16px", borderRadius: "24px",
      fontSize: "12px", fontWeight: 700, cursor: "pointer",
      border: "1.5px solid",
      background: active ? `${color}18` : "transparent",
      borderColor: active ? color : "var(--border-color)",
      color: active ? color : "var(--text-muted)",
      letterSpacing: "0.5px", outline: "none",
      transition: "all 0.2s",
    }}
  >
    {label}
    {count !== undefined && (
      <span style={{
        fontSize: "10px", fontWeight: 800,
        background: active ? color : "var(--border-color)",
        color: active ? "#fff" : "var(--text-muted)",
        borderRadius: "10px", padding: "1px 6px",
      }}>
        {count}
      </span>
    )}
  </motion.button>
);

// ============ CUSTOMER ROW ============
const CustomerRow = ({ customer, index }) => {
  const [hov, setHov] = useState(false);
  const colorPair = avatarColors[index % avatarColors.length];
  
  const providerKey = detectProvider(customer.provider, customer.email);
  const initials = customer.name ? customer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "CU";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "2.4fr 2fr 1.6fr 1.6fr",
        alignItems: "center", gap: "16px",
        padding: "18px 28px", borderRadius: "16px", marginBottom: "6px",
        background: hov ? "var(--card-hover-bg)" : "var(--bg-card)",
        border: "1px solid var(--border-color)",
        transition: "all 0.22s", position: "relative",
        boxShadow: hov ? "0 8px 32px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <motion.div
        animate={{ opacity: hov ? 1 : 0 }}
        style={{
          position: "absolute", left: 0, top: "18%", bottom: "18%",
          width: "3px", borderRadius: "0 3px 3px 0",
          background: `linear-gradient(${colorPair[0]},${colorPair[1]})`,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 4 }}
          style={{
            width: "46px", height: "46px", borderRadius: "14px", flexShrink: 0,
            background: `linear-gradient(135deg,${colorPair[0]},${colorPair[1]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 800, color: "#fff",
            boxShadow: `0 6px 20px ${colorPair[0]}55`,
          }}
        >
          {initials}
        </motion.div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)", marginBottom: "4px" }}>
            {customer.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--text-muted)">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
              {customer.formattedId}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "var(--text-muted)", flexShrink: 0 }}><EmailIcon size={13} /></span>
        <span style={{
          fontSize: "13px", color: "var(--text-main)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {customer.email}
        </span>
      </div>

      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          padding: "6px 14px", borderRadius: "20px",
          background: (PROVIDER_CONFIG[providerKey] || PROVIDER_CONFIG.EMAIL).bg,
          border: `1.5px solid ${(PROVIDER_CONFIG[providerKey] || PROVIDER_CONFIG.EMAIL).border}`,
        }}>
          {(PROVIDER_CONFIG[providerKey] || PROVIDER_CONFIG.EMAIL).icon(14)}
          <span style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.6px",
            color: (PROVIDER_CONFIG[providerKey] || PROVIDER_CONFIG.EMAIL).color, textTransform: "uppercase",
          }}>
            {(PROVIDER_CONFIG[providerKey] || PROVIDER_CONFIG.EMAIL).label}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          padding: "6px 14px", borderRadius: "20px",
          background: STATUS_CONFIG[customer.status].bg, border: `1.5px solid ${STATUS_CONFIG[customer.status].border}`,
        }}>
          <span style={{ position: "relative", display: "flex" }}>
            {STATUS_CONFIG[customer.status].pulse && (
              <motion.span
                animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{
                  position: "absolute", width: "8px", height: "8px",
                  borderRadius: "50%", background: STATUS_CONFIG[customer.status].color,
                  top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                }}
              />
            )}
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_CONFIG[customer.status].color, display: "block" }} />
          </span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: STATUS_CONFIG[customer.status].color }}>{STATUS_CONFIG[customer.status].label}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============ MAIN ============
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterProvider, setFilterProvider] = useState("ALL");
  const [searchFocused, setSearchFocused]   = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/customer/all');
        const formattedData = response.data.map(c => ({
          ...c,
          formattedId: `MM-C-${10000 + c.id}`, 
          status: "ACTIVE" 
        }));

        setCustomers(formattedData);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const stats = {
    total:     customers.length,
    active:    customers.filter(c => c.status === "ACTIVE").length,
    offline:   customers.filter(c => c.status === "OFFLINE").length,
    suspended: customers.filter(c => c.status === "SUSPENDED").length,
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const match = !q || c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) || (c.formattedId && c.formattedId.toLowerCase().includes(q));
    const ms = filterStatus === "ALL" || c.status === filterStatus;
    const mp = filterProvider === "ALL" || detectProvider(c.provider, c.email) === filterProvider;
    return match && ms && mp;
  });

  const statCards = [
    { key: "ALL",       label: "Total",     value: stats.total,     color: "#3b82f6", icon: "👥" },
    { key: "ACTIVE",    label: "Active",    value: stats.active,    color: "#10b981", icon: "✅" },
    { key: "OFFLINE",   label: "Offline",   value: stats.offline,   color: "#64748b", icon: "⚫" },
    { key: "SUSPENDED", label: "Suspended", value: stats.suspended, color: "#f97316", icon: "⚠️" },
  ];

  const statusFilterKeys = ["ALL", "ACTIVE", "INACTIVE", "OFFLINE", "SUSPENDED"];
  const providers = ["ALL", "GOOGLE", "GMAIL", "FACEBOOK"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", padding: "32px 36px", fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "30px", fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                Customer Directory
              </h1>
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "6px 14px", borderRadius: "20px",
                  background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f97316">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#f97316" }}>
                  {stats.total} ACCOUNTS
                </span>
              </motion.div>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
              Manage and monitor all registered customers in your system
            </p>
          </div>

          {/* Search */}
          <motion.div
            animate={{ boxShadow: searchFocused ? "0 0 0 2px rgba(249,115,22,0.4)" : "none" }}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "var(--bg-card)",
              border: `1.5px solid ${searchFocused ? "rgba(249,115,22,0.6)" : "var(--border-color)"}`,
              borderRadius: "14px", padding: "11px 18px", minWidth: "310px",
              transition: "border-color 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-muted)">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search by ID, name or email..."
              style={{ background: "none", border: "none", outline: "none", color: "var(--text-main)", fontSize: "13px", width: "100%" }}
            />
            {search && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
                onClick={() => setSearch("")}
                style={{
                  background: "var(--border-color)", border: "none", borderRadius: "50%",
                  width: "20px", height: "20px", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", color: "var(--text-main)", flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* ── STAT CARDS ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ display: "flex", gap: "14px", marginTop: "28px", flexWrap: "wrap" }}
        >
         {statCards.map((s, i) => (
            <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.2 }} style={{ flex: 1, minWidth: "120px" }}>
              <StatCard
                label={s.label}
                value={s.value}
                color={s.color}
                icon={s.icon}
                active={filterStatus === s.key}
                onClick={() => setFilterStatus(filterStatus === s.key && s.key !== "ALL" ? "ALL" : s.key)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ── FILTERS ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ display: "flex", gap: "8px", marginTop: "22px", flexWrap: "wrap", alignItems: "center" }}
        >
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "1px", marginRight: "4px" }}>STATUS:</span>
          {statusFilterKeys.map(s => (
            <FilterChip key={s} label={s} active={filterStatus === s}
              onClick={() => setFilterStatus(s)}
              color={s === "ALL" ? "#3b82f6" : STATUS_CONFIG[s]?.color}
              count={s === "ALL" ? customers.length : customers.filter(c => c.status === s).length}
            />
          ))}
          <div style={{ width: "1px", height: "22px", background: "var(--border-color)", margin: "0 6px" }} />
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "1px", marginRight: "4px" }}>PROVIDER:</span>
          {providers.map(p => (
            <FilterChip key={p} label={p} active={filterProvider === p}
              onClick={() => setFilterProvider(p)}
              color={p === "ALL" ? "#3b82f6" : PROVIDER_CONFIG[p]?.color}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* ── TABLE HEADER ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ display: "grid", gridTemplateColumns: "2.4fr 2fr 1.6fr 1.6fr", gap: "16px", padding: "10px 28px", marginBottom: "8px" }}
      >
        {["CUSTOMER NAME & ID", "EMAIL ADDRESS", "LOGIN PROVIDER", "STATUS"].map(h => (
          <span key={h} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "var(--text-muted)", textTransform: "uppercase" }}>
            {h}
          </span>
        ))}
      </motion.div>

      <div style={{ height: "1px", background: "var(--border-color)", marginBottom: "12px" }} />

      {/* ── ROWS ── */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
              style={{ height: "80px", borderRadius: "16px", marginBottom: "6px", background: "var(--bg-card)" }}
            />
          ))
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "70px 20px" }}
          >
            <div style={{ fontSize: "52px", marginBottom: "14px" }}>🔍</div>
            <div style={{ color: "var(--text-muted)", fontSize: "17px", fontWeight: 600 }}>No customers found</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px", opacity: 0.7 }}>Try adjusting your filters</div>
          </motion.div>
        ) : (
          filtered.map((c, i) => (
            <CustomerRow key={c.id} customer={c} index={i} />
          ))
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{
          marginTop: "28px", padding: "18px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Showing <strong style={{ color: "var(--text-main)" }}>{filtered.length}</strong> of{" "}
          <strong style={{ color: "var(--text-main)" }}>{customers.length}</strong> customers
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", opacity: 0.8 }}>Data Source: Live Database</span>
      </motion.div>
    </div>
  );
};

export default Customers;