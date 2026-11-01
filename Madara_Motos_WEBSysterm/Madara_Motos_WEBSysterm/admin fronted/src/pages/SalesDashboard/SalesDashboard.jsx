import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, AlertTriangle, ArrowDownToLine, 
  Trash2, LogOut, Menu, Search, CheckCircle, Save, X, Ban, User,
  Mail, Phone, Briefcase, Clock, Calendar, ShieldCheck, Key, Edit3, Info, MapPin, Truck, FileText, Plus, History, Send, Bell, CheckCircle2,
  Sun, Moon, Sunset, CalendarClock, BoxSelect, 
  TrendingUp 
} from 'lucide-react';
import './SalesDashboard.css'; 

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

const StoreDashboard = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [items, setItems] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loginTime, setLoginTime] = useState("");
 const [profileData, setProfileData] = useState({
      id: '', name: 'Loading...', role: 'Store Keeper', employeeId: '', 
      branch: '', email: '', phone: '', joinedDate: '', address: '' 
  });;
 
  const [emailStatus, setEmailStatus] = useState('NONE'); 
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmailReq, setNewEmailReq] = useState('');
  
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });


  const [showNotifications, setShowNotifications] = useState(false);
  const [managerReplyNotifications, setManagerReplyNotifications] = useState([]);



  const [grnSupplier, setGrnSupplier] = useState(localStorage.getItem('grnSupplier') || '');
  const [grnInvoice, setGrnInvoice] = useState(localStorage.getItem('grnInvoice') || '');
  const [grnDate, setGrnDate] = useState(localStorage.getItem('grnDate') || new Date().toISOString().split('T')[0]);
  
  const [isGrnDetailsConfirmed, setIsGrnDetailsConfirmed] = useState(localStorage.getItem('isGrnDetailsConfirmed') === 'true');
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false); 
  
  const [selectedGrnItemCode, setSelectedGrnItemCode] = useState(''); 
  const [grnQty, setGrnQty] = useState('');
  const [grnBuyingPrice, setGrnBuyingPrice] = useState(''); 
  
  const [grnItemsList, setGrnItemsList] = useState(() => {
      const saved = localStorage.getItem('grnItemsList');
      return saved ? JSON.parse(saved) : [];
  });


  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
      if (!selectedGrnItemCode) {
          setProductSearchTerm('');
      }
  }, [selectedGrnItemCode]);

  const [grnHistory, setGrnHistory] = useState([]);
const [showGrnHistory, setShowGrnHistory] = useState(false);
const [grnSearch, setGrnSearch] = useState('');
const [grnFilterDate, setGrnFilterDate] = useState('');
const [selectedGrn, setSelectedGrn] = useState(null);
const [showGrnViewModal, setShowGrnViewModal] = useState(false);


  const [damageItemCode, setDamageItemCode] = useState('');
  const [damageQty, setDamageQty] = useState('');
  const [damageReason, setDamageReason] = useState('');
  const [damageSupplier, setDamageSupplier] = useState('');
 const [damagedHistory, setDamagedHistory] = useState(() => {
  const saved = localStorage.getItem('damagedHistory');
  return saved ? JSON.parse(saved) : [];
});

const [damageProductSearchTerm, setDamageProductSearchTerm] = useState('');
  const [showDamageProductDropdown, setShowDamageProductDropdown] = useState(false);

  useEffect(() => {
      if (!damageItemCode) {
          setDamageProductSearchTerm('');
      }
  }, [damageItemCode]);


const [showNewItemRequestModal, setShowNewItemRequestModal] = useState(false);

  const [compatMode, setCompatMode] = useState('by_part'); 
  const [compatPartSearch, setCompatPartSearch] = useState('');
  const [compatVehicleBrand, setCompatVehicleBrand] = useState('');
  const [compatVehicleModel, setCompatVehicleModel] = useState('');
  const [vehicleBrandsList, setVehicleBrandsList] = useState([]); 

const [newItemForm, setNewItemForm] = useState({
  productCode: '',
  productName: '',
  buyingPrice: '',
  vehicleType: '',
  brand: '',
  partCategory: '',
  imageUrl: '',
  model: '',
  manufactureYear: '',
  quantity: '' 
});


const [filteredBrandsForNewItem, setFilteredBrandsForNewItem] = useState([]);
const [isCustomType, setIsCustomType] = useState(false);
const [isCustomBrand, setIsCustomBrand] = useState(false);
const [isCustomCategory, setIsCustomCategory] = useState(false);


const handleNewItemVehicleTypeChange = (selectedType) => {
    if (selectedType === 'OTHER') {
        setIsCustomType(true);
        setNewItemForm({ ...newItemForm, vehicleType: '', brand: '' });
        setFilteredBrandsForNewItem([]);
        return;
    }
    
    setIsCustomType(false);
    setIsCustomBrand(false);
    setNewItemForm({ ...newItemForm, vehicleType: selectedType, brand: '' });
    

    const brandsForType = [...new Set(
        items.filter(i => i.vehicleType === selectedType && i.brand)
             .map(i => i.brand)
    )].sort();
    
    setFilteredBrandsForNewItem(brandsForType);
};
const [showNewSupplierRequestModal, setShowNewSupplierRequestModal] = useState(false);
const [newSupplierForm, setNewSupplierForm] = useState({
  supplierName: '',
  company: '',
  contactNumber: '',
  email: '',
  address: ''
});
const toggleSidebar = () => setIsOpen(!isOpen);


  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const hour = currentTime.getHours();
  let greeting = 'Good Evening';
  let TimeIcon = Moon;
  let iconColor = '#818cf8';
  let iconBg = '#e0e7ff';

  if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
      TimeIcon = Sun;
      iconColor = '#f59e0b';
      iconBg = '#fef3c7';
  } else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
      TimeIcon = Sun;
      iconColor = '#ea580c';
      iconBg = '#ffedd5';
  } else if (hour >= 17 && hour < 20) {
      greeting = 'Good Evening';
      TimeIcon = Sunset;
      iconColor = '#ea580c';
      iconBg = '#ffedd5';
  } else {
      greeting = 'Good Night';
      TimeIcon = Moon;
      iconColor = '#6366f1';
      iconBg = '#e0e7ff';
  }
useEffect(() => {
  localStorage.setItem('grnSupplier', grnSupplier);
  localStorage.setItem('grnInvoice', grnInvoice);
  localStorage.setItem('grnDate', grnDate);
  localStorage.setItem('isGrnDetailsConfirmed', isGrnDetailsConfirmed);
  localStorage.setItem('grnItemsList', JSON.stringify(grnItemsList));
}, [grnSupplier, grnInvoice, grnDate, isGrnDetailsConfirmed, grnItemsList]);

useEffect(() => {
  localStorage.setItem('damagedHistory', JSON.stringify(damagedHistory));
}, [damagedHistory]);


  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    
    const handleBackButton = () => {
      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    const checkManagerReplies = async () => {
      if (
        profileData.email &&
        profileData.email !== "Loading..." &&
        profileData.email !== "Not provided"
      ) {
        try {
          const resStatus = await axios.get(
            `http://localhost:8080/api/notifications/my-email-request-status?email=${profileData.email}`
          );
          setEmailStatus(resStatus.data.status);

          const resResult = await axios.get(
            `http://localhost:8080/api/notifications/my-results?email=${profileData.email}`
          );

          if (Array.isArray(resResult.data)) {
            const results = resResult.data;


            const approvedGrnUpdates = results.filter(
              n => (n.type === "PRICE_UPDATE_APPROVAL" || n.type === "NEW_ITEM_APPROVAL") && n.status === "RESOLVED"
            );

            if (approvedGrnUpdates.length > 0) {
              setGrnItemsList(prevList => {
                let updatedList = [...prevList];
                approvedGrnUpdates.forEach(notif => {
                  try {
                    const msgData = JSON.parse(notif.message);
                    updatedList = updatedList.map(item =>
                      item.productCode === msgData.productCode
                        ? { ...item, status: "READY" }
                        : item
                    );
                  } catch (e) {
                    console.warn("Failed to parse notification message", e);
                  }
                });
                return updatedList;
              });

              for (const notif of approvedGrnUpdates) {
                try {
                  await axios.post(`http://localhost:8080/api/notifications/dismiss/${notif.id}`);
                } catch (e) {
                  console.warn("Failed to auto-dismiss notification", e);
                }
              }
            }


            const declinedGrnUpdates = results.filter(
              n => (n.type === "PRICE_UPDATE_APPROVAL" || n.type === "NEW_ITEM_APPROVAL") && n.status === "REJECTED"
            );

            if (declinedGrnUpdates.length > 0) {
              setGrnItemsList(prevList => {
                let updatedList = [...prevList];
                declinedGrnUpdates.forEach(notif => {
                  try {
                    const msgData = JSON.parse(notif.message);
                    updatedList = updatedList.map(item =>
                      item.productCode === msgData.productCode
                        ? { 
                            ...item, 
                            status: "DECLINED", 
                            declineType: notif.type, 
                            managerComment: notif.managerComment || "No specific reason provided." 
                          }
                        : item
                    );
                  } catch (e) {
                    console.warn("Failed to parse declined notification", e);
                  }
                });
                return updatedList;
              });
            }


            const visibleNotifications = results.filter(
              n => !((n.type === "PRICE_UPDATE_APPROVAL" || n.type === "NEW_ITEM_APPROVAL") && n.status === "RESOLVED")
            );
            setManagerReplyNotifications(visibleNotifications);

          } else {
            setManagerReplyNotifications([]);
          }
        } catch (e) {
          console.error("Failed to fetch manager replies:", e);
        }
      }
    };

    checkManagerReplies();
    const statusInterval = setInterval(checkManagerReplies, 10000);

    return () => clearInterval(statusInterval);
  }, [profileData.email]);

const fetchStoreData = async () => {
  setLoading(true);
  try {
    const userId = localStorage.getItem("userId");

    if (!userId || userId === "undefined") {
      alert("User session not found. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const userRes = await axios.get(`http://localhost:8080/api/users/${userId}`);
      if (userRes.data) {
        const currentEmail = userRes.data.gmail || userRes.data.email || "Not provided";
      setProfileData({
          id: userRes.data.id,
          name: userRes.data.name || userRes.data.username || "Store Keeper",
          role: userRes.data.role || "Stock Keeper",
          email: currentEmail,
          employeeId: userRes.data.employeeId || "N/A",
          branch: userRes.data.branch || "Main Branch",
          phone: userRes.data.contactNo || userRes.data.phone || "Not provided",
          joinedDate: userRes.data.joinedDate || "N/A",
          address: userRes.data.address || "Not provided" 
        });
        if (currentEmail !== "Not provided") {
          try {
            const statRes = await axios.get(
              `http://localhost:8080/api/notifications/my-email-request-status?email=${currentEmail}`
            );
            setEmailStatus(statRes.data.status);
          } catch (e) {
            console.warn("Failed to fetch email request status", e);
          }
        }
      }
    } catch (e) {
      console.error("User fetch failed", e);
    }

   const [prodRes, suppRes, historyRes, damagedRes] = await Promise.all([
      axios.get('http://localhost:8080/api/spareparts/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/suppliers').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/grn-history/all').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/damaged/all').catch(() => ({ data: [] }))
    ]);


    const prods = Array.isArray(prodRes.data) ? prodRes.data : [];
    setItems(prods);
    setSuppliersList(Array.isArray(suppRes.data) ? suppRes.data : []);



    const extractedBrands = [...new Set(prods.map(p => p.brand).filter(Boolean))].sort();
    setVehicleBrandsList(extractedBrands);

    if (Array.isArray(historyRes.data)) {
      const formattedHistory = historyRes.data
        .map(h => {
          let parsedItems = [];
          try {
            parsedItems = JSON.parse(h.items);
          } catch (e) {
            parsedItems = [];
          }
          return { ...h, items: parsedItems };
        })
        .reverse();

      setGrnHistory(formattedHistory);
    }

    if (Array.isArray(damagedRes.data)) {
      setDamagedHistory(damagedRes.data.reverse());
    }
  } catch (error) {
    console.error("Error fetching store data:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchStoreData();
}, []);

const handleLogout = async () => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    try {
      await axios.post(`http://localhost:8080/api/users/logout/${userId}`);
    } catch (e) {
      console.warn("Logout API failed", e);
    }
  }

  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("sessionLoginTime");
  navigate("/", { replace: true });
};


  const applyManagerPriceApproval = async (notif) => {
  try {
    const msgData = JSON.parse(notif.message);

    setGrnItemsList(prevList =>
      prevList.map(item =>
        item.productCode === msgData.productCode
          ? { ...item, status: 'READY' }
          : item
      )
    );

    await axios.post(`http://localhost:8080/api/notifications/dismiss/${notif.id}`);

    setManagerReplyNotifications(prev =>
      prev.filter(n => n.id !== notif.id)
    );

    alert(`✅ Price update approved for ${msgData.productCode}!\nIt is now READY to be saved in the GRN.`);
  } catch (e) {
    console.warn("Failed to apply approval", e);
    alert("Failed to apply manager approval.");
  }
};

const dismissNotification = async (id) => {
  try {
    await axios.post(`http://localhost:8080/api/notifications/dismiss/${id}`);
    setManagerReplyNotifications(prev => prev.filter(n => n.id !== id));
  } catch (e) {
    console.warn("Failed to dismiss notification", e);
  }
};

const handleConfirmGrnDetails = () => {
  if (!grnSupplier || !grnInvoice || !grnDate) {
    alert("⚠️ Please select a Supplier and enter the Invoice Number to proceed.");
    return;
  }

  const isDuplicateInvoice = grnHistory.some(
    grn => grn.invoice.toLowerCase() === grnInvoice.toLowerCase()
  );

  if (isDuplicateInvoice) {
    alert(`❌ Error: The Invoice Number "${grnInvoice}" has already been processed! Please check your invoice or enter a valid new one.`);
    return;
  }

  setIsGrnDetailsConfirmed(true);
};

const handleCancelGRNDraft = () => {
  setShowCancelConfirmModal(true);
};

const confirmCancelGRN = () => {
  setGrnSupplier('');
  setGrnInvoice('');
  setGrnDate(new Date().toISOString().split('T')[0]);
  setIsGrnDetailsConfirmed(false);
  setGrnItemsList([]);

  setSelectedGrnItemCode('');
  setGrnQty('');
  setGrnBuyingPrice('');

  localStorage.removeItem('grnSupplier');
  localStorage.removeItem('grnInvoice');
  localStorage.removeItem('isGrnDetailsConfirmed');
  localStorage.removeItem('grnItemsList');

  setShowCancelConfirmModal(false);
};

const handleSelectProduct = (code) => {
  setSelectedGrnItemCode(code);
  const itemObj = items.find(i => i.productCode === code);

  if (itemObj) {
    setGrnBuyingPrice(itemObj.unitPrice || itemObj.productPrice || '');
  } else {
    setGrnBuyingPrice('');
  }
};


  const selectedItemDetails = items.find(i => i.productCode === selectedGrnItemCode);
  const currentDbPrice = selectedItemDetails ? Number(selectedItemDetails.unitPrice || selectedItemDetails.productPrice || 0) : 0;
  const isPriceChanged = selectedItemDetails && grnBuyingPrice !== '' && Number(grnBuyingPrice) !== currentDbPrice;


  const handleAddGrnItem = async () => {
      if (!selectedGrnItemCode || !grnQty || Number(grnQty) <= 0 || !grnBuyingPrice || Number(grnBuyingPrice) < 0) {
          alert("Please select an item, enter a valid quantity, and enter the buying price.");
          return;
      }

      const itemObj = items.find(i => i.productCode === selectedGrnItemCode);
      if (!itemObj) return;

      let itemStatus = 'READY';


      if (isPriceChanged) {
          itemStatus = 'PENDING';
          const alertPayload = {
              employeeId: profileData.employeeId,
              employeeName: profileData.name,
              employeeEmail: profileData.email,
              type: 'PRICE_UPDATE_APPROVAL', 
              message: JSON.stringify({
                  productCode: itemObj.productCode,
                  productName: itemObj.productName,
                  oldBuyingPrice: currentDbPrice,
                  newBuyingPrice: Number(grnBuyingPrice),
                  currentSellingPrice: Number(itemObj.sellingPrice || 0),
                  qtyAdded: Number(grnQty)
              }),
              status: 'PENDING',
              createdAt: new Date().toISOString()
          };
          try {
              await axios.post('http://localhost:8080/api/notifications/add', alertPayload);
              alert(`⚠️ Price difference detected for ${itemObj.productCode}!\n\nA request has been sent to the Manager. The item will remain "PENDING" until approved.`);
          } catch(e) {
              alert("❌ Failed to send price update request to Manager.");
              return;
          }
      }

      const existingIndex = grnItemsList.findIndex(i => i.productCode === selectedGrnItemCode);
      
      if (existingIndex >= 0) {
          const newList = [...grnItemsList];
          newList[existingIndex].addedQty += Number(grnQty);
          newList[existingIndex].newBuyingPrice = Number(grnBuyingPrice);
          newList[existingIndex].status = itemStatus;
          setGrnItemsList(newList);
      } else {
          setGrnItemsList([...grnItemsList, { 
              ...itemObj, 
              addedQty: Number(grnQty), 
              newBuyingPrice: Number(grnBuyingPrice),
              oldPrice: currentDbPrice,
              status: itemStatus
          }]);
      }

      setSelectedGrnItemCode('');
      setGrnQty('');
      setGrnBuyingPrice('');
  };

  const handleRemoveGrnItem = (code) => {
      setGrnItemsList(grnItemsList.filter(i => i.productCode !== code));
  };


const handleCompleteGrn = async () => {
  if (grnItemsList.length === 0) {
    alert("Please add at least one item to the GRN before saving.");
    return;
  }


  const hasPendingItems = grnItemsList.some(item => item.status === 'PENDING');
  if (hasPendingItems) {
    alert("⏳ Cannot save GRN!\n\nSome items are still PENDING Manager approval.\nPlease wait or remove them.");
    return;
  }


  const hasDeclinedItems = grnItemsList.some(item => item.status === 'DECLINED');
  if (hasDeclinedItems) {
    alert("❌ Cannot save GRN!\n\nSome items were DECLINED by the Manager.\nPlease remove DECLINED items and re-add with the correct price.");
    return;
  }



  try {
    for (let grnItem of grnItemsList) {


      const freshRes = await axios.get(
        `http://localhost:8080/api/spareparts/${grnItem.productCode}`
      );
      const dbItem = freshRes.data;


      const currentQty = getStockQty(dbItem);
      const updatedQty = currentQty + grnItem.addedQty;


      const cleanPayload = {
        productCode:     dbItem.productCode,
        productName:     dbItem.productName,
        productPrice:    Number(grnItem.newBuyingPrice),
        unitPrice:       Number(grnItem.newBuyingPrice),
        sellingPrice:    dbItem.sellingPrice,
        stockQty:        Number(updatedQty),
        lowStockLimeted: dbItem.lowStockLimeted,
        imageUrl:        dbItem.imageUrl
      };

      console.log(`✅ Updating ${grnItem.productCode}:`, cleanPayload);


      const updateRes = await axios.put(
        `http://localhost:8080/api/spareparts/update/${grnItem.productCode}`,
        cleanPayload
      );
      console.log(`✅ Update Response:`, updateRes.data);
    }


    const newGrnRecord = {
      grnId:      `GRN-${Date.now()}`,
      supplier:   grnSupplier,
      invoice:    grnInvoice,
      date:       grnDate,
      items:      JSON.stringify(grnItemsList),
      totalItems: grnItemsList.length,
      totalQty:   grnItemsList.reduce((sum, i) => sum + i.addedQty, 0),
      timestamp:  new Date().toLocaleString()
    };

    console.log("Saving GRN Record:", newGrnRecord);

    const savedGrnRes = await axios.post(
      'http://localhost:8080/api/grn-history/add',
      newGrnRecord
    );

    console.log("GRN Saved:", savedGrnRes.data);

    const savedRecord = { ...savedGrnRes.data, items: grnItemsList };
    setGrnHistory([savedRecord, ...grnHistory]);


    alert("✅ GRN Completed! Stock and Database updated successfully.");

    setGrnSupplier('');
    setGrnInvoice('');
    setGrnDate(new Date().toISOString().split('T')[0]);
    setIsGrnDetailsConfirmed(false);
    setGrnItemsList([]);
    setSelectedGrnItemCode('');
    setGrnQty('');
    setGrnBuyingPrice('');
    localStorage.removeItem('grnSupplier');
    localStorage.removeItem('grnInvoice');
    localStorage.removeItem('grnDate');
    localStorage.removeItem('isGrnDetailsConfirmed');
    localStorage.removeItem('grnItemsList');


    const prodRes = await axios.get('http://localhost:8080/api/spareparts/all');
    setItems(Array.isArray(prodRes.data) ? prodRes.data : []);
    setShowGrnHistory(true);

  } catch (error) {
    console.error("GRN Error Full:", error);

    if (error.response) {
      console.error("Backend Response Data:", error.response.data);
      console.error("Backend Status:", error.response.status);
      alert(
        `❌ GRN Failed!\n` +
        `Status: ${error.response.status}\n` +
        `Message: ${JSON.stringify(error.response.data)}`
      );
    } else if (error.request) {
      console.error("No Response:", error.request);
      alert("❌ Backend connect netha!\nSpring Boot 8080 port eke run wenwada check karanna.");
    } else {
      alert(`❌ Error: ${error.message}`);
    }
  }
};
const handleDamageSubmit = async () => {
  if (!damageItemCode || !damageQty || !damageReason || !damageSupplier) {
    alert("Please fill in all the details (Product, Quantity, Reason, and Supplier).");
    return;
  }

  const itemObj = items.find(i => i.productCode === damageItemCode);
  if (!itemObj) return;

  const qtyNum = Number(damageQty);
  const currentStock = getStockQty(itemObj);

  if (qtyNum > currentStock) {
    alert(`❌ Cannot deduct ${qtyNum}. Only ${currentStock} items currently in stock!`);
    return;
  }

  try {
    const updatedQty = currentStock - qtyNum;
    const updatedItemData = { ...itemObj, stockQty: updatedQty };
    await axios.put(`http://localhost:8080/api/spareparts/update/${itemObj.productCode}`, updatedItemData);

    const newDamageRecord = {
      id: `DMG-${Date.now()}`,
      productCode: itemObj.productCode,
      productName: itemObj.productName,
      qty: qtyNum,
      reason: damageReason,
      supplier: damageSupplier,
      date: new Date().toLocaleString()
    };

    try {
      await axios.post('http://localhost:8080/api/damaged/add', newDamageRecord);
    } catch (e) {}

    setDamagedHistory([newDamageRecord, ...damagedHistory]);
    setItems(items.map(i => i.productCode === itemObj.productCode ? updatedItemData : i));

    alert("✅ Damaged item recorded successfully! Stock has been deducted.");

    setDamageItemCode('');
    setDamageQty('');
    setDamageReason('');
    setDamageSupplier('');

  } catch (error) {
    console.error("Damage Update Error:", error);
    alert("❌ Failed to process. Please check your connection.");
  }
};



