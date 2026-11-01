import React, { useState, useEffect } from 'react';
import { Search, Phone, ShoppingCart, Loader2, Download } from 'lucide-react';

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

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = ['All', 'Pending', 'Verified', 'Confirmed', 'Picked Up', 'Cancelled'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8080/api/orders/all');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const backendData = await response.json();

        const formattedOrders = backendData.map((order, index) => {
          const totalQty = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
          let partsDisplay = 'No parts';
          if (order.items && order.items.length > 0) {
            partsDisplay = order.items[0].productName;
            if (order.items.length > 1) partsDisplay += ` (+${order.items.length - 1} more)`;
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
            phone: order.contactNumber || 'N/A', 
            type: 'Retail', 
            avatar: custName.substring(0, 2).toUpperCase(),
            avatarColor: colors[index % colors.length],
            parts: partsDisplay,
            qty: totalQty,
            amount: `LKR ${order.totalAmount ? order.totalAmount.toLocaleString() : '0'}`,
            status: formattedStatus,
            date: dateString,
            vehicle: order.city || 'Store Pickup',
          };
        });
        setOrders(formattedOrders);
      } catch (err) {
        setError('Could not connect to the database. Is Spring Boot running?');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getMinutesPassed = (dateStr) => {
    if (!dateStr || dateStr === 'Just now') return 0;
    const orderTime = new Date(dateStr).getTime();
    return isNaN(orderTime) ? 0 : (Date.now() - orderTime) / (1000 * 60);
  };

  const filteredOrders = orders.filter(order => {
    const status = order.status ? order.status.toLowerCase() : '';
    const minsPassed = getMinutesPassed(order.date);
    if (status === 'picked up' && minsPassed >= 10) return false;
    if (status === 'cancelled' && minsPassed >= 60) return false;

    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.phone && order.phone.includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => [...prevOrders]); 
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <ShoppingCart className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>Customer Orders</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Live Database Connection Active.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        
        {/* Toolbar: Search & Filters */}
        <div className="p-5 border-b flex flex-col lg:flex-row justify-between gap-4 items-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          
          <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeFilter === f
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-white border'
                }`}
                style={activeFilter !== f ? { backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' } : {}}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-500" size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 transition-all text-sm"
              style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              placeholder="Search by ID, Name, Phone..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative min-h-[400px]">
          
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-card)', opacity: 0.8 }}>
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Loading orders from Database...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <p className="text-sm font-bold text-red-400 bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20">
                ⚠️ {error}
              </p>
            </div>
          )}

          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                {['Order ID', 'Customer Details', 'Parts Requested', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!isLoading && !error && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const st = statusConfig[order.status] || statusConfig['Pending'];
                  return (
                    <tr
                      key={order.id}
                      className="border-b transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.02]"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-orange-500">{order.id}</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{order.date}</p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${order.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                            {order.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{order.customer}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                                {order.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1"><Phone size={10}/> {order.phone}</span>
                              <span>• {order.vehicle}</span>
                            </div>
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
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${st.bg} ${st.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                !isLoading && !error && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        <p className="text-base font-medium" style={{ color: 'var(--text-main)' }}>No orders found</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}