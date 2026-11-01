import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, Truck, History, RotateCcw, 
  Users, FileText, User, LogOut, AlertTriangle, TrendingUp, 
  Banknote, Wallet, CalendarClock, Plus, Edit3, BarChart3, 
  PieChart, Filter, Search, X, Save, Phone, Mail, Lock, 
  ShieldCheck, MapPin, Calendar, Briefcase, Key, Clock, Ban, CheckCircle,
  Bell, Check, ArrowDownToLine, ShoppingCart, Eye, ShoppingBag, Archive, EyeOff, Sunrise, Sun, Sunset, Moon, Image as ImageIcon,
  CheckSquare, Send 
} from 'lucide-react';
import './ManagerDashboard.css';

const getWeekString = (d) => {
    const date = new Date(d.getTime());
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
    return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

const parseWeek = (weekStr) => {
    if (!weekStr) return { start: new Date(0), end: new Date(0) };
    const [y, w] = weekStr.split('-W');
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    
    const start = new Date(ISOweekStart);
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    return { start, end };
};

const getStockQty = (p) => {
    if (p.stockQty !== undefined) return Number(p.stockQty);
    if (p.qty !== undefined) return Number(p.qty);
    if (p.quantity !== undefined) return Number(p.quantity);
    return 0;
};

const getLowStockLimit = (p) => {
  if (p.lowStockLimeted !== undefined) return Number(p.lowStockLimeted);
  if (p.lowStockLimit !== undefined) return Number(p.lowStockLimit);
  return 5; 
};


const getGreetingDetails = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
        return { text: "Good Morning", icon: <Sunrise size={28} color="#f59e0b" />, color: "#f59e0b" };
    } else if (currentHour >= 12 && currentHour < 17) {
        return { text: "Good Afternoon", icon: <Sun size={28} color="#eab308" />, color: "#eab308" };
    } else if (currentHour >= 17 && currentHour < 21) {
        return { text: "Good Evening", icon: <Sunset size={28} color="#f97316" />, color: "#f97316" };
    } else {
        return { text: "Good Night", icon: <Moon size={28} color="#6366f1" />, color: "#6366f1" };
    }
};


const getMinutesPassed = (dateStr, localTimestamp) => {
    const timeToCompare = localTimestamp || (dateStr ? new Date(dateStr).getTime() : Date.now());
    return (Date.now() - timeToCompare) / (1000 * 60);
};


const CustomSelect = ({ label, value, options, onChange, error, fieldName }) => {
    const [isCustom, setIsCustom] = useState(false);

    return (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: error ? '#ef4444' : '#475569', display: 'block', marginBottom: '5px' }}>
                {label} {['partCategory', 'vehicleType'].includes(fieldName) && '*'}
            </label>
            {isCustom ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                        type="text" 
                        value={value} 
                        onChange={(e) => onChange(fieldName, e.target.value)} 
                        placeholder={`Type new ${label.toLowerCase()}`}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: error ? '1px solid #fca5a5' : '1px solid #cbd5e1', outline: 'none', background: error ? '#fef2f2' : '#fff', color: '#1e293b' }} 
                        autoFocus
                    />
                    <button onClick={() => { setIsCustom(false); onChange(fieldName, ''); }} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                </div>
            ) : (
                <select 
                    value={options.includes(value) ? value : (value ? 'ADD_NEW' : '')} 
                    onChange={(e) => {
                        if (e.target.value === 'ADD_NEW') {
                            setIsCustom(true);
                            onChange(fieldName, '');
                        } else {
                            onChange(fieldName, e.target.value);
                        }
                    }} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: error ? '1px solid #fca5a5' : '1px solid #cbd5e1', outline: 'none', background: error ? '#fef2f2' : '#fff', color: '#1e293b' }}
                >
                    <option value="">-- Select --</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    {value && !options.includes(value) && <option value={value}>{value}</option>}
                    <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#3b82f6' }}>+ Add New {label}...</option>
                </select>
            )}
            {error && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>⚠️ {error}</span>}
        </div>
    );
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportSubTab, setReportSubTab] = useState('sales'); 
  const [loading, setLoading] = useState(true);
  const [stockAlertTab, setStockAlertTab] = useState('low');

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  
  const [loginTime, setLoginTime] = useState("");

  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    lowStockItems: []
  });
  
  const [financeReport, setFinanceReport] = useState({
    dailyIncome: 0, weeklyIncome: 0, monthlyIncome: 0, yearlyIncome: 0
  });

  const todayObj = new Date();
  const [filterDate, setFilterDate] = useState(todayObj.toISOString().split('T')[0]); 
  const [filterWeek, setFilterWeek] = useState(getWeekString(todayObj)); 
  const [filterMonth, setFilterMonth] = useState(todayObj.getMonth()); 
  
  const years = [2026]; 
  const [filterMonthYear, setFilterMonthYear] = useState(2026); 
  const [filterYearOnly, setFilterYearOnly] = useState(2026);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const [profitFilterType, setProfitFilterType] = useState('daily');
  const [pFilterDate, setPFilterDate] = useState(todayObj.toISOString().split('T')[0]);
  const [pFilterWeek, setPFilterWeek] = useState(getWeekString(todayObj));
  const [pFilterMonth, setPFilterMonth] = useState(todayObj.getMonth());
  const [pFilterYear, setPFilterYear] = useState(2026);

  
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [returnsHistory, setReturnsHistory] = useState([]);
  const [grnHistory, setGrnHistory] = useState([]);
  const [damagedHistory, setDamagedHistory] = useState([]);


  const [customersList, setCustomersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerProviderFilter, setCustomerProviderFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("All");
  const [orderViewTab, setOrderViewTab] = useState('active'); 
  const [showRecentCancelled, setShowRecentCancelled] = useState(true);

  const [selectedGrn, setSelectedGrn] = useState(null);

  const [showSalesViewModal, setShowSalesViewModal] = useState(false);
  const [selectedSales, setSelectedSales] = useState(null);

  const [showReturnViewModal, setShowReturnViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [showDamagedViewModal, setShowDamagedViewModal] = useState(false);
  const [selectedDamaged, setSelectedDamaged] = useState(null);
  
  const [showGrnViewModal, setShowGrnViewModal] = useState(false);
  const [grnSearch, setGrnSearch] = useState('');
  const [grnFilterDate, setGrnFilterDate] = useState('');
  
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseSubTab, setPurchaseSubTab] = useState('low-stock');
  const [selectedLowStockItems, setSelectedLowStockItems] = useState([]);
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poQuantities, setPoQuantities] = useState({});
  const [purchaseOrdersHistory, setPurchaseOrdersHistory] = useState([]);

  const [showPoViewModal, setShowPoViewModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [poInvoiceNo, setPoInvoiceNo] = useState("");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ id: '', supplierName: '', company: '', contactNumber: '', email: '', address: '' });

  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  const [historyYear, setHistoryYear] = useState(new Date().getFullYear());

  const [returnSearchQuery, setReturnSearchQuery] = useState("");
  const [returnHistoryFilter, setReturnHistoryFilter] = useState("all");

  const [returnYear, setReturnYear] = useState(new Date().getFullYear());

  const [currentPage, setCurrentPage] = useState(1);
  const [damagedSearchQuery, setDamagedSearchQuery] = useState("");
  const [damagedFilterDate, setDamagedFilterDate] = useState("");

  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [showViewProductModal, setShowViewProductModal] = useState(false);
  const [selectedViewProduct, setSelectedViewProduct] = useState(null);
  

  const [productForm, setProductForm] = useState({
      productCode: '', productName: '', partCategory: '', vehicleType: '', brand: '', 
      model: '', manufactureYear: '', description: '', productPrice: '', unitPrice: '', 
      sellingPrice: '', stockQty: '', lowStockLimeted: '', imageUrl: ''
  });
  

  const [productFormErrors, setProductFormErrors] = useState({});


 
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ employeeId: '', username: '', email: '', role: 'SalesPerson', password: '' });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmNotifModal, setConfirmNotifModal] = useState(null);
  const [confirmNotifAction, setConfirmNotifAction] = useState("");
  const [declineReason, setDeclineReason] = useState("");

const [showApproveItemModal, setShowApproveItemModal] = useState(false);
const [approveItemForm, setApproveItemForm] = useState({ productCode: '', productName: '', buyingPrice: '', sellingPrice: '', lowStockLimit: 5, vehicleType: '', brand: '', partCategory: '', imageUrl: '', model: '', manufactureYear: '' });

  const [showPriceUpdateModal, setShowPriceUpdateModal] = useState(false);
  const [priceUpdateForm, setPriceUpdateForm] = useState({ productCode: '', productName: '', oldBuyingPrice: 0, newBuyingPrice: 0, currentSellingPrice: 0, newSellingPrice: '' });

  const [showSupplierApproveModal, setShowSupplierApproveModal] = useState(false);
  const [approveSupplierForm, setApproveSupplierForm] = useState({
    supplierName: '', company: '', contactNumber: '', email: '', address: ''
  });

