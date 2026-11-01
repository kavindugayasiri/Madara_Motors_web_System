import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, AlertTriangle, FileText, Truck, 
  ShoppingCart, Users, RotateCcw, CheckCircle
} from 'lucide-react';

import StatCard from './StatCard';
import SalesChart from './SalesChart'; 
import RecentOrders from './RecentOrders';
import SalesByCategory from './SalesByCategory';
import LowStockAlert from './LowStockAlert';
import TopProducts from './TopProducts';


const generateSparkline = (currentValue) => {
  if (!currentValue || currentValue === 0) return [0, 0, 0, 0, 0, 0, 0];
  const variance = Math.max(1, currentValue * 0.05); 
  return [
    Math.max(0, Math.floor(currentValue - variance * 1.5)),
    Math.max(0, Math.floor(currentValue - variance * 0.8)),
    Math.max(0, Math.floor(currentValue - variance * 1.2)),
    Math.max(0, Math.floor(currentValue - variance * 0.5)),
    Math.max(0, Math.floor(currentValue + variance * 0.2)),
    Math.max(0, Math.floor(currentValue - variance * 0.1)),
    currentValue 
  ];
};


const formatNumberToK = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const Dashboard = ({ onNavigate }) => {


  const [refreshKey, setRefreshKey] = useState(0);

  const [dashboardData, setDashboardData] = useState({
    itemsSoldToday: 0,
    partsInStock: 0,
    lowStockItems: 0,
    activeStaff: 0,
    pendingReturns: 0,
    activeOrders: 0,
    readyForPickup: 0,
    purchaseOrders: 0
  });


  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      setRefreshKey(prevKey => prevKey + 1); 
    }, 60000); 

    return () => clearInterval(autoRefreshInterval);
  }, []);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resParts, resSales, resUsers, resReturns, resOrders, resPurchases] = await Promise.allSettled([
          axios.get('http://localhost:8080/api/spareparts/all'),
          axios.get('http://localhost:8080/api/sales/all'),
          axios.get('http://localhost:8080/api/users/all'),
          axios.get('http://localhost:8080/api/returns/all'),
          axios.get('http://localhost:8080/api/orders/all'),
          axios.get('http://localhost:8080/api/purchases/all') // 
        ]);

        let itemsSold = 0, totalStock = 0, lowStockCount = 0, onlineUsers = 0;
        let returnsCount = 0, ordersCount = 0, readyCount = 0, purchasesCount = 0;

        if (resParts.status === 'fulfilled' && resParts.value.data) {
          const parts = Array.isArray(resParts.value.data) ? resParts.value.data : (resParts.value.data.content || []);
          totalStock = parts.reduce((sum, p) => sum + (p.stockQty || p.quantity || 0), 0);
          lowStockCount = parts.filter(p => (p.stockQty || p.quantity || 0) <= (p.lowStockLimeted || 5)).length;
        }

        if (resSales.status === 'fulfilled' && resSales.value.data) {
          const sales = Array.isArray(resSales.value.data) ? resSales.value.data : (resSales.value.data.content || []);
          const todayStr = new Date().toDateString();
          const todaySales = sales.filter(s => new Date(s.saleDate).toDateString() === todayStr);
          
          itemsSold = todaySales.reduce((total, sale) => {
            const items = sale.items || [];
            return total + items.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
          }, 0);
        }

        if (resUsers.status === 'fulfilled' && resUsers.value.data) {
          const users = Array.isArray(resUsers.value.data) ? resUsers.value.data : (resUsers.value.data.content || []);
          onlineUsers = users.filter(u => u.online === true).length;
        }

        if (resReturns.status === 'fulfilled' && resReturns.value.data) {
          const returns = Array.isArray(resReturns.value.data) ? resReturns.value.data : (resReturns.value.data.content || []);
          returnsCount = returns.length; 
        }

        if (resOrders.status === 'fulfilled' && resOrders.value.data) {
          const orders = Array.isArray(resOrders.value.data) ? resOrders.value.data : (resOrders.value.data.content || []);
          
          ordersCount = orders.filter(o => {
            const status = (o.status || '').toLowerCase();
            return status === 'pending' || status === 'processing';
          }).length;
          
          readyCount = orders.filter(o => {
            const status = (o.status || '').toLowerCase();
            return status === 'ready' || status === 'completed';
          }).length;
        }

        if (resPurchases.status === 'fulfilled' && resPurchases.value.data) {
          const poRecords = Array.isArray(resPurchases.value.data) ? resPurchases.value.data : (resPurchases.value.data.content || []);
          

          purchasesCount = poRecords.filter(po => po.status && !po.status.includes('Received')).length; 
        }

        setDashboardData({
          itemsSoldToday: itemsSold,
          partsInStock: totalStock,
          lowStockItems: lowStockCount,
          activeStaff: onlineUsers,
          pendingReturns: returnsCount,
          activeOrders: ordersCount,
          readyForPickup: readyCount,
          purchaseOrders: purchasesCount
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchDashboardData();
  }, [refreshKey]); 

  const stats = [
    {
      title: "Items Sold Today",
      value: formatNumberToK(dashboardData.itemsSoldToday),
      numericValue: dashboardData.itemsSoldToday,
      change: 'Live Update',
      changeType: 'up',
      icon: <FileText size={22} />,
      color: 'text-blue-400',
      bgColor: '#3b82f6',
      borderColor: 'rgba(59,130,246,0.2)',
      delay: 0,
      sparkData: generateSparkline(dashboardData.itemsSoldToday),
    },
    {
      title: 'Parts in Stock',
      value: formatNumberToK(dashboardData.partsInStock), 
      numericValue: dashboardData.partsInStock,
      change: 'Total Inventory',
      changeType: 'neutral',
      icon: <Package size={22} />,
      color: 'text-purple-400',
      bgColor: '#a855f7',
      borderColor: 'rgba(168,85,247,0.2)',
      delay: 100,
      sparkData: generateSparkline(dashboardData.partsInStock),
    },
    {
      title: 'Low Stock Items',
      value: formatNumberToK(dashboardData.lowStockItems),
      numericValue: dashboardData.lowStockItems,
      change: 'Needs attention',
      changeType: dashboardData.lowStockItems > 0 ? 'down' : 'up',
      icon: <AlertTriangle size={22} />,
      color: dashboardData.lowStockItems > 0 ? 'text-red-400' : 'text-emerald-400',
      bgColor: dashboardData.lowStockItems > 0 ? '#ef4444' : '#10b981',
      borderColor: dashboardData.lowStockItems > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
      delay: 200,
      sparkData: generateSparkline(dashboardData.lowStockItems), 
    },
    {
      title: 'Active Purchase Orders',
      value: formatNumberToK(dashboardData.purchaseOrders),
      numericValue: dashboardData.purchaseOrders,
      change: 'Supplier Orders',
      changeType: 'up',
      icon: <Truck size={22} />,
      color: 'text-orange-400',
      bgColor: '#f97316',
      borderColor: 'rgba(249,115,22,0.2)',
      delay: 300,
      sparkData: generateSparkline(dashboardData.purchaseOrders),
    },
    {
      title: 'Pending Sales Orders',
      value: formatNumberToK(dashboardData.activeOrders),
      numericValue: dashboardData.activeOrders,
      change: 'Customer requests',
      changeType: 'neutral',
      icon: <ShoppingCart size={22} />,
      color: 'text-cyan-400',
      bgColor: '#06b6d4',
      borderColor: 'rgba(6,182,212,0.2)',
      delay: 400,
      sparkData: generateSparkline(dashboardData.activeOrders),
    },
    {
      title: 'Active Staff Online',
      value: dashboardData.activeStaff.toString(),
      numericValue: dashboardData.activeStaff,
      change: 'System users',
      changeType: 'neutral',
      icon: <Users size={22} />,
      color: 'text-emerald-400',
      bgColor: '#10b981',
      borderColor: 'rgba(16,185,129,0.2)',
      delay: 500,
      sparkData: generateSparkline(dashboardData.activeStaff),
    },
    {
      title: 'Pending Returns (RMA)',
      value: formatNumberToK(dashboardData.pendingReturns),
      numericValue: dashboardData.pendingReturns,
      change: 'Requires inspection',
      changeType: dashboardData.pendingReturns > 0 ? 'down' : 'neutral',
      icon: <RotateCcw size={22} />,
      color: 'text-rose-400',
      bgColor: '#f43f5e',
      borderColor: 'rgba(244,63,94,0.2)',
      delay: 600,
      sparkData: generateSparkline(dashboardData.pendingReturns),
    },
    {
      title: 'Ready for Pickup',
      value: formatNumberToK(dashboardData.readyForPickup),
      numericValue: dashboardData.readyForPickup,
      change: 'Waiting for customer',
      changeType: 'up',
      icon: <CheckCircle size={22} />,
      color: 'text-teal-400',
      bgColor: '#14b8a6',
      borderColor: 'rgba(20,184,166,0.2)',
      delay: 700,
      sparkData: generateSparkline(dashboardData.readyForPickup),
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4 pb-6 slide-in-up" style={{ borderBottom: '1px solid var(--border-color)' }}>
        
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
            Workspace Overview 
            <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live System
            </span>
          </h1>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            Real-time summary of today's operations and inventory status.
          </p>
        </div>
        
        <div className="flex flex-col items-end justify-center px-6 py-3 rounded-2xl shadow-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Today's Date</p>
          <p className="text-sm font-black tracking-wide" style={{ color: 'var(--text-main)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={`${stat.title}-${refreshKey}`} {...stat} />
        ))}
      </div>

      {/* --- ANALYTICS & CATEGORY SALES --- */}
      {/* 🟢 Key එක පාස් කරලා තියෙන්නේ refresh වෙන්න */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-[2rem] p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <SalesChart key={`sales-chart-${refreshKey}`} />
        </div>
        <div className="rounded-[2rem] p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <SalesByCategory key={`sales-cat-${refreshKey}`} onNavigate={onNavigate} /> 
        </div>
      </div>

      {/* --- ALERTS & TOP PRODUCTS --- */}
      {/* 🟢 Key එක පාස් කරලා තියෙන්නේ refresh වෙන්න */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-[2rem] p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <LowStockAlert key={`low-stock-${refreshKey}`} onNavigate={onNavigate} /> 
        </div>
        <div className="rounded-[2rem] p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <TopProducts key={`top-products-${refreshKey}`} onNavigate={onNavigate} /> 
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      {/* 🟢 Key එක පාස් කරලා තියෙන්නේ refresh වෙන්න */}
      <div className="rounded-[2rem] p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <RecentOrders key={`recent-orders-${refreshKey}`} onNavigate={onNavigate} />
      </div>

    </div>
  );
};

export default Dashboard;