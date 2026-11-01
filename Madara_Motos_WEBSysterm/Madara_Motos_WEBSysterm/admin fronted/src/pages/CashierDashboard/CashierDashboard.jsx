import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, History, RotateCcw, User, LogOut, 
  Search, Plus, Minus, X, Clock, BarChart3, Package,
  Banknote, CreditCard, QrCode, TrendingUp, ClipboardList, Eye, Calendar, FileText, CheckCircle2, Trash2, RefreshCw,
  BadgeCheck, Briefcase, Phone, Mail, CalendarClock, ArrowDownToLine, ArrowUpFromLine, MonitorDot, Receipt,
  EyeOff, Edit3, Send, Save, Lock, AlertTriangle,
 Bell, Check, Sunrise, Sun, Sunset, Moon, Image as ImageIcon, ShoppingCart, Archive, ShoppingBag, Ban, Wrench
} from "lucide-react";
import "./CashierDashboard.css";

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

const CashierDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pos");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString()); 
  
  const [products, setProducts] = useState([]); 
  const [cart, setCart] = useState([]);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState(""); 
  const [customerId, setCustomerId] = useState("CUS-NEW");
  const [discount, setDiscount] = useState(0); 
  const [exchangeCredit, setExchangeCredit] = useState(0);

  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [showRequestItemsModal, setShowRequestItemsModal] = useState(false);

  const [compSearchQuery, setCompSearchQuery] = useState("");

  const [compatMode, setCompatMode] = useState('by_part'); // 'by_part' or 'by_vehicle'
  const [compatPartSearch, setCompatPartSearch] = useState('');
  const [compatVehicleBrand, setCompatVehicleBrand] = useState('');
  const [compatVehicleModel, setCompatVehicleModel] = useState('');
  const [vehicleBrandsList, setVehicleBrandsList] = useState([]); 


  const [allRequests, setAllRequests] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("All");
  const [orderViewTab, setOrderViewTab] = useState('active'); 
  const [showRecentCancelled, setShowRecentCancelled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);


  const [latestOrderId, setLatestOrderId] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null); 
  const [delayedOrderAlert, setDelayedOrderAlert] = useState(null); 
  const [dismissedDelayedOrders, setDismissedDelayedOrders] = useState([]); 
  const [sessionStartTime] = useState(Date.now()); 
  const [hasCheckedMissedOrders, setHasCheckedMissedOrders] = useState(false);

  const [returnSearchQuery, setReturnSearchQuery] = useState("");
  const [foundBill, setFoundBill] = useState(null);
  const [returnedBills, setReturnedBills] = useState([]); 
  const [returnCount, setReturnCount] = useState(0);
  const [showReturnHistoryModal, setShowReturnHistoryModal] = useState(false); 
  const [returnHistoryFilter, setReturnHistoryFilter] = useState("daily");
  
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false); 
  const [selectedReturnType, setSelectedReturnType] = useState(""); 
  const [returnItemsList, setReturnItemsList] = useState([]); 
  const [isReturnModified, setIsReturnModified] = useState(false); 
  const [showConfirmReturnModal, setShowConfirmReturnModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false); 
  const [showReturnReceipt, setShowReturnReceipt] = useState(false);
  const [returnReceiptData, setReturnReceiptData] = useState(null);

  const [salesHistory, setSalesHistory] = useState([]);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all"); 

  const [showBillView, setShowBillView] = useState(false); 
  const [isConfirmed, setIsConfirmed] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); 
  const [billIds, setBillIds] = useState({ billId: "", customerId: "" });

  const [isHistoryView, setIsHistoryView] = useState(false);
  const [historyBillDate, setHistoryBillDate] = useState("");
  const [historyBillTime, setHistoryBillTime] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  
  const [emailRequestStatus, setEmailRequestStatus] = useState("NONE");

  const [showNotifications, setShowNotifications] = useState(false);
  const [managerReplyNotification, setManagerReplyNotification] = useState(null);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  const generateLoginTime = () => {
    const now = new Date();
    return `${now.toLocaleDateString()} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getOrSetLoginTime = () => {
    let storedTime = localStorage.getItem("cashierLoginTime");
    if (!storedTime) {
        const now = new Date();
        storedTime = `${now.toLocaleDateString()} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        localStorage.setItem("cashierLoginTime", storedTime);
    }
    return storedTime;
  };

 const [profileData, setProfileData] = useState({
    name: "Loading...",
    role: "Loading...",
    employeeId: "Loading...",
    branch: "Loading...",
    contact: "Loading...",
    email: "Loading...",
    password: "", 
    address: "", 
    status: "Active Shift",
    joinedDate: "Loading...",
    counter: "Counter 01",
    loginTime: getOrSetLoginTime() 
  });

