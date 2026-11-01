import React, { useState, useEffect } from 'react';
import { Settings, Menu, X, User } from 'lucide-react'; 
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
        sidebarOpen ? 'left-72' : 'left-20'
      } ${scrolled ? 'shadow-lg' : ''}`}
      style={{ 
        backgroundColor: scrolled ? 'var(--bg-main)' : 'transparent',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid var(--border-color)`,
        opacity: 0.98
      }}
    >
      <div className="flex items-center justify-between px-6 py-3">

        {/* Left side: Menu Toggle */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl transition-all duration-200 hover:bg-orange-500/10 group"
            title="Toggle Menu"
            style={{ color: 'var(--text-muted)' }}
          >
            <div className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`}>
              {sidebarOpen ? (
                <X size={20} className="group-hover:text-orange-500" />
              ) : (
                <Menu size={20} className="group-hover:text-orange-500" />
              )}
            </div>
          </button>
        </div>

        {/* Right side: Settings & Login */}
        <div className="flex items-center gap-3">
          
       
          <Link 
            to="/settings" 
            className="p-2.5 rounded-xl transition-all duration-200 hover:bg-orange-500/10 group" 
            title="System Settings"
            style={{ color: 'var(--text-muted)' }}
          >
            <Settings size={18} className="group-hover:text-orange-500 transition-colors" />
          </Link>

          {/* Staff Login Button */}
          <Link 
            to="/login"
            className="relative px-4 py-2 rounded-xl font-semibold text-sm text-white overflow-hidden group flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ml-2"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            <div className="relative flex items-center gap-2">
              <User size={14} />
              <span>Staff Login</span>
            </div>
          </Link>
          
        </div>
      </div>
    </header>
  );
};

export default Navbar;