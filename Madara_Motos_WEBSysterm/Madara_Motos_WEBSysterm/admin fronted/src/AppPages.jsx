import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, ShoppingCart, Users, BarChart3,
  Settings as SettingsIcon, Truck, Tag, Wrench, FileText, Star,
  Bell, Layers, BoxSelect, ArrowRightLeft,
  AlertTriangle, UserCog
} from 'lucide-react';

// 🟢 ඔයාගේ Sidebar එක මෙතනට Import කරගන්න
import Sidebar from "./components/Sidebar";
// කලින් හදපු Components import කරගන්න
import InventoryList from './components/InventoryList';
import Categories from './components/Categories';
import Brands from './components/Brands';
import Compatibility from './components/Compatibility';
import Orders from './components/Orders';
import Invoices from './components/Invoices';
import LowStock from './components/LowStock';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Employee from './components/Employee';
import Settings from './components/Settings'; 
import AnalyticsDashboard from './components/AnalyticsDashboard'; 
import ReturnsRMAPage from './components/ReturnsRMAPage';

export const PlaceholderPage = ({ title, icon, desc }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/30 flex items-center justify-center mb-6 float-anim">
      <div className="text-orange-400">{icon}</div>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-gray-500 max-w-md">{desc}</p>
    <button className="mt-6 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all"
      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
      Get Started
    </button>
  </div>
);

export const pageMap = {
  dashboard: null, 
  analytics: (
    <div className="w-full h-full overflow-y-auto px-2">
      <AnalyticsDashboard />
    </div>
  ),
  products: (
    <div className="w-full h-full overflow-y-auto px-2">
      <InventoryList />
    </div>
  ),
  categories: ( <div className="w-full h-full overflow-y-auto px-2"> <Categories /> </div>),
  brands: (<div className="w-full h-full overflow-y-auto px-2"><Brands /> </div>),
  compatibility: (<div className="w-full h-full overflow-y-auto px-2"> <Compatibility /></div>),
  'low-stock': <LowStock />,
  orders: (<div className="w-full h-full overflow-y-auto px-2"><Orders /></div>),
  invoices: <Invoices />, 
  returns: <ReturnsRMAPage />,
  customers: (<div className="w-full h-full overflow-y-auto px-2"> <Customers /></div> ),
  suppliers: (<div className="w-full h-full overflow-y-auto px-2"> <Suppliers /></div>),
  employees: (<div className="w-full h-full overflow-y-auto px-2">  <Employee /></div>),
  settings: (
    <div className="w-full h-full overflow-y-auto px-2">
      <Settings />
    </div>
  ),
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟢 මෙන්න මේක තමයි ඔයාගේ ප්‍රධාන Layout Component එක
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AdminLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 🟢 Sidebar එකේ Badge වලට යවන්න ඕන ගණන් ටික තියාගන්න States
  const [tableOrderCount, setTableOrderCount] = useState(0);
  const [tableLowStockCount, setTableLowStockCount] = useState(0);

  useEffect(() => {
    const fetchTableCounts = async () => {
      try {
        // 1. Dashboard Table එකේ තියෙන Orders ගාණ හොයාගැනීම
        const ordersRes = await axios.get('http://localhost:8080/api/orders');
        // ඔක්කොම ඕඩර්ස් ගන්නේ නැතුව, Dashboard එකේ පේන ගාණ (උදා: අලුත්ම 8) විතරක් ගන්නවා.
        const recentOrders = ordersRes.data.slice(0, 8); 
        setTableOrderCount(recentOrders.length);

        // 2. Dashboard Table එකේ තියෙන Low Stock ගාණ හොයාගැනීම
        const lowStockRes = await axios.get('http://localhost:8080/api/spareparts/low-stock');
        // මේකත් ටේබල් එකේ පේන ගාණට (උදා: මුල් අයිටම් 5) හදාගන්න පුළුවන්
        const currentLowStock = lowStockRes.data.slice(0, 5); 
        setTableLowStockCount(currentLowStock.length);

      } catch (error) {
        console.error("Error fetching table counts for sidebar:", error);
      }
    };

    fetchTableCounts();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0d14' }}>
      
      {/* 🟢 මෙන්න මෙතන තමයි Sidebar එකට අර හොයාගත්ත ගණන් ටික පාස් කරන්නේ */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activePage={activePage} 
        setActivePage={setActivePage} 
        orderCount={tableOrderCount}        // 👈 Orders ගාණ
        lowStockCount={tableLowStockCount}  // 👈 Low Stock ගාණ
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'} flex flex-col`}>
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activePage === 'dashboard' ? (
             <div className="text-white">
               {/* ඔයාගේ ප්‍රධාන Dashboard කෑල්ල (අර ටේබල් තියෙන කෑල්ල) මෙතන Render වෙයි */}
               {/* <MainDashboard /> */}
             </div>
          ) : (
             pageMap[activePage]
          )}
        </div>
      </main>
    </div>
  );
};