const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
        try { await axios.post(`http://localhost:8080/api/users/logout/${userId}`); } catch (error) {}
    }
    localStorage.removeItem("cashierLoginTime");
    localStorage.removeItem("userId"); 
    

    window.location.href = "/"; 
  };

  useEffect(() => {
    let lastDay = new Date().getDate();
    const timer = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
        setCurrentDate(now.toLocaleDateString());
        if (now.getDate() !== lastDay) {
            lastDay = now.getDate();
            fetchSalesHistory(); 
            fetchReturns(); 
            fetchDailyProfit();
        }
    }, 1000);
    
    fetchProducts(); 
    fetchReturns(); 
    fetchSalesHistory();
    fetchDailyProfit();
    fetchUserProfile(); 
    fetchOrderRequests();

    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
      if (allRequests.length > 0 && !hasCheckedMissedOrders) {
          const offlinePendingOrdersCount = allRequests.filter(o => {
              const isPending = (o.status || 'Pending').toLowerCase() === 'pending';
              const orderTime = new Date(o.createdAt || o.orderDate).getTime();
              return isPending && (orderTime < sessionStartTime); // Only orders came before login
          }).length;
          
          if (offlinePendingOrdersCount > 0) {
              setNewOrderAlert({ isMissedAlert: true, count: offlinePendingOrdersCount });
              const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
              audio.play().catch(e => console.log("Audio blocked"));
          }
          setHasCheckedMissedOrders(true); 
      }
  }, [allRequests, hasCheckedMissedOrders, sessionStartTime]);


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
                                  body: `${orders[0].customerName || 'A customer'} placed an order. Total: LKR ${orders[0].totalAmount?.toLocaleString()}`
                              });
                          }
                          setTimeout(() => { setNewOrderAlert(null); }, 15000);
                          
                          const enrichedOrders = orders.map(o => ({
                              ...o,
                              localUpdateTime: o.updatedAt ? new Date(o.updatedAt).getTime() : new Date(o.createdAt || o.orderDate).getTime()
                          }));
                          setAllRequests([...enrichedOrders].reverse()); 
                      }
                      return currentLatestId;
                  });
              }
          } catch (error) {}
      };
      const interval = setInterval(checkNewOrders, 10000);
      return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const checkDelayedOrders = () => {
        if (!allRequests || allRequests.length === 0) return;
        const now = new Date().getTime();
        const twoHoursInMs = 2 * 60 * 60 * 1000; 

        const delayedOrder = allRequests.find(o => {
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
  }, [allRequests, dismissedDelayedOrders]);

  useEffect(() => {
    const checkManagerReply = async () => {
        if (profileData.email && profileData.email !== "Loading...") {
            try {
                const resStatus = await axios.get(`http://localhost:8080/api/notifications/my-email-request-status?email=${profileData.email}`);
                setEmailRequestStatus(resStatus.data.status);
                
                const resResult = await axios.get(`http://localhost:8080/api/notifications/my-email-result?email=${profileData.email}`);
                if (resResult.data) {
                    setManagerReplyNotification(resResult.data);
                } else {
                    setManagerReplyNotification(null);
                }

                if (resStatus.data.status === "RESOLVED" && emailRequestStatus === "PENDING") {
                    fetchUserProfile(); 
                }
            } catch(e) {}
        }
    };
    checkManagerReply();
    const statusInterval = setInterval(checkManagerReply, 10000); 
    return () => clearInterval(statusInterval);
  }, [profileData.email, emailRequestStatus]);

const fetchUserProfile = async () => {
  try {
    const loggedInUserId = localStorage.getItem("userId");

    if (!loggedInUserId) {
      alert("User session not found. Please login again.");
      navigate("/");
      return;
    }

    const response = await axios.get(`http://localhost:8080/api/users/${loggedInUserId}`);

    if (response.data) {
      setProfileData(prev => ({
        ...prev,
        name: response.data.name || prev.name,
        email: response.data.gmail || response.data.email || prev.email, 
        password: response.data.password || prev.password, 
        contact: response.data.contactNo || response.data.contact || prev.contact, 
        employeeId: response.data.employeeId || prev.employeeId,
        joinedDate: response.data.joinedDate || prev.joinedDate,
        branch: response.data.branch || prev.branch,
        address: response.data.address || "", 
        role: response.data.role || prev.role
      }));
    }
  } catch (error) {
    console.error("Database Connection Error!", error);
  }
};
  useEffect(() => {
    const handleAfterPrint = () => { handleCancelAndClear(); };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handleBackButton = (e) => {
      window.history.pushState(null, null, window.location.pathname);
    };
    window.addEventListener('popstate', handleBackButton);
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'profit' || activeTab === 'history' || activeTab === 'profile') {
        fetchSalesHistory(); 
        fetchReturns();
    } else if (activeTab === 'requests') {
        fetchOrderRequests(); 
    } 
  }, [activeTab]);

 const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/spareparts/all");
      const prods = Array.isArray(response.data) ? response.data : [];
      setProducts(prods);


      const extractedBrands = [...new Set(prods.map(p => p.brand || p.partCategory).filter(Boolean))].sort();
      setVehicleBrandsList(extractedBrands);
    } catch (error) { console.error("Error products:", error); }
  };

  const fetchDailyProfit = async () => {
    try {
        const response = await axios.get("http://localhost:8080/api/sales/daily-profit");
        setDailyProfit(response.data);
    } catch (error) { console.error("Error profit:", error); }
  };

  const fetchOrderRequests = async () => {
    try {
        const response = await axios.get("http://localhost:8080/api/orders/all");
        const rawOrders = Array.isArray(response.data) ? response.data : [];
        if (rawOrders.length > 0) { 
            setLatestOrderId(prev => prev === null ? rawOrders[0].id : prev); 
        }
        const enrichedOrders = rawOrders.map(o => ({
            ...o,
            localUpdateTime: o.updatedAt ? new Date(o.updatedAt).getTime() : new Date(o.createdAt || o.orderDate).getTime()
        }));
        setAllRequests([...enrichedOrders].reverse());
    } catch (error) { 
        console.error("Error fetching orders:", error); 
        setAllRequests([]); 
    }
  };

  const fetchSalesHistory = async () => {
    try {
        const response = await axios.get("http://localhost:8080/api/sales/all");
        setSalesHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) { console.error("Error history:", error); }
  };

  const fetchReturns = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/returns/all");
      const data = Array.isArray(response.data) ? response.data : [];
      setReturnedBills(data);
      setReturnCount(data.length); 
    } catch (error) { console.error("Error returns:", error); }
  };


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
        setAllRequests(allRequests.map(o => o.id === order.id ? { ...o, status: 'Verified', localUpdateTime: Date.now() } : o));
        alert("✅ Order Verified Successfully!");
        if(showOrderModal) setShowOrderModal(false);
    } catch (error) {
        setAllRequests(allRequests.map(o => o.id === order.id ? { ...o, status: 'Verified', localUpdateTime: Date.now() } : o));
        alert("✅ Order Verified!");
        if(showOrderModal) setShowOrderModal(false);
    }
  };

  const handleCompleteOrder = async (order, e) => {
    if (e) e.stopPropagation();
    try {
        await axios.put(`http://localhost:8080/api/orders/update-status/${order.id}`, { status: 'Completed' });
        setAllRequests(allRequests.map(o => o.id === order.id ? { ...o, status: 'Completed', localUpdateTime: Date.now() } : o));
        alert("✅ Order marked as Completed!");
        if(showOrderModal) setShowOrderModal(false);
    } catch (error) {
        setAllRequests(allRequests.map(o => o.id === order.id ? { ...o, status: 'Completed', localUpdateTime: Date.now() } : o));
        alert("✅ Order marked as Completed!");
        if(showOrderModal) setShowOrderModal(false);
    }
  };

  const handlePickupOrder = async (order, e) => {
    if (e) e.stopPropagation();
    if(!window.confirm(`Are you sure you want to mark Order #ORD-${order.id} as Picked Up? Stock will be deducted.`)) return;

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
        setAllRequests(allRequests.map(o => o.id === order.id ? { ...o, status: 'Picked Up', localUpdateTime: Date.now() } : o));
        alert("✅ Order marked as Picked Up & Stock Deducted!");
        if(showOrderModal) setShowOrderModal(false);
    } catch (error) {
        alert("✅ Order marked as Picked Up (UI Fallback)!");
        if(showOrderModal) setShowOrderModal(false);
    }
  };

  const handleCancelOrder = async (order, e) => {
    if (e) e.stopPropagation();
    if(window.confirm("Are you sure you want to cancel this order?")) {
        try {
            await axios.put(`http://localhost:8080/api/orders/update-status/${order.id}`, { status: 'Cancelled' });
            setAllRequests(allRequests.map(o => o.id === order.id ? { ...o, status: 'Cancelled', localUpdateTime: Date.now() } : o));
            alert("✅ Order Cancelled Successfully!");
            if(showOrderModal) setShowOrderModal(false);
        } catch (error) {
            setAllRequests(allRequests.map(o => o.id === order.id ? { ...o, status: 'Cancelled', localUpdateTime: Date.now() } : o));
            if(showOrderModal) setShowOrderModal(false);
        }
    }
  };

  const handleReturnBillSearch = async () => {
    if (!returnSearchQuery) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/sales/find/${returnSearchQuery}`);
      if (response.data) {
        const saleDate = new Date(response.data.saleDate);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - saleDate) / (1000 * 60 * 60 * 24)); 
        if (diffDays > 7) {
          alert(`❌ Return Period Expired!\n\nමෙම බිල්පත නිකුත් කර දින ${diffDays} ක් ගතවී ඇත. භාණ්ඩ මාරු කළ හැක්කේ දින 7ක් ඇතුළත පමණි.`);
          setFoundBill(null); 
          return; 
        }
        setFoundBill(response.data);
      } else {
        alert("Bill Not Found!");
      }
    } catch (error) { alert("Invalid Bill ID or Server Error"); }
  };

  const startReturnFlow = () => {
    const subTotal = (foundBill.items || []).reduce((sum, item) => sum + ((item.price || item.sellingPrice) * (item.quantity || item.qty)), 0);
    const discountMultiplier = subTotal > 0 ? (foundBill.totalAmount / subTotal) : 1;

    const initialList = (foundBill.items || []).map(item => {
      const alreadyReturnedLogs = returnedBills.filter(rb => rb.billId === foundBill.billId && rb.productCode === item.productCode);
      const alreadyReturnedQty = alreadyReturnedLogs.reduce((sum, rb) => sum + (rb.quantity || 0), 0);
      
      const purchasedQty = item.quantity || item.qty || 1;
      const maxReturnable = Math.max(0, purchasedQty - alreadyReturnedQty);
      const actualPaidPrice = Math.round((item.price || item.sellingPrice) * discountMultiplier);

      return { 
        ...item, 
        purchasedQty: purchasedQty,
        maxReturnable: maxReturnable,
        actualPaidPrice: actualPaidPrice, 
        returnQty: 0 
      };
    });
    setReturnItemsList(initialList);
    setIsReturnModified(false);
    setIsReturnModalOpen(true); 
  };

  const increaseReturnQty = (index) => {
    const newList = [...returnItemsList];
    const maxQty = newList[index].maxReturnable; 
    if (newList[index].returnQty < maxQty) {
        newList[index].returnQty += 1;
        setReturnItemsList(newList);
        setIsReturnModified(true);
    } else if (maxQty === 0) {
        alert("This item has already been fully returned!");
    }
  };

  const decreaseReturnQty = (index) => {
    const newList = [...returnItemsList];
    if (newList[index].returnQty > 0) { 
        newList[index].returnQty -= 1;
        setReturnItemsList(newList);
        setIsReturnModified(true);
    }
  };

  const getReturnTotalRefund = () => returnItemsList.reduce((acc, item) => acc + (item.returnQty * item.actualPaidPrice), 0);

  const handleCancelReturnBtn = () => {
    if (isReturnModified) setShowCancelConfirmModal(true); 
    else setIsReturnModalOpen(false); 
  };

  const handleInitiateReturn = (type) => {
    const selectedItems = returnItemsList.filter(i => i.returnQty > 0);
    if(selectedItems.length === 0) {
        alert("❌ කරුණාකර Return කිරීමට අවශ්‍ය භාණ්ඩවල ප්‍රමාණය (+) බොත්තම ඔබා තෝරන්න.");
    } else {
        setSelectedReturnType(type); 
        setShowConfirmReturnModal(true);
    }
  };

 const finalConfirmReturn = async () => {
    const itemsToProcess = returnItemsList.filter(item => item.returnQty > 0);
    try {
      const newReturnRecords = [];
      const totalRefundAmt = getReturnTotalRefund();
      
      for (const item of itemsToProcess) {
          const returnData = {
            billId: foundBill.billId, 
            productCode: item.productCode, 
            productName: item.productName,
            quantity: item.returnQty, 
            refundAmount: item.returnQty * item.actualPaidPrice, 
            returnDate: new Date().toISOString(), 
            returnType: selectedReturnType 
          };
          await axios.post("http://localhost:8080/api/returns/add", returnData);
          newReturnRecords.push(returnData);
      }
      
      setReturnCount(prev => prev + newReturnRecords.length);
      setReturnedBills([...returnedBills, ...newReturnRecords]); 
      
      if (selectedReturnType === "Cash Return") {
         setReturnReceiptData({ billId: foundBill.billId, items: itemsToProcess, totalAmount: totalRefundAmt, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() });
         setShowReturnReceipt(true);
      } else if (selectedReturnType === "Product Return") {
         setExchangeCredit(totalRefundAmt);
         setActiveTab("pos"); 
         alert(`Exchange Credit of Rs. ${totalRefundAmt.toLocaleString()} added to your POS terminal. Please add the new items to the cart.`);
      }
      
      setIsReturnModalOpen(false); setReturnItemsList([]); setSelectedReturnType("");
      setShowConfirmReturnModal(false); setFoundBill(null); setReturnSearchQuery("");
      fetchProducts(); fetchSalesHistory(); fetchDailyProfit();
    } catch (error) { alert(error.response?.data || "Error processing return"); }
  };

  const getFilteredReturnHistory = () => {
    const now = new Date();
    return returnedBills.filter(rb => {
      const rbDate = new Date(rb.returnDate);
      if (returnHistoryFilter === "daily") return rbDate.toDateString() === now.toDateString();
      if (returnHistoryFilter === "weekly") return (now - rbDate) / (1000 * 60 * 60 * 24) <= 7;
      if (returnHistoryFilter === "monthly") return rbDate.getMonth() === now.getMonth() && rbDate.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const filteredProducts = products.filter((p) => p.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) || p.productName?.toLowerCase().includes(searchQuery.toLowerCase()));

  const addToCart = (product) => {
    if (product.stockQty <= 0) { 
        alert(`❌ Out of Stock!\n\n${product.productName} is currently out of stock.`); 
        return; 
    }
    
    const exist = cart.find((x) => x.productCode === product.productCode);
    if (exist) {
        if(exist.qty >= product.stockQty) { 
            alert(`⚠️ Maximum Stock Reached!\n\nYou cannot add more than ${product.stockQty} items of ${product.productName}.`); 
            return; 
        }
        setCart(cart.map((item) => item.productCode === product.productCode ? { ...item, qty: item.qty + 1 } : item));
    } else { 
        setCart([...cart, { ...product, qty: 1 }]); 
    }
  };

  const updateQty = (code, delta) => {
      const exist = cart.find((x) => x.productCode === code);
      const productInDB = products.find((p) => p.productCode === code);

      if (!exist || !productInDB) return;

      const newQty = exist.qty + delta;

      if (newQty > productInDB.stockQty) {
          alert(`⚠️ Maximum Stock Reached!\n\nOnly ${productInDB.stockQty} items available in stock for ${productInDB.productName}.`);
          return;
      }

      setCart(cart.map((item) => item.productCode === code ? { ...item, qty: Math.max(1, newQty) } : item));
  };

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      const exactMatch = products.find(p => p.productCode?.toLowerCase() === searchQuery.toLowerCase());
      if (exactMatch) { addToCart(exactMatch); setSearchQuery(""); }
    }
  };

  const removeFromCart = (code) => setCart(cart.filter((x) => x.productCode !== code));
  
  const getSubTotal = () => cart.reduce((acc, item) => acc + item.sellingPrice * item.qty, 0);
  const getDiscountAmount = () => (getSubTotal() * discount) / 100;
  const getNetTotal = () => getSubTotal() - getDiscountAmount() - exchangeCredit;

  const handleOpenBill = (method) => {
    if (!isEditMode) setBillIds({ billId: "INV-" + Math.floor(Date.now() / 1000), customerId: "CUS-" + Math.floor(1000 + Math.random() * 9000) });
    setSelectedPaymentMethod(method); setShowPaymentModal(false); setShowBillView(true); setIsConfirmed(false); setIsHistoryView(false); 
  };

  const finalConfirmPayment = async () => {
    if(getNetTotal() < 0) {
        alert("Transaction complete. Refund balance returned to customer.");
        handleCancelAndClear();
        return;
    }

    const saleData = { billId: billIds.billId, customerId: billIds.customerId, totalAmount: getNetTotal(), paymentMethod: selectedPaymentMethod, items: cart };
    try {
        await axios.post("http://localhost:8080/api/sales/add", saleData);
        setIsConfirmed(true); setIsEditMode(false);
        fetchSalesHistory(); fetchProducts(); fetchDailyProfit();
    } catch (error) { alert("Backend Error!"); }
  };

  const handleEditBill = () => { setShowBillView(false); setIsEditMode(true); };
  const handleCancelAndClear = () => {
    setCart([]); setDiscount(0); setExchangeCredit(0); setIsEditMode(false);
    setShowBillView(false); setIsConfirmed(false); setIsHistoryView(false); setShowReturnReceipt(false); setReturnReceiptData(null);
  };

  const handlePayClick = () => {
    if (cart.length === 0 && exchangeCredit === 0) { alert("Cart is empty!"); return; }
    if (isEditMode) setShowBillView(true); else setShowPaymentModal(true);
  };

  const getFilteredHistory = () => {
    const now = new Date();
    const historyData = Array.isArray(salesHistory) ? salesHistory : [];
    return historyData.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      if (historyFilter === "daily") return saleDate.toDateString() === now.toDateString();
      if (historyFilter === "weekly") return (now - saleDate) / (1000 * 60 * 60 * 24) <= 7;
      if (historyFilter === "monthly") return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      return true;
    }).filter(s => s.billId?.toLowerCase().includes(historySearchQuery.toLowerCase()));
  };

  const getRefundAmountForBill = (billId) => {
      return returnedBills
        .filter(rb => rb.billId === billId)
        .reduce((sum, rb) => sum + rb.refundAmount, 0);
  };

  const viewPastBill = (sale) => {
    setBillIds({ billId: sale.billId, customerId: sale.customerId });
    setCart(sale.items || []);
    setSelectedPaymentMethod(sale.paymentMethod);
    setExchangeCredit(0); 
    const pastDate = new Date(sale.saleDate);
    setHistoryBillDate(pastDate.toLocaleDateString());
    setHistoryBillTime(pastDate.toLocaleTimeString());
    setIsConfirmed(true); setIsHistoryView(true); setShowBillView(true);
  };

  const handleEmailRequestSubmit = async () => {
      if(!newEmailInput || !newEmailInput.includes("@")) {
          alert("Please enter a valid Gmail address.");
          return;
      }
      
      try {
          await axios.post('http://localhost:8080/api/notifications/request-email-change', {
              currentEmail: profileData.email,
              newEmail: newEmailInput
          });
          
          setEmailRequestStatus("PENDING"); 
          setShowEmailModal(false);
          alert(`📨 Request sent to Manager!\n\nAn approval request to change your email from [${profileData.email}] to [${newEmailInput}] has been securely submitted.`);
      } catch (error) {
          alert(error.response?.data?.error || "Failed to send request to the manager.");
      }
  };

  const handleProfileSave = async () => {
  try {
    const loggedInUserId = localStorage.getItem("userId");

    if (!loggedInUserId) {
      alert("User session not found. Please login again.");
      navigate("/");
      return;
    }

    const backendPayload = {
      name: editFormData.name,
      contactNo: editFormData.contact, 
      branch: editFormData.branch,
      address: editFormData.address 
    };

    await axios.put(`http://localhost:8080/api/users/update/${loggedInUserId}`, backendPayload);

    setProfileData(prevData => ({
      ...prevData,
      name: editFormData.name,
      contact: editFormData.contact,
      branch: editFormData.branch,
      address: editFormData.address 
    }));

    setShowEditProfileModal(false); 
    alert("✅ Profile Updated Successfully in Database!");
  } catch (error) {
    console.error("Profile update error", error);
    setProfileData(prevData => ({
      ...prevData,
      name: editFormData.name,
      contact: editFormData.contact,
      branch: editFormData.branch,
      address: editFormData.address
    }));
    setShowEditProfileModal(false);
    alert("Profile details updated locally! (Backend API /update failed)");
  }
};

  const handlePasswordSubmit = async () => {
  if (!newPasswordInput || newPasswordInput.length < 4) {
    alert("Password must be at least 4 characters long.");
    return;
  }

  if (newPasswordInput !== confirmPasswordInput) {
    alert("Passwords do not match! Please verify.");
    return;
  }

  try {
    const loggedInUserId = localStorage.getItem("userId");

    if (!loggedInUserId) {
      alert("User session not found. Please login again.");
      navigate("/");
      return;
    }

    await axios.put(`http://localhost:8080/api/users/update/${loggedInUserId}`, { password: newPasswordInput });

    setProfileData(prev => ({ ...prev, password: newPasswordInput }));
    setShowPasswordModal(false);
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    alert("Password Updated Successfully in Database!");
  } catch (error) {
    console.error("Password update error", error);
    setProfileData(prev => ({ ...prev, password: newPasswordInput }));
    setShowPasswordModal(false);
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    alert("Password updated locally! (Backend API error)");
  }
};

  const calculateShiftStats = () => {
    const todayStr = new Date().toDateString();
    
    const todaySalesData = salesHistory.filter(s => new Date(s.saleDate).toDateString() === todayStr);
    const todayGrossSales = todaySalesData.reduce((sum, s) => sum + s.totalAmount, 0);

    const todayReturnsData = returnedBills.filter(rb => new Date(rb.returnDate).toDateString() === todayStr);
    
    let returnsFromTodayBills = 0;
    let returnsFromPastBills = 0;

    todayReturnsData.forEach(rb => {
        const originalSale = salesHistory.find(s => s.billId === rb.billId);
        if (originalSale && new Date(originalSale.saleDate).toDateString() === todayStr) {
            returnsFromTodayBills += (rb.refundAmount || 0);
        } else {
            returnsFromPastBills += (rb.refundAmount || 0);
        }
    });

    const netDrawerCash = todayGrossSales - returnsFromTodayBills - returnsFromPastBills;

    return { todaySalesData, todayGrossSales, todayReturnsData, returnsFromTodayBills, returnsFromPastBills, netDrawerCash };
  };

  const dismissManagerReply = async () => {
      try {
          if(managerReplyNotification && managerReplyNotification.id) {
              await axios.post(`http://localhost:8080/api/notifications/reject/${managerReplyNotification.id}`); 
          }
      } catch (e) { console.warn(e); }
      setManagerReplyNotification(null); 
      setShowNotifications(false);
  }



  const renderProfit = () => {
    const { todayGrossSales, returnsFromTodayBills, returnsFromPastBills, netDrawerCash } = calculateShiftStats();

    return (
      <div style={{padding:'30px'}}>
        <h2 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom: '30px', color: '#1e293b'}}><BarChart3 color="#3b82f6"/> Financial Summary (Cash Drawer)</h2>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px'}}>
            <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} style={{background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px'}}><div style={{background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6'}}><ArrowUpFromLine size={24}/></div><span style={{color: '#64748b', fontWeight: '700', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px'}}>Gross Income (Today)</span></div>
                <h2 style={{fontSize: '36px', color: '#1e293b', fontWeight: '800'}}>Rs. {todayGrossSales.toLocaleString()}</h2>
                <p style={{fontSize: '13px', color: '#94a3b8', marginTop: '8px'}}>Total money generated from bills today.</p>
            </motion.div>

            <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.1}} style={{background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', cursor: 'pointer'}} onClick={() => { setReturnHistoryFilter('daily'); setShowReturnHistoryModal(true); }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px'}}><div style={{background: '#fef2f2', padding: '12px', borderRadius: '12px', color: '#ef4444'}}><ArrowDownToLine size={24}/></div><span style={{color: '#64748b', fontWeight: '700', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px'}}>Today's Returns</span></div>
                <h2 style={{fontSize: '36px', color: '#ef4444', fontWeight: '800'}}>- Rs. {returnsFromTodayBills.toLocaleString()}</h2>
                <p style={{fontSize: '13px', color: '#94a3b8', marginTop: '8px'}}>Refunds for items sold <strong>today</strong>.</p>
            </motion.div>

            {returnsFromPastBills > 0 && (
                <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.15}} style={{background: '#fffbeb', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.1)', border: '1px solid #fde68a', cursor: 'pointer'}} onClick={() => { setReturnHistoryFilter('daily'); setShowReturnHistoryModal(true); }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px'}}><div style={{background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#f59e0b'}}><AlertTriangle size={24}/></div><span style={{color: '#b45309', fontWeight: '700', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px'}}>Past Bill Returns</span></div>
                    <h2 style={{fontSize: '36px', color: '#d97706', fontWeight: '800'}}>- Rs. {returnsFromPastBills.toLocaleString()}</h2>
                    <p style={{fontSize: '13px', color: '#b45309', marginTop: '8px'}}>Refunds done today for <strong>previous days'</strong> bills.</p>
                </motion.div>
            )}

            <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '30px', borderRadius: '20px', boxShadow: '0 15px 30px rgba(16, 185, 129, 0.3)', color: 'white'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px'}}><div style={{background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', color: 'white'}}><Banknote size={24}/></div><span style={{fontWeight: '700', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px'}}>Net Cash in Drawer</span></div>
                <h2 style={{fontSize: '42px', fontWeight: '900'}}>Rs. {netDrawerCash.toLocaleString()}</h2>
                <p style={{fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '8px'}}>Actual physical cash remaining after ALL returns.</p>
            </motion.div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const { todaySalesData, todayGrossSales, todayReturnsData, returnsFromTodayBills, returnsFromPastBills, netDrawerCash } = calculateShiftStats();
    const totalRefundAmount = returnsFromTodayBills + returnsFromPastBills;

    return (
      <div style={{padding:'30px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '85vh', background: '#f8fafc', paddingBottom: '60px'}}>
         <h2 style={{alignSelf: 'flex-start', display:'flex', alignItems:'center', gap:'10px', marginBottom: '30px', color: '#1e293b'}}>
            <User color="#3b82f6"/> Cashier Profile & Shift Details
         </h2>

         <div style={{width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start'}}>
            
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} style={{background:'#fff', padding:'35px 25px 40px 25px', borderRadius:'16px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '75vh', overflowY: 'auto', width: '100%', boxSizing: 'border-box'}}>
                <div style={{width: '120px', height: '120px', borderRadius: '50%', background: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)', flexShrink: 0}}>
                    <User size={60} color="#fff" />
                </div>
                <h2 style={{margin: '0 0 10px 0', color: '#1e293b', fontSize: '24px', fontWeight: '800', textAlign:'center'}}>{profileData.name}</h2>
                <span style={{background: '#ecfdf5', color: '#10b981', padding: '5px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '25px', border: '1px solid #a7f3d0'}}>Active Shift</span>
                
                <hr style={{width: '100%', borderTop: '1px dashed #cbd5e1', borderBottom:'none', margin: '0 0 20px 0'}}/>
                
                <div style={{width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '10px'}}>
                    <p style={{color: '#475569', fontSize: '14px', margin: 0}}><strong style={{color: '#1e293b'}}>EMP ID:</strong> {profileData.employeeId}</p>
                    <p style={{color: '#475569', fontSize: '14px', margin: 0}}><strong style={{color: '#1e293b'}}>Role:</strong> {profileData.role}</p>
                    <p style={{color: '#475569', fontSize: '14px', margin: 0}}><strong style={{color: '#1e293b'}}>Branch:</strong> {profileData.branch}</p>
                    <p style={{color: '#475569', fontSize: '14px', margin: 0}}><strong style={{color: '#1e293b'}}>Address:</strong> {profileData.address || "Not provided"}</p>
                    
                    <hr style={{borderTop: '1px solid #e2e8f0', borderBottom:'none', margin: '5px 0'}}/>

                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                           <strong style={{color: '#1e293b', fontSize: '14px'}}>Gmail Account:</strong>
                           <button onClick={() => setShowEmailModal(true)} style={{background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding:0}}>
                               <Edit3 size={12}/> Change
                           </button>
                        </div>
                        <div style={{background: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                           <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{profileData.email}</span>
                           {emailRequestStatus === 'PENDING' && <span style={{background: '#fffbeb', color: '#f59e0b', fontSize: '10px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #fde68a', marginLeft: '5px', fontWeight: 'bold'}}>Pending</span>}
                           {emailRequestStatus === 'REJECTED' && <span style={{background: '#fef2f2', color: '#ef4444', fontSize: '10px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #fca5a5', marginLeft: '5px', fontWeight: 'bold'}} title="Manager rejected your request">Declined ❌</span>}
                        </div>
                    </div>

                    <div style={{marginTop: '5px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                           <strong style={{color: '#1e293b', fontSize: '14px'}}>Login Password:</strong>
                           <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                               <button onClick={() => setShowPassword(!showPassword)} style={{background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding:0, display: 'flex', alignItems: 'center'}}>
                                   {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                               </button>
                               <button onClick={() => setShowPasswordModal(true)} style={{background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding:0}}>
                                   <Edit3 size={12}/> Change
                               </button>
                           </div>
                        </div>
                        <div style={{background: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569', letterSpacing: showPassword ? '0px' : '3px'}}>
                           {showPassword ? profileData.password : '••••••••••••'}
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} style={{display: 'flex', flexDirection: 'column', gap: '25px', width: '100%'}}>
                <div style={{background:'#fff', padding:'35px', borderRadius:'16px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'}}>
                    <h3 style={{color: '#0f172a', margin: '0 0 25px 0', fontSize: '20px'}}>Current Shift Information</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        
                        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9'}}>
                            <span style={{display: 'flex', alignItems:'center', gap:'8px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800'}}><MonitorDot size={16}/> Register / Till</span>
                            <p style={{color: '#1e293b', fontSize: '20px', fontWeight: '800', margin: '8px 0 0 0'}}>{profileData.counter}</p>
                        </div>
                        
                        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9'}}>
                            <span style={{display: 'flex', alignItems:'center', gap:'8px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800'}}><Clock size={16}/> Login Time</span>
                            <p style={{color: '#1e293b', fontSize: '18px', fontWeight: '800', margin: '8px 0 0 0'}}>{profileData.loginTime}</p>
                        </div>
                        
                        <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => setActiveTab('history')} style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', cursor: 'pointer'}}>
                            <span style={{display: 'flex', alignItems:'center', gap:'8px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800'}}><Receipt size={16}/> Bills Processed</span>
                            <p style={{color: '#1e293b', fontSize: '20px', fontWeight: '800', margin: '8px 0 0 0'}}>{todaySalesData.length} Bills</p>
                        </motion.div>
                        
                        <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => setActiveTab('profit')} style={{background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe', cursor: 'pointer'}}>
                            <span style={{display: 'flex', alignItems:'center', gap:'8px', color: '#3b82f6', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800'}}><Package size={16}/> Total Gross Sales</span>
                            <p style={{color: '#1d4ed8', fontSize: '20px', fontWeight: '900', margin: '8px 0 0 0'}}>Rs. {todayGrossSales.toLocaleString()}</p>
                        </motion.div>
                        
                        <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => { setActiveTab('returns'); setShowReturnHistoryModal(true); setReturnHistoryFilter('daily'); }} style={{background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca', cursor: 'pointer'}}>
                            <span style={{display: 'flex', alignItems:'center', gap:'8px', color: '#ef4444', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800'}}><RotateCcw size={16}/> Returns ({todayReturnsData.length})</span>
                            <p style={{color: '#b91c1c', fontSize: '20px', fontWeight: '900', margin: '8px 0 0 0'}}>- Rs. {totalRefundAmount.toLocaleString()}</p>
                        </motion.div>
                        
                        <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => setActiveTab('profit')} style={{background: '#ecfdf5', padding: '20px', borderRadius: '12px', border: '1px solid #a7f3d0', cursor: 'pointer'}}>
                            <span style={{display: 'flex', alignItems:'center', gap:'8px', color: '#10b981', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800'}}><Banknote size={16}/> Net Sales (Shift)</span>
                            <p style={{color: '#047857', fontSize: '20px', fontWeight: '900', margin: '8px 0 0 0'}}>Rs. {netDrawerCash.toLocaleString()}</p>
                        </motion.div>

                    </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                    <motion.button 
                        whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} 
                        onClick={() => { setEditFormData(profileData); setShowEditProfileModal(true); }}
                        style={{flex: 1, background: '#f8fafc', color: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                    >
                        <Edit3 size={18}/> Edit Profile Info
                    </motion.button>
                    
                    <motion.button onClick={handleLogout} whileHover={{scale: 1.02, boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)"}} whileTap={{scale: 0.98}} style={{flex: 1, background: '#ef4444', color: '#fff', padding: '20px', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                        <LogOut size={20}/> End Shift & Logout
                    </motion.button>
                </div>
            </motion.div>
         </div>
      </div>
    );
  };

  const renderPOS = () => {
    const netTotal = getNetTotal();
    const isRefundBalance = netTotal < 0;
    const displayNetTotal = Math.abs(netTotal);
    

    const greeting = getGreetingDetails();
    const firstName = profileData.name !== "Loading..." ? profileData.name.split(' ')[0] : "Cashier";

    return (
      <div className="pos-layout">
        
       {/* 🟢 NEW GREETING & INFO HEADER (Like Manager Dashboard) */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{
                background: '#fff', 
                borderRadius: '16px', 
                padding: '20px 25px', 
                marginBottom: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Left Side: Greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative', zIndex: 1 }}>
                <div style={{ background: `${greeting.color}15`, padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {greeting.icon}
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b', fontWeight: '800' }}>
                        {greeting.text}, <span style={{ color: '#3b82f6' }}>{firstName}!</span> 👋
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px', fontWeight: '400' }}>
                        Here is what's happening in your store today.
                    </p>
                </div>
            </div>

            {/* Right Side: Time and Date Stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                    <CalendarClock size={20} color="#3b82f6"/>
                    <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.5px' }}>{currentTime}</span>
                </div>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
        </motion.div>

        <div className="pos-content-wrapper">
           <div className="product-section">
              <div className="search-bar-row">
                  <div className="search-input" style={{width: '100%', position:'relative'}}>
                      <Search size={20} color="#666" style={{position:'absolute', top:'12px', left:'15px'}}/>
                      <input type="text" placeholder="Scan Barcode / Type Name..." style={{width:'100%', padding:'12px 45px'}} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchEnter} autoFocus />
                      {searchQuery && <X size={18} color="#999" style={{position:'absolute', top:'14px', right:'15px', cursor:'pointer'}} onClick={() => setSearchQuery("")} />}
                  </div>
              </div>
              <div className="products-grid">
                 {filteredProducts.map(item => (
                    <motion.div whileTap={{scale:0.95}} key={item.productCode} className="product-card" onClick={()=>addToCart(item)}>
                       <Package size={24}/><h3>{item.productName}</h3><p className="price">Rs. {item.sellingPrice}</p>
                       <div style={{display:'flex', justifyContent:'space-between', width:'100%', marginTop:'auto'}}><span style={{fontSize:'11px', background:'#f3f4f6', padding:'2px 6px', borderRadius:'4px'}}>{item.productCode}</span><span style={{color: item.stockQty < 5 ? 'red' : 'green', fontWeight:'bold', fontSize:'12px'}}>Stock: {item.stockQty}</span></div>
                    </motion.div>
                 ))}
              </div>
           </div>
           <div className="cart-section">
              <h2>Current Order</h2>
              <div className="cart-items">
                 {cart.length === 0 ? <p style={{textAlign:'center', marginTop:'20px'}}>Cart is Empty</p> :
                   cart.map(item=>(
                    <div key={item.productCode} className="cart-item">
                       <div><h4>{item.productName}</h4><small>Rs. {item.sellingPrice}</small></div>
                       <div className="qty-wrapper"><button onClick={()=>updateQty(item.productCode, -1)} className="qty-btn"><Minus size={14}/></button><span>{item.qty}</span><button onClick={()=>updateQty(item.productCode, 1)} className="qty-btn plus"><Plus size={14}/></button></div>
                       <div>{(item.sellingPrice * item.qty).toLocaleString()}</div><button onClick={()=>removeFromCart(item.productCode)} className="remove-btn"><X size={16}/></button>
                    </div>
                 ))}
              </div>
              <div className="cart-footer">
                 <div className="disc-row" style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                    {[0, 5, 10, 15, 20].map(d => (
                      <button key={d} onClick={() => setDiscount(d)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: discount === d ? '#f97316' : '#fff', color: discount === d ? '#fff' : '#000', cursor: 'pointer', fontWeight: 'bold' }}>{d}%</button>
                    ))}
                 </div>
                 <div className="totals">
                    <div className="row"><span>Subtotal</span><span>{getSubTotal().toLocaleString()}</span></div>
                    {discount > 0 && <div className="row" style={{color:'red'}}><span>Discount ({discount}%)</span><span>-{getDiscountAmount().toLocaleString()}</span></div>}
                    {exchangeCredit > 0 && <div className="row" style={{color:'#f97316', fontWeight:'bold'}}><span>Exchange Credit</span><span>-Rs. {exchangeCredit.toLocaleString()}</span></div>}
                    <div className="row grand" style={{ color: isRefundBalance ? '#ef4444' : '#0f172a' }}><span>{isRefundBalance ? "Refund Balance" : "Net Total"}</span><span>Rs. {displayNetTotal.toLocaleString()}</span></div>
                 </div>
                 {exchangeCredit > 0 && <button className="qty-btn" style={{width:'100%', marginBottom:'10px', background:'#fef2f2', color:'#ef4444', border:'1px solid #fca5a5', padding:'8px', borderRadius:'8px', cursor:'pointer'}} onClick={() => setExchangeCredit(0)}>Clear Exchange Credit</button>}
                 <button className="pay-btn" onClick={handlePayClick} style={{ background: isRefundBalance ? '#ef4444' : '#0f172a' }}>{isRefundBalance ? "CONFIRM EXCHANGE (REFUND)" : (isEditMode ? "CONFIRM ORDER" : "PAY NOW")}</button>
              </div>
           </div>
        </div>
      </div>
    );
  };


  const renderCustomerRequests = () => {
      let displayedOrders = [];


      if (orderViewTab === 'active') {
          displayedOrders = allRequests.filter(o => {
              const status = (o.status || 'Pending').toLowerCase();
              if (['pending', 'verified', 'completed'].includes(status)) return true;
              if (status === 'picked up') return getMinutesPassed(o.orderDate, o.localUpdateTime) < 10;
              if (status === 'cancelled' && showRecentCancelled) return getMinutesPassed(o.orderDate, o.localUpdateTime) < (24 * 60); 
              return false;
          });
      } else {
          displayedOrders = allRequests.filter(o => {
              const status = (o.status || 'Pending').toLowerCase();
              if (status === 'picked up') return getMinutesPassed(o.orderDate, o.localUpdateTime) >= 10;
              if (status === 'cancelled') return getMinutesPassed(o.orderDate, o.localUpdateTime) >= (24 * 60);
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
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="tab-content" style={{padding: '30px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px'}}>
             <div>
               <h2 style={{margin: '0 0 5px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px'}}><ShoppingCart color="#f97316"/> Customer Orders</h2>
               <p style={{margin: 0, color: '#64748b', fontSize: '13px'}}>Monitor and verify incoming orders or check the archive</p>
             </div>
             <div className="search-input" style={{position:'relative'}}>
                 <Search size={18} color="#64748b" style={{position:'absolute', top:'10px', left:'15px'}}/>
                 <input type="text" placeholder="Search Order ID, Name, Phone..." value={orderSearch} onChange={(e)=>setOrderSearch(e.target.value)} style={{padding:'10px 10px 10px 40px', borderRadius:'8px', border:'1px solid #e2e8f0', width: '300px', outline: 'none', background:'#fff', color:'#1e293b'}} />
             </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
             <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={() => { setOrderViewTab('active'); setOrderFilter('All'); }} style={{padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: orderViewTab === 'active' ? '#0f172a' : 'transparent', color: orderViewTab === 'active' ? '#fff' : '#64748b', transition: 'all 0.2s'}}><ShoppingCart size={18}/> Active Orders</button>
                <button onClick={() => { setOrderViewTab('history'); setOrderFilter('All'); }} style={{padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: orderViewTab === 'history' ? '#0f172a' : 'transparent', color: orderViewTab === 'history' ? '#fff' : '#64748b', transition: 'all 0.2s'}}><Archive size={18}/> Order Archive (History)</button>
             </div>
             {orderViewTab === 'active' && (
                 <button onClick={() => setShowRecentCancelled(!showRecentCancelled)} style={{background: '#fff', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'}}>
                    {showRecentCancelled ? <EyeOff size={16}/> : <Eye size={16}/>} {showRecentCancelled ? "Hide Recent Cancelled" : "Show Recent Cancelled"}
                 </button>
             )}
          </div>

          <div style={{display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px'}}>
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
                       <tr key={ord.id} style={{borderTop: '1px solid #f1f5f9', cursor: 'pointer'}} onClick={() => { setSelectedOrder(ord); setShowOrderModal(true); }}>
                           <td style={{padding: '15px'}}><div style={{fontWeight: '900', color: '#f97316'}}>{ord.orderId || `#ORD-${ord.id}`}</div><div style={{fontSize: '11px', color: '#94a3b8', marginTop: '4px'}}>{new Date(ord.createdAt || ord.orderDate).toLocaleString()}</div></td>
                          <td><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><div style={{width: '35px', height: '35px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '12px'}}>{init}</div><div><div style={{fontWeight: 'bold', color: '#1e293b'}}>{ord.customerName || 'Walk-in Customer'}</div><div style={{fontSize: '12px', color: '#64748b'}}>{ord.phone || ord.contactNo || ord.contactNumber || ord.customerPhone || 'N/A'}</div></div></div></td>
                           <td style={{color: '#475569'}}><div style={{fontWeight: '500', color: '#1e293b'}}>{itemsText}</div><div style={{fontSize: '12px'}}>Qty: {qtyText}</div></td>
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

  const renderReturns = () => (
    <div style={{padding:'30px'}}>
      <h2 style={{display:'flex', alignItems:'center', gap:'10px'}}><RotateCcw color="#f97316"/> Returns Management</h2>
      <div style={{display:'flex', gap:'20px', margin:'20px 0'}}>
        <div className="search-input" style={{flex:1, position:'relative'}}>
          <Search size={18} color="#666" style={{position:'absolute', top:'12px', left:'15px'}}/>
          <input type="text" placeholder="Search Bill ID for Return..." style={{width:'100%', padding:'12px 45px', borderRadius:'10px', border:'1px solid #ddd'}} value={returnSearchQuery} onChange={(e)=>setReturnSearchQuery(e.target.value)} />
          <button onClick={handleReturnBillSearch} style={{position:'absolute', right:'5px', top:'5px', background:'#0f172a', color:'#fff', padding:'7px 15px', border:'none', borderRadius:'7px', cursor:'pointer'}}>Find Bill</button>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setReturnHistoryFilter('daily'); setShowReturnHistoryModal(true); }} style={{background:'#ef4444', color:'#fff', padding:'10px 25px', borderRadius:'10px', border:'none', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}><FileText size={18}/> View Return Bills ({returnCount})</motion.button>
      </div>

      {foundBill && (
        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="table-container" style={{background:'#fff', padding:'20px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead style={{background:'#f8fafc', textAlign:'left'}}><tr><th style={{padding:'15px'}}>Bill ID</th><th>Total Amount</th><th style={{textAlign:'right'}}>Action</th></tr></thead>
            <tbody>
              <tr style={{borderTop:'1px solid #eee'}}><td style={{padding:'15px'}}><strong>{foundBill.billId}</strong></td><td><strong style={{color:'#0f172a'}}>Rs. {foundBill.totalAmount?.toLocaleString()}</strong></td><td style={{textAlign:'right'}}><button onClick={startReturnFlow} style={{background:'#ef4444', color:'#fff', border:'none', padding:'8px 20px', borderRadius:'6px', cursor:'pointer', fontWeight: 'bold'}}>Return Items</button></td></tr>
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );

 const renderHistory = () => {
    const filtered = getFilteredHistory();
    return (
      <div style={{padding:'30px'}}>
        <h2 style={{display:'flex', alignItems:'center', gap:'10px'}}><History color="#f97316"/> Sales History</h2>
        <div style={{display:'flex', gap:'10px', margin:'20px 0'}}>
          {["all", "daily", "weekly", "monthly"].map(f => (
            <button key={f} onClick={()=>setHistoryFilter(f)} style={{padding:'8px 20px', borderRadius:'8px', border:'none', cursor:'pointer', background: historyFilter===f?'#f97316':'#f1f5f9', color: historyFilter===f?'#fff':'#1e293b', textTransform:'capitalize', fontWeight:'600'}}>{f}</button>
          ))}
        </div>
        <div className="search-input" style={{maxWidth:'400px', position:'relative', marginBottom:'20px'}}>
            <Search size={18} color="#666" style={{position:'absolute', top:'12px', left:'15px'}}/>
            <input type="text" placeholder="Search Bill ID..." style={{width:'100%', padding:'12px 45px', borderRadius:'10px', border:'1px solid #ddd'}} value={historySearchQuery} onChange={(e)=>setHistorySearchQuery(e.target.value)} />
        </div>
        <div className="table-container" style={{background:'#fff', borderRadius:'15px', overflow:'hidden', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead style={{background:'#f8fafc', textAlign:'left'}}>
              <tr>
                <th style={{padding:'18px'}}>Bill ID</th>
                <th style={{padding:'18px'}}>Date/Time</th>
                <th style={{padding:'18px'}}>Original Total</th>
                <th style={{padding:'18px'}}>Refunded</th>
                <th style={{padding:'18px'}}>Adjusted Total</th>
                <th style={{padding:'18px', textAlign:'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sale => {
                const refundAmt = getRefundAmountForBill(sale.billId);
                return (

                  <tr key={sale.billId} style={{borderTop:'1px solid #eee'}} className="history-row">
                    <td style={{padding:'18px'}}>
                        <strong style={{color: '#3b82f6'}}>{sale.billId}</strong>
                        {refundAmt > 0 && <span style={{marginLeft: '8px', background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #fecaca'}}>RETURNED</span>}
                    </td>
                    <td>{new Date(sale.saleDate).toLocaleString()}</td>
                    <td style={{color: '#64748b', textDecoration: refundAmt > 0 ? 'line-through' : 'none'}}>Rs. {sale.totalAmount?.toLocaleString()}</td>
                    <td style={{color: '#ef4444', fontWeight: '600'}}>{refundAmt > 0 ? `- Rs. ${refundAmt.toLocaleString()}` : '-'}</td>
                    <td style={{color: '#10b981', fontWeight: '800', fontSize: '15px'}}>Rs. {(sale.totalAmount - refundAmt).toLocaleString()}</td>
                    
                    {/* 🟢 onClick එක දැම්මේ මේ Eye Icon Button එකට විතරයි! */}
                    <td style={{textAlign:'right', paddingRight:'18px'}}>
                        <button 
                            onClick={() => viewPastBill(sale)} 
                            style={{background: '#eff6ff', border: '1px solid #bfdbfe', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s'}}
                            title="View Bill Details"
                        >
                            <Eye size={18} color="#3b82f6"/>
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

 
  const renderCompatibility = () => {
    

    const filteredComp = products.filter(item => {
        if (compatMode === 'by_part') {
            if (!compatPartSearch) return false;
            const search = compatPartSearch.toLowerCase();
            return (item.productCode && item.productCode.toLowerCase().includes(search)) || 
                   (item.productName && item.productName.toLowerCase().includes(search));
        } else {
            if (!compatVehicleBrand) return false;
            const searchData = `${item.productName} ${item.partCategory} ${item.compatibleVehicles || item.compatibleModels || ''}`.toLowerCase();
            const brandMatch = searchData.includes(compatVehicleBrand.toLowerCase());
            const modelMatch = compatVehicleModel ? searchData.includes(compatVehicleModel.toLowerCase()) : true;
            return brandMatch && modelMatch;
        }
    });

    return (
        <div style={{padding:'30px', animation: 'fadeIn 0.3s ease-in-out'}}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wrench color="#2563eb" /> Parts Compatibility Check
                </h2>
                
                {/* 🟢 Toggle Buttons: Search By Part OR Search By Vehicle */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                    <button 
                        onClick={() => { setCompatMode('by_part'); setCompatVehicleBrand(''); setCompatVehicleModel(''); }} 
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', background: compatMode === 'by_part' ? '#fff' : 'transparent', color: compatMode === 'by_part' ? '#2563eb' : '#64748b', boxShadow: compatMode === 'by_part' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        Find Vehicles by Part
                    </button>
                    <button 
                        onClick={() => { setCompatMode('by_vehicle'); setCompatPartSearch(''); }} 
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', background: compatMode === 'by_vehicle' ? '#fff' : 'transparent', color: compatMode === 'by_vehicle' ? '#2563eb' : '#64748b', boxShadow: compatMode === 'by_vehicle' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        Find Parts by Vehicle
                    </button>
                </div>

                {/* 🟢 Search Inputs */}
                {compatMode === 'by_part' ? (
                    <div style={{ position: 'relative', maxWidth: '500px', marginBottom: '30px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '14px', left: '15px' }} />
                        <input 
                            type="text" 
                            placeholder="Enter Part Code or Name (e.g. BDY-01)..." 
                            value={compatPartSearch} 
                            onChange={(e) => setCompatPartSearch(e.target.value)} 
                            style={{ width: '100%', padding: '14px 15px 14px 45px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', background: '#f8fafc', boxSizing: 'border-box' }} 
                        />
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Select Vehicle Brand</label>
                            <select 
                                value={compatVehicleBrand} 
                                onChange={(e) => setCompatVehicleBrand(e.target.value)} 
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontSize: '14px', cursor: 'pointer' }}
                            >
                                <option value="">-- Choose Brand --</option>
                                {vehicleBrandsList.map(b => <option key={b} value={b}>{b}</option>)}
                                {vehicleBrandsList.length === 0 && <option value="" disabled>No brands found in DB</option>}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Enter Vehicle Model (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Corolla, Hornet..." 
                                value={compatVehicleModel} 
                                onChange={(e) => setCompatVehicleModel(e.target.value)} 
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }} 
                            />
                        </div>
                    </div>
                )}

                {/* 🟢 Results Table */}
                <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    Matching Results
                </h3>
                
                <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow:'0 4px 15px rgba(0,0,0,0.03)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', color:'#475569' }}>Item Details</th>
                                <th style={{ color:'#475569' }}>Compatible Models (Bikes/Vehicles)</th>
                                <th style={{ color:'#475569' }}>Brand/Category</th>
                                <th style={{ color:'#475569', textAlign: 'center' }}>Current Stock</th>
                                <th style={{ color:'#475569', textAlign: 'right', paddingRight:'16px' }}>Unit Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComp.map(item => {
                                const inStock = getStockQty(item) > 0;
                                const compatList = item.compatibleVehicles || item.compatibleModels || (item.productName.includes("Honda") ? "Honda Bikes (Universal)" : "Universal Fit / Check Manual");
                                return (
                                    <tr key={item.productCode} style={{ borderBottom: '1px solid #f1f5f9', background: !inStock ? '#fcfcfc' : 'transparent' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 'bold', color: !inStock ? '#94a3b8' : '#1e293b', fontSize: '15px' }}>{item.productName}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', background: '#f1f5f9', display: 'inline-block', padding: '2px 6px', borderRadius: '4px' }}>{item.productCode}</div>
                                        </td>
                                        <td style={{ color: '#3b82f6', fontWeight: '600', fontSize: '13px', lineHeight: '1.4', maxWidth: '250px' }}>
                                            {compatList}
                                        </td>
                                        <td style={{ color: '#64748b' }}>
                                            <span style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>{item.brand || item.partCategory || 'Spare Part'}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ background: inStock ? '#ecfdf5' : '#fef2f2', color: inStock ? '#10b981' : '#ef4444', padding: '5px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', border: `1px solid ${inStock ? '#a7f3d0' : '#fca5a5'}` }}>
                                                {inStock ? `${getStockQty(item)} In Stock` : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '16px', fontWeight: '800', color: !inStock ? '#94a3b8' : '#0f172a' }}>
                                            Rs. {Number(item.sellingPrice || item.price || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredComp.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>
                                        {compatMode === 'by_part' && !compatPartSearch ? "Type a part code or name to see compatible vehicles." : 
                                         compatMode === 'by_vehicle' && !compatVehicleBrand ? "Select a vehicle brand to see compatible parts." : 
                                         "No compatibility records found for your search."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar no-print">
        <div className="logo"><h2>Madara<span>Motors</span></h2></div>
        <nav className="nav-menu">
           <button className={activeTab==='pos'?'active':''} onClick={()=>setActiveTab('pos')}><LayoutDashboard size={18}/> POS</button>
           <button className={activeTab==='requests'?'active':''} onClick={()=>setActiveTab('requests')}><ClipboardList size={18}/> Order Request</button>
           <button className={activeTab==='profit'?'active':''} onClick={()=>setActiveTab('profit')}><BarChart3 size={18}/> Profit</button>
           <button className={activeTab==='history'?'active':''} onClick={()=>setActiveTab('history')}><History size={18}/> History</button>
         <button className={activeTab==='returns'?'active':''} onClick={()=>setActiveTab('returns')}><RotateCcw size={18}/> Returns</button>
           <button className={activeTab==='compatibility'?'active':''} onClick={()=>setActiveTab('compatibility')}><Wrench size={18}/> Compatibility</button>
           <button className={activeTab==='profile'?'active':''} onClick={()=>setActiveTab('profile')}><User size={18}/> Profile</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}><LogOut size={18}/> Logout</button>
      </div>
      
      <div className="main-content" style={{ overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
        
        {/* 🟢 CASHIER TOP BAR WITH NOTIFICATION BELL */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 30px', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ position: 'relative', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '50%', border: '1px solid #e2e8f0' }} onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={22} color="#64748b" />
                {managerReplyNotification && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: managerReplyNotification.status === 'REJECTED' ? '#ef4444' : '#10b981', color: '#fff', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0px', border: '2px solid #fff' }}></span>
                )}
            </div>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 10}} style={{position: 'absolute', top: '70px', right: '30px', background: '#fff', width: '320px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden'}}>
                        <div style={{padding: '15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b'}}>Your Notifications</div>
                        <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                            {!managerReplyNotification ? (
                                <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px'}}>No new notifications.</div>
                            ) : (
                                <div style={{padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        {managerReplyNotification.status === 'REJECTED' ? <X size={20} color="#ef4444"/> : <CheckCircle2 size={20} color="#10b981"/>}
                                        <span style={{fontWeight: 'bold', fontSize: '14px', color: '#0f172a'}}>Manager Reply</span>
                                    </div>
                                    <div style={{fontSize: '13px', color: managerReplyNotification.status === 'REJECTED' ? '#ef4444' : '#10b981', background: managerReplyNotification.status === 'REJECTED' ? '#fef2f2' : '#ecfdf5', padding: '10px', borderRadius: '6px', border: `1px solid ${managerReplyNotification.status === 'REJECTED' ? '#fca5a5' : '#a7f3d0'}`}}>
                                        Your request to change email to <strong>{managerReplyNotification.newValue}</strong> was {managerReplyNotification.status === 'REJECTED' ? 'DECLINED' : 'APPROVED'} by the Manager.
                                    </div>
                                    <button onClick={dismissManagerReply} style={{background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}>Dismiss</button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ minHeight:'100%', paddingBottom: '40px' }}>
               {activeTab === 'pos' && renderPOS()}
               {activeTab === 'requests' && renderCustomerRequests()}
               {activeTab === 'profit' && renderProfit()}
               {activeTab === 'returns' && renderReturns()}
               {activeTab === 'history' && renderHistory()}
               {activeTab === 'compatibility' && renderCompatibility()}
               {activeTab === 'profile' && renderProfile()}
            </motion.div>
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
                    <input type="password" placeholder="Enter new password" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '15px'}} autoFocus/>
                    
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'}}/>
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePasswordSubmit} style={{flex: 2, background:'#3b82f6', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                      <Save size={16}/> Update Password
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowPasswordModal(false); setNewPasswordInput(""); setConfirmPasswordInput(""); }} style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Cancel</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

       
        {/* Edit Profile Modal */}
       {/* Edit Profile Modal */}
        <AnimatePresence>
          {showEditProfileModal && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              
              <motion.div className="payment-modal" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} style={{ background: '#fff', width: '680px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                
                <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 style={{margin: 0, color: '#1e293b', fontSize: '22px'}}>Edit Profile</h2>
                    <button onClick={() => setShowEditProfileModal(false)} style={{background:'transparent', border:'none', cursor:'pointer', color:'#64748b'}}><X size={24}/></button>
                </div>
                
                {/* 🟢 2-Column Grid Layout */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', marginBottom: '25px', textAlign: 'left'}}>
                    
                    {/* Full Name */}
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Full Name</label>
                        <input type="text" value={editFormData.name || ""} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} />
                    </div>

                    {/* Email Address (Locked) */}
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Email Address <span style={{color: '#ef4444'}}>(Locked)</span></label>
                        <input type="email" value={profileData.email || ""} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', background:'#f8fafc', color:'#94a3b8', cursor: 'not-allowed'}} />
                    </div>
                    
                    {/* Contact Number */}
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Contact Number</label>
                        <input type="text" value={editFormData.contact || ""} onChange={(e) => setEditFormData({...editFormData, contact: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} />
                    </div>

                    {/* Branch */}
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Branch / Location</label>
                        <input type="text" value={editFormData.branch || ""} onChange={(e) => setEditFormData({...editFormData, branch: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} />
                    </div>

                    {/* 🟢 Address Field */}
                    <div style={{gridColumn: 'span 2'}}>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Address</label>
                        <input type="text" placeholder="Enter your address" value={editFormData.address || ""} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background:'#fff', color:'#1e293b'}} />
                    </div>

                </div>

                <div style={{display:'flex', gap:'10px'}}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleProfileSave} style={{flex: 2, background:'#10b981', color:'#fff', padding:'14px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                      <Save size={18}/> Confirm & Save Details
                  </motion.button>
                  {/* Cancel Button එකකුත් දැම්මා ලේසි වෙන්න */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowEditProfileModal(false)} style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'14px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>
                      Cancel
                  </motion.button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Email Request Modal */}
        <AnimatePresence>
          {showEmailModal && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="payment-modal" style={{width:'400px', background:'#fff', padding:'30px', borderRadius:'20px'}} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <div style={{background: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px', color: '#3b82f6'}}><Mail size={30}/></div>
                    <h2 style={{fontSize: '20px', color: '#1e293b'}}>Request Email Change</h2>
                    <p style={{color: '#64748b', fontSize: '13px', marginTop: '5px'}}>Account modifications require Manager Approval.</p>
                </div>
                <div style={{textAlign: 'left', marginBottom: '20px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>Current Email</label>
                    <input type="text" value={profileData.email} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', marginBottom: '15px'}}/>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', display: 'block'}}>New Gmail Address</label>
                    <input type="email" placeholder="e.g. new.email@gmail.com" value={newEmailInput} onChange={(e) => setNewEmailInput(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'}} autoFocus/>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleEmailRequestSubmit} style={{flex: 2, background:'#3b82f6', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                      <Send size={16}/> Send Request</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowEmailModal(false)} style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Cancel</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Return Flow Modal */}
        <AnimatePresence>
          {isReturnModalOpen && foundBill && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="payment-modal" style={{width: '800px', background:'#fff', padding:'30px', borderRadius:'20px', overflow:'hidden'}} initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: -20 }}>
                <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}><h2 style={{margin:0, color:'#1e293b'}}>Select Return Items</h2></div>
                    <button onClick={handleCancelReturnBtn} style={{background:'transparent', border:'none', cursor:'pointer'}}><X size={24}/></button>
                </div>
                <div style={{marginTop: '20px', maxHeight: '350px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px'}}>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead style={{background:'#f8fafc', textAlign:'left', position: 'sticky', top: 0, zIndex: 1}}>
                        <tr>
                            <th style={{padding:'12px', fontSize:'13px', color:'#64748b'}}>Code</th>
                            <th style={{fontSize:'13px', color:'#64748b'}}>Item Name</th>
                            <th style={{fontSize:'13px', color:'#64748b'}}>Price</th>
                            <th style={{textAlign:'center', fontSize:'13px', color:'#64748b'}}>Purchased</th>
                            <th style={{textAlign:'center', fontSize:'13px', color:'#64748b'}}>Return Qty</th>
                            <th style={{textAlign:'right', paddingRight: '12px', fontSize:'13px', color:'#64748b'}}>Refund</th>
                        </tr>
                        </thead>
                        <tbody>
                        {returnItemsList.map((item, idx) => (
                            <tr key={idx} style={{borderBottom:'1px solid #f1f5f9'}}>
                            <td style={{padding:'12px', fontWeight: 'bold'}}>{item.productCode}</td>
                            <td>{item.productName}</td>
                            <td>
                                Rs. {item.actualPaidPrice?.toLocaleString()}
                                {item.actualPaidPrice < (item.price || item.sellingPrice) && (
                                    <>
                                        <br/>
                                        <small style={{color:'red', fontSize:'10px'}}>(Discounted)</small>
                                    </>
                                )}
                            </td>
                            <td style={{textAlign:'center', color:'#64748b'}}>
                                {item.purchasedQty} <br/>
                                <small style={{color: item.maxReturnable === 0 ? 'red' : 'green'}}>(Avail: {item.maxReturnable})</small>
                            </td>
                            <td style={{textAlign:'center'}}>
                                <div style={{display:'inline-flex', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'3px', alignItems:'center'}}>
                                    <button onClick={()=>decreaseReturnQty(idx)} style={{border:'none', background:'none', cursor:'pointer', padding:'2px 5px'}}><Minus size={14}/></button>
                                    <span style={{margin:'0 10px', fontWeight:'bold', color: item.returnQty > 0 ? '#ef4444' : '#1e293b'}}>{item.returnQty}</span>
                                    <button onClick={()=>increaseReturnQty(idx)} style={{border:'none', background:'none', cursor:'pointer', padding:'2px 5px'}}><Plus size={14}/></button>
                                </div>
                            </td>
                            <td style={{textAlign:'right', paddingRight: '12px', color:'#ef4444', fontWeight:'bold'}}>Rs. {(item.returnQty * item.actualPaidPrice).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div style={{marginTop:'20px', padding:'20px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontWeight:'bold', color:'#475569', fontSize:'16px'}}>Total Refund Amount:</span>
                    <span style={{fontSize:'28px', fontWeight:'900', color:'#ef4444'}}>Rs. {getReturnTotalRefund().toLocaleString()}</span>
                </div>
                <div style={{display:'flex', gap:'15px', marginTop:'25px'}}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleInitiateReturn("Cash Return")} style={{flex:1, background: '#ef4444', color:'#fff', padding:'18px', borderRadius:'12px', border:'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><Banknote size={22}/> Cash Refund</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleInitiateReturn("Product Return")} style={{flex:1, background: '#f97316', color:'#fff', padding:'18px', borderRadius:'12px', border:'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><RefreshCw size={22}/> Product Exchange</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirmModal && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="payment-modal" style={{width:'400px', background:'#fff', padding:'30px', borderRadius:'15px', textAlign:'center'}} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <X size={50} color="#ef4444" style={{marginBottom:'15px'}}/>
                <h2 style={{fontSize: '22px'}}>Discard Changes?</h2>
                <p style={{color:'#64748b', marginTop:'10px', fontSize:'14px'}}>You have unsaved changes in your return list. Are you sure you want to cancel the return process?</p>
                <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'25px'}}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowCancelConfirmModal(false); setIsReturnModalOpen(false); setReturnItemsList([]); setIsReturnModified(false); }} style={{flex: 1, background:'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Yes, Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCancelConfirmModal(false)} style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'12px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>No, Continue</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final Return Confirmation Modal */}
        <AnimatePresence>
          {showConfirmReturnModal && (
            <motion.div className="modal-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="payment-modal" style={{width:'400px', background:'#fff', padding:'30px', borderRadius:'20px', textAlign:'center'}} initial={{ scale: 0.5, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, rotate: 5 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                {selectedReturnType === "Cash Return" ? <Banknote size={50} color="#ef4444" style={{marginBottom:'15px'}}/> : <RefreshCw size={50} color="#f97316" style={{marginBottom:'15px'}}/>}
                <h2 style={{fontSize: '22px'}}>Confirm {selectedReturnType}?</h2>
                <p style={{color:'#64748b', marginTop:'15px', fontSize: '15px', lineHeight: '1.5'}}>
                  You are about to process a <strong>{selectedReturnType}</strong> for <br/>
                  <span style={{color: '#0f172a', fontWeight: 'bold', fontSize: '18px'}}>{returnItemsList.filter(i => i.returnQty > 0).length} Item(s)</span>
                </p>
                <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'30px'}}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={finalConfirmReturn} style={{flex: 1, background: selectedReturnType === 'Cash Return' ? '#ef4444' : '#f97316', color:'#fff', padding:'12px 20px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Yes, Process</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowConfirmReturnModal(false)} style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'12px 20px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Cancel</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Return Receipt Modal */}
        <AnimatePresence>
            {showReturnReceipt && returnReceiptData && (
            <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <motion.div className="payment-modal" style={{ width: '400px', background: '#fff', padding: '25px', borderRadius: '15px' }}>
                    <div id="printable-return-receipt">
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Banknote size={24}/> RETURN RECEIPT</h2>
                            <p style={{ margin: '5px 0', fontSize: '12px', color: '#64748b' }}>MADARA MOTORS</p>
                            <hr style={{ margin: '10px 0', border: '1px dashed #ccc' }} />
                        </div>
                        <div style={{ fontSize: '12px', margin: '10px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span><strong>Original Bill:</strong> {returnReceiptData.billId}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}><span>Date: {returnReceiptData.date}</span><span>Time: {returnReceiptData.time}</span></div>
                        </div>
                        <hr style={{ margin: '10px 0', border: '1px dashed #ccc' }} />
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
                            {returnReceiptData.items.map(i => (
                              <div key={i.productCode} style={{fontSize:'12px', display:'flex', justifyContent:'space-between', padding:'4px 0'}}>
                                <span>{i.productName} (x{i.returnQty})</span>
                                <span>Rs. {(i.returnQty * i.actualPaidPrice)?.toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '2px solid #000', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: '#ef4444' }}>
                                <span>TOTAL REFUNDED:</span><span>Rs. {returnReceiptData.totalAmount.toLocaleString()}</span>
                            </div>
                            <p style={{fontSize:'12px', marginTop:'10px', textAlign:'center', fontWeight:'bold'}}>(PAID IN CASH)</p>
                        </div>
                    </div>
                    <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%' }}>
                        <button className="pay-btn" style={{ background: '#10b981', color: '#fff', flex: 1, padding:'15px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold' }} onClick={() => window.print()}>Print Receipt</button>
                        <button className="qty-btn" style={{ background: '#ef4444', color: '#fff', flex: 1, padding:'15px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold' }} onClick={handleCancelAndClear}>Close</button>
                    </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

        {/* 🟢 POS Bill Modal */}
        <AnimatePresence>
            {showBillView && (
            <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <motion.div className="payment-modal" style={{ width: '450px', background: '#fff', padding: '30px', borderRadius: '20px' }} initial={{y:50, opacity:0}} animate={{y:0, opacity:1}}>
                    <div id="printable-bill">
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: '#f97316', margin: 0, fontWeight: '800' }}>MADARA MOTORS</h2>
                            <hr style={{ margin: '15px 0', border: '1px dashed #cbd5e1' }} />
                        </div>
                        <div style={{ fontSize: '13px', margin: '10px 0', color: '#334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>ID:</strong> {billIds.billId}</span><span><strong>CUS ID:</strong> {billIds.customerId}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span>Date: {isHistoryView ? historyBillDate : currentDate}</span><span>Time: {isHistoryView ? historyBillTime : currentTime}</span>
                            </div>
                        </div>
                        
                        <div style={{ maxHeight: '220px', overflowY: 'auto', margin: '20px 0', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                            {cart.map(i => {
                              const returnedItemLogs = returnedBills.filter(rb => rb.billId === billIds.billId && rb.productCode === i.productCode);
                              const returnQty = returnedItemLogs.reduce((sum, rb) => sum + rb.quantity, 0);
                              const isFullyReturned = isHistoryView && returnQty >= i.qty;
                              
                              const returnType = returnedItemLogs.length > 0 ? returnedItemLogs[0].returnType : "";

                              return (
                                <div key={i.productCode} style={{fontSize:'13px', display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: '1px solid #f8fafc', color: isFullyReturned ? '#94a3b8' : '#1e293b'}}>
                                  <div>
                                     <span style={{textDecoration: isFullyReturned ? 'line-through' : 'none'}}>{i.productName} x {i.qty} @ {i.sellingPrice?.toLocaleString()}</span>
                                     {isHistoryView && returnQty > 0 && 
                                         <div style={{marginTop:'4px'}}>
                                             <span style={{background:'#fef2f2', color:'#ef4444', padding:'2px 6px', borderRadius:'4px', fontSize:'11px', fontWeight:'700'}}>
                                                 Refunded x{returnQty} {returnType ? `(${returnType})` : ''}
                                             </span>
                                         </div>
                                     }
                                  </div>
                                  <span style={{fontWeight: '600', textDecoration: isFullyReturned ? 'line-through' : 'none'}}>{(i.qty * (i.sellingPrice || i.price))?.toLocaleString()}</span>
                                </div>
                              );
                            })}
                        </div>
                        
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}><span>Original Subtotal:</span><span>{getSubTotal().toLocaleString()}</span></div>
                            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ef4444', marginTop: '5px' }}><span>Discount ({discount}%):</span><span>-{getDiscountAmount().toLocaleString()}</span></div>}
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', marginTop: '10px', color: '#1e293b' }}>
                                <span>ORIGINAL TOTAL:</span>
                                <span>Rs. {Math.abs(getNetTotal()).toLocaleString()}</span>
                            </div>
                            
                            {isHistoryView && getRefundAmountForBill(billIds.billId) > 0 && (
                                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '12px', marginTop: '15px', border: '1px solid #e2e8f0'}}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '14px', color: '#ef4444' }}>
                                      <span>REFUNDS ISSUED:</span>
                                      <span>-Rs. {getRefundAmountForBill(billIds.billId).toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '20px', marginTop: '10px', color: '#10b981', borderTop: '2px solid #cbd5e1', paddingTop:'10px' }}>
                                      <span>ADJUSTED TOTAL:</span>
                                      <span>Rs. {(getNetTotal() - getRefundAmountForBill(billIds.billId)).toLocaleString()}</span>
                                  </div>
                                </div>
                            )}
                            
                            <p style={{fontSize:'11px', marginTop:'15px', color: '#94a3b8', textAlign:'center', textTransform: 'uppercase', letterSpacing: '1px'}}>Payment Method: {selectedPaymentMethod}</p>
                        </div>
                    </div>
                    <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '25px', width: '100%' }}>
                        {isHistoryView ? (
                            <button className="qty-btn" style={{ background: '#0f172a', color: '#fff', width: '100%', padding:'18px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold' }} onClick={handleCancelAndClear}>Close View</button>
                        ) : !isConfirmed ? (
                            <>
                                <button className="pay-btn" style={{flex: 2, background: '#0f172a', color: '#fff', padding:'15px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold'}} onClick={finalConfirmPayment}>Confirm Sale</button>
                                <div style={{display:'flex', flexDirection:'column', gap:'10px', flex: 1}}>
                                    <button className="qty-btn" style={{background:'#f1f5f9', color:'#1e293b', padding:'10px', width:'100%', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold'}} onClick={handleEditBill}>Update</button>
                                    <button className="qty-btn" style={{background:'#fef2f2', color:'#ef4444', padding:'10px', width:'100%', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold'}} onClick={handleCancelAndClear}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <div style={{display:'flex', gap:'10px', width:'100%'}}>
                                <button className="pay-btn" style={{ background: '#10b981', color: '#fff', flex: 1, padding:'18px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold' }} onClick={() => window.print()}>Print Bill</button>
                                <button className="qty-btn" style={{ background: '#ef4444', color: '#fff', flex: 1, padding:'18px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'bold' }} onClick={handleCancelAndClear}>Close</button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

        {/* Return History Modal */}
        <AnimatePresence>
          {showReturnHistoryModal && (
            <motion.div className="modal-overlay no-print" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <motion.div className="payment-modal" style={{width:'750px', background:'#fff', padding:'25px', borderRadius:'15px'}} initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}}>
                <div className="modal-header">
                  <h2 style={{display:'flex', alignItems:'center', gap:'10px'}}><Calendar color="#ef4444"/> Return Bills Summary</h2>
                  <button onClick={() => setShowReturnHistoryModal(false)}><X size={24}/></button>
                </div>
                <div style={{display:'flex', gap:'10px', margin:'20px 0'}}>
                  {["daily", "weekly", "monthly"].map(f => (
                    <button key={f} onClick={()=>setReturnHistoryFilter(f)} style={{padding:'8px 20px', borderRadius:'8px', border:'none', cursor:'pointer', background: returnHistoryFilter===f?'#ef4444':'#f1f5f9', color: returnHistoryFilter===f?'#fff':'#1e293b', textTransform:'capitalize', fontWeight:'600'}}>{f}</button>
                  ))}
                </div>
                <div style={{maxHeight:'400px', overflowY:'auto'}}>
                  <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead style={{background:'#f8fafc', textAlign:'left'}}>
                      <tr><th style={{padding:'12px'}}>Bill ID</th><th>Returned Item</th><th>Qty</th><th>Refund Amount</th><th>Return Date</th></tr>
                    </thead>
                    <tbody>
                      {getFilteredReturnHistory().length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No return records found.</td></tr>
                      ) : (
                        getFilteredReturnHistory().map((rb, idx) => (
                          <tr key={idx} style={{borderTop:'1px solid #eee', fontSize:'14px'}}>
                            <td style={{padding:'12px'}}><strong>{rb.billId}</strong></td>
                            <td>{rb.productName}</td>
                            <td>{rb.quantity}</td>
                            <td style={{color:'red'}}>Rs. {rb.refundAmount?.toLocaleString()}</td>
                            <td style={{fontSize:'12px'}}>{new Date(rb.returnDate).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{marginTop:'20px', padding:'15px', background:'#fef2f2', borderRadius:'10px', textAlign:'right'}}>
                   <span style={{fontWeight:'bold', fontSize:'18px'}}>Total Refunded: Rs. {getFilteredReturnHistory().reduce((sum, r) => sum + r.refundAmount, 0).toLocaleString()}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
            {showPaymentModal && (
            <motion.div className="modal-overlay no-print">
                <motion.div className="payment-modal">
                    <div className="modal-header"><h2>Select Payment Method</h2><button onClick={() => setShowPaymentModal(false)}><X size={24}/></button></div>
                    <div className="total-display"><small>Total Amount</small><h1>Rs. {Math.abs(getNetTotal()).toLocaleString()}</h1></div>
                    <div className="payment-options-grid">
                        <button className="pay-opt-btn cash" onClick={() => handleOpenBill('Cash')}><div className="icon-circle"><Banknote size={32}/></div><span>CASH</span></button>
                        <button className="pay-opt-btn card" onClick={() => handleOpenBill('Card')}><div className="icon-circle"><CreditCard size={32}/></div><span>CARD</span></button>
                        <button className="pay-opt-btn online" onClick={() => handleOpenBill('Online')}><div className="icon-circle"><QrCode size={32}/></div><span>ONLINE</span></button>
                    </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

        {/* 🟢 CUSTOM IN-APP NEW ORDER ALERT / MISSED ORDERS ALERT */}
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
                  setActiveTab('requests');
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
                  setActiveTab('requests');
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
                {/* Customer Info Section */}
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                        <span style={{display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px'}}>Customer Info</span>
                        <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '15px'}}>{selectedOrder.customerName || 'Walk-in Customer'}</div>
                        
                        <div style={{fontSize: '13px', color: '#475569', marginTop: '4px'}}>
                           <Phone size={12} style={{display:'inline', marginRight:'4px'}}/>
                           {selectedOrder.phone || selectedOrder.contactNo || selectedOrder.contactNumber || selectedOrder.customerPhone || 'N/A'}
                        </div>
                        
                       
                        <div style={{fontSize: '13px', color: '#475569', marginTop: '4px'}}>
                           <Mail size={12} style={{display:'inline', marginRight:'4px'}}/>
                           {selectedOrder.email || selectedOrder.customerEmail || selectedOrder.gmail || 'N/A'}
                        </div>
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
                    {(selectedOrder.status || 'Pending').toLowerCase() === 'pending' && (
                        <button onClick={(e) => handleVerifyOrder(selectedOrder, e)} style={{flex: 2, background: '#10b981', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}><CheckCircle2 size={18}/> Verify Order</button>
                    )}
                    {(selectedOrder.status || '').toLowerCase() === 'verified' && (
                        <button onClick={(e) => handleCompleteOrder(selectedOrder, e)} style={{flex: 2, background: '#3b82f6', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}><Package size={18}/> Complete Order</button>
                    )}
                    {(selectedOrder.status || '').toLowerCase() === 'completed' && (
                        <button onClick={(e) => handlePickupOrder(selectedOrder, e)} style={{flex: 2, background: '#8b5cf6', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}><ShoppingBag size={18}/> Mark as Picked Up</button>
                    )}
                    {['pending', 'verified', 'completed'].includes((selectedOrder.status || 'pending').toLowerCase()) && (
                        <button onClick={(e) => handleCancelOrder(selectedOrder, e)} style={{flex: 1, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'}}><Ban size={18}/> Cancel Order</button>
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

export default CashierDashboard;