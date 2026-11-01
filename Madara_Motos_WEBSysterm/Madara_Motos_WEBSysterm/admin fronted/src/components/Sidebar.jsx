
import React, { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Settings, Truck, Tag, Wrench, FileText, Star, ChevronRight,
  Zap, Bell, Layers, BoxSelect, ArrowRightLeft, AlertTriangle, UserCog 
} from 'lucide-react';

const Sidebar = ({ isOpen, activePage, setActivePage }) => {
  const [expandedGroups, setExpandedGroups] = useState(['Main', 'Inventory', 'Sales', 'Operations', 'System']);
  


  const navGroups = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, color: 'text-orange-400' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'NEW', color: 'text-purple-400' },
      ]
    },
    {
      label: 'Inventory',
      items: [
        { id: 'products', label: 'Parts & Products', icon: Package, badge: null, color: 'text-blue-400' },
        { id: 'categories', label: 'Categories', icon: Layers, badge: null, color: 'text-cyan-400' },
        { id: 'brands', label: 'Brands', icon: Star, badge: null, color: 'text-yellow-400' },
        { id: 'compatibility', label: 'Compatibility', icon: BoxSelect, badge: null, color: 'text-green-400' },
        { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle, badge: null, color: 'text-red-400' }
      ]
    },
    {
      label: 'Sales',
      items: [
        { id: 'orders', label: 'Customer Orders', icon: ShoppingCart, badge: null, color: 'text-pink-400' },
        { id: 'invoices', label: 'Invoices', icon: FileText, badge: null, color: 'text-indigo-400' },
        { id: 'returns', label: 'Returns & RMA', icon: ArrowRightLeft, badge: null, color: 'text-red-400' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { id: 'customers', label: 'Customers', icon: Users, badge: null, color: 'text-teal-400' },
        { id: 'suppliers', label: 'Suppliers', icon: Truck, badge: null, color: 'text-amber-400' },
        { id: 'employees', label: 'Employee', icon: UserCog, badge: null, color: 'text-blue-400' },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, badge: null, color: 'text-gray-400' },
      ]
    },
  ];

  const toggleGroup = (label) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-20'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #0a0d14 100%)',
        borderRight: '1px solid rgba(249,115,22,0.12)'
      }}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(249,115,22,0.12)' }}>
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg glow-orange float-anim text-white font-black text-xl">
            M
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#0d1117] live-dot" />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          <h1 className="text-base font-black text-white leading-tight whitespace-nowrap">
            Madara<span className="gradient-text"> Motors</span>
          </h1>
          <p className="text-xs text-gray-500 whitespace-nowrap">Vehicle Parts & Services</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label);
          return (
            <div key={group.label} className="mb-2">
              {isOpen && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 mb-1 group"
                >
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                    {group.label}
                  </span>
                  <ChevronRight
                    size={12}
                    className={`text-gray-600 group-hover:text-gray-400 transition-all duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              )}

              <div className={`overflow-hidden transition-all duration-300 ${
                isExpanded || !isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePage(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                        isActive
                          ? 'nav-active text-white'
                          : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 opacity-10"
                          style={{ background: 'linear-gradient(90deg, #f97316, transparent)' }} />
                      )}

                      <div className={`flex-shrink-0 transition-all duration-200 ${
                        isActive ? item.color : 'text-gray-600'
                      } ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                        <Icon size={18} />
                      </div>

                      <span className={`flex-1 text-sm font-medium text-left whitespace-nowrap overflow-hidden transition-all duration-300 ${
                        isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
                      }`}>
                        {item.label}
                      </span>

                      {item.badge && isOpen && (
                        <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.badgeColor 
                            ? item.badgeColor 
                            : item.badge === 'NEW'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'rgba(249,115,22,0.12)' }}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 transition-all duration-300`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            M
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <p className="text-sm font-semibold text-white whitespace-nowrap">Madara Motors</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;