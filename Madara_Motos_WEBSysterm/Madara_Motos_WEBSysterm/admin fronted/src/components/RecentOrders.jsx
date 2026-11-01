import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

const statusConfig = {
  'Pending': { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', dot: 'bg-yellow-400' },
  'Verified': { label: 'Verified', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30', dot: 'bg-purple-400' },
  'Confirmed': { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', dot: 'bg-blue-400' },
  'Completed': { label: 'Completed', color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', dot: 'bg-indigo-400' },
  'Picked Up': { label: 'Picked Up', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/30', dot: 'bg-green-400' },
  'Cancelled': { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', dot: 'bg-red-400' },
};

const colors = [
  'from-blue-500 to-blue-700', 'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700', 'from-green-500 to-green-700',
  'from-yellow-500 to-orange-600', 'from-teal-500 to-teal-700'
];

const RecentOrders = ({ onNavigate }) => {
  const [filter, setFilter] = useState('All');
  
  const [orders, setOrders] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);

  const filters = ['All', 'Pending', 'Verified', 'Confirmed', 'Picked Up', 'Cancelled'];

  useEffect(() => {
    const fetchRealOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8080/api/orders/all'); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const backendData = await response.json();

        const formattedOrders = backendData.map((order, index) => {
          const totalQty = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

          let partsDisplay = 'No parts';
          if (order.items && order.items.length > 0) {
            partsDisplay = order.items[0].productName;
            if (order.items.length > 1) {
              partsDisplay += ` (+${order.items.length - 1} more)`; 
            }
          }

          let formattedStatus = 'Pending';
          if (order.status) {
              const s = order.status.toLowerCase();
              
              if (s === 'pending') formattedStatus = 'Pending'; 
              else if (s === 'verified') formattedStatus = 'Verified';
              else if (s === 'confirmed') formattedStatus = 'Confirmed';
              else if (s === 'completed') formattedStatus = 'Completed';
              else if (s === 'picked up' || s === 'pickedup') formattedStatus = 'Picked Up';
              else if (s === 'cancelled' || s === 'canceled') formattedStatus = 'Cancelled';
              else formattedStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1);
          }

          const orderDate = new Date(order.orderDate);
          const dateString = isNaN(orderDate.getTime()) 
            ? 'Just now' 
            : orderDate.toLocaleDateString() + ', ' + orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

          const custName = order.customerName && order.customerName.trim() !== '' ? order.customerName : 'Walk-in Customer';

          return {
            id: `#ORD-${String(order.id).padStart(4, '0')}`,
            customer: custName,
            avatar: custName.substring(0, 2).toUpperCase(),
            avatarColor: colors[index % colors.length], 
            parts: partsDisplay,
            qty: totalQty,
            amount: `LKR ${order.totalAmount ? order.totalAmount.toLocaleString() : '0'}`,
            status: formattedStatus,
            date: dateString,
            vehicle: order.city || 'Store Pickup', 
            urgent: false
          };
        });

        setOrders(formattedOrders); 
      } catch (err) {
        console.error("Fetch Error:", err);
        setError('Could not connect to Database.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealOrders();
  }, []);

  const getMinutesPassed = (dateStr) => {
    if (!dateStr || dateStr === 'Just now') return 0;
    const orderTime = new Date(dateStr).getTime();
    if (isNaN(orderTime)) return 0;
    return (Date.now() - orderTime) / (1000 * 60);
  };

  const activeOrders = orders.filter(order => {
    const status = order.status ? order.status.toLowerCase() : '';
    const minsPassed = getMinutesPassed(order.date);

    if (status === 'picked up' && minsPassed >= 10) return false; 
    if (status === 'cancelled' && minsPassed >= 60) return false; 

    return true;
  });

  const filtered = filter === 'All' ? activeOrders : activeOrders.filter(o => o.status === filter);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => [...prevOrders]); 
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>Recent Orders</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Latest 8 live orders</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('orders')}
          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors"
        >
          View all <ChevronRight size={12} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="px-6 pt-3 pb-2 flex gap-2 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              filter === f
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-200'
            }`}
            style={filter !== f ? { backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto min-h-[300px] relative">
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-card)', opacity: 0.8 }}>
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Fetching live orders...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-sm font-bold text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 shadow-lg">
              ⚠️ {error}
            </p>
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              {['Order ID', 'Customer', 'Parts', 'Amount', 'Status'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && !error && filtered.slice(0, 8).map((order, i) => {
              const st = statusConfig[order.status] || statusConfig['Pending'];
              
              return (
                <tr
                  key={order.id}
                  className="border-b transition-colors group cursor-pointer"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-orange-500">{order.id}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{order.date}</p>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${order.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                        {order.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{order.customer}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.vehicle}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: 'var(--text-main)' }}>{order.parts}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Qty: {order.qty}</p>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{order.amount}</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${st.bg} ${st.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${st.dot} live-dot`} />
                      {st.label}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Empty State */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <div className="inline-block p-4 rounded-full mb-3" style={{ backgroundColor: 'var(--bg-main)' }}>
              <span className="text-2xl">📦</span>
            </div>
            <p>No orders found for this status.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;