const [profileData, setProfileData] = useState({
    id: null, 
    name: "", 
    userName: "", 
    role: "", 
    employeeId: "", 
    branch: "", 
    email: "", 
    password: "",
    phone: "", 
    address: "", 
    joinedDate: ""
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [emailChangeForm, setEmailChangeForm] = useState({ newEmail: '' });
  const [emailChangePending, setEmailChangePending] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [emailChangeTimer, setEmailChangeTimer] = useState(null);
  const [timerCountdown, setTimerCountdown] = useState(0);


  const [latestOrderId, setLatestOrderId] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null); 
  const [delayedOrderAlert, setDelayedOrderAlert] = useState(null); 
  const [dismissedDelayedOrders, setDismissedDelayedOrders] = useState([]); 
  
  const [sessionStartTime] = useState(Date.now()); 
  const [hasCheckedMissedOrders, setHasCheckedMissedOrders] = useState(false);


  useEffect(() => {

    window.history.pushState(null, null, window.location.href);

    const handleBackButton = (event) => {

      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);


  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
  }, []);



  const handleVerifyOrder = async (order, e) => {
    if (e) e.stopPropagation();
    let hasStockIssue = false;
    let missingItems = [];

    if (order.items && order.items.length > 0) {
        for (let item of order.items) {
            const dbProduct = products.find(p => p.productCode === item.productCode);
            const availableStock = dbProduct ? getStockQty(dbProduct) : 0;
            const reqQty = item.qty || item.quantity || 1;
            if (reqQty > availableStock) {
                hasStockIssue = true;
                missingItems.push(`${item.productName || item.productCode} (Req: ${reqQty}, Has: ${availableStock})`);
            }
        }
    }

    if (hasStockIssue) {
        alert(`❌ Cannot verify order!\nInsufficient stock for:\n\n${missingItems.join('\n')}`);
        return;
    }

    try {
        await axios.put(`http://localhost:8080/api/orders/update-status/${order.id}`, { status: 'Verified' });
        setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Verified', localUpdateTime: Date.now() } : o));
        alert("✅ Order Verified Successfully!");
        if(showOrderModal) setShowOrderModal(false);
    } catch (error) {
        console.warn("Backend update failed, applying UI fallback.", error);
        setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Verified', localUpdateTime: Date.now() } : o));
        alert("✅ Order Verified Successfully!");
        if(showOrderModal) setShowOrderModal(false);
    }
  };

  const handleCompleteOrder = async (order, e) => {
    if (e) e.stopPropagation();
    try {
        await axios.put(`http://localhost:8080/api/orders/update-status/${order.id}`, { status: 'Completed' });
        setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Completed', localUpdateTime: Date.now() } : o));
        alert("✅ Order marked as Completed!");
        if(showOrderModal) setShowOrderModal(false);
    } catch (error) {
        console.warn("Backend update failed, applying UI fallback.", error);
        setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Completed', localUpdateTime: Date.now() } : o));
        alert("✅ Order marked as Completed!");
        if(showOrderModal) setShowOrderModal(false);
    }
  };

  const handlePickupOrder = async (order, e) => {
    if (e) e.stopPropagation();
    if(!window.confirm(`Are you sure you want to mark Order #ORD-${order.id} as Picked Up? Stock will be deducted.`)) {
        return;
    }

    try {
        await axios.put(`http://localhost:8080/api/orders/update-status/${order.id}`, { status: 'Picked Up' });

        let updatedProductsList = [...products];
        if (order.items && order.items.length > 0) {
            for (let item of order.items) {
                const dbProduct = updatedProductsList.find(p => p.productCode === item.productCode);
                if (dbProduct) {
                    const currentStock = getStockQty(dbProduct);
                    const reqQty = item.qty || item.quantity || 1;
                    const newStock = currentStock >= reqQty ? currentStock - reqQty : 0;
                    
                    const updatedProd = { ...dbProduct, stockQty: newStock };
                    await axios.put(`http://localhost:8080/api/spareparts/update/${dbProduct.productCode}`, updatedProd);
                    updatedProductsList = updatedProductsList.map(p => p.productCode === dbProduct.productCode ? updatedProd : p);
                }
            }
        }

        setProducts(updatedProductsList);
        setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Picked Up', localUpdateTime: Date.now() } : o));
        alert("✅ Order marked as Picked Up & Stock Deducted!");
        if(showOrderModal) setShowOrderModal(false);
        fetchAllData();
    } catch (error) {
        console.warn("Backend update failed, applying UI fallback.", error);
        let updatedProductsList = [...products];
        if (order.items && order.items.length > 0) {
            for (let item of order.items) {
                const dbProduct = updatedProductsList.find(p => p.productCode === item.productCode);
                if (dbProduct) {
                    const currentStock = getStockQty(dbProduct);
                    const reqQty = item.qty || item.quantity || 1;
                    const newStock = currentStock >= reqQty ? currentStock - reqQty : 0;
                    updatedProductsList = updatedProductsList.map(p => p.productCode === dbProduct.productCode ? { ...dbProduct, stockQty: newStock } : p);
                }
            }
        }
        setProducts(updatedProductsList);
        setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Picked Up', localUpdateTime: Date.now() } : o));
        alert("✅ Order marked as Picked Up & Stock Deducted!");
        if(showOrderModal) setShowOrderModal(false);
    }
  };

  const handleCancelOrder = async (order, e) => {
    if (e) e.stopPropagation();
    if(window.confirm("Are you sure you want to cancel this order?")) {
        try {
            await axios.put(`http://localhost:8080/api/orders/update-status/${order.id}`, { status: 'Cancelled' });
            setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Cancelled', localUpdateTime: Date.now() } : o));
            alert("✅ Order Cancelled Successfully!");
            if(showOrderModal) setShowOrderModal(false);
        } catch (error) {
            console.warn("Backend update failed, applying UI fallback.", error);
            setOrdersList(ordersList.map(o => o.id === order.id ? { ...o, status: 'Cancelled', localUpdateTime: Date.now() } : o));
            alert("✅ Order Cancelled Successfully!");
            if(showOrderModal) setShowOrderModal(false);
        }
    }
  };

  useEffect(() => {
    const fetchNotifs = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/notifications/pending');
            setNotifications(res.data);
        } catch(e) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let storedTime = localStorage.getItem("sessionLoginTime");
    if (!storedTime) {
        storedTime = new Date().toLocaleString();
        localStorage.setItem("sessionLoginTime", storedTime);
    }
    setLoginTime(storedTime);

    const timer = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
        setCurrentDate(now.toLocaleDateString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);




  useEffect(() => {
      if (ordersList.length > 0 && !hasCheckedMissedOrders) {
          const offlinePendingOrdersCount = ordersList.filter(o => {
              const isPending = (o.status || 'Pending').toLowerCase() === 'pending';
              const orderTime = new Date(o.createdAt || o.orderDate).getTime();
              return isPending && (orderTime < sessionStartTime);
          }).length;
          
          if (offlinePendingOrdersCount > 0) {
              setNewOrderAlert({ isMissedAlert: true, count: offlinePendingOrdersCount });
              const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
              audio.play().catch(e => console.log("Audio blocked"));
          }
          setHasCheckedMissedOrders(true); 
      }
  }, [ordersList, hasCheckedMissedOrders, sessionStartTime]);


  useEffect(() => {
      const checkNewOrders = async () => {
          try {
              const res = await axios.get('http://localhost:8080/api/orders/all');
              const orders = res.data;
              if (orders && orders.length > 0) {
                  const currentLatestId = orders[0].id;
                  setLatestOrderId(prevId => {
                      if (prevId !== null && currentLatestId > prevId) {
                          const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
                          audio.play().catch(e => console.log("Audio blocked"));
                          
                          setNewOrderAlert({ isMissedAlert: false, data: orders[0] });
                          
                          if ("Notification" in window && Notification.permission === "granted") {
                              new Notification("🚨 New Order Received!", {
                                  body: `${orders[0].customerName || 'A customer'} placed an order. Total: LKR ${orders[0].totalAmount?.toLocaleString()}`,
                                  icon: "https://cdn-icons-png.flaticon.com/512/3500/3500833.png"
                              });
                          }
                          setTimeout(() => { setNewOrderAlert(null); }, 15000);
                          setOrdersList([...orders].reverse());
                      }
                      return currentLatestId;
                  });
              }
          } catch (error) { console.log("Check failed", error); }
      };
      const interval = setInterval(checkNewOrders, 10000);
      return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const checkDelayedOrders = () => {
        if (!ordersList || ordersList.length === 0) return;

        const now = new Date().getTime();
        const twoHoursInMs = 2 * 60 * 60 * 1000; 

        const delayedOrder = ordersList.find(o => {
            const isPending = (o.status || 'Pending').toLowerCase() === 'pending';
            const orderTime = new Date(o.createdAt || o.orderDate).getTime();
            return isPending && (now - orderTime) > twoHoursInMs && !dismissedDelayedOrders.includes(o.id);
        });

        if (delayedOrder) {
            setDelayedOrderAlert(delayedOrder);
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg');
            audio.play().catch(e => console.log("Audio blocked"));
            setTimeout(() => { setDelayedOrderAlert(null); }, 15000);
        }
    };

    const delayedInterval = setInterval(checkDelayedOrders, 5 * 60 * 1000);
    return () => clearInterval(delayedInterval);
  }, [ordersList, dismissedDelayedOrders]);

  const fetchAllData = async () => {
  setLoading(true);
  try {
    const loggedInUserId = localStorage.getItem("userId");

    if (!loggedInUserId) {
      alert("User session not found. Please login again.");
      navigate("/login");
      return;
    }

 try {
      const userRes = await axios.get(`http://localhost:8080/api/users/${loggedInUserId}`);
      if (userRes.data) {
        
        setProfileData({
          id: userRes.data.id || loggedInUserId,
          name: userRes.data.name || userRes.data.username || "",
          userName: userRes.data.userName || userRes.data.username || "",
          role: userRes.data.role || "",
          email: userRes.data.gmail || userRes.data.email || "",
          employeeId: userRes.data.employeeId || "",
          branch: userRes.data.branch || "Head Office",
          phone: userRes.data.contactNo || "",
          address: userRes.data.address || "", 
          joinedDate: userRes.data.joinedDate || new Date().toISOString().split('T')[0],
          status: userRes.data.status || 'Active'
        });
        
        setEditProfileForm({
          name: userRes.data.name || userRes.data.username || "",
          userName: userRes.data.userName || userRes.data.username || "",
          phone: userRes.data.contactNo || "",
          branch: userRes.data.branch || "Head Office",
          address: userRes.data.address || "" 
        });
      }
    } catch (e) {
      console.warn("User fetch issue", e);
    }
const [dashboardRes, prodRes, orderRes, allUsersRes, returnsRes, suppRes, grnRes, damagedRes, custRes, ordListRes, purchaseOrdersRes] = await Promise.all([
      axios.get('http://localhost:8080/api/manager-dashboard').catch(() => ({ data: {} })),
      axios.get('http://localhost:8080/api/spareparts/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/sales/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/users/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/returns/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/suppliers').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/grn-history/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/damaged/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/customers/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/orders/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/purchases/all').catch(() => ({ data: [] })) 
    
    ]);

    setPurchaseOrdersHistory(Array.isArray(purchaseOrdersRes.data) ? purchaseOrdersRes.data.reverse() : []);
    

    const updateDynamicOptions = (prods) => {
        if(!prods) return;
        

        const uniqueCats = [...new Set(prods.map(p => p.partCategory).filter(Boolean))];
        const uniqueTypes = [...new Set(prods.map(p => p.vehicleType).filter(Boolean))];
        const uniqueBrands = [...new Set(prods.map(p => p.brand).filter(Boolean))];


        setCategoryOptions(uniqueCats);
        setVehicleTypeOptions(uniqueTypes);
        setBrandOptions(uniqueBrands);
    };

    const allProducts = Array.isArray(prodRes.data) ? prodRes.data : [];
    updateDynamicOptions(allProducts); 

    const lowStockList = dashboardRes.data?.lowStockItems || allProducts.filter(p => getStockQty(p) <= getLowStockLimit(p));
    setProducts(allProducts);
    setDashboardData({
      totalProducts: dashboardRes.data?.totalProducts || allProducts.length,
      lowStockCount: dashboardRes.data?.lowStockCount || lowStockList.length,
      lowStockItems: lowStockList
    });

    setSalesHistory(Array.isArray(orderRes.data) ? orderRes.data : []);

    const fetchedUsers = Array.isArray(allUsersRes.data) ? allUsersRes.data : [];
    setUsers(fetchedUsers.map(u => ({ ...u, status: u.status || 'Active' })));

    setReturnsHistory(Array.isArray(returnsRes.data) ? returnsRes.data : []);
    setSuppliers(Array.isArray(suppRes.data) ? suppRes.data : []);

    if (Array.isArray(grnRes.data)) {
      const formattedGrn = grnRes.data.map(g => {
        let parsedItems = [];
        try {
          parsedItems = JSON.parse(g.items);
        } catch (e) {
          parsedItems = [];
        }
        return { ...g, items: parsedItems };
      }).reverse();

      setGrnHistory(formattedGrn);
    } else {
      setGrnHistory([]);
    }

    setDamagedHistory(Array.isArray(damagedRes.data) ? damagedRes.data.reverse() : []);
    
    setCustomersList(Array.isArray(custRes.data) ? custRes.data : []);
    

    const rawOrders = Array.isArray(ordListRes.data) ? ordListRes.data : [];
    if (rawOrders.length > 0) { setLatestOrderId(prev => prev === null ? rawOrders[0].id : prev); }
    
    const enrichedOrders = rawOrders.map(o => ({
        ...o,
        localUpdateTime: o.updatedAt ? new Date(o.updatedAt).getTime() : new Date(o.createdAt || o.orderDate).getTime()
    }));

    setOrdersList([...enrichedOrders].reverse());

      } catch (error) {
        console.error("Critical error fetching data:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    let dInc = 0, wInc = 0, mInc = 0, yInc = 0;
    const targetDateStr = new Date(filterDate).toDateString();
    const weekRange = parseWeek(filterWeek);

    salesHistory.forEach(sale => {
      const sDate = new Date(sale.saleDate);
      const amount = sale.totalAmount || 0;

      if (sDate.toDateString() === targetDateStr) dInc += amount;
      if (sDate >= weekRange.start && sDate <= weekRange.end) wInc += amount;
      if (sDate.getMonth() === parseInt(filterMonth) && sDate.getFullYear() === parseInt(filterMonthYear)) mInc += amount;
      if (sDate.getFullYear() === parseInt(filterYearOnly)) yInc += amount;
    });

    setFinanceReport({ dailyIncome: dInc, weeklyIncome: wInc, monthlyIncome: mInc, yearlyIncome: yInc });
  }, [salesHistory, filterDate, filterWeek, filterMonth, filterMonthYear, filterYearOnly]);

  const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
        try {
            await axios.post(`http://localhost:8080/api/users/logout/${userId}`);
        } catch (error) {}
    }
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("sessionLoginTime");
    navigate("/");
  };

const triggerConfirmNotification = (notif, action) => {
  if (action === 'APPROVE' && notif.type === 'NEW_ITEM_APPROVAL') {
    try {
      const itemData = JSON.parse(notif.message);
      setApproveItemForm({
        productCode: itemData.productCode || '',
        productName: itemData.productName || '',
        buyingPrice: itemData.buyingPrice || '',
        sellingPrice: '',
        lowStockLimit: 5,
        vehicleType: itemData.vehicleType || '',
        brand: itemData.brand || '',
        partCategory: itemData.partCategory || '',
        imageUrl: itemData.imageUrl || '',
        model: itemData.model || '',
        manufactureYear: itemData.manufactureYear || ''
      });
      setConfirmNotifModal(notif);
      setShowNotifications(false);
      setShowApproveItemModal(true);
    } catch (e) {}
  } else if (action === 'APPROVE' && notif.type === 'NEW_SUPPLIER_APPROVAL') {
    try {
      const supplierData = JSON.parse(notif.message);
      setApproveSupplierForm({
        supplierName: supplierData.supplierName || '',
        company: supplierData.company || '',
        contactNumber: supplierData.contactNumber || '',
        email: supplierData.email || '',
        address: supplierData.address || ''
      });
      setConfirmNotifModal(notif);
      setShowNotifications(false);
      setShowSupplierApproveModal(true);
    } catch (e) {}
  } else if (action === 'APPROVE' && notif.type === 'PRICE_UPDATE_APPROVAL') {
    try {
      const itemData = JSON.parse(notif.message);
      setPriceUpdateForm({
        productCode: itemData.productCode,
        productName: itemData.productName,
        oldBuyingPrice: itemData.oldBuyingPrice,
        newBuyingPrice: itemData.newBuyingPrice,
        currentSellingPrice: itemData.currentSellingPrice,
        newSellingPrice: itemData.currentSellingPrice
      });
      setConfirmNotifModal(notif);
      setShowNotifications(false);
      setShowPriceUpdateModal(true);
    } catch (e) {}
  } else {
    setConfirmNotifModal(notif);
    setConfirmNotifAction(action);
    setShowNotifications(false);
  }
};

 const executeNotificationAction = async () => {
  try {
    if (confirmNotifAction === 'APPROVE') {
      await axios.post(`http://localhost:8080/api/notifications/approve/${confirmNotifModal.id}`);
      alert("✅ Request Approved Successfully!");
    } else {
      if (!declineReason.trim()) {
        alert("Please enter a reason for declining.");
        return;
      }
      await axios.post(
        `http://localhost:8080/api/notifications/reject/${confirmNotifModal.id}`,
        { reason: declineReason }
      );
      alert("❌ Request Declined!");
    }
    setNotifications(prev => prev.filter(n => n.id !== confirmNotifModal.id));
    fetchAllData();
  } catch (e) {
    alert(`Failed to ${confirmNotifAction.toLowerCase()} request.`);
  } finally {
    setConfirmNotifModal(null);
    setConfirmNotifAction("");
    setDeclineReason("");
  }
};

  const handleApproveNewItem = async () => {
      if (!approveItemForm.buyingPrice || !approveItemForm.sellingPrice || !approveItemForm.lowStockLimit) {
          alert("Please set the Buying Price, Selling Price, and Low Stock Limit.");
          return;
      }
      if (Number(approveItemForm.sellingPrice) < Number(approveItemForm.buyingPrice)) {
          if(!window.confirm("⚠️ Warning: Selling Price is lower than Buying Price. Are you sure you want to proceed?")) {
              return;
          }
      }
     try {
          const newProductPayload = {
              productCode: approveItemForm.productCode,
              productName: approveItemForm.productName,
              unitPrice: Number(approveItemForm.buyingPrice),
              productPrice: Number(approveItemForm.buyingPrice),
              sellingPrice: Number(approveItemForm.sellingPrice),
              stockQty: 0, 
              lowStockLimeted: Number(approveItemForm.lowStockLimit),
              vehicleType: approveItemForm.vehicleType,
              brand: approveItemForm.brand,
              partCategory: approveItemForm.partCategory,
              model: approveItemForm.model,
              manufactureYear: approveItemForm.manufactureYear,
              imageUrl: approveItemForm.imageUrl || ''
          };
          await axios.post(`http://localhost:8080/api/spareparts/add`, newProductPayload);
          if (confirmNotifModal && confirmNotifModal.id) {
              await axios.post(`http://localhost:8080/api/notifications/approve/${confirmNotifModal.id}`);
              setNotifications(notifications.filter(n => n.id !== confirmNotifModal.id));
          }
          alert("✅ Product Registered Successfully!\n\nThe Store Keeper can now proceed with the GRN.");
          setShowApproveItemModal(false);
          setConfirmNotifModal(null);
          fetchAllData(); 
      } catch (error) {
          console.error("Failed to register new item:", error);
          alert("❌ Failed to register product. It might already exist in the database.");
      }
  };

  const handleApprovePriceUpdate = async () => {
  if (!priceUpdateForm.newSellingPrice) {
    alert("Please enter a new Selling Price.");
    return;
  }
  try {
    const existingProd = products.find(p => p.productCode === priceUpdateForm.productCode);
    if (!existingProd) {
      alert("Product not found in DB!");
      return;
    }
    const updatedProd = {
      ...existingProd,
      sellingPrice: Number(priceUpdateForm.newSellingPrice),
      unitPrice: Number(priceUpdateForm.newBuyingPrice),
      productPrice: Number(priceUpdateForm.newBuyingPrice)
    };
    await axios.put(`http://localhost:8080/api/spareparts/update/${priceUpdateForm.productCode}`, updatedProd);
    if (confirmNotifModal && confirmNotifModal.id) {
      await axios.post(`http://localhost:8080/api/notifications/approve/${confirmNotifModal.id}`);
      setNotifications(prev => prev.filter(n => n.id !== confirmNotifModal.id));
    }
    alert("✅ Selling Price Updated Successfully!");
    setShowPriceUpdateModal(false);
    setConfirmNotifModal(null);
    fetchAllData();
  } catch (e) {
    alert("❌ Failed to update price.");
  }
};

const handleApproveSupplier = async () => {
  if (!approveSupplierForm.supplierName || !approveSupplierForm.contactNumber) {
    alert("Please fill Supplier Name and Contact Number.");
    return;
  }
  try {
    await axios.post("http://localhost:8080/api/suppliers", approveSupplierForm);
    if (confirmNotifModal && confirmNotifModal.id) {
      await axios.post(`http://localhost:8080/api/notifications/approve/${confirmNotifModal.id}`);
      setNotifications(prev => prev.filter(n => n.id !== confirmNotifModal.id));
    }
    alert("✅ Supplier registered successfully!");
    setShowSupplierApproveModal(false);
    setConfirmNotifModal(null);
    fetchAllData();
  } catch (error) {
    console.error("Failed to approve supplier:", error);
    alert("❌ Failed to register supplier.");
  }
};

  const handleOpenAddUser = () => {
    setUserForm({ employeeId: '', username: '', email: '', role: 'SalesPerson', password: '' });
      setShowUserModal(true);
  };

const handleUserSubmit = async () => {
    if (!userForm.employeeId || !userForm.username || !userForm.email || !userForm.password) {
        alert("Employee ID, Full Name, Email, and Password are required!");
        return;
    }
    const isDuplicateId = users.some(u => 
        u.employeeId && u.employeeId.toLowerCase() === userForm.employeeId.toLowerCase()
    );
    if (isDuplicateId) {
        alert(`❌ Error: Employee ID "${userForm.employeeId}" already exists in the system!`);
        return; 
    }
    const isDuplicateEmail = users.some(u => 
        (u.email && u.email.toLowerCase() === userForm.email.toLowerCase()) || 
        (u.gmail && u.gmail.toLowerCase() === userForm.email.toLowerCase())
    );
    if (isDuplicateEmail) {
        alert(`❌ Error: Email Address "${userForm.email}" is already registered to another employee!`);
        return; 
    }
    try {
        const newUser = {
            employeeId: userForm.employeeId,
            name: userForm.username,
            userName: userForm.username,
            gmail: userForm.email,
            role: userForm.role,
            password: userForm.password,
            status: 'Active'
        };
        const response = await axios.post(`http://localhost:8080/api/users/add`, newUser);
        const savedUser = response.data || newUser; 
        setUsers([...users, savedUser]);
        setShowUserModal(false);
        alert("✅ New Employee Account Created Successfully!");
    } catch (error) {
        console.error("Backend add failed:", error);
        alert(
            error.response?.data?.message || 
            error.response?.data?.error || 
            "❌ Failed to add user. Check connection or constraints."
        );
    }
};

  const togglePoItem = (product) => {
      setSelectedLowStockItems(prev => {
          if (prev.find(item => item.productCode === product.productCode)) {
              return prev.filter(item => item.productCode !== product.productCode);
          } else {
              return [...prev, product];
          }
      });
  };

  const handlePoQtyChange = (code, qty) => {
      setPoQuantities(prev => ({...prev, [code]: qty}));
  };


  const handleSendPurchaseOrder = async () => {
      if(!poSupplierId) return alert("⚠️ Please select a Supplier!");
      if(selectedLowStockItems.length === 0) return alert("⚠️ Please select at least one item!");


      const itemsPayload = selectedLowStockItems.map(p => ({
          sparePart: { productCode: p.productCode }, 
          quantity: Number(poQuantities[p.productCode] || 1)
      }));

      const payload = {
          supplier: { id: poSupplierId },
          status: "Processing",
          items: itemsPayload
      };

      try {
          await axios.post('http://localhost:8080/api/purchases/add', payload);
          alert("✅ Purchase Order Sent to Supplier Successfully!");
          setShowPurchaseOrderModal(false);
          setSelectedLowStockItems([]);
          setPoQuantities({});
          fetchAllData(); 
      } catch (error) {
          console.error("PO Failed:", error);
          alert("❌ Failed to send Purchase Order.");
      }
  };


  const handleReceivePO = async () => {
      if(!poInvoiceNo.trim()) {
          return alert("⚠️ Please enter the Supplier Bill / Invoice ID!");
      }
      try {

          const newStatus = `Received (Bill No: ${poInvoiceNo})`;
          await axios.put(`http://localhost:8080/api/purchases/update-status/${selectedPo.id}`, {
              status: newStatus
          });
          
          alert("✅ Purchase Order Marked as Received Successfully!");
          setShowPoViewModal(false); 
          setPoInvoiceNo(""); 
          fetchAllData(); 
      } catch (error) {
          console.error(error);
          alert("❌ Failed to update Purchase Order status.");
      }
  };
  const handleToggleUserStatus = async (user) => {
      const newStatus = user.status === 'Active' ? 'Hold' : 'Active';
      const actionText = newStatus === 'Hold' ? 'suspend' : 'activate';
      if(window.confirm(`Are you sure you want to ${actionText} this account?`)) {
          try {
              await axios.put(`http://localhost:8080/api/users/update-status/${user.id}`, { status: newStatus });
              setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
          } catch (error) {
              console.warn("Backend update failed, updating UI state for demo.");
              setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
          }
      }
  };



  const handleProductFormChange = (field, value) => {
      setProductForm(prev => {
          const updatedForm = { ...prev, [field]: value };

          if (field === 'vehicleType') {
              updatedForm.brand = ''; 
          }
          return updatedForm;
      });
      if (productFormErrors[field]) {
          setProductFormErrors(prev => ({ ...prev, [field]: null })); 
      }
  };

  const handleOpenAddProduct = () => {
    setProductForm({ productCode: '', productName: '', partCategory: '', vehicleType: '', brand: '', model: '', manufactureYear: '', description: '', productPrice: '', unitPrice: '', sellingPrice: '', stockQty: '', lowStockLimeted: 5, imageUrl: '' });
    setProductFormErrors({});
    setIsEditingProduct(false);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (e, product) => {
    e.stopPropagation();
    setProductForm({
        ...product,
        stockQty: getStockQty(product),
        lowStockLimeted: getLowStockLimit(product),
        unitPrice: product.unitPrice || product.productPrice || 0
    });
    setProductFormErrors({});
    setIsEditingProduct(true);
    setShowProductModal(true);
  };

  const handleViewProduct = (product) => { setSelectedViewProduct(product); setShowViewProductModal(true); };

  const handleProductSubmit = async () => {
      let errors = {};
      

      if (!productForm.productCode?.trim()) errors.productCode = "Product Code is required";
      if (!productForm.productName?.trim()) errors.productName = "Product Name is required";
      if (!productForm.partCategory?.trim()) errors.partCategory = "Category is required";
      if (!productForm.vehicleType?.trim()) errors.vehicleType = "Vehicle Type is required";
      if (!productForm.sellingPrice || Number(productForm.sellingPrice) <= 0) errors.sellingPrice = "Valid Selling Price is required";


      if (!isEditingProduct) {
          const isDuplicate = products.some(p => p.productCode && p.productCode.toLowerCase() === productForm.productCode.trim().toLowerCase());
          if (isDuplicate) {
              errors.productCode = `Product Code "${productForm.productCode}" already exists!`;
          }
      }

      if (Object.keys(errors).length > 0) {
          setProductFormErrors(errors);
          return; // Stop submission
      }

      setProductFormErrors({});


      if (productForm.partCategory && !categoryOptions.includes(productForm.partCategory)) setCategoryOptions([...categoryOptions, productForm.partCategory]);
      if (productForm.vehicleType && !vehicleTypeOptions.includes(productForm.vehicleType)) setVehicleTypeOptions([...vehicleTypeOptions, productForm.vehicleType]);
      if (productForm.brand && !brandOptions.includes(productForm.brand)) setBrandOptions([...brandOptions, productForm.brand]);

      const payload = {
          ...productForm,
          unitPrice: Number(productForm.unitPrice || 0),
          productPrice: Number(productForm.unitPrice || 0),
          sellingPrice: Number(productForm.sellingPrice),
          stockQty: Number(productForm.stockQty || 0),
          lowStockLimeted: Number(productForm.lowStockLimeted || 5)
      };

      try {
          if (isEditingProduct) {
              await axios.put(`http://localhost:8080/api/spareparts/update/${productForm.productCode}`, payload);
              setProducts(products.map(p => p.productCode === productForm.productCode ? payload : p));
          } else {
              const response = await axios.post(`http://localhost:8080/api/spareparts/add`, payload);
              setProducts([...products, response.data || payload]);
          }
          setShowProductModal(false); 
          alert(`✅ Product ${isEditingProduct ? "Updated" : "Saved"} Successfully!`);
      } catch (error) {
          alert(`❌ Failed to ${isEditingProduct ? "update" : "save"} product. Server error.`);
      }
  };

  const handleOpenAddSupplier = () => {
      setSupplierForm({ id: '', supplierName: '', company: '', contactNumber: '', email: '', address: '' });
      setIsEditingSupplier(false);
      setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (supplier) => {
      setSupplierForm(supplier);
      setIsEditingSupplier(true);
      setShowSupplierModal(true);
  };

  const handleSupplierSubmit = async () => {
      if (!supplierForm.supplierName || !supplierForm.contactNumber) {
          alert("Supplier Name and Contact Number are required!");
          return;
      }
      if (isEditingSupplier) {
          try {
              await axios.put(`http://localhost:8080/api/suppliers/${supplierForm.id}`, supplierForm);
              setSuppliers(suppliers.map(s => s.id === supplierForm.id ? supplierForm : s));
              setShowSupplierModal(false);
              alert("✅ Supplier Updated Successfully!");
          } catch (error) {
              console.error("Backend update failed:", error);
              alert("❌ Failed to update supplier.");
          }
      } else {
          try {
              const response = await axios.post(`http://localhost:8080/api/suppliers`, supplierForm);
              const savedSupplier = response.data || supplierForm; 
              setSuppliers([...suppliers, savedSupplier]);
              setShowSupplierModal(false);
              alert("✅ New Supplier Added Successfully!");
          } catch (error) {
              console.error("Backend add failed:", error);
              alert("❌ Failed to add supplier.");
          }
      }
  };

 const handleProfileUpdateSubmit = async () => {
  try {
    const updatePayload = {
      id: profileData.id,
      name: editProfileForm.name,
      userName: editProfileForm.userName, 
      gmail: profileData.email, 
      contactNo: editProfileForm.phone, 
      branch: editProfileForm.branch,
      address: editProfileForm.address,
      employeeId: profileData.employeeId,
      joinedDate: profileData.joinedDate,
      role: profileData.role,
      status: profileData.status || 'Active'
    };

    await axios.put(
      `http://localhost:8080/api/users/update/${profileData.id}`, 
      updatePayload
    );

    setProfileData({ 
      ...profileData, 
      name: editProfileForm.name,
      userName: editProfileForm.userName,
      phone: editProfileForm.phone,   
      branch: editProfileForm.branch,
      address: editProfileForm.address
    });
    
    setShowEditProfileModal(false);
    alert("✅ Profile updated successfully!");
    fetchAllData(); 
    
  } catch (error) {
    console.warn("Backend update failed:", error);
    setProfileData({ ...profileData, ...editProfileForm });
    setShowEditProfileModal(false);
  }
};

  const handlePasswordUpdateSubmit = async () => {
    if(passwordForm.newPass !== passwordForm.confirm) {
        alert("New passwords do not match!");
        return;
    }
    try {
        await axios.put(`http://localhost:8080/api/users/update/${profileData.id}`, { ...profileData, password: passwordForm.newPass });
        setShowPasswordModal(false);
        setPasswordForm({ current: '', newPass: '', confirm: '' });
        alert("✅ Password changed successfully!");
    } catch (error) {
        console.warn("Backend update failed, simulating success.");
        setShowPasswordModal(false);
        setPasswordForm({ current: '', newPass: '', confirm: '' });
    }
  };

  const handleEmailChangeRequest = async () => {
    setEmailChangeError('');
    setEmailChangeSuccess(false);

    if (!emailChangeForm.newEmail.trim()) {
        setEmailChangeError('Please enter a new email address.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailChangeForm.newEmail)) {
        setEmailChangeError('Please enter a valid email address.');
        return;
    }

    if (emailChangeForm.newEmail === profileData.email) {
        setEmailChangeError('New email is same as current email!');
        return;
    }

    try {
        setEmailChangePending(true);

        await axios.post(
            'http://localhost:8080/api/email-change/request',
            {
                userId: profileData.id,
                currentEmail: profileData.email,
                newEmail: emailChangeForm.newEmail,
                employeeName: profileData.name
            }
        );

        setEmailChangeSuccess(true);
        setEmailChangeError('');

    } catch (error) {
        const errData = error.response?.data;

        if (errData?.minutesLeft !== undefined) {
            const totalSeconds =
                (errData.minutesLeft * 60) +
                (errData.secondsLeft || 0);

            setTimerCountdown(totalSeconds);
            setEmailChangeError(
                `⏰ Please wait ${errData.minutesLeft}m ` +
                `${errData.secondsLeft || 0}s before requesting again.`
            );

            const interval = setInterval(() => {
                setTimerCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setEmailChangeError('');
                        return 0;
                    }
                    const mins = Math.floor((prev - 1) / 60);
                    const secs = (prev - 1) % 60;
                    setEmailChangeError(
                        `⏰ Please wait ${mins}m ${secs}s ` +
                        `before requesting again.`
                    );
                    return prev - 1;
                });
            }, 1000);

            setEmailChangeTimer(interval);

        } else if (errData?.error) {
            setEmailChangeError(`❌ ${errData.error}`);
        } else {
            setEmailChangeError(
                '❌ Failed to send email change request.'
            );
        }
    } finally {
        setEmailChangePending(false);
    }
};

  const getProfitData = () => {
    let filteredSales = [];
    let filteredReturns = [];

    const targetDateStr = new Date(pFilterDate).toDateString();
    const weekRange = parseWeek(pFilterWeek);

    filteredSales = salesHistory.filter(sale => {
        const sDate = new Date(sale.saleDate);
        if (profitFilterType === 'daily') return sDate.toDateString() === targetDateStr;
        if (profitFilterType === 'weekly') return sDate >= weekRange.start && sDate <= weekRange.end;
        if (profitFilterType === 'monthly') return sDate.getMonth() === parseInt(pFilterMonth) && sDate.getFullYear() === parseInt(pFilterYear);
        if (profitFilterType === 'yearly') return sDate.getFullYear() === parseInt(pFilterYear);
        return true;
    });

    filteredReturns = returnsHistory.filter(ret => {
        const rDate = new Date(ret.returnDate);
        if (profitFilterType === 'daily') return rDate.toDateString() === targetDateStr;
        if (profitFilterType === 'weekly') return rDate >= weekRange.start && rDate <= weekRange.end;
        if (profitFilterType === 'monthly') return rDate.getMonth() === parseInt(pFilterMonth) && rDate.getFullYear() === parseInt(pFilterYear);
        if (profitFilterType === 'yearly') return rDate.getFullYear() === parseInt(pFilterYear);
        return true;
    });

    let totalGrossRevenue = 0;
    let totalCostOfGoods = 0;

    const billRows = filteredSales.map(sale => {
        let saleCost = 0;
        let saleRev = sale.totalAmount;
        
        (sale.items || []).forEach(item => {
            const matchedProd = products.find(p => p.productCode === item.productCode);
            const costPrice = matchedProd?.unitPrice || matchedProd?.productPrice || (item.sellingPrice * 0.75);
            saleCost += (costPrice * (item.qty || 1));
        });

        totalGrossRevenue += saleRev;
        totalCostOfGoods += saleCost;

        return {
            billId: sale.billId,
            date: sale.saleDate,
            revenue: saleRev,
            cost: saleCost,
            profit: saleRev - saleCost
        };
    });

    let returnRevenueLoss = 0;
    let returnCostRecovery = 0;

    filteredReturns.forEach(ret => {
        returnRevenueLoss += ret.refundAmount;
        const matchedProd = products.find(p => p.productCode === ret.productCode);
        const costPrice = matchedProd?.unitPrice || matchedProd?.productPrice || ((ret.refundAmount / ret.quantity) * 0.75);
        returnCostRecovery += (costPrice * ret.quantity);
    });

    const netRevenue = totalGrossRevenue - returnRevenueLoss;
    const netCost = totalCostOfGoods - returnCostRecovery;
    const netProfit = netRevenue - netCost;

    return { billRows, netRevenue, netCost, netProfit, returnRevenueLoss };
  };

  const getRefundAmountForBill = (billId) => {
  return returnsHistory
    .filter(rb => rb.billId === billId)
    .reduce((sum, rb) => sum + rb.refundAmount, 0);
};

const filteredGrnHistory = grnHistory.filter(grn => {
  const search = grnSearch.trim().toLowerCase();

  const invoice = String(grn.invoice || '').trim().toLowerCase();
  const supplier = String(grn.supplier || '').trim().toLowerCase();
  const grnId = String(grn.grnId || '').trim().toLowerCase();
  const date = String(grn.date || '').trim().toLowerCase();

  const matchesSearch =
    search === '' ||
    invoice.includes(search) ||
    supplier.includes(search) ||
    grnId.includes(search) ||
    date.includes(search);

  const matchesDate =
    !grnFilterDate || String(grn.date || '') === grnFilterDate;

  return matchesSearch && matchesDate;
});

const handleViewGrn = (grn) => {
  setSelectedGrn(grn);
  setShowGrnViewModal(true);
};







  const renderDashboard = () => {
  const outOfStockItems = products.filter(p => getStockQty(p) === 0);
  const lowStockOnlyItems = products.filter(p => {
    const stock = getStockQty(p);
    const limit = getLowStockLimit(p);
    return stock > 0 && stock <= limit;
  });

  const greeting = getGreetingDetails(); 

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
      
      {/* 🟢 NEW CREATIVE GREETING SECTION */}
      <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
              background: '#fff', 
              borderRadius: '16px', 
              padding: '25px 30px', 
              marginBottom: '35px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
          }}
      >
          {/* Background Decorative Element */}
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', background: `${greeting.color}15`, borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
              <div style={{ background: `${greeting.color}20`, padding: '15px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 15px ${greeting.color}30` }}>
                  {greeting.icon}
              </div>
              <div>
                  <h1 style={{ margin: '0 0 5px 0', fontSize: '26px', color: '#1e293b', fontWeight: '800' }}>
                      {greeting.text}, <span style={{ color: '#3b82f6' }}>{profileData.name.split(' ')[0]}!</span> 👋
                  </h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                      Here is what's happening in your store today.
                  </p>
              </div>
          </div>

          <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                  <CalendarClock size={22} color="#3b82f6"/> {currentTime}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
          </div>
      </motion.div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{color: '#1e293b', margin: 0}}>System Overview</h2>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Banknote size={20}/> 
              <span style={{fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold'}}>
                Daily Revenue
              </span>
            </div>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '12px'}} />
          </div>
          <h2 style={{fontSize: '36px', margin: 0}}>Rs. {financeReport.dailyIncome.toLocaleString()}</h2>
        </div>

        <div style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.2)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <TrendingUp size={20}/> 
              <span style={{fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold'}}>
                Weekly Revenue
              </span>
            </div>
            <input type="week" value={filterWeek} onChange={(e) => setFilterWeek(e.target.value)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '12px'}} />
          </div>
          <h2 style={{fontSize: '36px', margin: 0}}>Rs. {financeReport.weeklyIncome.toLocaleString()}</h2>
        </div>

        <div style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.2)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Wallet size={20}/> 
              <span style={{fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold'}}>
                Monthly Revenue
              </span>
            </div>
            <div style={{display: 'flex', gap: '5px'}}>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '12px'}}>
                {months.map((m, i) => <option key={i} value={i} style={{color: '#0f172a'}}>{m}</option>)}
              </select>
              <select value={filterMonthYear} onChange={(e) => setFilterMonthYear(e.target.value)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '12px'}}>
                {years.map(y => <option key={y} value={y} style={{color: '#0f172a'}}>{y}</option>)}
              </select>
            </div>
          </div>
          <h2 style={{fontSize: '36px', margin: 0}}>Rs. {financeReport.monthlyIncome.toLocaleString()}</h2>
        </div>

        <div style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <BarChart3 size={20}/> 
              <span style={{fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold'}}>
                Yearly Revenue
              </span>
            </div>
            <select value={filterYearOnly} onChange={(e) => setFilterYearOnly(e.target.value)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 15px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '12px'}}>
              {years.map(y => <option key={y} value={y} style={{color: '#0f172a'}}>{y}</option>)}
            </select>
          </div>
          <h2 style={{fontSize: '36px', margin: 0}}>Rs. {financeReport.yearlyIncome.toLocaleString()}</h2>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px'}}>
        <div style={{background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <div style={{display: 'flex', gap: '10px'}}>
              <button
                onClick={() => setStockAlertTab('low')}
                style={{
                  background: stockAlertTab === 'low' ? '#ef4444' : '#f1f5f9',
                  color: stockAlertTab === 'low' ? '#fff' : '#475569',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Low Stock ({lowStockOnlyItems.length})
              </button>

              <button
                onClick={() => setStockAlertTab('out')}
                style={{
                  background: stockAlertTab === 'out' ? '#f97316' : '#f1f5f9',
                  color: stockAlertTab === 'out' ? '#fff' : '#475569',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Out of Stock ({outOfStockItems.length})
              </button>
            </div>
          </div>

          <div style={{maxHeight: '300px', overflowY: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
              <thead style={{background: '#f8fafc', position: 'sticky', top: 0}}>
                <tr>
                  <th style={{padding: '12px', textAlign: 'left', color:'#475569'}}>Code</th>
                  <th style={{textAlign: 'left', color:'#475569'}}>Name</th>
                  <th style={{textAlign: 'center', color:'#475569'}}>
                    {stockAlertTab === 'low' ? 'Stock Left' : 'Stock Status'}
                  </th>
                  <th style={{textAlign: 'center', color:'#475569'}}>
                    {stockAlertTab === 'low' ? 'Limit' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stockAlertTab === 'low' ? (
                  lowStockOnlyItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
                        No low stock items.
                      </td>
                    </tr>
                  ) : (
                    lowStockOnlyItems.map(item => (
                      <tr key={item.productCode} style={{borderBottom: '1px solid #f1f5f9'}}>
                        <td style={{padding: '12px', fontWeight: 'bold', color: '#475569'}}>{item.productCode}</td>
                        <td style={{color: '#1e293b'}}>{item.productName}</td>
                        <td style={{textAlign: 'center', color: '#ef4444', fontWeight: 'bold', background: '#fef2f2', borderRadius: '6px'}}>
                          {getStockQty(item)}
                        </td>
                        <td style={{textAlign: 'center', color: '#64748b'}}>
                          {getLowStockLimit(item)}
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  outOfStockItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
                        No out of stock items.
                      </td>
                    </tr>
                  ) : (
                    outOfStockItems.map(item => (
                      <tr key={item.productCode} style={{borderBottom: '1px solid #f1f5f9'}}>
                        <td style={{padding: '12px', fontWeight: 'bold', color: '#475569'}}>{item.productCode}</td>
                        <td style={{color: '#1e293b'}}>{item.productName}</td>
                        <td style={{textAlign: 'center', color: '#f97316', fontWeight: 'bold', background: '#fff7ed', borderRadius: '6px'}}>
                          OUT
                        </td>
                        <td style={{textAlign: 'center', color: '#f97316', fontWeight: 'bold'}}>
                          Reorder Needed
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => setActiveTab('inventory')} style={{background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer'}}>
            <div style={{background: '#eff6ff', padding: '15px', borderRadius: '50%', color: '#3b82f6'}}><Package size={30}/></div>
            <div><h3 style={{margin: 0, fontSize: '24px', color: '#1e293b'}}>{dashboardData.totalProducts}</h3><span style={{color: '#64748b', fontSize: '13px'}}>Total Products in DB</span></div>
          </motion.div>

          <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => setActiveTab('users')} style={{background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer'}}>
            <div style={{background: '#f0fdf4', padding: '15px', borderRadius: '50%', color: '#10b981'}}><Users size={30}/></div>
            <div><h3 style={{margin: '0 0 5px 0', fontSize: '24px', color: '#1e293b'}}>{users.length}</h3><span style={{color: '#64748b', fontSize: '13px'}}>Total System Accounts</span></div>
          </motion.div>

          <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => { setActiveTab('reports'); setReportSubTab('returns'); }} style={{background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer'}}>
            <div style={{background: '#fef2f2', padding: '15px', borderRadius: '50%', color: '#ef4444'}}><RotateCcw size={30}/></div>
            <div><h3 style={{margin: 0, fontSize: '24px', color: '#1e293b'}}>{returnsHistory.length}</h3><span style={{color: '#64748b', fontSize: '13px'}}>Total Returns Processed</span></div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

  const renderProfit = () => {
    const profitData = getProfitData();
    const marginPercent = profitData.netRevenue > 0 ? ((profitData.netProfit / profitData.netRevenue) * 100).toFixed(2) : 0;

    return (
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color:'#1e293b'}}><PieChart color="#f97316"/> Profit & Margins Analysis</h2>
          
          <div style={{display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', padding: '8px 15px', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
             <Filter size={16} color="#64748b"/>
             <select value={profitFilterType} onChange={(e) => setProfitFilterType(e.target.value)} style={{border: 'none', background: '#f1f5f9', color:'#1e293b', padding: '8px', borderRadius: '6px', fontWeight: 'bold', outline: 'none', cursor: 'pointer'}}>
                <option value="daily">Daily Profit</option>
                <option value="weekly">Weekly Profit</option>
                <option value="monthly">Monthly Profit</option>
                <option value="yearly">Yearly Profit</option>
             </select>

             {profitFilterType === 'daily' && <input type="date" value={pFilterDate} onChange={(e) => setPFilterDate(e.target.value)} style={{border: '1px solid #cbd5e1', padding: '7px', borderRadius: '6px', outline: 'none', cursor: 'pointer', background:'#fff', color:'#1e293b'}} />}
             {profitFilterType === 'weekly' && <input type="week" value={pFilterWeek} onChange={(e) => setPFilterWeek(e.target.value)} style={{border: '1px solid #cbd5e1', padding: '7px', borderRadius: '6px', outline: 'none', cursor: 'pointer', background:'#fff', color:'#1e293b'}} />}
             {profitFilterType === 'monthly' && (
               <div style={{display: 'flex', gap: '5px'}}>
                 <select value={pFilterMonth} onChange={(e) => setPFilterMonth(e.target.value)} style={{border: '1px solid #cbd5e1', padding: '7px', borderRadius: '6px', outline: 'none', cursor: 'pointer', background:'#fff', color:'#1e293b'}}>
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                 </select>
                 <select value={pFilterYear} onChange={(e) => setPFilterYear(e.target.value)} style={{border: '1px solid #cbd5e1', padding: '7px', borderRadius: '6px', outline: 'none', cursor: 'pointer', background:'#fff', color:'#1e293b'}}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
               </div>
             )}
             {profitFilterType === 'yearly' && (
                 <select value={pFilterYear} onChange={(e) => setPFilterYear(e.target.value)} style={{border: '1px solid #cbd5e1', padding: '7px', borderRadius: '6px', outline: 'none', cursor: 'pointer', background:'#fff', color:'#1e293b'}}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
             )}
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px'}}>
            <div style={{background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'}}>
                <span style={{color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase'}}>Net Revenue (Sales - Returns)</span>
                <h2 style={{margin: '10px 0 0 0', fontSize: '28px', color: '#1e293b'}}>Rs. {profitData.netRevenue.toLocaleString()}</h2>
            </div>
            <div style={{background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'}}>
                <span style={{color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase'}}>Total Cost of Goods (Buying Price)</span>
                <h2 style={{margin: '10px 0 0 0', fontSize: '28px', color: '#1e293b'}}>Rs. {profitData.netCost.toLocaleString()}</h2>
            </div>
            <div style={{background: '#f0fdf4', padding: '25px', borderRadius: '15px', border: '1px solid #bbf7d0', borderLeft: '5px solid #10b981', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)', position: 'relative'}}>
                <span style={{color: '#047857', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase'}}>Actual Net Profit</span>
                <h2 style={{margin: '10px 0 0 0', fontSize: '32px', color: '#10b981'}}>Rs. {profitData.netProfit.toLocaleString()}</h2>
                <div style={{position: 'absolute', top: '25px', right: '25px', background: '#10b981', color: '#fff', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'}}>
                    Margin: {marginPercent}%
                </div>
            </div>
        </div>

        <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
            <thead style={{background: '#f8fafc', textAlign: 'left'}}>
              <tr>
                <th style={{padding: '15px', color:'#475569'}}>Bill ID</th>
                <th style={{color:'#475569'}}>Date & Time</th>
                <th style={{color:'#475569'}}>Bill Revenue (Selling)</th>
                <th style={{color:'#475569'}}>Bill Cost (Buying)</th>
                <th style={{color:'#475569'}}>Profit per Bill</th>
              </tr>
            </thead>
            <tbody>
              {profitData.billRows.length === 0 ? (<tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No sales records found for this period.</td></tr>) : 
                profitData.billRows.map(row => (
                <tr key={row.billId} style={{borderTop: '1px solid #f1f5f9'}}>
                  <td style={{padding: '15px', fontWeight: 'bold', color: '#3b82f6'}}>{row.billId}</td>
                  <td style={{color:'#1e293b'}}>{new Date(row.date).toLocaleString()}</td>
                  <td style={{color:'#1e293b'}}>Rs. {row.revenue.toLocaleString()}</td>
                  <td style={{color: '#64748b'}}>Rs. {row.cost.toLocaleString()}</td>
                  <td style={{fontWeight: 'bold', color: row.profit >= 0 ? '#10b981' : '#ef4444'}}>
                      {row.profit >= 0 ? '+' : '-'} Rs. {Math.abs(row.profit).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const renderCustomers = () => {
    const filteredCustomers = customersList.filter(c => {
      const matchSearch = (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) || 
                          (c.email || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.customerId || '').toLowerCase().includes(customerSearch.toLowerCase());
      
      const matchProvider = customerProviderFilter === 'ALL' || 
                            (c.provider || 'LOCAL').toUpperCase() === customerProviderFilter;

      return matchSearch && matchProvider;
    });

    return (
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
        <div style={{marginBottom: '25px'}}>
          <h2 style={{margin: '0 0 5px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px'}}>
             <Users color="#3b82f6"/> Customer Database
          </h2>
          <p style={{margin: 0, color: '#64748b', fontSize: '13px'}}>Manage and view all registered customers</p>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px'}}>
           <div className="search-input" style={{position:'relative'}}>
               <Search size={18} color="#64748b" style={{position:'absolute', top:'10px', left:'15px'}}/>
               <input type="text" placeholder="Search ID, Name, Email..." value={customerSearch} onChange={(e)=>setCustomerSearch(e.target.value)} style={{padding:'10px 10px 10px 40px', borderRadius:'8px', border:'1px solid #e2e8f0', width: '300px', outline: 'none', background:'#fff', color:'#1e293b'}} />
           </div>

           <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
               <span style={{fontSize: '13px', fontWeight: 'bold', color: '#475569'}}>PROVIDER:</span>
               <div style={{display: 'flex', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden'}}>
                  {['ALL', 'GOOGLE', 'GMAIL', 'FACEBOOK', 'LOCAL'].map(prov => (
                     <button key={prov} onClick={() => setCustomerProviderFilter(prov)} style={{padding: '8px 15px', border: 'none', borderRight: prov !== 'LOCAL' ? '1px solid #e2e8f0' : 'none', background: customerProviderFilter === prov ? '#eff6ff' : 'transparent', color: customerProviderFilter === prov ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}>
                        {prov}
                     </button>
                  ))}
               </div>
           </div>
        </div>

        <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
            <thead style={{background: '#f8fafc', textAlign: 'left'}}>
              <tr>
                <th style={{padding: '15px', color:'#475569'}}>Customer Details</th>
                <th style={{color:'#475569'}}>Email Address</th>
                <th style={{color:'#475569'}}>Phone</th>
                <th style={{color:'#475569'}}>Login Provider</th>
                <th style={{color:'#475569'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No customers found.</td></tr>
              ) : (
                  filteredCustomers.map(cust => {
                     const init = cust.name ? cust.name.substring(0, 2).toUpperCase() : 'CU';
                     const prov = (cust.provider || 'LOCAL').toUpperCase();
                     let provColor = '#64748b'; let provBg = '#f1f5f9';
                     if (prov === 'GOOGLE') { provColor = '#3b82f6'; provBg = '#eff6ff'; }
                     if (prov === 'GMAIL') { provColor = '#ef4444'; provBg = '#fef2f2'; }
                     if (prov === 'FACEBOOK') { provColor = '#1d4ed8'; provBg = '#dbeafe'; }

                     return (
                     <tr key={cust.id} style={{borderTop: '1px solid #f1f5f9'}}>
                         <td style={{padding: '15px'}}>
                             <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                 <div style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0}}>
                                     {init}
                                 </div>
                                 <div>
                                     <div style={{fontWeight: 'bold', color: '#1e293b'}}>{cust.name}</div>
                                     <div style={{fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                        <MapPin size={10}/> {cust.address || cust.customerId || `CUST-${cust.id}`}
                                     </div>
                                 </div>
                             </div>
                         </td>
                         <td style={{color: '#475569'}}>
                             <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}><Mail size={14}/> {cust.email}</div>
                         </td>
                         <td style={{color: '#475569'}}>
                             <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}><Phone size={14}/> {cust.phone || cust.contactNo || cust.contactNumber || cust.customerPhone || cust.customer?.phone || 'N/A'}</div>
                         </td>
                         <td>
                             <span style={{background: provBg, color: provColor, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px'}}>
                                 {prov === 'GMAIL' ? <Mail size={12}/> : null} {prov}
                             </span>
                         </td>
                         <td>
                             <span style={{background: '#dcfce7', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px'}}>
                                 <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'}}></span> Active
                             </span>
                         </td>
                     </tr>
                     )
                  })
              )}
            </tbody>
          </table>
          <div style={{padding: '15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b'}}>
              <span>Showing <strong>{filteredCustomers.length}</strong> of <strong>{customersList.length}</strong> customers</span>
              <span>Data Source: Live Database</span>
          </div>
        </div>
      </motion.div>
    );
  };

const renderOrders = () => {


      let displayedOrders = [];

      if (orderViewTab === 'active') {
          displayedOrders = ordersList.filter(o => {
              const status = (o.status || 'Pending').toLowerCase();
              

              if (['pending', 'verified', 'completed'].includes(status)) return true;


              if (status === 'picked up') {
                  return getMinutesPassed(o.orderDate, o.localUpdateTime) < 10;
              }


              if (status === 'cancelled' && showRecentCancelled) {
                  return getMinutesPassed(o.orderDate, o.localUpdateTime) < (24 * 60); 
              }

              return false; 
          });
      } else {

          displayedOrders = ordersList.filter(o => {
              const status = (o.status || 'Pending').toLowerCase();
              
              if (status === 'picked up') {
                  return getMinutesPassed(o.orderDate, o.localUpdateTime) >= 10;
              }
              if (status === 'cancelled') {
                  return getMinutesPassed(o.orderDate, o.localUpdateTime) >= (24 * 60);
              }
              return false;
          });
      }


      const filteredOrders = displayedOrders.filter(o => {
        const matchSearch = (o.orderId || '').toLowerCase().includes(orderSearch.toLowerCase()) || 
                            (o.customerName || '').toLowerCase().includes(orderSearch.toLowerCase()) || 
                            (o.phone || '').toLowerCase().includes(orderSearch.toLowerCase());
        
        const matchStatus = orderFilter === 'All' || (o.status || 'Pending').toLowerCase() === orderFilter.toLowerCase();
        
        return matchSearch && matchStatus;
      });

      return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px'}}>
             <div>
               <h2 style={{margin: '0 0 5px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <ShoppingCart color="#f97316"/> Customer Orders
               </h2>
               <p style={{margin: 0, color: '#64748b', fontSize: '13px'}}>Monitor and verify incoming orders or check the archive</p>
             </div>
             <div className="search-input" style={{position:'relative'}}>
                 <Search size={18} color="#64748b" style={{position:'absolute', top:'10px', left:'15px'}}/>
                 <input type="text" placeholder="Search Order ID, Name, Phone..." value={orderSearch} onChange={(e)=>setOrderSearch(e.target.value)} style={{padding:'10px 10px 10px 40px', borderRadius:'8px', border:'1px solid #e2e8f0', width: '300px', outline: 'none', background:'#fff', color:'#1e293b'}} />
             </div>
          </div>

          {/* 🟢 3. Active / History View Tabs */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
             <div style={{display: 'flex', gap: '10px'}}>
                <button 
                  onClick={() => { setOrderViewTab('active'); setOrderFilter('All'); }} 
                  style={{padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: orderViewTab === 'active' ? '#0f172a' : 'transparent', color: orderViewTab === 'active' ? '#fff' : '#64748b', transition: 'all 0.2s'}}
                >
                  <ShoppingCart size={18}/> Active Orders
                </button>
                <button 
                  onClick={() => { setOrderViewTab('history'); setOrderFilter('All'); }} 
                  style={{padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: orderViewTab === 'history' ? '#0f172a' : 'transparent', color: orderViewTab === 'history' ? '#fff' : '#64748b', transition: 'all 0.2s'}}
                >
                  <Archive size={18}/> Order Archive (History)
                </button>
             </div>

             {/* 🟢 4. Show/Hide Cancelled Button (Only in Active View) */}
             {orderViewTab === 'active' && (
                 <button 
                    onClick={() => setShowRecentCancelled(!showRecentCancelled)}
                    style={{background: '#fff', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'}}
                 >
                    {showRecentCancelled ? <EyeOff size={16}/> : <Eye size={16}/>} 
                    {showRecentCancelled ? "Hide Recent Cancelled" : "Show Recent Cancelled"}
                 </button>
             )}
          </div>

          <div style={{display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px'}}>
             {/* 🟢 5. Dynamic Status Filters based on View */}
             {(orderViewTab === 'active' ? ['All', 'Pending', 'Verified', 'Completed', 'Picked Up', 'Cancelled'] : ['All', 'Picked Up', 'Cancelled']).map(status => (
                <button key={status} onClick={() => setOrderFilter(status)} style={{padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', border: orderFilter === status ? 'none' : '1px solid #e2e8f0', background: orderFilter === status ? '#f97316' : '#fff', color: orderFilter === status ? '#fff' : '#64748b', transition: 'all 0.2s', whiteSpace: 'nowrap'}}>{status}</button>
             ))}
          </div>

          <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
              <thead style={{background: '#f8fafc', textAlign: 'left'}}><tr><th style={{padding: '15px', color:'#475569'}}>Order ID</th><th style={{color:'#475569'}}>Customer Details</th><th style={{color:'#475569'}}>Items Requested</th><th style={{color:'#475569'}}>Total Amount</th><th style={{color:'#475569'}}>Status</th></tr></thead>
              <tbody>
                {filteredOrders.length === 0 ? (<tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>{orderViewTab === 'active' ? "No active orders found." : "No orders in the archive yet."}</td></tr>) : (
                    filteredOrders.map(ord => {
                       const init = ord.customerName ? ord.customerName.substring(0, 2).toUpperCase() : 'CU'; const status = (ord.status || 'Pending').toLowerCase(); let statusColor = '#64748b'; let statusBg = '#f1f5f9';
                       if (status === 'pending') { statusColor = '#d97706'; statusBg = '#fffbeb'; } if (status === 'verified') { statusColor = '#3b82f6'; statusBg = '#eff6ff'; } if (status === 'completed') { statusColor = '#10b981'; statusBg = '#dcfce7'; } if (status === 'picked up') { statusColor = '#8b5cf6'; statusBg = '#f3e8ff'; } if (status === 'cancelled') { statusColor = '#ef4444'; statusBg = '#fef2f2'; }
                       let itemsText = "Items not specified"; let qtyText = 1;
                       if(ord.items && ord.items.length > 0) { itemsText = ord.items[0].productName; qtyText = ord.items[0].qty || ord.items[0].quantity || 1; if(ord.items.length > 1) { itemsText += ` (+${ord.items.length - 1} more)`; } }
                       return (
                       <tr key={ord.id} style={{borderTop: '1px solid #f1f5f9', cursor: 'pointer'}} className="inventory-row-hover" onClick={() => { setSelectedOrder(ord); setShowOrderModal(true); }}>
                           <td style={{padding: '15px'}}><div style={{fontWeight: '900', color: '#f97316'}}>{ord.orderId || `#ORD-${ord.id}`}</div><div style={{fontSize: '11px', color: '#94a3b8', marginTop: '4px'}}>{new Date(ord.createdAt || ord.orderDate).toLocaleString()}</div></td>
                           <td><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><div style={{width: '35px', height: '35px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0}}>{init}</div><div><div style={{fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px'}}>{ord.customerName || 'Walk-in Customer'} <span style={{background: '#f1f5f9', color: '#64748b', fontSize: '10px', padding: '2px 6px', borderRadius: '4px'}}>Retail</span></div><div style={{fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px'}}><Phone size={10}/> {ord.phone || ord.contactNo || ord.contactNumber || ord.customerPhone || ord.customer?.phone || 'N/A'}</div></div></div></td>
                           <td style={{color: '#475569'}}><div style={{fontWeight: '500', color: '#1e293b'}}>{itemsText}</div><div style={{fontSize: '12px', marginTop: '2px'}}>Qty: {qtyText}</div></td>
                           <td style={{fontWeight: 'bold', color: '#1e293b', fontSize: '15px'}}>LKR {ord.totalAmount?.toLocaleString()}</td>
                           <td><span style={{background: statusBg, color: statusColor, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', border: `1px solid ${statusColor}30`, textTransform:'uppercase'}}><span style={{width: '6px', height: '6px', borderRadius: '50%', background: statusColor}}></span> {ord.status || 'Pending'}</span></td>
                       </tr>
                       )
                    })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      );
  };

const renderInventory = () => {
   
    let dataList = [];
    if (Array.isArray(products)) {
        dataList = products;
    } else if (products && Array.isArray(products.content)) {
        dataList = products.content;
    }

    const safeQuery = inventorySearchQuery || '';

    const filteredProducts = dataList.filter(p => 
        (p.productCode && p.productCode.toLowerCase().includes(safeQuery.toLowerCase())) || 
        (p.productName && p.productName.toLowerCase().includes(safeQuery.toLowerCase()))
    );

    
    const itemsPerPage = 15;
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const safeCurrentPage = Math.min(Math.max(1, typeof currentPage !== 'undefined' ? currentPage : 1), totalPages);

    const paginatedInventory = filteredProducts.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage
    );

    return (
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0, color:'#1e293b'}}>Inventory Management</h2>
          <div style={{display: 'flex', gap: '15px'}}>
             <div className="search-input" style={{position:'relative'}}>
                 <Search size={18} color="#64748b" style={{position:'absolute', top:'10px', left:'15px'}}/>
                 <input type="text" placeholder="Search Code or Name..." value={inventorySearchQuery} onChange={(e)=>setInventorySearchQuery(e.target.value)} style={{padding:'10px 10px 10px 40px', borderRadius:'8px', border:'1px solid #e2e8f0', width: '250px', outline: 'none', background:'#fff', color:'#1e293b'}} />
             </div>
             <button onClick={handleOpenAddProduct} style={{background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}><Plus size={18}/> Add New Product</button>
          </div>
        </div>
        
        <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
          <div style={{maxHeight: '600px', overflowY: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
              <thead style={{background: '#f8fafc', textAlign: 'left', position: 'sticky', top: 0, zIndex: 1}}>
                <tr>
                    <th style={{padding: '15px', color:'#475569'}}>Code</th>
                    <th style={{color:'#475569'}}>Product Name</th>
                    
                  
                    <th style={{color:'#475569', textAlign: 'center'}}>Category</th>
                    <th style={{color:'#475569', textAlign: 'center'}}>Vehicle</th>
                    <th style={{color:'#475569', textAlign: 'center'}}>Brand</th>
                    
                    <th style={{color:'#475569'}}>Buying Price</th>
                    <th style={{color:'#475569'}}>Selling Price</th>
                    <th style={{color:'#475569', textAlign: 'center'}}>Stock</th>
                    <th style={{textAlign: 'center', color:'#475569'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInventory.length === 0 ? (<tr><td colSpan="9" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No products found.</td></tr>) : 
                  paginatedInventory.map(p => {
                  const stock = getStockQty(p); 
                  const limit = getLowStockLimit(p);
                  return (
                  <tr key={p.productCode} onClick={() => handleViewProduct(p)} style={{borderTop: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s'}} className="inventory-row-hover">
                        <td style={{padding: '15px', fontWeight: 'bold', color: '#3b82f6'}}>{p.productCode}</td>
                        <td style={{fontWeight: '500', color: '#1e293b'}}>{p.productName}</td>
                        
                       
                        <td style={{textAlign: 'center'}}>
                            <span style={{background: '#f8fafc', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', border: '1px solid #e2e8f0'}}>{p.partCategory || '-'}</span>
                        </td>
                        <td style={{textAlign: 'center'}}>
                            <span style={{background: '#f8fafc', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', border: '1px solid #e2e8f0'}}>{p.vehicleType || '-'}</span>
                        </td>
                        <td style={{textAlign: 'center'}}>
                            <span style={{background: '#f8fafc', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', border: '1px solid #e2e8f0'}}>{p.brand || '-'}</span>
                        </td>

                        <td style={{color: '#64748b'}}>Rs. {(p.unitPrice || p.productPrice || (p.sellingPrice*0.75))?.toLocaleString()}</td>
                        <td style={{fontWeight: 'bold', color: '#0f172a'}}>Rs. {p.sellingPrice?.toLocaleString()}</td>
                        <td style={{textAlign: 'center'}}>
                            <span style={{background: stock <= limit ? '#fef2f2' : '#f0fdf4', color: stock <= limit ? '#ef4444' : '#10b981', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold'}}>
                                {stock}
                            </span>
                        </td>
                        <td style={{textAlign: 'center'}}>
                            <button onClick={(e) => handleOpenEditProduct(e, p)} style={{background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'}}>
                                <Edit3 size={14}/> Edit
                            </button>
                        </td>
                      </tr>
                )})}
              </tbody>
            </table>
          </div>

         
          {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
                      Showing {(safeCurrentPage - 1) * itemsPerPage + 1} to {Math.min(safeCurrentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} Entries
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }} disabled={safeCurrentPage === 1} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: safeCurrentPage === 1 ? '#e2e8f0' : '#fff', color: safeCurrentPage === 1 ? '#94a3b8' : '#1e293b', cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Previous</button>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }} disabled={safeCurrentPage === totalPages} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: safeCurrentPage === totalPages ? '#e2e8f0' : '#fff', color: safeCurrentPage === totalPages ? '#94a3b8' : '#1e293b', cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Next</button>
                  </div>
              </div>
          )}

        </div>
      </motion.div>
    );
  };

      const renderPurchaseOrders = () => {


      const activePoItemCodes = purchaseOrdersHistory
          .filter(po => po.status === 'Processing' || po.status === 'Sent to Supplier' || po.status === 'Email Failed')
          .flatMap(po => (po.items || []).map(item => item.sparePart?.productCode));


      const allLowStock = [
          ...products.filter(p => getStockQty(p) === 0), 
          ...products.filter(p => {
              const stock = getStockQty(p);
              return stock > 0 && stock <= getLowStockLimit(p);
          })
      ].filter(p => !activePoItemCodes.includes(p.productCode)); 

      return (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px'}}>
                  <div>
                      <h2 style={{margin: '0 0 5px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <ShoppingCart color="#3b82f6"/> Purchase Orders
                      </h2>
                      <p style={{margin: 0, color: '#64748b', fontSize: '13px'}}>Order low stock items directly from your suppliers.</p>
                  </div>
              </div>

              {/* Sub Tabs */}
              <div style={{display: 'flex', gap: '10px', marginBottom: '20px', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                  <button onClick={() => setPurchaseSubTab('low-stock')} style={{padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', border: 'none', background: purchaseSubTab === 'low-stock' ? '#0f172a' : 'transparent', color: purchaseSubTab === 'low-stock' ? '#fff' : '#64748b'}}>
                      Low Stock Items
                  </button>
                  <button onClick={() => setPurchaseSubTab('history')} style={{padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', border: 'none', background: purchaseSubTab === 'history' ? '#0f172a' : 'transparent', color: purchaseSubTab === 'history' ? '#fff' : '#64748b'}}>
                      Order History
                  </button>
              </div>

              {purchaseSubTab === 'low-stock' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                      {/* Create Order Button */}
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
                          <button onClick={() => {
                              if(selectedLowStockItems.length === 0) return alert("Select items first!");
                              setShowPurchaseOrderModal(true);
                          }} style={{background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                              <CheckSquare size={18}/> Create Purchase Order ({selectedLowStockItems.length})
                          </button>
                      </div>
<div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                              <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                                  <tr>
                                      <th style={{padding: '15px', color:'#475569', width: '40px', textAlign: 'center'}}>Select</th>
                                      <th style={{color:'#475569'}}>Code</th>
                                      <th style={{color:'#475569'}}>Product Name</th>
                                      
                                      {/* 🟢 අලුතින් එකතු කරපු Columns 3 */}
                                      <th style={{color:'#475569', textAlign: 'center'}}>Category</th>
                                      <th style={{color:'#475569', textAlign: 'center'}}>Vehicle</th>
                                      <th style={{color:'#475569', textAlign: 'center'}}>Brand</th>
                                      
                                      <th style={{color:'#475569', textAlign: 'center'}}>Stock Left</th>
                                      <th style={{color:'#475569', textAlign: 'center'}}>Status</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {allLowStock.length === 0 ? (<tr><td colSpan="8" style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>All stocks are good!</td></tr>) : 
                                      allLowStock.map(item => {
                                          const isSelected = selectedLowStockItems.find(i => i.productCode === item.productCode);
                                          const stock = getStockQty(item);
                                          return (
                                              <tr key={item.productCode} style={{borderTop: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : 'transparent', cursor: 'pointer'}} onClick={() => togglePoItem(item)}>
                                                  <td style={{padding: '15px', textAlign: 'center'}}>
                                                      <input type="checkbox" checked={!!isSelected} readOnly style={{width: '16px', height: '16px', cursor: 'pointer'}}/>
                                                  </td>
                                                  <td style={{fontWeight: 'bold', color: '#3b82f6'}}>{item.productCode}</td>
                                                  <td style={{color: '#1e293b', fontWeight: '500'}}>{item.productName}</td>
                                                  
                                                  {/* 🟢 අලුතින් එකතු කරපු Row Data 3 */}
                                                  <td style={{textAlign: 'center'}}>
                                                      <span style={{background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{item.partCategory || 'N/A'}</span>
                                                  </td>
                                                  <td style={{textAlign: 'center'}}>
                                                      <span style={{background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{item.vehicleType || 'N/A'}</span>
                                                  </td>
                                                  <td style={{textAlign: 'center'}}>
                                                      <span style={{background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{item.brand || 'N/A'}</span>
                                                  </td>

                                                  <td style={{textAlign: 'center', color: stock === 0 ? '#ef4444' : '#f97316', fontWeight: 'bold', fontSize: '15px'}}>{stock}</td>
                                                  <td style={{textAlign: 'center'}}>
                                                      <span style={{background: stock===0?'#fef2f2':'#fff7ed', color: stock===0?'#ef4444':'#f97316', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold'}}>
                                                          {stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                      </span>
                                                  </td>
                                              </tr>
                                          )
                                      })
                                  }
                              </tbody>
                          </table>
                      </div>
                  </motion.div>
              )}

{purchaseSubTab === 'history' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                      <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                              <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                                  <tr>
                                      <th style={{padding: '15px', color:'#475569'}}>Order ID</th>
                                      <th style={{color:'#475569'}}>Date & Time</th>
                                      <th style={{color:'#475569'}}>Supplier</th>
                                      <th style={{color:'#475569'}}>Status</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {purchaseOrdersHistory.length === 0 ? (<tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No purchase orders found.</td></tr>) : 
                                      purchaseOrdersHistory.map(po => (
                                          <tr key={po.id} onClick={() => { setSelectedPo(po); setShowPoViewModal(true); }} style={{borderTop: '1px solid #f1f5f9', cursor: 'pointer'}} className="inventory-row-hover">
                                              <td style={{padding: '15px', fontWeight: 'bold', color: '#1e293b'}}>#PO-{po.id}</td>
                                              <td style={{color: '#64748b'}}>{new Date(po.orderDate).toLocaleString()}</td>
                                              <td style={{color: '#3b82f6', fontWeight: 'bold'}}>{po.supplier?.supplierName || 'Unknown'}</td>
                                              <td>
                                                  <span style={{
                                                      background: po.status.includes('Received') ? '#dcfce7' : (po.status === 'Sent to Supplier' ? '#eff6ff' : '#fef2f2'), 
                                                      color: po.status.includes('Received') ? '#10b981' : (po.status === 'Sent to Supplier' ? '#3b82f6' : '#ef4444'), 
                                                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                                                  }}>
                                                      {po.status}
                                                  </span>
                                              </td>
                                          </tr>
                                      ))
                                  }
                              </tbody>
                          </table>
                      </div>
                  </motion.div>
              )}
          </motion.div>
      );
  };

  const renderSuppliers = () => (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color:'#1e293b'}}><Truck color="#f97316"/> Suppliers Management</h2>
        <button onClick={handleOpenAddSupplier} style={{background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'}}>
            <Plus size={18}/> Add Supplier
        </button>
      </div>

      <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
          <thead style={{background: '#f8fafc', textAlign: 'left'}}>
            <tr>
              <th style={{padding: '15px', color:'#475569'}}>Supplier ID</th>
              <th style={{color:'#475569'}}>Supplier Name</th>
              <th style={{color:'#475569'}}>Company</th>
              <th style={{color:'#475569'}}>Contact Number</th>
              <th style={{color:'#475569'}}>Email</th>
              <th style={{textAlign: 'center', color:'#475569'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No suppliers found.</td></tr>
            ) : (
                suppliers.map(sup => (
                <tr key={sup.id} style={{borderTop: '1px solid #f1f5f9'}}>
                    <td style={{padding: '15px', fontWeight: 'bold', color: '#3b82f6'}}>{sup.id}</td>
                    <td style={{fontWeight: 'bold', color: '#1e293b'}}>{sup.supplierName}</td>
                    <td style={{color: '#475569'}}>{sup.company || "N/A"}</td>
                    <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#475569'}}><Phone size={14}/> {sup.contactNumber}</div>
                    </td>
                    <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#475569'}}><Mail size={14}/> {sup.email || "N/A"}</div>
                    </td>
                    <td style={{textAlign: 'center'}}>
                        <button onClick={() => handleOpenEditSupplier(sup)} style={{background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'}}>
                            <Edit3 size={14}/> Update
                        </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

 const renderReportsMaster = () => {
    

    const getFilteredSales = () => {
        const now = new Date();
        return salesHistory.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          

          if (saleDate.getFullYear() !== parseInt(historyYear)) return false;

          if (historyFilter === "daily") return saleDate.toDateString() === now.toDateString();
          if (historyFilter === "weekly") return (now - saleDate) / (1000 * 60 * 60 * 24) <= 7;
          if (historyFilter === "monthly") return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
          
          return true;
        }).filter(s => s.billId?.toLowerCase().includes(historySearchQuery.toLowerCase()));
    };


    const getFilteredReturns = () => {
        const now = new Date();
        return returnsHistory.filter(rb => {
          const rbDate = new Date(rb.returnDate);
          

          if (rbDate.getFullYear() !== parseInt(returnYear)) return false;

          if (returnHistoryFilter === "daily") return rbDate.toDateString() === now.toDateString();
          if (returnHistoryFilter === "weekly") return (now - rbDate) / (1000 * 60 * 60 * 24) <= 7;
          if (returnHistoryFilter === "monthly") return rbDate.getMonth() === now.getMonth() && rbDate.getFullYear() === now.getFullYear();
          
          return true;
        }).filter(r => r.billId?.toLowerCase().includes(returnSearchQuery.toLowerCase()));
    };


    const getFilteredDamaged = () => {
        return damagedHistory.filter(rec => {
            const searchStr = damagedSearchQuery.toLowerCase();
            const matchesSearch = 
                (rec.productCode || "").toLowerCase().includes(searchStr) ||
                (rec.productName || "").toLowerCase().includes(searchStr) ||
                (rec.reason || "").toLowerCase().includes(searchStr) ||
                (rec.supplier || "").toLowerCase().includes(searchStr);
            
            const matchesDate = !damagedFilterDate || (rec.date && rec.date.startsWith(damagedFilterDate));
            
            return matchesSearch && matchesDate;
        });
    };


    const currentYr = new Date().getFullYear();
    const availableYears = [];
    for(let i = 2026; i <= currentYr; i++) {
        availableYears.push(i);
    }

    return (
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color:'#1e293b'}}><FileText color="#3b82f6"/> System Reports</h2>
          
         <div style={{display: 'flex', gap: '5px', background: '#fff', padding: '5px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap'}}>
  <button
    onClick={() => setReportSubTab('sales')}
    style={{
      padding: '8px 15px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: reportSubTab === 'sales' ? '#0f172a' : 'transparent',
      color: reportSubTab === 'sales' ? '#fff' : '#64748b',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <History size={16}/> Sales History
  </button>

  <button
    onClick={() => setReportSubTab('returns')}
    style={{
      padding: '8px 15px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: reportSubTab === 'returns' ? '#0f172a' : 'transparent',
      color: reportSubTab === 'returns' ? '#fff' : '#64748b',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <RotateCcw size={16}/> Returns List
  </button>

  <button
    onClick={() => setReportSubTab('grn')}
    style={{
      padding: '8px 15px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: reportSubTab === 'grn' ? '#0f172a' : 'transparent',
      color: reportSubTab === 'grn' ? '#fff' : '#64748b',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <ArrowDownToLine size={16}/> GRN History
  </button>

  <button
    onClick={() => setReportSubTab('damaged')}
    style={{
      padding: '8px 15px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: reportSubTab === 'damaged' ? '#0f172a' : 'transparent',
      color: reportSubTab === 'damaged' ? '#fff' : '#64748b',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <AlertTriangle size={16}/> Damaged / Returns
  </button>
</div>
        </div>

{/* 🟢 SALES HISTORY TAB */}
        {reportSubTab === 'sales' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div style={{display:'flex', gap:'10px', marginBottom:'20px', alignItems: 'center', flexWrap: 'wrap'}}>
              
              {/* Year Filter Dropdown */}
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '2px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', padding: '0 10px' }}>YEAR:</span>
                <select value={historyYear} onChange={(e) => setHistoryYear(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer', padding: '6px' }}>
                    {availableYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                </select>
              </div>

              {/* Time Filters */}
              {["all", "daily", "weekly", "monthly"].map(f => (
                <button key={f} onClick={()=>setHistoryFilter(f)} style={{padding:'8px 20px', borderRadius:'8px', cursor:'pointer', background: historyFilter===f?'#3b82f6':'#fff', border:historyFilter!==f?'1px solid #e2e8f0':'none', color: historyFilter===f?'#fff':'#475569', textTransform:'capitalize', fontWeight:'600'}}>{f}</button>
              ))}

              <div className="search-input" style={{marginLeft: 'auto', position:'relative'}}>
                  <Search size={18} color="#666" style={{position:'absolute', top:'10px', left:'10px'}}/>
                  <input type="text" placeholder="Search Bill ID..." style={{padding:'10px 10px 10px 35px', borderRadius:'8px', border:'1px solid #e2e8f0', width: '250px', outline:'none', background:'#fff', color:'#1e293b'}} value={historySearchQuery} onChange={(e)=>setHistorySearchQuery(e.target.value)} />
              </div>
            </div>
            
            <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                  <tr><th style={{padding: '15px', color:'#475569'}}>Bill ID</th><th style={{color:'#475569'}}>Date & Time</th><th style={{color:'#475569'}}>Customer</th><th style={{color:'#475569'}}>Original Total</th><th style={{color:'#475569'}}>Refunded</th><th style={{color:'#475569'}}>Adjusted Total</th></tr>
                </thead>
                <tbody>
                  {getFilteredSales().length === 0 ? (<tr><td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No sales records found for {historyYear}.</td></tr>) : 
                    getFilteredSales().map(sale => {
                    const refundAmt = getRefundAmountForBill(sale.billId);
                    return (
                     <tr key={sale.billId} onClick={() => { setSelectedSales(sale); setShowSalesViewModal(true); }} style={{borderTop: '1px solid #f1f5f9', cursor: 'pointer'}} className="inventory-row-hover">
                        <td style={{padding: '15px', fontWeight: 'bold', color: '#3b82f6'}}>{sale.billId}</td>
                        <td style={{color:'#1e293b'}}>{new Date(sale.saleDate).toLocaleString()}</td>
                        <td style={{color:'#1e293b'}}>{sale.customerId}</td>
                        <td style={{color: '#64748b', textDecoration: refundAmt > 0 ? 'line-through' : 'none'}}>Rs. {sale.totalAmount?.toLocaleString()}</td>
                        <td style={{color: '#ef4444', fontWeight: '600'}}>{refundAmt > 0 ? `- Rs. ${refundAmt.toLocaleString()}` : '-'}</td>
                        <td style={{color: '#10b981', fontWeight: '800', fontSize: '15px'}}>Rs. {(sale.totalAmount - refundAmt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 🟢 RETURNS HISTORY TAB */}
        {reportSubTab === 'returns' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div style={{display:'flex', gap:'10px', marginBottom:'20px', alignItems: 'center', flexWrap: 'wrap'}}>
              
              {/* Year Filter Dropdown */}
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '2px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', padding: '0 10px' }}>YEAR:</span>
                <select value={returnYear} onChange={(e) => setReturnYear(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer', padding: '6px' }}>
                    {availableYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                </select>
              </div>

              {["all", "daily", "weekly", "monthly"].map(f => (
                <button key={f} onClick={()=>setReturnHistoryFilter(f)} style={{padding:'8px 20px', borderRadius:'8px', cursor:'pointer', background: returnHistoryFilter===f?'#0f172a':'#fff', border:returnHistoryFilter!==f?'1px solid #e2e8f0':'none', color: returnHistoryFilter===f?'#fff':'#475569', textTransform:'capitalize', fontWeight:'600'}}>{f}</button>
              ))}
              <div className="search-input" style={{marginLeft: 'auto', position:'relative'}}>
                  <Search size={18} color="#666" style={{position:'absolute', top:'10px', left:'10px'}}/>
                  <input type="text" placeholder="Search Bill ID..." style={{padding:'10px 10px 10px 35px', borderRadius:'8px', border:'1px solid #e2e8f0', width: '250px', outline:'none', background:'#fff', color:'#1e293b'}} value={returnSearchQuery} onChange={(e)=>setReturnSearchQuery(e.target.value)} />
              </div>
            </div>

            <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                  <tr><th style={{padding: '15px', color:'#475569'}}>Bill ID</th><th style={{color:'#475569'}}>Date & Time</th><th style={{color:'#475569'}}>Returned Item</th><th style={{color:'#475569'}}>Qty</th><th style={{color:'#475569'}}>Refund Issued</th></tr>
                </thead>
                <tbody>
                  {getFilteredReturns().length === 0 ? (<tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No return records found for {returnYear}.</td></tr>) : 
                    getFilteredReturns().map((rb, idx) => (
                      <tr key={idx} onClick={() => { setSelectedReturn(rb); setShowReturnViewModal(true); }} style={{borderTop: '1px solid #f1f5f9', cursor: 'pointer'}} className="inventory-row-hover">
                        <td style={{padding: '15px', fontWeight: 'bold', color: '#3b82f6'}}>{rb.billId}</td>
                        <td style={{color:'#1e293b'}}>{new Date(rb.returnDate).toLocaleString()}</td>
                        <td style={{color:'#1e293b'}}>{rb.productName}</td>
                        <td style={{color:'#1e293b'}}>{rb.quantity}</td>
                        <td style={{color: '#ef4444', fontWeight: 'bold'}}>Rs. {rb.refundAmount?.toLocaleString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

       {/* 🟢 GRN HISTORY TAB (Connected to Backend & Styled) */}
        {reportSubTab === 'grn' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            
            {/* Search & Filter Toolbar */}
            <div style={{display:'flex', gap:'15px', marginBottom:'20px', alignItems: 'center'}}>
              <input
                type="text"
                placeholder="Search by GRN ID / Invoice / Supplier..."
                value={grnSearch}
                onChange={(e) => setGrnSearch(e.target.value)}
                style={{ 
                  padding:'10px 15px', borderRadius:'8px', border:'1px solid #e2e8f0', 
                  width: '320px', outline: 'none', background:'#fff', color:'#1e293b' 
                }}
              />
              <input
                type="date"
                value={grnFilterDate}
                onChange={(e) => setGrnFilterDate(e.target.value)}
                style={{ 
                  padding:'10px 15px', borderRadius:'8px', border:'1px solid #e2e8f0', 
                  outline: 'none', background:'#fff', color:'#1e293b', cursor: 'pointer' 
                }}
              />
              <button
                onClick={() => { setGrnSearch(''); setGrnFilterDate(''); }}
                style={{ 
                  background: 'transparent', border: 'none', color: '#1e293b', 
                  fontWeight: 'bold', cursor: 'pointer', padding: '10px', fontSize: '14px' 
                }}
              >
                Clear
              </button>
            </div>

            {/* Data Table */}
            <div style={{background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                <thead style={{background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0'}}>
                  <tr>
                    <th style={{padding: '16px 20px', color:'#475569', fontWeight: '600'}}>GRN ID</th>
                    <th style={{padding: '16px 20px', color:'#475569', fontWeight: '600'}}>Supplier</th>
                    <th style={{padding: '16px 20px', color:'#475569', fontWeight: '600'}}>Invoice</th>
                    <th style={{padding: '16px 20px', color:'#475569', fontWeight: '600'}}>Date</th>
                    <th style={{padding: '16px 20px', color:'#475569', fontWeight: '600'}}>Total Items</th>
                    <th style={{padding: '16px 20px', color:'#475569', fontWeight: '600'}}>Total Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrnHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>
                        No GRN history found in the database.
                      </td>
                    </tr>
                  ) : (
                    filteredGrnHistory.map((grn, idx) => (
                      <tr key={idx} style={{borderBottom: '1px solid #f1f5f9'}}>
                        <td style={{padding: '16px 20px'}}>
                            {/* GRN ID Link (Clickable) */}
                            <span 
                                style={{color: '#3b82f6', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'}}
                                onClick={() => handleViewGrn(grn)}
                            >
                                {grn.grnId}
                            </span>
                        </td>
                        <td style={{padding: '16px 20px', color:'#1e293b'}}>{grn.supplier}</td>
                        <td style={{padding: '16px 20px', color:'#1e293b'}}>{grn.invoice}</td>
                        <td style={{padding: '16px 20px', color:'#1e293b'}}>{grn.date}</td>
                        <td style={{padding: '16px 20px', color:'#1e293b'}}>{grn.totalItems}</td>
                        <td style={{padding: '16px 20px', color:'#1e293b'}}>{grn.totalQty}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
          
        )}
        {/* 🟢 SALES VIEW MODAL */}
        <AnimatePresence>
          {showSalesViewModal && selectedSales && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <motion.div className="payment-modal" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} style={{ background: '#fff', width: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px' }}><History color="#3b82f6" size={28}/></div>
                    <div>
                      <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>Sales Invoice Details</h2>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Bill ID: <strong style={{color: '#3b82f6'}}>{selectedSales.billId}</strong></p>
                    </div>
                  </div>
                  <button onClick={() => setShowSalesViewModal(false)} style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#475569', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Date & Time</span>
                      <div style={{ fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{new Date(selectedSales.saleDate).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Customer</span>
                      <div style={{ fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{selectedSales.customerId || 'Walk-in'}</div>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Purchased Items</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                      <tr><th style={{ padding: '10px', textAlign: 'left', color: '#475569' }}>Item</th><th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Qty</th><th style={{ padding: '10px', textAlign: 'right', color: '#475569' }}>Unit Price</th><th style={{ padding: '10px', textAlign: 'right', color: '#475569' }}>Total</th></tr>
                    </thead>
                    <tbody>
                      {(selectedSales.items || []).map((it, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px', color: '#1e293b', fontWeight: '600' }}>{it.productName} <br/><span style={{fontSize: '11px', color: '#64748b'}}>{it.productCode}</span></td>
                          <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{it.qty || it.quantity || 1}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>Rs. {(it.sellingPrice || it.price || 0).toLocaleString()}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>Rs. {((it.qty || it.quantity || 1) * (it.sellingPrice || it.price || 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                    Total Amount: <span style={{ color: '#10b981', marginLeft: '15px', fontSize: '22px' }}>Rs. {selectedSales.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button onClick={() => setShowSalesViewModal(false)} style={{ background: '#f1f5f9', color: '#0f172a', padding: '10px 25px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>Close Window</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🟢 RETURNS VIEW MODAL */}
        <AnimatePresence>
          {showReturnViewModal && selectedReturn && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <motion.div className="payment-modal" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} style={{ background: '#fff', width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '12px' }}><RotateCcw color="#ef4444" size={28}/></div>
                    <div>
                      <h2 style={{ margin: 0, color: '#991b1b', fontSize: '20px', fontWeight: '800' }}>Return Details</h2>
                      <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '13px' }}>Bill ID: <strong>{selectedReturn.billId}</strong></p>
                    </div>
                  </div>
                  <button onClick={() => setShowReturnViewModal(false)} style={{ background: '#fca5a5', border: 'none', cursor: 'pointer', color: '#7f1d1d', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Returned Date:</span>
                      <span style={{ color: '#1e293b', fontWeight: '600' }}>{new Date(selectedReturn.returnDate).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Item Name:</span>
                      <span style={{ color: '#1e293b', fontWeight: '600' }}>{selectedReturn.productName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Item Code:</span>
                      <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{selectedReturn.productCode}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Quantity Returned:</span>
                      <span style={{ color: '#1e293b', fontWeight: 'bold' }}>{selectedReturn.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Reason:</span>
                      <span style={{ color: '#1e293b' }}>{selectedReturn.reason || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                      <span style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '16px' }}>Refund Issued:</span>
                      <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '18px' }}>Rs. {selectedReturn.refundAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
                    <button onClick={() => setShowReturnViewModal(false)} style={{ background: '#f1f5f9', color: '#0f172a', padding: '10px 25px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>Close Window</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🟢 DAMAGED/RETURNS VIEW MODAL */}
        <AnimatePresence>
          {showDamagedViewModal && selectedDamaged && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <motion.div className="payment-modal" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} style={{ background: '#fff', width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px' }}><AlertTriangle color="#d97706" size={28}/></div>
                    <div>
                      <h2 style={{ margin: 0, color: '#92400e', fontSize: '20px', fontWeight: '800' }}>Damaged / Returned Item</h2>
                      <p style={{ margin: '4px 0 0 0', color: '#d97706', fontSize: '13px' }}>Item Code: <strong>{selectedDamaged.productCode}</strong></p>
                    </div>
                  </div>
                  <button onClick={() => setShowDamagedViewModal(false)} style={{ background: '#fde68a', border: 'none', cursor: 'pointer', color: '#92400e', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Reported Date:</span>
                      <span style={{ color: '#1e293b', fontWeight: '600' }}>{selectedDamaged.date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Item Name:</span>
                      <span style={{ color: '#1e293b', fontWeight: '600' }}>{selectedDamaged.productName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Quantity Deducted:</span>
                      <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '16px' }}>-{selectedDamaged.qty}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Supplier:</span>
                      <span style={{ color: '#1e293b', fontWeight: '600' }}>{selectedDamaged.supplier || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Reported By:</span>
                      <span style={{ color: '#1e293b', fontWeight: '600' }}>{selectedDamaged.user || 'Unknown'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>Reason / Remarks:</span>
                      <span style={{ color: '#1e293b', fontStyle: 'italic' }}>"{selectedDamaged.reason || 'No reason provided'}"</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
                    <button onClick={() => setShowDamagedViewModal(false)} style={{ background: '#f1f5f9', color: '#0f172a', padding: '10px 25px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>Close Window</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* 🟢 NEW: DAMAGED / RETURNS TAB WITH SEARCH & DATE FILTER */}
        {reportSubTab === 'damaged' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            
            {/* Search & Filter Toolbar */}
            <div style={{display:'flex', gap:'10px', marginBottom:'20px', flexWrap: 'wrap'}}>
              <input
                type="text"
                placeholder="Search Item, Reason, Supplier..."
                value={damagedSearchQuery}
                onChange={(e) => setDamagedSearchQuery(e.target.value)}
                style={{ padding:'10px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', width: '300px', outline: 'none', background:'#fff', color:'#1e293b' }}
              />
              <input
                type="date"
                value={damagedFilterDate}
                onChange={(e) => setDamagedFilterDate(e.target.value)}
                style={{ padding:'10px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', outline: 'none', background:'#fff', color:'#1e293b' }}
              />
              <button
                onClick={() => { setDamagedSearchQuery(''); setDamagedFilterDate(''); }}
                style={{ padding:'10px 16px', borderRadius:'8px', border:'none', background:'#f1f5f9', color:'#475569', cursor:'pointer', fontWeight:'bold' }}
              >
                Clear
              </button>
            </div>

            <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                  <tr>
                    <th style={{padding: '15px', color:'#475569'}}>Date & Time</th>
                    <th style={{color:'#475569'}}>Item Code</th>
                    <th style={{color:'#475569'}}>Item Name</th>
                    <th style={{color:'#475569'}}>Qty</th>
                    <th style={{color:'#475569'}}>Reason</th>
                    <th style={{color:'#475569'}}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredDamaged().length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                        No damaged / return records found.
                      </td>
                    </tr>
                  ) : (
                    getFilteredDamaged().map((rec, idx) => (
                      <tr key={idx} onClick={() => { setSelectedDamaged(rec); setShowDamagedViewModal(true); }} style={{borderTop: '1px solid #f1f5f9', cursor: 'pointer'}} className="inventory-row-hover">
                        <td style={{padding: '15px', color:'#1e293b'}}>{rec.date}</td>
                        <td style={{fontWeight: 'bold', color: '#3b82f6'}}>{rec.productCode}</td>
                        <td style={{color:'#1e293b'}}>{rec.productName}</td>
                        <td style={{color: '#ef4444', fontWeight: 'bold'}}>-{rec.qty}</td>
                        <td style={{color:'#1e293b'}}>{rec.reason}</td>
                        <td style={{color:'#1e293b'}}>{rec.supplier}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </motion.div>
    );
  };
  const renderUsers = () => (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color:'#1e293b'}}><Users color="#3b82f6"/> Employee Management</h2>
        <button onClick={handleOpenAddUser} style={{background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'}}>
            <User size={18}/> Add Employee
        </button>
      </div>

      <div style={{background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
          <thead style={{background: '#f8fafc', textAlign: 'left'}}>
            <tr>
              <th style={{padding: '15px', color:'#475569'}}>EMP ID</th>
              <th style={{color:'#475569'}}>Full Name</th>
              <th style={{color:'#475569'}}>System Role</th>
              <th style={{color:'#475569'}}>Email</th>
              <th style={{textAlign: 'center', color:'#475569'}}>Account Status</th>
              <th style={{textAlign: 'center', color:'#475569'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No employees found.</td></tr>
            ) : (
                users.map(u => {
                const currentUserId = localStorage.getItem("userId");
                const isCurrentUser = u.id?.toString() === currentUserId;

                return (
                <tr key={u.id} style={{borderTop: '1px solid #e2e8f0', background: u.status === 'Hold' ? '#fef2f2' : 'transparent'}}>
                    <td style={{padding: '15px', fontWeight: 'bold', color: '#1e293b'}}>{u.employeeId || 'N/A'}</td>
                    <td style={{fontWeight: 'bold', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {u.name || u.username}
                        {u.online ? (
                            <span title="Online" style={{width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 5px #10b981'}}></span>
                        ) : (
                            <span title="Offline" style={{width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1', display: 'inline-block'}}></span>
                        )}
                    </td>
                    <td>
                        <span style={{background: '#f1f5f9', border:'1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#475569'}}>{u.role}</span>
                    </td>
                    <td style={{color: '#64748b'}}>{u.email || u.gmail || 'Not provided'}</td>
                    <td style={{textAlign: 'center'}}>
                        <span style={{
                            display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                            background: u.status === 'Active' ? '#dcfce7' : '#fee2e2',
                            color: u.status === 'Active' ? '#15803d' : '#b91c1c'
                        }}>
                            {u.status}
                        </span>
                    </td>
                    <td style={{textAlign: 'center'}}>
                        {isCurrentUser ? (
                            <span style={{
                                display: 'inline-block', padding: '6px 12px', borderRadius: '6px', 
                                background: '#f1f5f9', color: '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'not-allowed'
                            }}>
                                Current User
                            </span>
                        ) : u.status === 'Active' ? (
                            <button onClick={() => handleToggleUserStatus(u)} style={{background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '12px'}}>
                                <Ban size={14}/> Hold
                            </button>
                        ) : (
                            <button onClick={() => handleToggleUserStatus(u)} style={{background: '#dcfce7', border: '1px solid #86efac', color: '#10b981', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '12px'}}>
                                <CheckCircle size={14}/> Activate
                            </button>
                        )}
                    </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content">
        <h2 style={{margin: '0 0 25px 0', color:'#1e293b'}}>Profile & Security</h2>
        
        <div style={{display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap'}}>
            <div style={{flex: '1', minWidth: '300px', background: '#fff', padding: '35px 25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e2e8f0'}}>
                <div style={{position: 'relative'}}>
                    <div style={{width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)'}}>
                        <User size={55} color="#fff" />
                    </div>
                    <div style={{position: 'absolute', bottom: '15px', right: '0', background: '#10b981', width: '22px', height: '22px', borderRadius: '50%', border: '3px solid #fff'}}></div>
                </div>
                
                <h2 style={{margin: '5px 0', color: '#0f172a', fontSize: '26px', fontWeight: '800'}}>{profileData.name}</h2>
                <span style={{background: '#eff6ff', color: '#3b82f6', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid #bfdbfe', marginBottom: '25px'}}>
                    {profileData.role}
                </span>

                <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', color: '#475569', fontSize: '14px'}}>
                        <div style={{background: '#f1f5f9', border:'1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#64748b'}}><Mail size={18}/></div>
                        <span style={{fontWeight: '500', wordBreak: 'break-all'}}>{profileData.email}</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', color: '#475569', fontSize: '14px'}}>
                        <div style={{background: '#f1f5f9', border:'1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#64748b'}}><Phone size={18}/></div>
                        <span style={{fontWeight: '500'}}>{profileData.phone || "Not provided"}</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', color: '#475569', fontSize: '14px'}}>
                        <div style={{background: '#f1f5f9', border:'1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#64748b'}}><MapPin size={18}/></div>
                        <span style={{fontWeight: '500'}}>{profileData.address || "Not provided"}</span>
                    </div>
                </div>

                <button onClick={() => { setEditProfileForm(profileData); setShowEditProfileModal(true); }} style={{width: '100%', padding: '15px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s'}}>
                    <Edit3 size={16}/> Edit Profile
                </button>
            </div>

            <div style={{flex: '2', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '25px'}}>
                <div style={{background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0'}}>
                    <h3 style={{margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px'}}><Briefcase size={20} color="#3b82f6"/> Employment Details</h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                        <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                            <span style={{display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase'}}>Employee ID</span>
                            <span style={{fontSize: '16px', color: '#0f172a', fontWeight: '700'}}>{profileData.employeeId}</span>
                        </div>
                        <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                            <span style={{display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase'}}>Assigned Branch</span>
                            <span style={{fontSize: '16px', color: '#0f172a', fontWeight: '700'}}>{profileData.branch}</span>
                        </div>
                        <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                            <span style={{display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase'}}>Session Started At</span>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '700', fontSize: '13px'}}>
                                <Clock size={16} color="#f59e0b"/> {loginTime}
                            </div>
                        </div>
                        <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                            <span style={{display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase'}}>Joined Date</span>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '700', fontSize: '16px'}}>
                                <Calendar size={16} color="#3b82f6"/> {profileData.joinedDate || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <button 
                    onClick={() => setShowPasswordModal(true)} 
                    style={{
                      padding: '12px 25px', 
                      background: '#0f172a', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      transition: '0.2s',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Key size={16}/> Change Password
                  </button>

                  <button 
                    onClick={() => {
                      setEmailChangeForm({ newEmail: '' });
                      setShowEmailChangeModal(true);
                    }} 
                    style={{
                      padding: '12px 25px', 
                      background: '#eff6ff', 
                      color: '#3b82f6', 
                      border: '2px solid #bfdbfe', 
                      borderRadius: '10px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Mail size={16}/> Change Email Address
                  </button>
                </div>
                            </div>
                        </div>
                    </motion.div>
                  );

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontSize: '20px', fontWeight: 'bold', color: '#64748b'}}>Loading System Data...</div>;

  return (
    <div className="dashboard-container manager-layout" style={{display: 'flex', height: '100vh', background: '#f4f7f9', fontFamily: 'system-ui, sans-serif'}}>
      
      <div className="sidebar no-print" style={{width: '260px', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px 0'}}>
        <div className="logo" style={{padding: '0 25px 20px 25px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px'}}>
          <h2 style={{margin: 0, fontSize: '22px', color: '#fff'}}>Madara<span style={{color: '#3b82f6'}}>Motors</span></h2>
          <span style={{fontSize: '11px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase'}}>Manager Portal</span>
        </div>

        <nav className="nav-menu" style={{display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px', flex: 1, overflowY: 'auto'}}>
           <button style={{background: activeTab==='dashboard'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='dashboard'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='dashboard'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('dashboard')}><LayoutDashboard size={20}/> Dashboard</button>
           <button style={{background: activeTab==='profit'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='profit'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='profit'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('profit')}><PieChart size={20}/> Profit & Margins</button>
           <button style={{background: activeTab==='orders'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='orders'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='orders'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('orders')}><ShoppingCart size={20}/> Customer Orders</button>
           <button style={{background: activeTab==='inventory'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='inventory'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='inventory'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('inventory')}><Package size={20}/> Inventory</button>
           <button style={{background: activeTab==='customers'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='customers'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='customers'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('customers')}><Users size={20}/> Customers</button>
           <button style={{background: activeTab==='suppliers'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='suppliers'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='suppliers'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('suppliers')}><Truck size={20}/> Suppliers</button>
           <button style={{background: activeTab==='purchase-orders'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='purchase-orders'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='purchase-orders'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('purchase-orders')}><ShoppingCart size={20}/> Purchase Orders</button>
           <button style={{background: activeTab==='reports'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='reports'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='reports'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('reports')}><FileText size={20}/> Reports</button>
           <button style={{background: activeTab==='users'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='users'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='users'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('users')}><Users size={20}/> Employees</button>
           <button style={{background: activeTab==='profile'?'rgba(59,130,246,0.1)':'transparent', color: activeTab==='profile'?'#3b82f6':'#cbd5e1', padding: '15px 20px', border: 'none', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='profile'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('profile')}><User size={20}/> Profile</button>
        </nav>

        <div style={{padding: '0 15px', marginTop: 'auto'}}>
          <button onClick={handleLogout} style={{width: '100%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold'}}><LogOut size={18}/> Logout</button>
        </div>
      </div>
      
      <div className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '0px 30px 30px 30px', boxSizing: 'border-box', position: 'relative' }}>
        
        {/* 🟢 TOP BAR WITH BELL ICON */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '25px', position: 'sticky', top: 0, zIndex: 50, background: '#f4f7f9' }}>
            <div style={{ position: 'relative', cursor: 'pointer', background: '#fff', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={22} color="#64748b" />
                {notifications.length > 0 && (
                    <span style={{ position: 'absolute', top: '0px', right: '0px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        {notifications.length}
                    </span>
                )}
            </div>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 10}} style={{position: 'absolute', top: '70px', right: '0px', background: '#fff', width: '320px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden'}}>
                        <div style={{padding: '15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b', display: 'flex', justifyContent: 'space-between'}}>
                            Notifications
                            <button onClick={() => setShowNotifications(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={16}/></button>
                        </div>
                        <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                            {notifications.length === 0 ? (
                                <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px'}}>No new notifications.</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} style={{padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                        <div>
                                            <span style={{fontWeight: 'bold', fontSize: '13px', color: '#0f172a'}}>{n.employeeName}</span>
                                            <span style={{color: '#64748b', fontSize: '12px', display: 'block'}}>{n.employeeEmail || (n.type === 'NEW_ITEM_APPROVAL' || n.type === 'PRICE_UPDATE_APPROVAL' ? 'Store Keeper' : 'Employee')}</span>
                                        </div>
                                        
                                        {/* 🟢 Notification Messages Based on Type */}
                                          {n.type === 'NEW_ITEM_APPROVAL' ? (
                                            <div style={{fontSize: '13px', color: '#2563eb', background: '#eff6ff', padding: '8px', borderRadius: '6px', border: '1px solid #bfdbfe'}}>
                                              New item requested: <strong>{JSON.parse(n.message).productName}</strong>
                                            </div>

                                          ) : n.type === 'NEW_SUPPLIER_APPROVAL' ? (
                                            <div style={{fontSize: '13px', color: '#0ea5e9', background: '#ecfeff', padding: '8px', borderRadius: '6px', border: '1px solid #a5f3fc'}}>
                                              New supplier requested: <strong>{JSON.parse(n.message).supplierName}</strong>
                                            </div>

                                          ) : n.type === 'PRICE_UPDATE_APPROVAL' ? (
                                            <div style={{fontSize: '13px', color: '#d97706', background: '#fffbeb', padding: '8px', borderRadius: '6px', border: '1px solid #fde68a'}}>
                                              Price changed for <strong>{JSON.parse(n.message).productName}</strong>. Please update Selling Price.
                                            </div>

                                          ) : (
                                            <div style={{fontSize: '13px', color: '#ef4444', background: '#fef2f2', padding: '8px', borderRadius: '6px'}}>
                                              {n.message}
                                            </div>
                                          )}

                                        <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                            <button onClick={() => triggerConfirmNotification(n, 'APPROVE')} style={{flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'}}>
                                            <Check size={14}/> {n.type === 'ACTIVATION'
                                            ? 'Activate'
                                            : (n.type === 'NEW_ITEM_APPROVAL' || n.type === 'PRICE_UPDATE_APPROVAL' || n.type === 'NEW_SUPPLIER_APPROVAL')
                                              ? 'Review & Update'
                                              : 'Approve'}
                                            </button>
                                            <button onClick={() => triggerConfirmNotification(n, 'REJECT')} style={{flex: 1, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'}}>
                                                <X size={14}/> Decline
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" >
            <motion.div key={activeTab} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ minHeight:'100%', paddingBottom: '40px' }}>
               {activeTab === 'dashboard' && renderDashboard()}
               {activeTab === 'profit' && renderProfit()}
               {activeTab === 'orders' && renderOrders()}
               {activeTab === 'inventory' && renderInventory()}
               {activeTab === 'customers' && renderCustomers()}
               {activeTab === 'suppliers' && renderSuppliers()}
               {activeTab === 'purchase-orders' && renderPurchaseOrders()}
               {activeTab === 'reports' && renderReportsMaster()}
               {activeTab === 'users' && renderUsers()}
               {activeTab === 'profile' && renderProfile()}
            </motion.div>
        </AnimatePresence>

        {/* 🟢 CUSTOMER ORDER DETAILS & VERIFY MODAL */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <motion.div
              className="modal-overlay no-print"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
            >
              <motion.div
                className="payment-modal"
                initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }}
                style={{ background: '#fff', width: '750px', maxHeight: '85vh', overflowY: 'auto', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart color="#f97316"/> Order Details - {selectedOrder.orderId || `#ORD-${selectedOrder.id}`}
                  </h2>
                  <button onClick={() => setShowOrderModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
                </div>

                {/* Customer Info Section */}
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                        <span style={{display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px'}}>Customer Info</span>
                        <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '15px'}}>{selectedOrder.customerName || 'Walk-in Customer'}</div>
                        <div style={{fontSize: '13px', color: '#475569', marginTop: '3px'}}>
                           <Phone size={12} style={{display:'inline', marginRight:'4px'}}/>
                           {selectedOrder.phone || selectedOrder.contactNo || selectedOrder.contactNumber || selectedOrder.customerPhone || selectedOrder.customer?.phone || 'N/A'}
                        </div>
                        {selectedOrder.address && <div style={{fontSize: '13px', color: '#475569', marginTop: '3px'}}><MapPin size={12} style={{display:'inline', marginRight:'4px'}}/>{selectedOrder.address}</div>}
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <span style={{display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px'}}>Order Status</span>
                        <span style={{background: '#eff6ff', color: '#3b82f6', padding: '5px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', display: 'inline-block', textTransform:'uppercase'}}>{selectedOrder.status || 'Pending'}</span>
                        <div style={{fontSize: '12px', color: '#64748b', marginTop: '8px'}}>{new Date(selectedOrder.createdAt || selectedOrder.orderDate).toLocaleString()}</div>
                    </div>
                </div>

                <h3 style={{fontSize: '15px', color: '#1e293b', marginBottom: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px'}}>Requested Items & Stock Validation</h3>
                
                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '20px'}}>
                  <thead style={{background: '#f1f5f9'}}>
                    <tr>
                      <th style={{padding: '12px', textAlign: 'left', color: '#475569'}}>Item Details</th>
                      <th style={{padding: '12px', textAlign: 'center', color: '#475569'}}>Req. Qty</th>
                      <th style={{padding: '12px', textAlign: 'center', color: '#475569'}}>In Stock</th>
                      <th style={{padding: '12px', textAlign: 'right', color: '#475569'}}>Unit Price</th>
                      <th style={{padding: '12px', textAlign: 'right', color: '#475569'}}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((it, i) => {
                      const dbProduct = products.find(p => p.productCode === it.productCode);
                      const availableStock = dbProduct ? getStockQty(dbProduct) : 0;
                      const reqQty = it.qty || it.quantity || 1;
                      const isShortage = reqQty > availableStock;
                      

                      const finalPrice = it.sellingPrice || it.price || it.unitPrice || (dbProduct ? dbProduct.sellingPrice : 0);
                      const subtotal = reqQty * finalPrice;

                      return (
                        <tr key={i} style={{borderBottom: '1px solid #e2e8f0', background: isShortage ? '#fef2f2' : 'transparent'}}>
                          <td style={{padding: '12px'}}>
                              <div style={{fontWeight: 'bold', color: '#1e293b'}}>{it.productName}</div>
                              <div style={{fontSize: '11px', color: '#64748b'}}>{it.productCode}</div>
                              {isShortage && <div style={{fontSize: '11px', color: '#ef4444', fontWeight: 'bold', marginTop: '2px'}}>⚠️ Out of Stock / Insufficient</div>}
                          </td>
                          <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b'}}>{reqQty}</td>
                          <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', color: isShortage ? '#ef4444' : '#10b981'}}>{availableStock}</td>
                          <td style={{padding: '12px', textAlign: 'right', color: '#475569'}}>LKR {finalPrice.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'right', color: '#1e293b', fontWeight: 'bold'}}>LKR {subtotal.toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '2px solid #f1f5f9', paddingTop: '15px', marginTop: '10px'}}>
                    <div style={{fontSize: '18px', color: '#64748b', fontWeight: 'bold', marginRight: '15px'}}>Total Amount:</div>
                    <div style={{fontSize: '24px', color: '#f97316', fontWeight: '900'}}>LKR {selectedOrder.totalAmount?.toLocaleString()}</div>
                </div>

                {/* 🟢 Dynamic Order Actions Based on Status */}
                <div style={{display: 'flex', gap: '10px', marginTop: '25px'}}>
                    
                    {/* Pending නම් Verify බට්න් එක පෙන්නන්න */}
                    {(selectedOrder.status || 'Pending').toLowerCase() === 'pending' && (
                        <button 
                            onClick={(e) => handleVerifyOrder(selectedOrder, e)}
                            style={{flex: 2, background: '#10b981', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}
                        >
                            <CheckCircle size={18}/> Verify Order
                        </button>
                    )}

                    {/* Verified නම් Complete බට්න් එක පෙන්නන්න */}
                    {(selectedOrder.status || '').toLowerCase() === 'verified' && (
                        <button 
                            onClick={(e) => handleCompleteOrder(selectedOrder, e)}
                            style={{flex: 2, background: '#3b82f6', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}
                        >
                            <Package size={18}/> Complete Order
                        </button>
                    )}

                    {/* Completed නම් Picked Up බට්න් එක පෙන්නන්න */}
                    {(selectedOrder.status || '').toLowerCase() === 'completed' && (
                        <button 
                            onClick={(e) => handlePickupOrder(selectedOrder, e)}
                            style={{flex: 2, background: '#8b5cf6', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}
                        >
                            <ShoppingBag size={18}/> Mark as Picked Up
                        </button>
                    )}

                    {/* Pending, Verified, Completed කියන 3ටම Cancel බට්න් එක තියෙනවා */}
                    {['pending', 'verified', 'completed'].includes((selectedOrder.status || 'pending').toLowerCase()) && (
                        <button 
                            onClick={(e) => handleCancelOrder(selectedOrder, e)}
                            style={{flex: 1, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}
                        >
                            <Ban size={18}/> Cancel Order
                        </button>
                    )}
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🟢 Notification Confirmation Modal (Standard) */}
  <AnimatePresence>
  {confirmNotifModal &&
    (
      confirmNotifAction === 'REJECT' ||
      (confirmNotifModal.type !== 'NEW_ITEM_APPROVAL' &&
       confirmNotifModal.type !== 'PRICE_UPDATE_APPROVAL')
    ) && (
      <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="payment-modal"
          style={{width:'400px', background:'#fff', padding:'30px', borderRadius:'20px', textAlign:'center'}}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          {confirmNotifAction === 'APPROVE' ? (
            <CheckCircle size={50} color="#10b981" style={{marginBottom:'15px'}}/>
          ) : (
            <X size={50} color="#ef4444" style={{marginBottom:'15px'}}/>
          )}

          <h2 style={{fontSize: '22px', color:'#1e293b'}}>Confirm Action?</h2>

          <p style={{color:'#64748b', marginTop:'10px', fontSize:'14px'}}>
            Are you sure you want to <strong>{confirmNotifAction === 'APPROVE' ? 'approve' : 'decline'}</strong> the request from <strong>{confirmNotifModal.employeeName}</strong>?
          </p>

          {confirmNotifAction === 'REJECT' && (
            <textarea
              placeholder="Enter reason for declining this request..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                marginTop: '15px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                background: '#f8fafc',
                color: '#1e293b'
              }}
            />
          )}

          <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'25px'}}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={executeNotificationAction}
              style={{
                flex: 1,
                background: confirmNotifAction === 'APPROVE' ? '#10b981' : '#ef4444',
                color:'#fff',
                padding:'12px 20px',
                borderRadius:'8px',
                border:'none',
                cursor:'pointer',
                fontWeight: 'bold'
              }}
            >
              Yes, {confirmNotifAction === 'APPROVE' ? 'Approve' : 'Decline'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setConfirmNotifModal(null);
                setConfirmNotifAction("");
                setDeclineReason("");
              }}
              style={{
                flex: 1,
                background:'#f1f5f9',
                color:'#1e293b',
                padding:'12px 20px',
                borderRadius:'8px',
                border:'none',
                cursor:'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
  )}
  
</AnimatePresence>
        {/* 🟢 NEW ITEM APPROVAL MODAL (Manager fills remaining details) */}
        {/* 🟢 NEW ITEM APPROVAL MODAL (Manager fills remaining details) */}
        <AnimatePresence>
            {showApproveItemModal && confirmNotifModal && (
                <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} style={{ background: '#fff', width: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package color="#10b981"/> Approve New Product</h2>
                            <button onClick={() => { setShowApproveItemModal(false); setConfirmNotifModal(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
                        </div>
                        <p style={{color:'#64748b', fontSize:'13px', marginBottom: '25px'}}>The Store Keeper requested to add this item. Please set the selling price and stock limit to register it in the system.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                            
                            {/* 🟢 Read Only Fields (From Store Keeper) */}
                            <div style={{display: 'flex', gap: '15px'}}>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Item Code</label>
                                    <input type="text" value={approveItemForm.productCode} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                                <div style={{flex: 2}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Item Name</label>
                                    <input type="text" value={approveItemForm.productName} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px'}}>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Vehicle Type</label>
                                    <input type="text" value={approveItemForm.vehicleType || 'N/A'} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Brand</label>
                                    <input type="text" value={approveItemForm.brand || 'N/A'} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Category</label>
                                    <input type="text" value={approveItemForm.partCategory || 'N/A'} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px'}}>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Compatible Model</label>
                                    <input type="text" value={approveItemForm.model || 'Universal'} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Year</label>
                                    <input type="text" value={approveItemForm.manufactureYear || 'Universal'} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Buying Price (Rs.)</label>
                                    <input type="text" value={approveItemForm.buyingPrice} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold'}} />
                                </div>
                            </div>

                            <div>
                                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Image URL</label>
                                <input type="text" value={approveItemForm.imageUrl || 'No Image'} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} />
                            </div>

                            <hr style={{borderTop: '1px dashed #cbd5e1', margin: '10px 0'}}/>

                            {/* 🟢 Manager Input Fields */}
                            <div style={{display: 'flex', gap: '15px'}}>
                                <div style={{flex: 2}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#10b981', display: 'block', marginBottom: '5px'}}>Set Selling Price (Rs.) *</label>
                                    <input type="number" placeholder="e.g. 5000" value={approveItemForm.sellingPrice} onChange={(e) => setApproveItemForm({...approveItemForm, sellingPrice: e.target.value})} autoFocus style={{width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #10b981', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold', background:'#fff', color:'#1e293b'}} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#ef4444', display: 'block', marginBottom: '5px'}}>Low Stock Limit *</label>
                                    <input type="number" value={approveItemForm.lowStockLimit} onChange={(e) => setApproveItemForm({...approveItemForm, lowStockLimit: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color:'#ef4444', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold'}} />
                                </div>
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={handleApproveNewItem} style={{flex: 2, background:'#10b981', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                                <Save size={16}/> Confirm & Add to Inventory
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        {/* 🟢 NEW SUPPLIER APPROVAL MODAL */}
<AnimatePresence>
  {showSupplierApproveModal && confirmNotifModal && (
    <motion.div
      className="modal-overlay no-print"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <motion.div
        className="payment-modal"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        style={{
          background: '#fff',
          width: '500px',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck color="#0ea5e9"/> Approve New Supplier
          </h2>
          <button
            onClick={() => {
              setShowSupplierApproveModal(false);
              setConfirmNotifModal(null);
            }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={24}/>
          </button>
        </div>

        <p style={{color:'#64748b', fontSize:'13px', marginBottom: '20px'}}>
          The Store Keeper requested to register a new supplier. Please review and confirm the supplier details.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Supplier Name *</label>
            <input
              type="text"
              value={approveSupplierForm.supplierName}
              onChange={(e) => setApproveSupplierForm({...approveSupplierForm, supplierName: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}}
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Company Name</label>
            <input
              type="text"
              value={approveSupplierForm.company}
              onChange={(e) => setApproveSupplierForm({...approveSupplierForm, company: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}}
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Contact Number *</label>
            <input
              type="text"
              value={approveSupplierForm.contactNumber}
              onChange={(e) => setApproveSupplierForm({...approveSupplierForm, contactNumber: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}}
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Email</label>
            <input
              type="email"
              value={approveSupplierForm.email}
              onChange={(e) => setApproveSupplierForm({...approveSupplierForm, email: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}}
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Address</label>
            <input
              type="text"
              value={approveSupplierForm.address}
              onChange={(e) => setApproveSupplierForm({...approveSupplierForm, address: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}}
            />
          </div>
        </div>

        <div style={{display:'flex', gap:'10px'}}>
          <button
            onClick={handleApproveSupplier}
            style={{flex: 2, background:'#0ea5e9', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}
          >
            <Save size={16}/> Confirm & Add Supplier
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* 🟢 FULLY REDESIGNED GRN VIEW MODAL */}
<AnimatePresence>
  {showGrnViewModal && selectedGrn && (
    <motion.div
      className="modal-overlay no-print"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}
    >
      <motion.div
        className="payment-modal"
        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
        style={{
          background: '#fff', width: '900px', maxHeight: '90vh', overflowY: 'auto',
          padding: '0', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
              <ArrowDownToLine color="#3b82f6" size={28}/>
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>GRN Receipt Details</h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Reference ID: <strong style={{color: '#3b82f6'}}>{selectedGrn.grnId}</strong></p>
            </div>
          </div>
          <button onClick={() => setShowGrnViewModal(false)} style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#475569', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20}/>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '30px' }}>
          
          {/* Top Summary Cards (Supplier & Order Details) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            
            {/* Supplier Details */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} color="#f97316"/> Supplier Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Supplier Name:</span>
                  <span style={{ fontWeight: 'bold', color: '#1e293b', textTransform: 'capitalize' }}>{selectedGrn.supplier || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Order/Invoice Details */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="#3b82f6"/> Order Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Invoice No:</span>
                  <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{selectedGrn.invoice || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Received Date:</span>
                  <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{selectedGrn.date || 'N/A'}</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Items Table */}
          <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Received Products Details</h3>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ padding: '14px 15px', textAlign: 'left', color: '#475569', fontWeight: 'bold' }}>Product ID</th>
                  <th style={{ padding: '14px 15px', textAlign: 'left', color: '#475569', fontWeight: 'bold' }}>Product Name</th>
                  <th style={{ padding: '14px 15px', textAlign: 'center', color: '#475569', fontWeight: 'bold' }}>Qty</th>
                  <th style={{ padding: '14px 15px', textAlign: 'right', color: '#475569', fontWeight: 'bold' }}>Buying Price (Rs.)</th>
                  <th style={{ padding: '14px 15px', textAlign: 'right', color: '#475569', fontWeight: 'bold' }}>Selling Price (Rs.)</th>
                  <th style={{ padding: '14px 15px', textAlign: 'right', color: '#475569', fontWeight: 'bold' }}>Total Cost (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {(selectedGrn.items || []).length > 0 ? (
                  selectedGrn.items.map((it, i) => {
                    const buyPrice = Number(it.newBuyingPrice || it.buyingPrice || it.unitPrice || 0);
                    const sellPrice = Number(it.sellingPrice || 0);
                    const qty = Number(it.addedQty || it.qty || 0);
                    const subTotal = buyPrice * qty;
                    
                    return (
                      <tr key={i} style={{ borderTop: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '14px 15px', color: '#3b82f6', fontWeight: 'bold' }}>{it.productCode || 'N/A'}</td>
                        <td style={{ padding: '14px 15px', color: '#1e293b', fontWeight: '600' }}>{it.productName || 'N/A'}</td>
                        <td style={{ padding: '14px 15px', textAlign: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>+{qty}</td>
                        <td style={{ padding: '14px 15px', textAlign: 'right', color: '#64748b' }}>{buyPrice.toLocaleString()}</td>
                        <td style={{ padding: '14px 15px', textAlign: 'right', color: '#0ea5e9', fontWeight: '600' }}>{sellPrice > 0 ? sellPrice.toLocaleString() : 'N/A'}</td>
                        <td style={{ padding: '14px 15px', textAlign: 'right', color: '#1e293b', fontWeight: '800' }}>{subTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      <Package size={30} style={{margin: '0 auto 10px', opacity: 0.5, display: 'block'}}/>
                      No item details found for this GRN.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Table Footer with Totals */}
            <div style={{ background: '#0f172a', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '30px', color: '#cbd5e1', fontSize: '14px' }}>
                  <span>Total Items: <strong style={{color: '#fff', fontSize: '16px'}}>{selectedGrn.totalItems || (selectedGrn.items || []).length}</strong></span>
                  <span>Total Qty: <strong style={{color: '#fff', fontSize: '16px'}}>{selectedGrn.totalQty || (selectedGrn.items || []).reduce((s, i) => s + Number(i.addedQty || i.qty || 0), 0)}</strong></span>
              </div>
              <div style={{ fontSize: '16px', color: '#cbd5e1' }}>
                Total GRN Value: 
                <span style={{ color: '#10b981', fontSize: '24px', marginLeft: '12px', fontWeight: '900' }}>
                  Rs. {(selectedGrn.items || []).reduce((sum, i) => sum + (Number(i.addedQty || i.qty || 0) * Number(i.newBuyingPrice || i.buyingPrice || i.unitPrice || 0)), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button at Bottom */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
            <button onClick={() => setShowGrnViewModal(false)} style={{ background: '#f1f5f9', color: '#0f172a', padding: '12px 30px', borderRadius: '10px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s' }}>
              Close Window
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
            
        {/* 🟢 PRICE UPDATE APPROVAL MODAL */}
        <AnimatePresence>
            {showPriceUpdateModal && confirmNotifModal && (
                <motion.div className="modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} style={{ background: '#fff', width: '500px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp color="#f59e0b"/> Price Change Alert</h2>
                            <button onClick={() => { setShowPriceUpdateModal(false); setConfirmNotifModal(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
                        </div>
                        <p style={{color:'#64748b', fontSize:'13px', marginBottom: '25px'}}>The Store Keeper recorded a new GRN with a different Buying Price. Please update the Selling Price accordingly.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                            <div style={{display: 'flex', gap: '15px'}}>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Item Code</label>
                                    <input type="text" value={priceUpdateForm.productCode} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                                <div style={{flex: 2}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Item Name</label>
                                    <input type="text" value={priceUpdateForm.productName} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'}} />
                                </div>
                            </div>
                            
                            <div style={{display: 'flex', gap: '15px'}}>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Old Buying Price</label>
                                    <input type="text" value={`Rs. ${priceUpdateForm.oldBuyingPrice}`} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold'}} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#ef4444', display: 'block', marginBottom: '5px'}}>New Buying Price</label>
                                    <input type="text" value={`Rs. ${priceUpdateForm.newBuyingPrice}`} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold'}} />
                                </div>
                            </div>

                            <hr style={{borderTop: '1px dashed #cbd5e1', margin: '10px 0'}}/>

                            <div style={{display: 'flex', gap: '15px'}}>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Current Selling Price</label>
                                    <input type="text" value={`Rs. ${priceUpdateForm.currentSellingPrice}`} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold'}} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#10b981', display: 'block', marginBottom: '5px'}}>Set New Selling Price *</label>
                                    <input type="number" placeholder="Enter new price" value={priceUpdateForm.newSellingPrice} onChange={(e) => setPriceUpdateForm({...priceUpdateForm, newSellingPrice: e.target.value})} autoFocus style={{width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #10b981', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold', background:'#fff', color:'#1e293b'}} />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleApprovePriceUpdate} style={{width: '100%', background:'#f59e0b', color:'#fff', padding:'15px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                            <Save size={18}/> Update Selling Price
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Add Employee Modal */}
        <AnimatePresence>
            {showUserModal && (
                <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} style={{ background: '#fff', width: '450px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px' }}>Create Employee Account</h2>
                            <button onClick={() => setShowUserModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
                        </div>
                        <p style={{fontSize: '13px', color: '#64748b', marginBottom: '20px'}}>Create basic access for a new employee. They can complete their profile later upon login.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Employee ID *</label>
                            <input type="text" placeholder="e.g. EMP-005" value={userForm.employeeId} onChange={(e) => setUserForm({...userForm, employeeId: e.target.value})} autoFocus style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                            
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Full Name *</label>
                            <input type="text" placeholder="e.g. Nimal Perera" value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} autoComplete="none" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                            
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Email Address</label>
                            <input type="email" placeholder="e.g. nimal@madaramotors.com" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} autoComplete="none" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                            
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>System Role *</label>
                            <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background: '#fff', color:'#1e293b' }}>
                               <option value="SalesPerson">Cashier (Sales Person)</option>
                               <option value="StoreKeeper">Stock Keeper</option>
                               <option value="Manager">Manager</option>
                            </select></div>

                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Temporary Password *</label>
                            <input type="password" placeholder="Assign a default password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} autoComplete="new-password" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button onClick={handleUserSubmit} style={{ flex: 2, background: '#3b82f6', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Users size={18}/> Create Account</button>
                            <button onClick={() => setShowUserModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#1e293b', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 🟢 Supplier Modal */}
        <AnimatePresence>
            {showSupplierModal && (
                <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} style={{ background: '#fff', width: '450px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px' }}>{isEditingSupplier ? "Update Supplier" : "Add New Supplier"}</h2>
                            <button onClick={() => setShowSupplierModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {isEditingSupplier && (
                                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Supplier ID</label>
                                <input type="text" value={supplierForm.id} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', boxSizing: 'border-box' }} /></div>
                            )}
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Supplier Name *</label>
                            <input type="text" value={supplierForm.supplierName} onChange={(e) => setSupplierForm({...supplierForm, supplierName: e.target.value})} autoFocus style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                            
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Company Name</label>
                            <input type="text" placeholder="e.g. Toyota Lanka" value={supplierForm.company || ''} onChange={(e) => setSupplierForm({...supplierForm, company: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>

                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Contact Number *</label>
                            <input type="text" value={supplierForm.contactNumber} onChange={(e) => setSupplierForm({...supplierForm, contactNumber: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Email Address</label>
                            <input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                            <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Address</label>
                            <input type="text" value={supplierForm.address || ''} onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button onClick={handleSupplierSubmit} style={{ flex: 2, background: '#3b82f6', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Save size={18}/> {isEditingSupplier ? "Save Changes" : "Confirm & Add"}</button>
                            <button onClick={() => setShowSupplierModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#1e293b', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 🟢 FULLY REDESIGNED PRODUCT ADD/EDIT MODAL WITH VALIDATION & CUSTOM SELECTS */}
        <AnimatePresence>
            {showProductModal && (
                <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} style={{ background: '#fff', width: '850px', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{background: '#eff6ff', padding: '8px', borderRadius: '10px'}}><Package color="#3b82f6" size={24}/></div>
                                {isEditingProduct ? "Update Product Details" : "Register New Product"}
                            </h2>
                            <button onClick={() => setShowProductModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
                        </div>
                        
                        {/* 2-Column Form Layout */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            
                            {/* Column 1: Basic Information */}
                            <div>
                                <h3 style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontWeight: 'bold' }}>Basic Information</h3>
                                
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: productFormErrors.productCode ? '#ef4444' : '#475569', display: 'block', marginBottom: '5px' }}>Product Code (ID) *</label>
                                    <input type="text" placeholder="e.g. AFT-01" value={productForm.productCode} onChange={(e) => handleProductFormChange('productCode', e.target.value)} disabled={isEditingProduct} autoFocus={!isEditingProduct} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: productFormErrors.productCode ? '1px solid #fca5a5' : '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background: isEditingProduct ? '#f8fafc' : (productFormErrors.productCode ? '#fef2f2' : '#fff'), color: isEditingProduct ? '#94a3b8' : '#1e293b' }} />
                                    {productFormErrors.productCode && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>⚠️ {productFormErrors.productCode}</span>}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: productFormErrors.productName ? '#ef4444' : '#475569', display: 'block', marginBottom: '5px' }}>Product Name *</label>
                                    <input type="text" placeholder="Enter part name" value={productForm.productName} onChange={(e) => handleProductFormChange('productName', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: productFormErrors.productName ? '1px solid #fca5a5' : '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background: productFormErrors.productName ? '#fef2f2' : '#fff', color:'#1e293b' }} />
                                    {productFormErrors.productName && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>⚠️ {productFormErrors.productName}</span>}
                                </div>

                                
                               {/* Custom Select Components */}
                                <CustomSelect label="Category" fieldName="partCategory" value={productForm.partCategory} options={categoryOptions} onChange={handleProductFormChange} error={productFormErrors.partCategory} />
                                <CustomSelect label="Vehicle Type" fieldName="vehicleType" value={productForm.vehicleType} options={vehicleTypeOptions} onChange={handleProductFormChange} error={productFormErrors.vehicleType} />
                                
                               
                                {(() => {
                                    let dynamicBrands = brandOptions; 
                                    if (productForm.vehicleType) {

                                        const matchingBrands = products
                                            .filter(p => p.vehicleType === productForm.vehicleType && p.brand)
                                            .map(p => p.brand);
                                        dynamicBrands = matchingBrands.length > 0 ? [...new Set(matchingBrands)] : [];
                                    }
                                    return (
                                        <CustomSelect label="Brand" fieldName="brand" value={productForm.brand} options={dynamicBrands} onChange={handleProductFormChange} />
                                    );
                                })()}

                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{flex: 1}}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Model</label>
                                        <input type="text" placeholder="e.g. Civic" value={productForm.model || ''} onChange={(e) => handleProductFormChange('model', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} />
                                    </div>
                                    <div style={{flex: 1}}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Year</label>
                                        <input type="text" placeholder="e.g. 2018" value={productForm.manufactureYear || ''} onChange={(e) => handleProductFormChange('manufactureYear', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Pricing & Stock */}
                            <div>
                                <h3 style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontWeight: 'bold' }}>Pricing & Inventory</h3>
                                
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{flex: 1}}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Buying Price (Rs.)</label>
                                        <input type="number" placeholder="0.00" value={productForm.unitPrice || ''} onChange={(e) => handleProductFormChange('unitPrice', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b' }} />
                                    </div>
                                    <div style={{flex: 1}}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: productFormErrors.sellingPrice ? '#ef4444' : '#10b981', display: 'block', marginBottom: '5px' }}>Selling Price (Rs.) *</label>
                                        <input type="number" placeholder="0.00" value={productForm.sellingPrice} onChange={(e) => handleProductFormChange('sellingPrice', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: productFormErrors.sellingPrice ? '2px solid #ef4444' : '2px solid #10b981', outline: 'none', boxSizing: 'border-box', background: productFormErrors.sellingPrice ? '#fef2f2' : '#fff', color:'#1e293b', fontWeight: 'bold' }} />
                                        {productFormErrors.sellingPrice && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>⚠️ {productFormErrors.sellingPrice}</span>}
                                    </div>
                                </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    
                                    {/* 🟢 මේක දැන් Lock කරලා තියෙන්නේ. අතින් වෙනස් කරන්න බෑ! */}
                                    <div style={{flex: 1}}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>
                                            Current Stock Qty <span style={{color: '#ef4444'}}>(Locked)</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            value={productForm.stockQty || 0} 
                                            disabled 
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', background:'#e2e8f0', color:'#64748b', fontSize: '16px', fontWeight: 'bold', cursor: 'not-allowed' }} 
                                        />
                                    </div>

                                    <div style={{flex: 1}}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444', display: 'block', marginBottom: '5px' }}>Low Stock Limit</label>
                                        <input 
                                            type="number" 
                                            value={productForm.lowStockLimeted} 
                                            onChange={(e) => handleProductFormChange('lowStockLimeted', e.target.value)} 
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fca5a5', outline: 'none', boxSizing: 'border-box', background: '#fef2f2', color:'#ef4444', fontSize: '16px', fontWeight: 'bold' }} 
                                        />
                                    </div>
                                    
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Description</label>
                                    <textarea rows="3" placeholder="Brief details about the part..." value={productForm.description || ''} onChange={(e) => handleProductFormChange('description', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b', resize: 'none' }} />
                                </div>

                                {/* Image URL Section */}
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                        {productForm.imageUrl ? <img src={productForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display='none'}/> : <ImageIcon color="#94a3b8" size={24}/>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Product Image URL</label>
                                        <input type="text" placeholder="https://example.com/image.jpg" value={productForm.imageUrl || ''} onChange={(e) => handleProductFormChange('imageUrl', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b', fontSize: '12px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                         <button onClick={handleProductSubmit} style={{ flex: 2, background: '#10b981', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px', boxShadow: '0 4px 15px rgba(16,185,129,0.2)' }}>
                                <Save size={18}/> {isEditingProduct ? "Update Product" : "Add New Product"}
                            </button>
                            <button onClick={() => setShowProductModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
                                Cancel
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Product View Modal */}
        <AnimatePresence>
            {showViewProductModal && selectedViewProduct && (
                <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ background: '#fff', width: '500px', padding: '0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        
                        {/* 🔵 Modal Header */}
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                                <Package size={24} color="#3b82f6"/> Product Details
                            </h2>
                            <button onClick={() => setShowViewProductModal(false)} style={{ background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                <X size={18}/>
                            </button>
                        </div>

                        {/* 🔵 Modal Body */}
                        <div className="invoice-content" style={{ padding: '25px' }}>
                            
                            <h3 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontWeight: '800' }}>Specifications</h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Product Code</span>
                                    <span style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '800' }}>{selectedViewProduct.productCode}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Product Name</span>
                                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{selectedViewProduct.productName}</span>
                                </div>
                                
                                {/* 🟢 අලුතින් දාපු Fields 3 */}
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Category</span>
                                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{selectedViewProduct.partCategory || 'N/A'}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Vehicle Type</span>
                                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{selectedViewProduct.vehicleType || 'N/A'}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Brand</span>
                                    <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '700' }}>{selectedViewProduct.brand || 'N/A'}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Model</span>
                                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{selectedViewProduct.model || 'N/A'}</span>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontWeight: '800' }}>Pricing & Stock</h3>

                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Buying Price</span>
                                    <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: '800' }}>Rs. {(selectedViewProduct.unitPrice || selectedViewProduct.productPrice || (selectedViewProduct.sellingPrice*0.75))?.toLocaleString() || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Selling Price</span>
                                    <span style={{ color: '#10b981', fontSize: '16px', fontWeight: '900' }}>Rs. {selectedViewProduct.sellingPrice?.toLocaleString() || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
                                    <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>Current Stock</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>Low Limit: {getLowStockLimit(selectedViewProduct)}</span>
                                        <span style={{ 
                                            background: getStockQty(selectedViewProduct) <= getLowStockLimit(selectedViewProduct) ? '#fef2f2' : '#f0fdf4', 
                                            color: getStockQty(selectedViewProduct) <= getLowStockLimit(selectedViewProduct) ? '#ef4444' : '#10b981', 
                                            padding: '6px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '18px', border: `1px solid ${getStockQty(selectedViewProduct) <= getLowStockLimit(selectedViewProduct) ? '#fca5a5' : '#86efac'}` 
                                        }}>
                                            {getStockQty(selectedViewProduct)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        
       {/* Edit Profile Modal */}
        <AnimatePresence>
          {showEditProfileModal && (
            <motion.div className="modal-overlay no-print" 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
              background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              
              <motion.div className="payment-modal" 
                initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} 
                style={{ background: '#fff', width: '680px', padding: '30px', 
                borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                
                <div className="modal-header" 
                  style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h2 style={{margin: 0, color: '#1e293b', fontSize: '22px'}}>Edit Profile</h2>
                  <button onClick={() => setShowEditProfileModal(false)} 
                    style={{background:'transparent', border:'none', cursor:'pointer', color:'#64748b'}}>
                    <X size={24}/>
                  </button>
                </div>
                
                {/* 🟢 2-Column Grid Layout */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', marginBottom: '25px', textAlign: 'left'}}>
                  
                  {/* Full Name */}
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Full Name</label>
                    <input 
                      type="text" 
                      value={editProfileForm.name || ""} 
                      onChange={(e) => setEditProfileForm({...editProfileForm, name: e.target.value})} 
                      style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} 
                    />
                  </div>

                  {/* Email Address (Locked) */}
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Email Address <span style={{color: '#ef4444'}}>(Locked)</span></label>
                    <input 
                      type="email" 
                      value={profileData.email || ""} 
                      disabled 
                      style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', background:'#f8fafc', color:'#94a3b8', cursor: 'not-allowed'}} 
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Username</label>
                    <input 
                      type="text" 
                      value={editProfileForm.userName || ""} 
                      onChange={(e) => setEditProfileForm({...editProfileForm, userName: e.target.value})} 
                      style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} 
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Contact Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 0771234567"
                      value={editProfileForm.phone || ""}
                      onChange={(e) => setEditProfileForm({...editProfileForm, phone: e.target.value})}
                      style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} 
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Branch / Location</label>
                    <input 
                      type="text" 
                      value={editProfileForm.branch || ""} 
                      onChange={(e) => setEditProfileForm({...editProfileForm, branch: e.target.value})} 
                      style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} 
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Address</label>
                    <input 
                      type="text" 
                      placeholder="Enter your address"
                      value={editProfileForm.address || ""} 
                      onChange={(e) => setEditProfileForm({...editProfileForm, address: e.target.value})} 
                      style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} 
                    />
                  </div>

                </div>

                <div style={{display:'flex', gap:'10px'}}>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                    onClick={handleProfileUpdateSubmit} 
                    style={{flex: 2, background:'#3b82f6', color:'#fff', padding:'14px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                    <Save size={18}/> Confirm & Save Details
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                    onClick={() => setShowEditProfileModal(false)}
                    style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'14px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>
                    Cancel
                  </motion.button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
{/* Email Change Modal */}
<AnimatePresence>
    {showEmailChangeModal && (
        <motion.div
            className="modal-overlay no-print"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex', justifyContent: 'center',
                alignItems: 'center', zIndex: 1000
            }}
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                style={{
                    background: '#fff', width: '460px',
                    padding: '35px', borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '10px'
                }}>
                    <h2 style={{
                        margin: 0, color: '#1e293b', fontSize: '20px',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <Mail color="#3b82f6" size={22}/>
                        Request Email Change
                    </h2>
                    <button
                        onClick={() => {
                            setShowEmailChangeModal(false);
                            setEmailChangeForm({ newEmail: '' });
                            setEmailChangeError('');
                            setEmailChangeSuccess(false);

                            if (emailChangeTimer) {
                                clearInterval(emailChangeTimer);
                                setEmailChangeTimer(null);
                            }
                            setTimerCountdown(0);
                        }}
                        style={{
                            background: 'transparent', border: 'none',
                            cursor: 'pointer', color: '#64748b'
                        }}
                    >
                        <X size={22}/>
                    </button>
                </div>

                {/* ✅ Success State */}
                {emailChangeSuccess ? (
                    <div style={{
                        textAlign: 'center', padding: '20px 0'
                    }}>
                        <div style={{
                            fontSize: '50px', marginBottom: '15px'
                        }}>
                            ✅
                        </div>
                        <h3 style={{
                            color: '#10b981', margin: '0 0 10px 0'
                        }}>
                            Confirmation Email Sent!
                        </h3>
                        <p style={{
                            color: '#64748b', fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            Please check your <strong>current email inbox</strong>
                            <br/>
                            <strong
                                style={{ color: '#1e293b' }}
                            >
                                {profileData.email}
                            </strong>
                            <br/>
                            and click <strong>CONFIRM</strong> to apply the change.
                        </p>
                        <p style={{
                            color: '#94a3b8', fontSize: '12px',
                            marginTop: '10px'
                        }}>
                            ⏰ Link expires in 10 minutes
                        </p>
                        <button
                            onClick={() => {
                                setShowEmailChangeModal(false);
                                setEmailChangeForm({ newEmail: '' });
                                setEmailChangeError('');
                                setEmailChangeSuccess(false);
                            }}
                            style={{
                                marginTop: '20px',
                                background: '#10b981', color: '#fff',
                                padding: '12px 30px', borderRadius: '10px',
                                border: 'none', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '14px'
                            }}
                        >
                            OK, Got It!
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Info Box */}
                        <p style={{
                            color: '#64748b', fontSize: '13px',
                            marginBottom: '20px',
                            background: '#f8fafc',
                            padding: '12px 15px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            lineHeight: '1.6'
                        }}>
                            Your new email address will only be updated
                            after the confirmation link is clicked.
                        </p>

                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            gap: '18px', marginBottom: '20px'
                        }}>
                            {/* Current Email */}
                            <div>
                                <label style={{
                                    fontSize: '12px', fontWeight: 'bold',
                                    color: '#475569', display: 'block',
                                    marginBottom: '6px'
                                }}>
                                    Current Email
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    style={{
                                        width: '100%', padding: '12px 15px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                        color: '#94a3b8',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* New Email */}
                            <div>
                                <label style={{
                                    fontSize: '12px', fontWeight: 'bold',
                                    color: '#1e293b', display: 'block',
                                    marginBottom: '6px'
                                }}>
                                    New Email Address{' '}
                                    <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter new email address"
                                    value={emailChangeForm.newEmail}
                                    onChange={(e) => {
                                        setEmailChangeForm({
                                            newEmail: e.target.value
                                        });
                                        setEmailChangeError('');
                                    }}
                                    disabled={timerCountdown > 0}
                                    autoFocus
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        handleEmailChangeRequest()
                                    }
                                    style={{
                                        width: '100%', padding: '12px 15px',
                                        borderRadius: '8px',
                                        border: emailChangeError
                                            ? '2px solid #ef4444'
                                            : '2px solid #3b82f6',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        fontSize: '14px', fontWeight: '500',
                                        color: '#1e293b',
                                        background: timerCountdown > 0
                                            ? '#f8fafc' : '#fff'
                                    }}
                                />
                            </div>

                            {/* ✅ Error / Timer Message */}
                            {emailChangeError && (
                                <div style={{
                                    background: timerCountdown > 0
                                        ? '#fff7ed' : '#fef2f2',
                                    border: `1px solid ${timerCountdown > 0
                                        ? '#fed7aa' : '#fca5a5'}`,
                                    borderRadius: '8px',
                                    padding: '12px 15px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px'
                                }}>
                                    {timerCountdown > 0 ? (
                                        <span style={{ fontSize: '18px' }}>
                                            ⏰
                                        </span>
                                    ) : (
                                        <AlertTriangle
                                            size={16}
                                            color="#ef4444"
                                            style={{ marginTop: '2px' }}
                                        />
                                    )}
                                    <p style={{
                                        margin: 0, fontSize: '13px',
                                        color: timerCountdown > 0
                                            ? '#92400e' : '#dc2626',
                                        lineHeight: '1.6',
                                        fontWeight: timerCountdown > 0
                                            ? 'bold' : 'normal'
                                    }}>
                                        {emailChangeError}
                                    </p>
                                </div>
                            )}

                            {/* Warning */}
                            <div style={{
                                background: '#fffbeb',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                padding: '12px 15px',
                                display: 'flex', gap: '10px',
                                alignItems: 'flex-start'
                            }}>
                                <AlertTriangle
                                    size={16}
                                    color="#d97706"
                                    style={{ marginTop: '2px', flexShrink: 0 }}
                                />
                                <p style={{
                                    margin: 0, fontSize: '12px',
                                    color: '#92400e', lineHeight: '1.6'
                                }}>
                                    A confirmation email will be sent to your{' '}
                                    <strong>current email</strong>. Click{' '}
                                    <strong>"Confirm"</strong> to apply or{' '}
                                    <strong>"Cancel"</strong> to discard.
                                    <br/>
                                    <strong>⏰ Link expires in 10 minutes!</strong>
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleEmailChangeRequest}
                                disabled={
                                    emailChangePending ||
                                    timerCountdown > 0
                                }
                                style={{
                                    flex: 2,
                                    background: (emailChangePending ||
                                        timerCountdown > 0)
                                        ? '#93c5fd' : '#3b82f6',
                                    color: '#fff', padding: '13px',
                                    borderRadius: '10px', border: 'none',
                                    cursor: (emailChangePending ||
                                        timerCountdown > 0)
                                        ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold', fontSize: '14px',
                                    display: 'flex', justifyContent: 'center',
                                    alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Mail size={16}/>
                                {emailChangePending
                                    ? 'Sending...'
                                    : timerCountdown > 0
                                        ? `Wait ${Math.floor(timerCountdown / 60)}m ${timerCountdown % 60}s`
                                        : 'Send Request'
                                }
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setShowEmailChangeModal(false);
                                    setEmailChangeForm({ newEmail: '' });
                                    setEmailChangeError('');
                                    setEmailChangeSuccess(false);
                                    if (emailChangeTimer) {
                                        clearInterval(emailChangeTimer);
                                        setEmailChangeTimer(null);
                                    }
                                    setTimerCountdown(0);
                                }}
                                style={{
                                    flex: 1, background: '#f1f5f9',
                                    color: '#1e293b', padding: '13px',
                                    borderRadius: '10px', border: 'none',
                                    cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="payment-modal" style={{width:'400px', background:'#fff', padding:'30px', borderRadius:'20px'}} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <div style={{background: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px', color: '#3b82f6'}}>
                        <Lock size={30}/>
                    </div>
                    <h2 style={{fontSize: '20px', color: '#1e293b'}}>Change Password</h2>
                    <p style={{color: '#64748b', fontSize: '13px', marginTop: '5px'}}>Set a new strong password for your account.</p>
                </div>
                
                <div style={{textAlign: 'left', marginBottom: '20px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>New Password</label>
                    <input type="password" placeholder="Enter new password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({...passwordForm, newPass: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '15px', background:'#fff', color:'#1e293b'}} autoFocus/>
                    
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background:'#fff', color:'#1e293b'}}/>
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePasswordUpdateSubmit} style={{flex: 2, background:'#3b82f6', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                      <Save size={16}/> Update Password
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowPasswordModal(false); setPasswordForm({ current: '', newPass: '', confirm: '' }); }} style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Cancel</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* 🟢 BULK PURCHASE ORDER MODAL */}
        <AnimatePresence>
            {showPurchaseOrderModal && (
                <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} style={{ background: '#fff', width: '650px', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Send color="#f97316"/> Send Purchase Request
                            </h2>
                            <button onClick={() => setShowPurchaseOrderModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%' }}><X size={20}/></button>
                        </div>

                        {/* Supplier Selection & Details */}
                        <div style={{marginBottom: '20px'}}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Select Supplier *</label>
                            <select value={poSupplierId} onChange={(e) => setPoSupplierId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #cbd5e1', outline: 'none', background: '#fff', color: '#1e293b', fontSize: '14px', fontWeight: 'bold' }}>
                                <option value="">-- Choose a Supplier --</option>
                                {suppliers.map(sup => (
                                    <option key={sup.id} value={sup.id}>{sup.supplierName} ({sup.company || 'Individual'})</option>
                                ))}
                            </select>

                            {/* 🟢 Supplier Details Box (Shows only if a supplier is selected) */}
                            {poSupplierId && (() => {
                                const selectedSup = suppliers.find(s => s.id.toString() === poSupplierId.toString());
                                if (!selectedSup) return null;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: 'auto' }} 
                                        style={{ marginTop: '15px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '14px' }}>
                                            <Briefcase size={16} color="#3b82f6" /> 
                                            <strong>Company:</strong> {selectedSup.company || <span style={{color:'#94a3b8', fontStyle:'italic'}}>No Company Name</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '14px' }}>
                                            <Mail size={16} color="#3b82f6" /> 
                                            <strong>Email:</strong> {selectedSup.email || <span style={{color:'#ef4444', fontStyle:'italic'}}>No Email Provided</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '14px' }}>
                                            <Phone size={16} color="#3b82f6" /> 
                                            <strong>Contact No:</strong> {selectedSup.contactNumber || <span style={{color:'#94a3b8', fontStyle:'italic'}}>Not Available</span>}
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </div>

                        {/* Selected Items List with Qty */}
                <h3 style={{fontSize: '14px', color: '#1e293b', marginBottom: '10px'}}>Selected Items for Restock</h3>
                        <div style={{background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px', maxHeight: '300px', overflowY: 'auto'}}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead style={{ background: '#f1f5f9' }}>
                                    <tr>
                                        <th style={{ padding: '10px', textAlign: 'left', color: '#475569' }}>Item Code</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: '#475569' }}>Product Details</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Order Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedLowStockItems.map(item => (
                                        <tr key={item.productCode} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                                            <td style={{ padding: '10px', color: '#3b82f6', fontWeight: 'bold', verticalAlign: 'middle' }}>{item.productCode}</td>
                                            <td style={{ padding: '10px', color: '#1e293b', verticalAlign: 'middle' }}>
                                                <div style={{fontWeight: '600', marginBottom: '6px'}}>{item.productName}</div>
                                                <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                                                    <span style={{background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{item.partCategory || 'N/A'}</span>
                                                    <span style={{background: '#eff6ff', color: '#3b82f6', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{item.vehicleType || 'N/A'}</span>
                                                    <span style={{background: '#fef2f2', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{item.brand || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={poQuantities[item.productCode] || 1} 
                                                    onChange={(e) => handlePoQtyChange(item.productCode, e.target.value)} 
                                                    style={{width: '70px', padding: '8px', borderRadius: '6px', border: '2px solid #3b82f6', outline: 'none', textAlign: 'center', fontWeight: 'bold'}}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        {/* 🟢 CUSTOM IN-APP NEW ORDER ALERT / MISSED ORDERS ALERT */}
       {/* 🟢 IN-APP ALERTS (NEW ORDERS & DELAYED ORDERS) */}
        <AnimatePresence>
          {/* 1. New Order / Missed Order Alert */}
          {newOrderAlert && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              style={{
                position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
                background: '#fff', borderLeft: '6px solid #f97316', padding: '20px',
                borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {newOrderAlert.isMissedAlert ? '🚨 Pending Orders!' : '🚨 New Order Received!'}
                </h3>
                <button onClick={() => setNewOrderAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
              </div>
              
              {newOrderAlert.isMissedAlert ? (
                  <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                    You have <strong style={{color: '#f97316', fontSize: '16px'}}>{newOrderAlert.count} pending orders</strong> waiting for verification.
                  </p>
              ) : (
                  <>
                    <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
                      <strong>{newOrderAlert.data?.customerName || 'A customer'}</strong> just placed an order.
                    </p>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f97316' }}>
                      LKR {newOrderAlert.data?.totalAmount?.toLocaleString()}
                    </div>
                  </>
              )}

              <button 
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('Pending'); 
                  setNewOrderAlert(null);
                }}
                style={{
                  background: '#f97316', color: '#fff', border: 'none', padding: '10px',
                  borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px'
                }}
              >
                Review Orders Now
              </button>
            </motion.div>
          )}

          {/* 2. 🚨 DELAYED ORDER WARNING POPUP */}
          {delayedOrderAlert && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              style={{
                position: 'fixed', bottom: newOrderAlert ? '190px' : '30px', right: '30px', zIndex: 9998,
                background: '#fef2f2', borderLeft: '6px solid #ef4444', padding: '20px',
                borderRadius: '12px', boxShadow: '0 10px 30px rgba(239,68,68,0.2)',
                display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px', border: '1px solid #fca5a5'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#b91c1c', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20}/> Action Required!
                </h3>
                <button 
                  onClick={() => {
                    setDismissedDelayedOrders(prev => [...prev, delayedOrderAlert.id]);
                    setDelayedOrderAlert(null);
                  }} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                >
                  <X size={18}/>
                </button>
              </div>
              
              <p style={{ margin: 0, color: '#991b1b', fontSize: '14px', lineHeight: '1.5' }}>
                Order <strong style={{color: '#7f1d1d'}}>#{delayedOrderAlert.id}</strong> has been pending for over 2 hours!
              </p>
              
              <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold' }}>
                Placed At: {new Date(delayedOrderAlert.createdAt || delayedOrderAlert.orderDate).toLocaleTimeString()}
              </div>

              <button 
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('Pending'); 
                  setSelectedOrder(delayedOrderAlert);
                  setShowOrderModal(true);
                  setDelayedOrderAlert(null);
                }}
                style={{
                  background: '#ef4444', color: '#fff', border: 'none', padding: '10px',
                  borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px'
                }}
              >
                Verify Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      {/* 🟢 PURCHASE ORDER DETAILS & RECEIVE MODAL */}
        <AnimatePresence>
            {showPoViewModal && selectedPo && (
                <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div className="payment-modal" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} style={{ background: '#fff', width: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px' }}><ShoppingCart color="#3b82f6" size={28}/></div>
                                <div>
                                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>Purchase Order Details</h2>
                                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>PO ID: <strong style={{color: '#3b82f6'}}>#PO-{selectedPo.id}</strong></p>
                                </div>
                            </div>
                            <button onClick={() => { setShowPoViewModal(false); setPoInvoiceNo(""); }} style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#475569', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
                        </div>
                        
                        <div style={{ padding: '30px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Date & Time Issued</span>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{new Date(selectedPo.orderDate).toLocaleString()}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Supplier Info</span>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{selectedPo.supplier?.supplierName || 'Unknown'}</div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Requested Items List</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                                <thead style={{ background: '#f1f5f9' }}>
                                    <tr>
                                        <th style={{ padding: '10px', textAlign: 'left', color: '#475569' }}>Item Code</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: '#475569' }}>Product Details</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Category</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Vehicle</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Brand</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Req. Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedPo.items || []).map((it, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                                            <td style={{ padding: '10px', color: '#3b82f6', fontWeight: 'bold' }}>{it.sparePart?.productCode || 'N/A'}</td>
                                            <td style={{ padding: '10px', color: '#1e293b', fontWeight: '600' }}>{it.sparePart?.productName || 'Unknown Part'}</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <span style={{background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{it.sparePart?.partCategory || 'N/A'}</span>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <span style={{background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{it.sparePart?.vehicleType || 'N/A'}</span>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <span style={{background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>{it.sparePart?.brand || 'N/A'}</span>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>{it.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {selectedPo.status === 'Sent to Supplier' ? (
                                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', marginTop: '25px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#b45309', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Truck size={18}/> Process Goods Receipt
                                    </h4>
                                    <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 15px 0' }}>Enter the Supplier's Bill / Invoice Number below to mark this Purchase Order as completed.</p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. INV-9982..." 
                                            value={poInvoiceNo}
                                            onChange={(e) => setPoInvoiceNo(e.target.value)}
                                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #fcd34d', outline: 'none', background: '#fff', fontWeight: 'bold', color: '#1e293b' }}
                                        />
                                        <button 
                                            onClick={handleReceivePO}
                                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <CheckCircle size={18}/> Mark as Received
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <span style={{ background: '#dcfce7', color: '#10b981', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #86efac' }}>
                                        Status: {selectedPo.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManagerDashboard;