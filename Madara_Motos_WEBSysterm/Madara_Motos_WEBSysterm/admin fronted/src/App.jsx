import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- COMPONENTS ---
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { pageMap, PlaceholderPage } from './AppPages';
import Orders from './components/Orders';

// --- AUTH PAGES ---
import Login from './pages/Login/Login';
import VerifyCode from './pages/VerifyCode/VerifyCode'; 
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import OtpVerification from './pages/OtpVerification/OtpVerification';

// --- DASHBOARDS (Lazy Loaded) ---
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard/ManagerDashboard'));
const SalesDashboard = lazy(() => import('./pages/SalesDashboard/SalesDashboard'));
const CashierDashboard = lazy(() => import('./pages/CashierDashboard/CashierDashboard'));

import ProductDetails from './components/ProductDetails';
import Categories from './components/Categories';

// ════════════════════════════════
// 1. ADMIN LAYOUT COMPONENT
// ════════════════════════════════
const AdminLayout = ({ children, activePage, setActivePage, orderCount }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen particle-bg grid-pattern">
      <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} orderCount={orderCount} />
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <main className="transition-all duration-300 min-h-screen"
        style={{ paddingLeft: sidebarOpen ? '288px' : '80px', paddingTop: '64px' }}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-main)' }}>
    <div style={{ width: 48, height: 48, border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ════════════════════════════════
// 2. MAIN APP COMPONENT
// ════════════════════════════════
function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [globalOrderCount, setGlobalOrderCount] = useState(0);

  
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/orders/all');
        if (response.ok) {
          const data = await response.json();
          setGlobalOrderCount(data.length); 
        }
      } catch (error) {
        console.error("Failed to fetch order count:", error);
      }
    };
    fetchOrderCount();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          
          {/* 🟢 MAIN ADMIN DASHBOARD ROUTE */}
          <Route path="/" element={
            <AdminLayout activePage={activePage} setActivePage={setActivePage} orderCount={globalOrderCount}>
              {activePage === 'dashboard' ? (
                <Dashboard onNavigate={setActivePage} />
              ) : activePage === 'orders' ? (
                <Orders onCountUpdate={setGlobalOrderCount} />
              ) : (
                pageMap[activePage] || <PlaceholderPage title="Coming Soon" />
              )}
            </AdminLayout>
          } />

          {/* 🟢 PRODUCT DETAILS ROUTE */}
          <Route path="/part-details/:id" element={
            <AdminLayout activePage="inventory" setActivePage={setActivePage} orderCount={globalOrderCount}>
              <ProductDetails />
            </AdminLayout>
          } />

          {/* 🟢 AUTHENTICATION ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 🟢 OTHER DASHBOARDS */}
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />

          {/* Cashier / Sales Person */}
          <Route path="/sales-dashboard" element={<CashierDashboard />} />
          <Route path="/cashier-dashboard" element={<CashierDashboard />} />

          {/* Store / Stock Keeper */}
          <Route path="/store-dashboard" element={<SalesDashboard />} />
          <Route path="/stock-dashboard" element={<SalesDashboard />} />

          {/* Fallback for unknown routes (404) */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;