const handleNewItemRequestSubmit = async () => {
  if (!newItemForm.productCode || !newItemForm.productName || !newItemForm.buyingPrice || !newItemForm.vehicleType || !newItemForm.brand || !newItemForm.partCategory || !newItemForm.quantity) {
    alert("Please fill in all the required fields (*), including Quantity.");
    return;
  }

  const exists = items.some(
    i => i.productCode.toLowerCase() === newItemForm.productCode.toLowerCase()
  );

  if (exists) {
    alert(`❌ Error: Product Code "${newItemForm.productCode.toUpperCase()}" already exists in the system!\nPlease check the dropdown or enter a different code.`);
    return;
  }

  try {
    const payload = {
      employeeId: profileData.employeeId,
      employeeName: profileData.name,
      employeeEmail: profileData.email,
      type: 'NEW_ITEM_APPROVAL',
      message: JSON.stringify({
        productCode: newItemForm.productCode.toUpperCase(),
        productName: newItemForm.productName,
        buyingPrice: Number(newItemForm.buyingPrice),
        vehicleType: newItemForm.vehicleType,
        brand: newItemForm.brand,
        partCategory: newItemForm.partCategory,
        imageUrl: newItemForm.imageUrl || 'No Image',
        model: newItemForm.model || 'Universal',
        manufactureYear: newItemForm.manufactureYear || 'Universal'
      }),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await axios.post('http://localhost:8080/api/notifications/add', payload);


    const newItemForGrn = {
        productCode: newItemForm.productCode.toUpperCase(),
        productName: newItemForm.productName,
        addedQty: Number(newItemForm.quantity),
        newBuyingPrice: Number(newItemForm.buyingPrice),
        oldPrice: 0,
        status: 'PENDING' 
    };

    setGrnItemsList([...grnItemsList, newItemForGrn]); 

    alert("✅ Request sent to Manager!\n\nThe item has been added to your GRN list as 'PENDING'.");

    setShowNewItemRequestModal(false);
    setNewItemForm({
      productCode: '', productName: '', buyingPrice: '', vehicleType: '', brand: '', partCategory: '', imageUrl: '', model: '', manufactureYear: '', quantity: ''
    });
    setFilteredBrandsForNewItem([]);
  } catch (e) {
    console.error(e);
    alert("❌ Failed to send request to Manager. Check your backend console for errors.");
  }
};
const handleNewSupplierRequestSubmit = async () => {
  if (!newSupplierForm.supplierName || !newSupplierForm.contactNumber) {
    alert("Please fill Supplier Name and Contact Number.");
    return;
  }

  try {
    const payload = {
      employeeId: profileData.employeeId,
      employeeName: profileData.name,
      employeeEmail: profileData.email,
      type: 'NEW_SUPPLIER_APPROVAL',
      message: JSON.stringify({
        supplierName: newSupplierForm.supplierName,
        company: newSupplierForm.company,
        contactNumber: newSupplierForm.contactNumber,
        email: newSupplierForm.email,
        address: newSupplierForm.address
      }),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await axios.post('http://localhost:8080/api/notifications/add', payload);

    alert("✅ New supplier request sent to Manager!");
    setShowNewSupplierRequestModal(false);
    setNewSupplierForm({
      supplierName: '',
      company: '',
      contactNumber: '',
      email: '',
      address: ''
    });
  } catch (e) {
    console.error(e);
    alert("❌ Failed to send supplier request.");
  }
};

const handleProfileUpdateSubmit = async () => {
  try {
    const payload = {
      name: editProfileForm.name,
      contactNo: editProfileForm.phone,
      gmail: editProfileForm.email,
      branch: editProfileForm.branch, 
      address: editProfileForm.address 
    };

    await axios.put(`http://localhost:8080/api/users/update/${profileData.id}`, payload);

    setProfileData({
      ...profileData,
      name: editProfileForm.name,
      phone: editProfileForm.phone,
      email: editProfileForm.email,
      branch: editProfileForm.branch, 
      address: editProfileForm.address 
    });

    setShowEditProfileModal(false);
    alert("✅ Profile updated successfully!");
  } catch (error) {
    console.error(error);
    alert("❌ Failed to update profile.");
  }
};

const handlePasswordUpdateSubmit = async () => {
  if (passwordForm.newPass !== passwordForm.confirm) {
    alert("New passwords do not match!");
    return;
  }
  try {
    await axios.put(`http://localhost:8080/api/users/update/${profileData.id}`, { password: passwordForm.newPass });
    setShowPasswordModal(false);
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    alert("✅ Password changed successfully!");
  } catch (error) {
    alert("❌ Failed to change password.");
  }
};

const handleEmailChangeRequest = async () => {
  if (!newEmailReq) {
    alert("Please enter a new email address.");
    return;
  }
  try {
    await axios.post('http://localhost:8080/api/notifications/request-email-change', {
      currentEmail: profileData.email,
      newEmail: newEmailReq
    });
    alert("✅ Request sent to Manager successfully! Please wait for approval.");
    setEmailStatus('PENDING');
    setShowEmailModal(false);
    setNewEmailReq('');
  } catch (error) {
    alert(error.response?.data?.error || "❌ Failed to send request.");
  }
};
const filteredGrnHistory = grnHistory.filter(grn => {
  const search = grnSearch.toLowerCase();

  const matchesSearch =
    !grnSearch ||
    grn.invoice?.toLowerCase().includes(search) ||
    grn.supplier?.toLowerCase().includes(search) ||
    grn.grnId?.toLowerCase().includes(search);

  const matchesDate =
    !grnFilterDate || grn.date === grnFilterDate;

  return matchesSearch && matchesDate;
});

const handleViewGrn = (grn) => {
  setSelectedGrn(grn);
  setShowGrnViewModal(true);
};
const filteredItems = items.filter(item => {
  if (!searchTerm) return true;
  const searchLower = searchTerm.toLowerCase();
  const matchName = item.productName ? item.productName.toLowerCase().includes(searchLower) : false;
  const matchCode = item.productCode ? item.productCode.toLowerCase().includes(searchLower) : false;
  return matchName || matchCode;
});

const lowStockItems = items.filter(i => getStockQty(i) > 0 && getStockQty(i) <= getLowStockLimit(i));
const outOfStockItems = items.filter(i => getStockQty(i) === 0);

if (loading) {
  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f4f7fe', color:'#2563eb', fontWeight:'bold', fontSize:'20px'}}>
      Loading Store Data...
    </div>
  );
}

return (
  <div className="store-container" style={{display: 'flex', height: '100vh', background: '#f4f7fe', fontFamily: 'system-ui, sans-serif'}}>
    
    {/* --- SIDEBAR --- */}
    <div className="sidebar" style={{width: isOpen ? '260px' : '80px', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', transition: '0.3s', padding: '20px 0', boxShadow: '4px 0 20px rgba(0,0,0,0.05)', position: 'relative', zIndex: 100}}>
      
     <div style={{display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center', padding: '0 20px', marginBottom: '30px', marginTop: '10px'}}>
        {isOpen && (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <h2 style={{margin: 0, fontSize: '21px', color: '#f8fafc', fontWeight: '800'}}>Madara<span style={{color: '#3b82f6'}}>Motors</span></h2>
            <span style={{fontSize: '11px', color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '600', marginTop: '2px'}}>Store Portal</span>
          </div>
        )}
      </div>

      {isOpen && (
        <div style={{padding: '0 20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px'}}>
          <div style={{width: '45px', height: '45px', borderRadius: '50%', background: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', border: '2px solid #3b82f6', color: '#60a5fa'}}>
            {profileData.name.charAt(0)}
          </div>
          <div>
            <h4 style={{margin: 0, fontSize: '15px', color: '#f8fafc'}}>{profileData.name}</h4>
            <span style={{fontSize: '12px', color: '#94a3b8'}}>{profileData.role}</span>
          </div>
        </div>
      )}

     <nav style={{display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px', flex: 1}}>
        {/* Dashboard Tab */}
        <button style={{background: activeTab==='dashboard'?'#2563eb':'transparent', color: '#fff', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='dashboard'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('dashboard')}>
          <LayoutDashboard size={20}/> {isOpen && "Dashboard"}
        </button>

        <button style={{background: activeTab==='inventory'?'#2563eb':'transparent', color: '#fff', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='inventory'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('inventory')}>
          <Package size={20}/> {isOpen && "Main Stock"}
        </button>
        <button style={{background: activeTab==='inward'?'#2563eb':'transparent', color: '#fff', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='inward'?'bold':'normal', transition: '0.2s'}} onClick={()=>{setActiveTab('inward'); setShowGrnHistory(false);}}>
          <ArrowDownToLine size={20}/> {isOpen && "Receive Stock (GRN)"}
        </button>
        <button style={{background: activeTab==='damaged'?'#2563eb':'transparent', color: '#fff', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='damaged'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('damaged')}>
          <Trash2 size={20}/> {isOpen && "Damaged / Returns"}
        </button>

        <button style={{background: activeTab==='compatibility'?'#2563eb':'transparent', color: '#fff', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='compatibility'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('compatibility')}>
          <BoxSelect size={20}/> {isOpen && "Compatibility Check"}
        </button>

        <button style={{background: activeTab==='lowstock'?'rgba(239,68,68,0.2)':'transparent', color: activeTab==='lowstock'?'#fca5a5':'#94a3b8', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='lowstock'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('lowstock')}>
          <AlertTriangle size={20}/> {isOpen && "Low Stock Alerts"}
          {isOpen && lowStockItems.length > 0 && <span style={{marginLeft: 'auto', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold'}}>{lowStockItems.length}</span>}
        </button>
        <button style={{background: activeTab==='outofstock'?'rgba(249,115,22,0.2)':'transparent', color: activeTab==='outofstock'?'#fdba74':'#94a3b8', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='outofstock'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('outofstock')}>
          <Ban size={20}/> {isOpen && "Out of Stock"}
          {isOpen && outOfStockItems.length > 0 && <span style={{marginLeft: 'auto', background: '#f97316', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold'}}>{outOfStockItems.length}</span>}
        </button>

        <button style={{background: activeTab==='profile'?'#2563eb':'transparent', color: '#fff', padding: '12px 15px', border: 'none', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: activeTab==='profile'?'bold':'normal', transition: '0.2s'}} onClick={()=>setActiveTab('profile')}>
          <User size={20}/> {isOpen && "My Profile"}
        </button>
      </nav>

      <div style={{padding: '0 15px', marginTop: 'auto'}}>
        <button onClick={handleLogout} style={{width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center', gap: '15px', transition: '0.2s'}}>
          <LogOut size={20}/> {isOpen && "Logout"}
        </button>
      </div>
    </div>
      {/* --- CONTENT AREA --- */}
      <div style={{flex: 1, padding: '0px 30px 30px 30px', overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
        
        {/* 🟢 TOP BAR WITH BELL ICON */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '25px', position: 'sticky', top: 0, zIndex: 50, background: '#f4f7fe' }}>
            <div style={{ position: 'relative', cursor: 'pointer', background: '#fff', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={22} color="#64748b" />
                {managerReplyNotifications.length > 0 && (
                    <span style={{ position: 'absolute', top: '0px', right: '0px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        {managerReplyNotifications.length}
                    </span>
                )}
            </div>

            {/* Notification Dropdown */}
  <AnimatePresence>
  {showNotifications && (
    <motion.div
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: 10}}
      style={{
        position: 'absolute',
        top: '70px',
        right: '0px',
        background: '#fff',
        width: '320px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '15px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: 'bold',
          color: '#1e293b',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        Your Notifications
        <button
          onClick={() => setShowNotifications(false)}
          style={{background: 'none', border: 'none', cursor: 'pointer'}}
        >
          <X size={16}/>
        </button>
      </div>

      <div style={{maxHeight: '300px', overflowY: 'auto'}}>
        {managerReplyNotifications.length === 0 ? (
          <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px'}}>
            No new notifications.
          </div>
        ) : (
          managerReplyNotifications.map(n => (
            <div
              key={n.id}
              style={{
                padding: '15px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                {n.status === 'REJECTED'
                  ? <X size={20} color="#ef4444"/>
                  : <CheckCircle2 size={20} color="#10b981"/>}
                <span style={{fontWeight: 'bold', fontSize: '14px', color: '#0f172a'}}>
                  Manager Reply
                </span>
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: n.status === 'REJECTED' ? '#ef4444' : '#10b981',
                  background: n.status === 'REJECTED' ? '#fef2f2' : '#ecfdf5',
                  padding: '10px',
                  borderRadius: '6px',
                  border: `1px solid ${n.status === 'REJECTED' ? '#fca5a5' : '#a7f3d0'}`
                }}
              >
                {n.type === 'NEW_ITEM_APPROVAL' ? (
                  <>
                    Your request to add the new item <strong>{JSON.parse(n.message).productCode}</strong> was {n.status === 'REJECTED' ? 'DECLINED' : 'APPROVED'}.
                  </>
                ) : n.type === 'NEW_SUPPLIER_APPROVAL' ? (
                  <>
                    Your request to add the new supplier <strong>{JSON.parse(n.message).supplierName}</strong> was {n.status === 'REJECTED' ? 'DECLINED' : 'APPROVED'}.
                  </>
                ) : n.type === 'PRICE_UPDATE_APPROVAL' ? (
                  <>
                    Your price update alert for <strong>{JSON.parse(n.message).productName}</strong> was {n.status === 'REJECTED' ? 'DECLINED' : 'REVIEWED AND APPROVED'}.
                  </>
                ) : n.type === 'EMAIL_CHANGE' ? (
                  <>
                    Your request to change email to <strong>{n.newValue}</strong> was {n.status === 'REJECTED' ? 'DECLINED' : 'APPROVED'}.
                  </>
                ) : (
                  <>
                    Your request was {n.status === 'REJECTED' ? 'DECLINED' : 'APPROVED'}.
                  </>
                )}
              </div>

              {n.status === 'REJECTED' && n.managerComment && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#991b1b',
                    background: '#fff1f2',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #fecdd3',
                    marginTop: '4px'
                  }}
                >
                  Reason: {n.managerComment}
                </div>
              )}

              {n.type === 'PRICE_UPDATE_APPROVAL' && n.status === 'RESOLVED' && (
                <button
                  onClick={() => applyManagerPriceApproval(n)}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  Apply Approval to GRN
                </button>
              )}

              <button
                onClick={() => dismissNotification(n.id)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Dismiss Message
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )}
</AnimatePresence>
        </div>

        

       {/* 🟢 NEW DASHBOARD CONTENT */}
        {activeTab === 'dashboard' && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
               {/* 🟢 NEW BEAUTIFUL WELCOME BANNER */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    
                    {/* Left Side: Greeting & Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: iconBg, width: '64px', height: '64px', borderRadius: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: iconColor }}>
                            <TimeIcon size={32} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '26px', color: '#1e293b', fontWeight: '800', letterSpacing: '-0.5px' }}>
                                {greeting}, <span style={{ color: '#2563eb' }}>{profileData.name.split(' ')[0]}!</span> 👋
                            </h1>
                            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                                Overview of your inventory health and recent stock operations.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Live Clock & Date */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', color: '#0f172a', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
                            <CalendarClock size={22} color="#3b82f6" /> 
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* 🟢 NEW TOP STATS CARDS: Store Operations Overview */}
    {/* 🟢 ULTRA MODERN LIGHT THEME: Store Operations Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '35px' }}>
                    
                    {/* 1. Catalog Items (Light Blue Theme) */}
                    <div 
                        onClick={() => setActiveTab('inventory')} 
                        style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(226, 232, 240, 0.6)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} 
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.12)'; e.currentTarget.style.borderColor = '#bfdbfe'; }} 
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(226, 232, 240, 0.6)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                    >
                        {/* Soft Left Border Accent */}
                        <div style={{ position: 'absolute', top: '15%', left: 0, width: '4px', height: '70%', background: '#60a5fa', borderRadius: '0 4px 4px 0' }} />
                        
                        {/* Icon Container with Soft Glow */}
                        <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '16px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px #dbeafe, 0 8px 16px rgba(59, 130, 246, 0.1)' }}>
                            <Package size={28} strokeWidth={2.5} />
                        </div>
                        
                        {/* Text Container */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Catalog Items</span>
                            <span style={{ fontSize: '28px', color: '#0f172a', fontWeight: '900', lineHeight: '1' }}>{items.length}</span>
                        </div>
                    </div>

                    {/* 2. Registered Suppliers (Light Purple Theme) */}
                    <div 
                        style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(226, 232, 240, 0.6)', border: '1px solid #f1f5f9', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} 
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.12)'; e.currentTarget.style.borderColor = '#e9d5ff'; }} 
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(226, 232, 240, 0.6)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                    >
                        <div style={{ position: 'absolute', top: '15%', left: 0, width: '4px', height: '70%', background: '#a855f7', borderRadius: '0 4px 4px 0' }} />
                        <div style={{ background: '#faf5ff', padding: '18px', borderRadius: '16px', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px #f3e8ff, 0 8px 16px rgba(168, 85, 247, 0.1)' }}>
                            <Truck size={28} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Suppliers</span>
                            <span style={{ fontSize: '28px', color: '#0f172a', fontWeight: '900', lineHeight: '1' }}>{suppliersList.length}</span>
                        </div>
                    </div>

                    {/* 3. GRN Records (Light Emerald/Mint Theme) */}
                    <div 
                        onClick={() => {setActiveTab('inward'); setShowGrnHistory(true);}} 
                        style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(226, 232, 240, 0.6)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} 
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.12)'; e.currentTarget.style.borderColor = '#a7f3d0'; }} 
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(226, 232, 240, 0.6)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                    >
                        <div style={{ position: 'absolute', top: '15%', left: 0, width: '4px', height: '70%', background: '#34d399', borderRadius: '0 4px 4px 0' }} />
                        <div style={{ background: '#ecfdf5', padding: '18px', borderRadius: '16px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px #d1fae5, 0 8px 16px rgba(16, 185, 129, 0.1)' }}>
                            <FileText size={28} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>GRN Records</span>
                            <span style={{ fontSize: '28px', color: '#0f172a', fontWeight: '900', lineHeight: '1' }}>{grnHistory.length}</span>
                        </div>
                    </div>

                    {/* 4. Damaged Items (Light Rose/Red Theme) */}
                    <div 
                        onClick={() => setActiveTab('damaged')} 
                        style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(226, 232, 240, 0.6)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} 
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(244, 63, 94, 0.12)'; e.currentTarget.style.borderColor = '#fecdd3'; }} 
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(226, 232, 240, 0.6)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                    >
                        <div style={{ position: 'absolute', top: '15%', left: 0, width: '4px', height: '70%', background: '#fb7185', borderRadius: '0 4px 4px 0' }} />
                        <div style={{ background: '#fff1f2', padding: '18px', borderRadius: '16px', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px #ffe4e6, 0 8px 16px rgba(244, 63, 94, 0.1)' }}>
                            <AlertTriangle size={28} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Damaged Log</span>
                            <span style={{ fontSize: '28px', color: '#0f172a', fontWeight: '900', lineHeight: '1' }}>{damagedHistory.length}</span>
                        </div>
                    </div>

                </div>
{                 /* 🟢 NEW CREATIVE SOLUTION & Needs Attention Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
                    
                    {/* 🟢 Inventory Health Overview (Replaced Quick Actions) */}
                    {(()=>{
                        const total = items.length || 1; 
                        const oosCount = outOfStockItems.length;
                        const lowCount = lowStockItems.length;
                        const healthyCount = items.length - oosCount - lowCount;
                        
                        const healthyPct = items.length === 0 ? 0 : Math.round((healthyCount / total) * 100);
                        const lowPct = items.length === 0 ? 0 : Math.round((lowCount / total) * 100);
                        const oosPct = items.length === 0 ? 0 : Math.round((oosCount / total) * 100);

                        return (
                            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={20} color="#2563eb" /> Inventory Health
                                </h3>
                                
                                {/* Circular Percentage Display */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '50%', background: `conic-gradient(#10b981 ${healthyPct}%, #e2e8f0 ${healthyPct}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
                                        <div style={{ width: '56px', height: '56px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '900', color: '#10b981' }}>
                                            {healthyPct}%
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>Overall Healthy</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Items in good condition</p>
                                    </div>
                                </div>

                                {/* Linear Progress Bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    {/* Healthy Stock */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                                            <span style={{ color: '#10b981' }}>Healthy Stock</span>
                                            <span style={{ color: '#475569' }}>{healthyCount} Items</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: `${healthyPct}%`, height: '100%', background: '#10b981', borderRadius: '10px', transition: 'width 1.5s ease-out' }}></div>
                                        </div>
                                    </div>

                                    {/* Low Stock */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                                            <span style={{ color: '#f59e0b' }}>Low Stock Warning</span>
                                            <span style={{ color: '#475569' }}>{lowCount} Items</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: `${lowPct}%`, height: '100%', background: '#f59e0b', borderRadius: '10px', transition: 'width 1.5s ease-out' }}></div>
                                        </div>
                                    </div>

                                    {/* Out of Stock */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                                            <span style={{ color: '#ef4444' }}>Out of Stock</span>
                                            <span style={{ color: '#475569' }}>{oosCount} Items</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: `${oosPct}%`, height: '100%', background: '#ef4444', borderRadius: '10px', transition: 'width 1.5s ease-out' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                   {/* 🟢 NEW CREATIVE SOLUTION: Top Stock Categories (Replaces Needs Attention Table) */}
                    {/* 🟢 NEW CREATIVE SOLUTION: Top Stock Categories (Fixed Error) */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={20} color="#8b5cf6" /> Top Stock Categories
                            </h3>
                            <button 
                                onClick={() => setActiveTab('inventory')} 
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#3b82f6', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                                View All Categories
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {(()=>{

                                const generatedCategoryCounts = {};
                                if (items && items.length > 0) {
                                    items.forEach(item => {
                                        const catName = item.partCategory || item.category || 'Uncategorized';
                                        generatedCategoryCounts[catName] = (generatedCategoryCounts[catName] || 0) + 1;
                                    });
                                }


                                const sortedCats = Object.keys(generatedCategoryCounts).sort((a,b) => generatedCategoryCounts[b] - generatedCategoryCounts[a]).slice(0, 5);
                                const maxCount = sortedCats.length > 0 ? generatedCategoryCounts[sortedCats[0]] : 1;

                                if(sortedCats.length === 0) {
                                    return <div style={{textAlign:'center', color:'#94a3b8', padding:'30px', background:'#f8fafc', borderRadius:'12px', border:'1px dashed #cbd5e1'}}>No category data available.</div>
                                }


                                const themeColors = [
                                    { text: '#3b82f6', bg: '#eff6ff' }, // Blue
                                    { text: '#8b5cf6', bg: '#faf5ff' }, // Purple
                                    { text: '#10b981', bg: '#ecfdf5' }, // Emerald
                                    { text: '#f59e0b', bg: '#fffbeb' }, // Amber
                                    { text: '#ec4899', bg: '#fdf2f8' }  // Pink
                                ];

                                return sortedCats.map((cat, idx) => {
                                    const count = generatedCategoryCounts[cat];
                                    const pct = Math.round((count / maxCount) * 100); 
                                    const theme = themeColors[idx % themeColors.length];
                                    

                                    const icon = (typeof getCategoryIcon === 'function') ? getCategoryIcon(cat) : '📦';

                                    return (
                                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {/* Category Icon */}
                                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                                {icon}
                                            </div>
                                            
                                            {/* Bar & Text */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{cat}</span>
                                                    <span style={{ fontSize: '13px', fontWeight: '800', color: theme.text }}>{count} Items</span>
                                                </div>
                                                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                                    {/* Animated Progress Bar */}
                                                    <div style={{ width: `${pct}%`, height: '100%', background: theme.text, borderRadius: '10px', transition: 'width 1s ease-out' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        )}

{/* --- INVENTORY TAB (MAIN STOCK) --- */}
        {activeTab === 'inventory' && (
          <div style={{background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease-in-out'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                <h2 style={{margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px'}}><Package color="#2563eb"/> Main Stock Level</h2>
                <div style={{position: 'relative'}}>
                    <Search size={18} color="#94a3b8" style={{position: 'absolute', top: '12px', left: '12px'}}/>
                    <input type="text" placeholder="Search item code or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{padding: '12px 10px 12px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', width: '300px'}} />
                </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                    <tr>
                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Item Code</th>
                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Part Name</th>
                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Category / Brand</th>
                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Physical Qty</th>
                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map(item => {
                        const stock = getStockQty(item);
                        const limit = getLowStockLimit(item);
                        return (
                        <tr key={item.productCode} style={{borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s'}} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{padding: '12px', fontWeight: 'bold', color: '#2563eb'}}>{item.productCode}</td>
                            <td style={{padding: '12px', color: '#1e293b', fontWeight: '500'}}>{item.productName || "Unnamed Product"}</td>
                            <td style={{padding: '12px', color: '#64748b'}}>
                                {item.partCategory || "N/A"} <br/>
                                <span style={{fontSize: '11px', color: '#94a3b8', fontWeight: '600'}}>{item.brand || "Universal"}</span>
                            </td>
                            <td style={{padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: stock === 0 ? '#ef4444' : stock <= limit ? '#f59e0b' : '#0f172a'}}>{stock}</td>
                            <td style={{padding: '12px', textAlign: 'center'}}>
                                <span style={{
                                    padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                                    background: stock === 0 ? '#fef2f2' : stock <= limit ? '#fff7ed' : '#eff6ff',
                                    color: stock === 0 ? '#ef4444' : stock <= limit ? '#ea580c' : '#3b82f6'
                                }}>
                                    {stock === 0 ? 'Out of Stock' : (stock <= limit ? 'Low Stock' : 'In Stock')}
                                </span>
                            </td>
                        </tr>
                        );
                    })}
                    {filteredItems.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No items found matching your search.</td></tr>}
                </tbody>
                </table>
            </div>
          </div>
        )}                                                 

{/* 🟢 RECEIVE STOCK (GRN) TAB 🟢 */}
{activeTab === 'inward' && (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: '0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ArrowDownToLine color="#2563eb" /> {showGrnHistory ? "GRN History Logs (Database)" : "Receive New Stock (GRN)"}
            </h2>
            <button 
                onClick={() => setShowGrnHistory(!showGrnHistory)} 
                style={{ background: showGrnHistory ? '#0f172a' : '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s' }}
            >
                {showGrnHistory ? <><Plus size={16}/> New GRN</> : <><History size={16}/> View History</>}
            </button>
        </div>

        {!showGrnHistory ? (
            <>
                {/* STEP 1: SUPPLIER DETAILS */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: '0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={18} color="#64748b"/> Step 1: Supplier & Invoice Details
                        </h3>
                        {isGrnDetailsConfirmed && (
                            <button 
                                onClick={() => setIsGrnDetailsConfirmed(false)} 
                                style={{ background: '#f1f5f9', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <Edit3 size={14}/> Edit Info
                            </button>
                        )}
                    </div>

                   <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                            Supplier / Company Name
                          </label>

                          {!isGrnDetailsConfirmed && (
                            <span
                              onClick={() => setShowNewSupplierRequestModal(true)}
                              style={{
                                fontSize: '11px',
                                color: '#2563eb',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              + Request New Supplier
                            </span>
                          )}
                        </div>

                        <select
                          value={grnSupplier}
                          onChange={e => setGrnSupplier(e.target.value)}
                          disabled={isGrnDetailsConfirmed}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            background: isGrnDetailsConfirmed ? '#f8fafc' : '#fff',
                            color: isGrnDetailsConfirmed ? '#94a3b8' : '#000',
                            cursor: isGrnDetailsConfirmed ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="">-- Select Company  --</option>
                          {suppliersList.map(sup => {
                            const displayName = sup.company ? `${sup.company} (${sup.supplierName})` : sup.supplierName;
                            return (
                              <option key={sup.id} value={displayName}>
                                {displayName}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. INV-100254"
                          value={grnInvoice}
                          onChange={e => setGrnInvoice(e.target.value)}
                          disabled={isGrnDetailsConfirmed}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            background: isGrnDetailsConfirmed ? '#f8fafc' : '#fff'
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>
                          Received Date
                        </label>
                        <input
                          type="date"
                          value={grnDate}
                          onChange={e => setGrnDate(e.target.value)}
                          disabled={isGrnDetailsConfirmed}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            background: isGrnDetailsConfirmed ? '#f8fafc' : '#fff'
                          }}
                        />
                      </div>
                    </div>
                    
                    {!isGrnDetailsConfirmed && (
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                            <button 
                                onClick={handleConfirmGrnDetails} 
                                disabled={!grnSupplier || !grnInvoice || !grnDate}
                                style={{ background: (!grnSupplier || !grnInvoice || !grnDate) ? '#cbd5e1' : '#10b981', color: '#fff', padding: '10px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
                            >
                                <CheckCircle size={18}/> Confirm & Proceed
                            </button>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isGrnDetailsConfirmed && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* STEP 2: ADD ITEMS */}
                           <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>

  {/* Header */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
    <h3 style={{ margin: '0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Package size={18} color="#64748b"/> Step 2: Add Items to List
    </h3>

    {/* Cancel GRN Button - Items 0 විතරයි පෙන්වන්නේ */}
    {grnItemsList.length === 0 && (
      <button
        onClick={handleCancelGRNDraft}
        style={{
          background: '#fff',
          color: '#ef4444',
          border: '1.5px solid #ef4444',
          padding: '8px 18px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#ef4444';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.color = '#ef4444';
        }}
      >
        <X size={15}/> Cancel GRN
      </button>
    )}
  </div>

  {/* Inputs Row */}
 {/* Inputs Row */}
  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

    {/* 🟢 SEARCHABLE PRODUCT DROPDOWN (Replaced simple select) */}
    <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
          Search & Select Product *
        </label>
        <span
          onClick={() => setShowNewItemRequestModal(true)}
          style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          <Plus size={12}/> Request New Item
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '12px' }} />
        <input
          type="text"
          placeholder="Type part name or code..."
          value={productSearchTerm}
          onChange={(e) => {
            setProductSearchTerm(e.target.value);
            setShowProductDropdown(true);
            if(e.target.value === '') handleSelectProduct('');
          }}
          onFocus={() => setShowProductDropdown(true)}

          onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
          style={{
            width: '100%', padding: '12px 35px', borderRadius: '8px',
            border: '1px solid #cbd5e1', outline: 'none', background: '#fff',
            fontSize: '14px', color: '#1e293b', boxSizing: 'border-box'
          }}
        />
        {/* Clear Button */}
        {productSearchTerm && (
          <X size={16} color="#ef4444" style={{ position: 'absolute', top: '14px', right: '12px', cursor: 'pointer' }} onClick={() => { setProductSearchTerm(''); handleSelectProduct(''); }} />
        )}
      </div>

      {/* Floating Dropdown List */}
      {showProductDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
          border: '1px solid #e2e8f0', borderRadius: '10px', marginTop: '6px',
          maxHeight: '280px', overflowY: 'auto', zIndex: 9999,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {items.filter(item =>
             `${item.productCode} ${item.productName}`.toLowerCase().includes(productSearchTerm.toLowerCase())
          ).map(item => {
             const stock = getStockQty(item);
             return (
              <div
                key={item.productCode}
                onMouseDown={() => { 
                   handleSelectProduct(item.productCode);
                   setProductSearchTerm(`${item.productCode} - ${item.productName}`);
                   setShowProductDropdown(false);
                }}
                style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>{item.productName || "Unnamed"}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.productCode}</div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px',
                  background: stock === 0 ? '#fef2f2' : '#ecfdf5',
                  color: stock === 0 ? '#ef4444' : '#10b981'
                }}>
                  Stock: {stock}
                </div>
              </div>
            )
          })}
          
          {items.filter(item => `${item.productCode} ${item.productName}`.toLowerCase().includes(productSearchTerm.toLowerCase())).length === 0 && (
             <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No matching products found.
             </div>
          )}
        </div>
      )}
    </div>

    {/* Quantity */}
    <div style={{ width: '120px' }}>
      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>
        Quantity
      </label>
      <input
        type="number"
        placeholder="0"
        value={grnQty}
        onChange={e => setGrnQty(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
      />
    </div>

    {/* Buying Price */}
    <div style={{ width: '150px' }}>
      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>
        Buying Price (Rs.)
      </label>
      <input
        type="number"
        placeholder="0.00"
        value={grnBuyingPrice}
        onChange={e => setGrnBuyingPrice(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #3b82f6', outline: 'none', fontWeight: 'bold', color: '#2563eb' }}
      />
    </div>

    {/* Add to List Button */}
    <button
      onClick={handleAddGrnItem}
      style={{ background: isPriceChanged ? '#f59e0b' : '#3b82f6', color: '#fff', padding: '12px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      {isPriceChanged ? <><Send size={18}/> Update & Add</> : <><Plus size={18}/> Add to List</>}
    </button>

  </div>
</div>

                            {/* STEP 3: SUMMARY TABLE */}
                            <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ margin: '0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={18} color="#64748b"/> Step 3: GRN Item Summary
                                    </h3>
                                    <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{grnItemsList.length} Items</span>
                                </div>

                                {grnItemsList.length > 0 ? (
                                    <>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                <thead>
                                                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                                        <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Product</th>
                                                        <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Qty</th>
                                                        <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Unit Price</th>
                                                        <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Subtotal</th>
                                                        <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Status</th>
                                                        <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                  {grnItemsList.map((item, idx) => (
                                                    <React.Fragment key={idx}>
                                                      {/* Main Row */}
                                                      <tr style={{ 
                                                        borderBottom: item.status === 'DECLINED' ? 'none' : '1px solid #f1f5f9',
                                                        background: item.status === 'DECLINED' ? '#fff5f5' : 'white'
                                                      }}>
                                                        <td style={{ padding: '12px' }}>
                                                          <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.productName}</div>
                                                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.productCode}</div>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>
                                                          +{item.addedQty}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                          Rs. {parseFloat(item.newBuyingPrice).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                                                          Rs. {(item.addedQty * item.newBuyingPrice).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                          <span style={{
                                                            background:
                                                              item.status === 'PENDING'  ? '#fffbeb' :
                                                              item.status === 'DECLINED' ? '#fef2f2' :
                                                              '#ecfdf5',
                                                            color:
                                                              item.status === 'PENDING'  ? '#d97706' :
                                                              item.status === 'DECLINED' ? '#ef4444' :
                                                              '#10b981',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            fontWeight: 'bold'
                                                          }}>
                                                            {item.status}
                                                          </span>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                          <button 
                                                            onClick={() => handleRemoveGrnItem(item.productCode)} 
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                          >
                                                            <Trash2 size={16}/>
                                                          </button>
                                                        </td>
                                                      </tr>

                                                {/* ✅ DECLINED - Special Message Row */}
                                                  {item.status === 'DECLINED' && (
                                                    <tr style={{ background: '#fff5f5' }}>
                                                      <td colSpan="6" style={{ 
                                                        padding: '0px 12px 12px 12px', 
                                                        borderBottom: '1px solid #f1f5f9' 
                                                      }}>
                                                        <div style={{
                                                          background: '#fef2f2',
                                                          border: '1px solid #fecaca',
                                                          borderRadius: '8px',
                                                          padding: '10px 15px',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'space-between',
                                                          gap: '10px'
                                                        }}>
                                                          {/* Left - Message */}
                                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '20px' }}>❌</span>
                                                            <div>
                                                              <div style={{ 
                                                                fontWeight: 'bold', 
                                                                color: '#ef4444', 
                                                                fontSize: '13px' 
                                                              }}>
                                                                {item.declineType === 'NEW_ITEM_APPROVAL' 
                                                                    ? "New Product Request Declined" 
                                                                    : "Price Update Declined"}
                                                              </div>
                                                              <div style={{ 
                                                                color: '#64748b', 
                                                                fontSize: '12px', 
                                                                marginTop: '2px' 
                                                              }}>
                                                                {item.declineType === 'NEW_ITEM_APPROVAL' ? (
                                                                    <>Manager Reason: <strong style={{ color: '#991b1b' }}>{item.managerComment}</strong></>
                                                                ) : (
                                                                    <>Remove this item and re-add with the correct price. Current DB Price: <strong style={{ color: '#1e293b' }}>Rs. {Number(item.oldPrice || 0).toLocaleString()}</strong></>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>

                                                          {/* Right - Remove Button */}
                                                          <button
                                                            onClick={() => handleRemoveGrnItem(item.productCode)}
                                                            style={{
                                                              background: '#ef4444',
                                                              color: '#fff',
                                                              border: 'none',
                                                              padding: '8px 16px',
                                                              borderRadius: '8px',
                                                              cursor: 'pointer',
                                                              fontWeight: 'bold',
                                                              fontSize: '12px',
                                                              display: 'flex',
                                                              alignItems: 'center',
                                                              gap: '6px',
                                                              whiteSpace: 'nowrap'
                                                            }}
                                                          >
                                                            <Trash2 size={14}/> {item.declineType === 'NEW_ITEM_APPROVAL' ? "Remove Item" : "Remove & Re-add"}
                                                          </button>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  )}
                                                    </React.Fragment>
                                                  ))}
                                                </tbody>
                                            </table>
                                        </div>
       {/* 🟢 REAL-WORLD LOGIC: Dynamic Finish Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button 
                onClick={handleCancelGRNDraft} 
                style={{ background: '#fff', color: '#ef4444', padding: '12px 25px', borderRadius: '10px', border: '1px solid #ef4444', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
            >
                Cancel GRN
            </button>
            
            {(()=>{
                const hasPending = grnItemsList.some(item => item.status === 'PENDING');
                const hasDeclined = grnItemsList.some(item => item.status === 'DECLINED');
                const isEmpty = grnItemsList.length === 0;
                

                const isReadyToSave = !isEmpty && !hasPending && !hasDeclined;


                let buttonText = "Finish & Save to Database";
                if (hasPending) buttonText = "⏳ Waiting for Approvals...";
                else if (hasDeclined) buttonText = "❌ Resolve Declined Items";
                else if (isEmpty) buttonText = "Add Items to Save";

                return (
                    <button 
                        onClick={handleCompleteGrn} 
                        disabled={!isReadyToSave}
                        style={{ 
                            background: isReadyToSave ? '#2563eb' : '#cbd5e1', 
                            color: isReadyToSave ? '#fff' : '#64748b', 
                            padding: '12px 35px', 
                            borderRadius: '10px', 
                            border: 'none', 
                            fontWeight: 'bold', 
                            cursor: isReadyToSave ? 'pointer' : 'not-allowed', 
                            boxShadow: isReadyToSave ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
                            transition: 'all 0.3s ease-in-out',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        title={!isReadyToSave ? "All items must be in 'READY' status to save." : ""}
                    >
                        {isReadyToSave && <Save size={18} />}
                        {buttonText}
                    </button>
                );
            })()}
        </div>
                                    </>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                                        No items added yet.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        ) : (
            /* GRN HISTORY VIEW */
<div style={{ background: '#fff', borderRadius: '16px', padding: '25px', border: '1px solid #e2e8f0' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '20px' }}>
    <ShieldCheck size={20}/>
    <span style={{ fontWeight: 'bold' }}>GRN History Table</span>
  </div>

  <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
    <input
      type="text"
      placeholder="Search by Invoice / Supplier / GRN ID"
      value={grnSearch}
      onChange={(e) => setGrnSearch(e.target.value)}
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        outline: 'none',
        minWidth: '260px'
      }}
    />

    <input
      type="date"
      value={grnFilterDate}
      onChange={(e) => setGrnFilterDate(e.target.value)}
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        outline: 'none'
      }}
    />

    <button
      onClick={() => {
        setGrnSearch('');
        setGrnFilterDate('');
      }}
      style={{
        background: '#f1f5f9',
        color: '#1e293b',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Clear
    </button>
  </div>

  {filteredGrnHistory.length > 0 ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {filteredGrnHistory.map((grn) => (
        <div
          key={grn.id}
          onClick={() => handleViewGrn(grn)}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            background: '#f8fafc',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <div>
              <h4 style={{ margin: '0', color: '#1e293b' }}>{grn.supplier}</h4>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Invoice: {grn.invoice} | Date: {grn.date}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
              Saved: {grn.timestamp}
            </div>
          </div>

          <table style={{ width: '100%', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: '#64748b' }}>
                <th align="left">Item</th>
                <th align="center">Qty</th>
                <th align="right">Price</th>
              </tr>
            </thead>
            <tbody>
              {(grn.items || []).map((it, i) => (
                <tr key={i}>
                  <td>{it.productName}</td>
                  <td align="center" style={{ color: '#10b981', fontWeight: 'bold' }}>+{it.addedQty}</td>
                  <td align="right">Rs. {Number(it.newBuyingPrice || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  ) : (
    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
      No GRN records found for your search.
    </div>
  )}
</div>
        )}
    </div>
)}

        {/* 🟢 DAMAGED / RETURNS TAB 🟢 */}
        {activeTab === 'damaged' && (
            <div style={{animation: 'fadeIn 0.3s ease-in-out', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                
                <h2 style={{margin: '0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Trash2 color="#ef4444"/> Damaged Goods & Supplier Returns
                </h2>

                <div style={{background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0'}}>
                    <h3 style={{margin: '0 0 15px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <AlertTriangle size={18} color="#ef4444"/> Record a Damaged Item
                    </h3>
                    <p style={{fontSize: '13px', color: '#64748b', marginBottom: '20px'}}>
                        Recording an item here will <strong>deduct it from the Main Stock</strong> immediately. Ensure you have the physical item separated.
                    </p>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                        {/* 🟢 SEARCHABLE PRODUCT DROPDOWN FOR DAMAGED ITEMS */}
                        <div style={{ position: 'relative' }}>
                            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Search & Select Product *</label>
                            
                            <div style={{ position: 'relative' }}>
                                <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                                <input
                                    type="text"
                                    placeholder="Type part name or code..."
                                    value={damageProductSearchTerm}
                                    onChange={(e) => {
                                        setDamageProductSearchTerm(e.target.value);
                                        setShowDamageProductDropdown(true);
                                        if(e.target.value === '') setDamageItemCode('');
                                    }}
                                    onFocus={() => setShowDamageProductDropdown(true)}

                                    onBlur={() => setTimeout(() => setShowDamageProductDropdown(false), 200)}
                                    style={{
                                        width: '100%', padding: '12px 35px', borderRadius: '8px',
                                        border: '1px solid #cbd5e1', outline: 'none', background: '#fff',
                                        fontSize: '14px', color: '#1e293b', boxSizing: 'border-box'
                                    }}
                                />
                                {/* Clear Button */}
                                {damageProductSearchTerm && (
                                    <X size={16} color="#ef4444" style={{ position: 'absolute', top: '14px', right: '12px', cursor: 'pointer' }} 
                                       onClick={() => { setDamageProductSearchTerm(''); setDamageItemCode(''); }} />
                                )}
                            </div>

                            {/* Floating Dropdown List */}
                            {showDamageProductDropdown && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
                                    border: '1px solid #e2e8f0', borderRadius: '10px', marginTop: '6px',
                                    maxHeight: '280px', overflowY: 'auto', zIndex: 9999,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                }}>
                                    {items.filter(item =>
                                       `${item.productCode} ${item.productName}`.toLowerCase().includes(damageProductSearchTerm.toLowerCase())
                                    ).map(item => {
                                       const stock = getStockQty(item);
                                       return (
                                        <div
                                            key={item.productCode}
                                            onMouseDown={() => {
                                               setDamageItemCode(item.productCode);
                                               setDamageProductSearchTerm(`${item.productCode} - ${item.productName}`);
                                               setShowDamageProductDropdown(false);
                                            }}
                                            style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>{item.productName || "Unnamed"}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.productCode}</div>
                                            </div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px',
                                                background: stock === 0 ? '#fef2f2' : '#ecfdf5',
                                                color: stock === 0 ? '#ef4444' : '#10b981'
                                            }}>
                                                Stock: {stock}
                                            </div>
                                        </div>
                                      )
                                    })}
                                    
                                    {items.filter(item => `${item.productCode} ${item.productName}`.toLowerCase().includes(damageProductSearchTerm.toLowerCase())).length === 0 && (
                                       <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                          No matching products found.
                                       </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Damaged Quantity *</label>
                            <input type="number" placeholder="e.g. 2" value={damageQty} onChange={e => setDamageQty(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'}} />
                        </div>

                        <div>
                            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Select Supplier to Return *</label>
                            <select value={damageSupplier} onChange={e => setDamageSupplier(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', cursor: 'pointer'}}>
                                <option value="">-- Select Supplier --</option>
                                {suppliersList.map(sup => {
                                    const displayName = sup.company ? `${sup.company} (${sup.supplierName})` : sup.supplierName;
                                    return <option key={sup.id} value={displayName}>{displayName}</option>
                                })}
                            </select>
                        </div>
                    </div>

                    <div style={{marginTop: '20px'}}>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Reason for Return / Issue *</label>
                        <input type="text" placeholder="e.g. Broken in transit, Manufacturing defect" value={damageReason} onChange={e => setDamageReason(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'}} />
                    </div>

                    <div style={{marginTop: '25px', display: 'flex', justifyContent: 'flex-end'}}>
                        <button onClick={handleDamageSubmit} style={{background: '#ef4444', color: '#fff', padding: '12px 30px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'}}>
                            <Trash2 size={18}/> Deduct Stock & Record Return
                        </button>
                    </div>
                </div>

                <div style={{background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0'}}>
                    <h3 style={{margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px'}}><History size={18} color="#64748b"/> Damaged & Returns History</h3>
                    
                    {damagedHistory.length > 0 ? (
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                                <tr>
                                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Date & Time</th>
                                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Item Code</th>
                                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Deducted Qty</th>
                                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Reason</th>
                                    <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Returned To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {damagedHistory.map((rec, idx) => (
                                    <tr key={idx} style={{borderBottom: '1px solid #f1f5f9'}}>
                                        <td style={{padding: '12px', color: '#64748b'}}>{rec.date}</td>
                                        <td style={{padding: '12px', fontWeight: 'bold', color: '#1e293b'}}>{rec.productCode}</td>
                                        <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#ef4444'}}>-{rec.qty}</td>
                                        <td style={{padding: '12px', color: '#475569'}}>{rec.reason}</td>
                                        <td style={{padding: '12px', color: '#3b82f6', fontWeight: '500'}}>{rec.supplier}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{padding: '30px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1'}}>
                            No damaged items or returns recorded yet.
                        </div>
                    )}
                </div>

            </div>
        )}

       {/* --- LOW STOCK TAB (TABLE VIEW) --- */}
        {activeTab === 'lowstock' && (
            <div style={{background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease-in-out'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                    <div>
                        <h2 style={{margin: '0 0 5px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px'}}><AlertTriangle/> Action Required: Low Stock</h2>
                        <p style={{margin: 0, color: '#64748b', fontSize: '14px'}}>These items have fallen below their minimum required stock level.</p>
                    </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                        <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                            <tr>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Item Code</th>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Part Name</th>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Min. Limit</th>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Current Qty</th>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockItems.map(item => {
                                const stock = getStockQty(item);
                                const limit = getLowStockLimit(item);
                                return (
                                    <tr key={item.productCode} style={{borderBottom: '1px solid #f1f5f9'}}>
                                        <td style={{padding: '12px', fontWeight: 'bold', color: '#2563eb'}}>{item.productCode}</td>
                                        <td style={{padding: '12px', color: '#1e293b'}}>{item.productName || "Unnamed"}</td>
                                        <td style={{padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: '500'}}>{limit}</td>
                                        <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#ef4444'}}>{stock}</td>
                                        <td style={{padding: '12px', textAlign: 'center'}}>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: '#fff7ed', color: '#ea580c', textTransform: 'uppercase' }}>Low Stock</span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {lowStockItems.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#10b981', fontWeight: 'bold'}}>All stock levels are healthy! 🎉</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        {/* --- OUT OF STOCK TAB (TABLE VIEW) --- */}
        {activeTab === 'outofstock' && (
            <div style={{background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease-in-out'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                    <div>
                        <h2 style={{margin: '0 0 5px 0', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '10px'}}><Ban/> Out of Stock Items</h2>
                        <p style={{margin: 0, color: '#64748b', fontSize: '14px'}}>These items are completely out of stock and unavailable for sale.</p>
                    </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                        <thead style={{background: '#f8fafc', textAlign: 'left'}}>
                            <tr>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Item Code</th>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Part Name</th>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Current Qty</th>
                                <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center'}}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outOfStockItems.map(item => (
                                <tr key={item.productCode} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td style={{padding: '12px', fontWeight: 'bold', color: '#2563eb'}}>{item.productCode}</td>
                                    <td style={{padding: '12px', color: '#1e293b'}}>{item.productName || "Unnamed"}</td>
                                    <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#ef4444'}}>0</td>
                                    <td style={{padding: '12px', textAlign: 'center'}}>
                                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: '#fef2f2', color: '#ef4444', textTransform: 'uppercase' }}>Out of Stock</span>
                                    </td>
                                </tr>
                            ))}
                            {outOfStockItems.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#10b981', fontWeight: 'bold'}}>No out of stock items! 🎉</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        {/* 🟢 COMPATIBILITY CHECK TAB */}
        {activeTab === 'compatibility' && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ margin: '0 0 20px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BoxSelect color="#2563eb" /> Parts Compatibility Check
                    </h2>
                    
                    {/* Toggle Buttons: Search By Part OR Search By Vehicle */}
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

                    {/* Search Inputs */}
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
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontSize: '14px' }}
                                >
                                    <option value="">-- Choose Brand --</option>
                                    {/* 🟢 DB එකෙන් ආපු Brands ටික පෙන්වනවා */}
                                    {vehicleBrandsList.map(b => <option key={b} value={b}>{b}</option>)}
                                    {vehicleBrandsList.length === 0 && <option value="" disabled>No brands found in DB</option>}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>Enter Vehicle Model (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Corolla, Civic..." 
                                    value={compatVehicleModel} 
                                    onChange={(e) => setCompatVehicleModel(e.target.value)} 
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }} 
                                />
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                        Matching Results
                    </h3>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <tr>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Item Code</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Part Name</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Category / Brand</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Compatible Vehicles</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.filter(item => {
                                    if (compatMode === 'by_part') {
                                        if (!compatPartSearch) return false;
                                        const search = compatPartSearch.toLowerCase();
                                        return (item.productCode && item.productCode.toLowerCase().includes(search)) || 
                                               (item.productName && item.productName.toLowerCase().includes(search));
                                    } else {
                                        if (!compatVehicleBrand) return false;

                                        const searchData = `${item.productName} ${item.partCategory} ${item.compatibleVehicles || ''}`.toLowerCase();
                                        const brandMatch = searchData.includes(compatVehicleBrand.toLowerCase());
                                        const modelMatch = compatVehicleModel ? searchData.includes(compatVehicleModel.toLowerCase()) : true;
                                        return brandMatch && modelMatch;
                                    }
                                }).map(item => (
                                    <tr key={item.productCode} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{item.productCode}</td>
                                        <td style={{ padding: '12px', color: '#1e293b' }}>{item.productName || "Unnamed"}</td>
                                        <td style={{ padding: '12px', color: '#64748b' }}>{item.partCategory || "N/A"}</td>
                                        <td style={{ padding: '12px', color: '#0ea5e9', fontWeight: '500' }}>
                                            {item.compatibleVehicles || "All standard models (Verify manually)"}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: getStockQty(item) > 0 ? '#10b981' : '#ef4444' }}>
                                            {getStockQty(item) > 0 ? `${getStockQty(item)} In Stock` : 'Out of Stock'}
                                        </td>
                                    </tr>
                                ))}
                                {items.filter(item => {
                                    if (compatMode === 'by_part') return compatPartSearch && ((item.productCode && item.productCode.toLowerCase().includes(compatPartSearch.toLowerCase())) || (item.productName && item.productName.toLowerCase().includes(compatPartSearch.toLowerCase())));
                                    return compatVehicleBrand && `${item.productName} ${item.partCategory} ${item.compatibleVehicles || ''}`.toLowerCase().includes(compatVehicleBrand.toLowerCase()) && (compatVehicleModel ? `${item.productName} ${item.partCategory} ${item.compatibleVehicles || ''}`.toLowerCase().includes(compatVehicleModel.toLowerCase()) : true);
                                }).length === 0 && (
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
        )}
     {/* 🟢 PROFILE TAB (UPDATED DESIGN) */}
        {activeTab === 'profile' && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h2 style={{ margin: '0 0 25px 0', color: '#0f172a' }}>My Profile & Security</h2>
                
                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    
                    {/* Left Profile Card (Matched with Image) */}
                    <div style={{ flex: '1', minWidth: '320px', maxWidth: '400px', background: '#fff', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                        
                        {/* Avatar */}
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#2563eb', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)' }}>
                                <User size={60} color="#fff" strokeWidth={2} />
                            </div>
                            <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#10b981', width: '24px', height: '24px', borderRadius: '50%', border: '4px solid #fff' }}></div>
                        </div>
                        
                        {/* Name & Role */}
                        <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>{profileData.name}</h2>
                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '700', border: '1px solid #bfdbfe', marginBottom: '35px' }}>
                            {profileData.role}
                        </span>

                     {/* Contact Info List */}
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '35px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#475569', fontSize: '15px' }}>
                                <div style={{ background: '#f8fafc', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3b82f6' }}>
                                    <Mail size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: '500', wordBreak: 'break-all' }}>{profileData.email}</span>
                                    {emailStatus === 'PENDING' && (
                                        <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Info size={14}/> Pending Approval
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#475569', fontSize: '15px' }}>
                                <div style={{ background: '#f8fafc', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3b82f6' }}>
                                    <Phone size={20} />
                                </div>
                                <span style={{ fontWeight: '500' }}>{profileData.phone}</span>
                            </div>
                            {/* 🟢 NEW: Address Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#475569', fontSize: '15px' }}>
                                <div style={{ background: '#f8fafc', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3b82f6' }}>
                                    <MapPin size={20} />
                                </div>
                                <span style={{ fontWeight: '500' }}>{profileData.address}</span>
                            </div>
                        </div>

                        {/* 🟢 Edit Button (Updated to pass address & branch) */}
                        <button 
                            onClick={() => { setEditProfileForm({ name: profileData.name, phone: profileData.phone, email: profileData.email, branch: profileData.branch, address: profileData.address }); setShowEditProfileModal(true); }} 
                            style={{ width: '100%', padding: '14px', background: '#fff', color: '#2563eb', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        >
                            <Edit3 size={18} /> Edit Profile Information
                        </button>
                    </div>

                    {/* Right Side: Employment & Security Cards */}
                    <div style={{ flex: '2', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        
                        {/* Employment Details */}
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Briefcase size={20} color="#2563eb"/> Employment Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>Employee ID</span>
                                    <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>{profileData.employeeId}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>Assigned Branch</span>
                                    <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>{profileData.branch}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>Session Started At</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '700', fontSize: '13px' }}>
                                        <Clock size={16} color="#f59e0b"/> {loginTime}
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>Joined Date</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '700', fontSize: '16px' }}>
                                        <Calendar size={16} color="#2563eb"/> {profileData.joinedDate}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Email */}
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={20} color="#0ea5e9"/> Update Email Address</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '350px' }}>Changing your email requires approval from the Branch Manager.</p>
                            </div>
                            <button 
                                onClick={() => setShowEmailModal(true)} 
                                disabled={emailStatus === 'PENDING'}
                                style={{ padding: '12px 25px', background: emailStatus === 'PENDING' ? '#cbd5e1' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: emailStatus === 'PENDING' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                            >
                                <Mail size={16}/> Request Change
                            </button>
                        </div>

                        {/* Security */}
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color="#10b981"/> Account Security</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Manage your password and security settings to keep your account safe.</p>
                            </div>
                            <button onClick={() => setShowPasswordModal(true)} style={{ padding: '12px 25px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                                <Key size={16}/> Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* 🟢 Modals Section 🟢 */}

{/* Request New Item Modal 🔴 */}
{/* Request New Item Modal 🔴 */}
<AnimatePresence>
  {showNewItemRequestModal && (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <motion.div
        style={{background: '#fff', width: '450px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Package color="#2563eb"/> Request New Product
          </h2>
          <button onClick={() => setShowNewItemRequestModal(false)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'}}>
            <X size={24}/>
          </button>
        </div>

        <p style={{color:'#64748b', fontSize:'13px', marginBottom: '20px'}}>
          Send the invoice details to the Manager to register this item in the Database.
        </p>
        
        {/* 🟢 UPDATED FORM: Scrollable container with new fields */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '5px'}}>
          
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Item Code (Barcode / ID) *</label>
            <input type="text" placeholder="e.g. BDY-15" value={newItemForm.productCode} onChange={(e) => setNewItemForm({...newItemForm, productCode: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase'}} autoFocus />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Item Name *</label>
            <input type="text" placeholder="e.g. Front Bumper Guard" value={newItemForm.productName} onChange={(e) => setNewItemForm({...newItemForm, productName: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              {/* 🟢 Vehicle Type */}
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Vehicle Type *</label>
                {isCustomType ? (
                    <div style={{display: 'flex', gap: '8px'}}>
                        <input type="text" placeholder="Enter new type..." value={newItemForm.vehicleType} onChange={(e) => setNewItemForm({...newItemForm, vehicleType: e.target.value})} style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} autoFocus />
                        <button onClick={() => { setIsCustomType(false); setNewItemForm({...newItemForm, vehicleType: ''}); }} style={{background: '#f1f5f9', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer', color: '#64748b'}} title="Cancel"><X size={16}/></button>
                    </div>
                ) : (
                    <select value={newItemForm.vehicleType} onChange={(e) => handleNewItemVehicleTypeChange(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', cursor: 'pointer'}}>
                        <option value="">-- Select Type --</option>
                        {[...new Set(items.map(i => i.vehicleType).filter(Boolean))].sort().map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                        <option value="OTHER" style={{fontWeight: 'bold', color: '#2563eb'}}>+ Add New Type...</option>
                    </select>
                )}
              </div>

              {/* 🟢 Vehicle Brand */}
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Vehicle Brand *</label>
                {isCustomBrand ? (
                    <div style={{display: 'flex', gap: '8px'}}>
                        <input type="text" placeholder="Enter new brand..." value={newItemForm.brand} onChange={(e) => setNewItemForm({...newItemForm, brand: e.target.value})} style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} autoFocus />
                        <button onClick={() => { setIsCustomBrand(false); setNewItemForm({...newItemForm, brand: ''}); }} style={{background: '#f1f5f9', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer', color: '#64748b'}} title="Cancel"><X size={16}/></button>
                    </div>
                ) : (
                    <select value={newItemForm.brand} onChange={(e) => {
                        if (e.target.value === 'OTHER') {
                            setIsCustomBrand(true);
                            setNewItemForm({...newItemForm, brand: ''});
                        } else {
                            setNewItemForm({...newItemForm, brand: e.target.value});
                        }
                    }} disabled={!newItemForm.vehicleType && !isCustomType} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: (!newItemForm.vehicleType && !isCustomType) ? '#f8fafc' : '#fff', cursor: (!newItemForm.vehicleType && !isCustomType) ? 'not-allowed' : 'pointer'}}>
                        <option value="">-- Select Brand --</option>
                        {filteredBrandsForNewItem.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                        <option value="OTHER" style={{fontWeight: 'bold', color: '#2563eb'}}>+ Add New Brand...</option>
                    </select>
                )}
              </div>
          </div>

          {/* 🟢 Part Category */}
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Part Category *</label>
            {isCustomCategory ? (
                <div style={{display: 'flex', gap: '8px'}}>
                    <input type="text" placeholder="Enter new category..." value={newItemForm.partCategory} onChange={(e) => setNewItemForm({...newItemForm, partCategory: e.target.value})} style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} autoFocus />
                    <button onClick={() => { setIsCustomCategory(false); setNewItemForm({...newItemForm, partCategory: ''}); }} style={{background: '#f1f5f9', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer', color: '#64748b'}} title="Cancel"><X size={16}/></button>
                </div>
            ) : (
                <select value={newItemForm.partCategory} onChange={(e) => {
                    if (e.target.value === 'OTHER') {
                        setIsCustomCategory(true);
                        setNewItemForm({...newItemForm, partCategory: ''});
                    } else {
                        setNewItemForm({...newItemForm, partCategory: e.target.value});
                    }
                }} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', cursor: 'pointer'}}>
                    <option value="">-- Select Category --</option>
                    {[...new Set(items.map(i => i.partCategory).filter(Boolean))].sort().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="OTHER" style={{fontWeight: 'bold', color: '#2563eb'}}>+ Add New Category...</option>
                </select>
            )}
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Compatible Model</label>
                <input type="text" placeholder="e.g. Corolla / All" value={newItemForm.model} onChange={(e) => setNewItemForm({...newItemForm, model: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Manufacture Year</label>
                <input type="text" placeholder="e.g. 2018-2023" value={newItemForm.manufactureYear} onChange={(e) => setNewItemForm({...newItemForm, manufactureYear: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
              </div>
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Photo URL Link</label>
            <input type="text" placeholder="e.g. https://example.com/image.jpg" value={newItemForm.imageUrl} onChange={(e) => setNewItemForm({...newItemForm, imageUrl: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
          </div>

          {/* 🟢 NEW: Quantity and Buying Price Side-by-Side */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Buying Price (Rs.) *</label>
                <input type="number" placeholder="e.g. 5000" value={newItemForm.buyingPrice} onChange={(e) => setNewItemForm({...newItemForm, buyingPrice: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>Quantity *</label>
                <input type="number" placeholder="e.g. 10" value={newItemForm.quantity} onChange={(e) => setNewItemForm({...newItemForm, quantity: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
              </div>
          </div>

        </div>

        <div style={{display:'flex', gap:'10px'}}>
          <button
            onClick={handleNewItemRequestSubmit}
            style={{flex: 2, background:'#2563eb', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}
          >
            <Send size={16}/> Send Request & Add to GRN
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
<AnimatePresence>
  {showNewSupplierRequestModal && (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <motion.div
        style={{background: '#fff', width: '450px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Truck color="#0ea5e9"/> Request New Supplier
          </h2>
          <button
            onClick={() => setShowNewSupplierRequestModal(false)}
            style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'}}
          >
            <X size={24}/>
          </button>
        </div>

        <p style={{color:'#64748b', fontSize:'13px', marginBottom: '20px'}}>
          Send the supplier details to the Manager for approval and registration in the system.
        </p>

        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px'}}>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>
              Supplier Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Janana"
              value={newSupplierForm.supplierName}
              onChange={(e) => setNewSupplierForm({...newSupplierForm, supplierName: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}}
              autoFocus
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Toyota Lanka"
              value={newSupplierForm.company}
              onChange={(e) => setNewSupplierForm({...newSupplierForm, company: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}}
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>
              Contact Number *
            </label>
            <input
              type="text"
              placeholder="e.g. 0771234567"
              value={newSupplierForm.contactNumber}
              onChange={(e) => setNewSupplierForm({...newSupplierForm, contactNumber: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}}
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>
              Email
            </label>
            <input
              type="email"
              placeholder="e.g. supplier@gmail.com"
              value={newSupplierForm.email}
              onChange={(e) => setNewSupplierForm({...newSupplierForm, email: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}}
            />
          </div>

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px'}}>
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. Colombo"
              value={newSupplierForm.address}
              onChange={(e) => setNewSupplierForm({...newSupplierForm, address: e.target.value})}
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}}
            />
          </div>
        </div>

        <div style={{display:'flex', gap:'10px'}}>
          <button
            onClick={handleNewSupplierRequestSubmit}
            style={{flex: 2, background:'#0ea5e9', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}
          >
            <Send size={16}/> Send Supplier Request
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      {/* Cancel GRN Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirmModal && (
          <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
              <motion.div style={{background: '#fff', width: '400px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center'}} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                  <X size={50} color="#ef4444" style={{marginBottom:'15px'}}/>
                  <h2 style={{fontSize: '22px', margin: '0 0 10px 0', color: '#1e293b'}}>Discard GRN?</h2>
                  <p style={{color:'#64748b', fontSize:'14px', marginBottom: '25px'}}>Are you sure you want to clear all entered details and cancel this GRN?</p>
                  <div style={{display:'flex', gap:'10px'}}>
                      <button onClick={confirmCancelGRN} style={{flex: 1, background:'#ef4444', color:'#fff', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Yes, Cancel</button>
                      <button onClick={() => setShowCancelConfirmModal(false)} style={{flex: 1, background:'#f1f5f9', color:'#1e293b', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight: 'bold'}}>No, Continue</button>
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
{/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div style={{background: '#fff', width: '450px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                    <h2 style={{margin: 0, color: '#1e293b', fontSize: '22px'}}>Edit Profile</h2>
                    <button onClick={() => setShowEditProfileModal(false)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'}}><X size={24}/></button>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Full Name</label>
                        <input type="text" value={editProfileForm.name || ''} onChange={(e) => setEditProfileForm({...editProfileForm, name: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
                    </div>
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Email Address (Gmail) <span style={{color: '#ef4444'}}>*</span></label>
                        <input type="email" value={editProfileForm.email || ''} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed'}} title="Request email change from Manager" />
                    </div>
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Phone Number</label>
                        <input type="text" value={editProfileForm.phone || ''} onChange={(e) => setEditProfileForm({...editProfileForm, phone: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
                    </div>
                    {/* 🟢 NEW: Address Field */}
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Address</label>
                        <input type="text" value={editProfileForm.address || ''} onChange={(e) => setEditProfileForm({...editProfileForm, address: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} />
                    </div>
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Assigned Branch</label>
                        <div style={{position: 'relative'}}>
                            <MapPin size={18} color="#94a3b8" style={{position: 'absolute', top: '12px', left: '12px'}}/>
                            {/* 🟢 Made this editable (Removed disabled & changed background) */}
                            <input type="text" value={editProfileForm.branch || ''} onChange={(e) => setEditProfileForm({...editProfileForm, branch: e.target.value})} style={{width: '100%', padding: '12px 12px 12px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', outline: 'none', boxSizing: 'border-box'}} />
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                    <button onClick={handleProfileUpdateSubmit} style={{flex: 2, background: '#2563eb', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}><Save size={18}/> Save Changes</button>
                    <button onClick={() => setShowEditProfileModal(false)} style={{flex: 1, background: '#f1f5f9', color: '#1e293b', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* Request Email Change Modal */}
      {showEmailModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div style={{background: '#fff', width: '400px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                    <h2 style={{margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}><Mail color="#0ea5e9"/> Request Email Change</h2>
                    <button onClick={() => setShowEmailModal(false)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'}}><X size={24}/></button>
                </div>
                <p style={{fontSize: '13px', color: '#64748b', marginBottom: '20px'}}>Your new email address will only be updated after the Manager approves this request.</p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Current Email</label>
                    <input type="text" value={profileData.email} disabled style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#94a3b8', boxSizing: 'border-box'}} /></div>
                    
                    <div><label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>New Email Address *</label>
                    <input type="email" placeholder="Enter new email" value={newEmailReq} onChange={(e) => setNewEmailReq(e.target.value)} autoFocus style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} /></div>
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                    <button onClick={handleEmailChangeRequest} style={{flex: 2, background: '#0ea5e9', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>Send Request</button>
                    <button onClick={() => setShowEmailModal(false)} style={{flex: 1, background: '#f1f5f9', color: '#1e293b', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Cancel</button>
                </div>
            </div>
        </div>
      )}
{/* GRN View Modal */}
<AnimatePresence>
  {showGrnViewModal && selectedGrn && (
    <div
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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        style={{
          background: '#fff',
          width: '700px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0, color: '#1e293b'}}>GRN Bill View</h2>
          <button
            onClick={() => setShowGrnViewModal(false)}
            style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'}}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{marginBottom: '20px', lineHeight: '1.8'}}>
          <div><strong>GRN ID:</strong> {selectedGrn.grnId}</div>
          <div><strong>Supplier:</strong> {selectedGrn.supplier}</div>
          <div><strong>Invoice No:</strong> {selectedGrn.invoice}</div>
          <div><strong>Date:</strong> {selectedGrn.date}</div>
          <div><strong>Saved At:</strong> {selectedGrn.timestamp}</div>
        </div>

        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
          <thead>
            <tr style={{background: '#f8fafc'}}>
              <th style={{padding: '12px', textAlign: 'left'}}>Item</th>
              <th style={{padding: '12px', textAlign: 'center'}}>Qty</th>
              <th style={{padding: '12px', textAlign: 'right'}}>Price</th>
              <th style={{padding: '12px', textAlign: 'right'}}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(selectedGrn.items || []).length > 0 ? (
              selectedGrn.items.map((it, i) => (
                <tr key={i} style={{borderTop: '1px solid #e2e8f0'}}>
                  <td style={{padding: '12px'}}>{it.productName}</td>
                  <td style={{padding: '12px', textAlign: 'center'}}>+{it.addedQty}</td>
                  <td style={{padding: '12px', textAlign: 'right'}}>
                    Rs. {Number(it.newBuyingPrice || 0).toLocaleString()}
                  </td>
                  <td style={{padding: '12px', textAlign: 'right'}}>
                    Rs. {(Number(it.addedQty || 0) * Number(it.newBuyingPrice || 0)).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
                  No item details found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{marginTop: '20px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b'}}>
          <div>Total Qty: {selectedGrn.items?.reduce((sum, i) => sum + Number(i.addedQty || 0), 0)}</div>
          <div>
            Total Value: Rs. {selectedGrn.items?.reduce(
              (sum, i) => sum + (Number(i.addedQty || 0) * Number(i.newBuyingPrice || 0)),
              0
            ).toLocaleString()}
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div style={{background: '#fff', width: '400px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                    <h2 style={{margin: 0, color: '#1e293b', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px'}}><ShieldCheck color="#10b981"/> Security Settings</h2>
                    <button onClick={() => setShowPasswordModal(false)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'}}><X size={24}/></button>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Current Password</label>
                    <input type="password" placeholder="Enter current password" value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} /></div>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>New Password</label>
                    <input type="password" placeholder="Enter new password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({...passwordForm, newPass: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} /></div>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '5px'}}>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box'}} /></div>
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                    <button onClick={handlePasswordUpdateSubmit} style={{flex: 2, background: '#2563eb', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}><Key size={16}/> Update Password</button>
                    <button onClick={() => setShowPasswordModal(false)} style={{flex: 1, background: '#f1f5f9', color: '#1e293b', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Cancel</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default StoreDashboard;