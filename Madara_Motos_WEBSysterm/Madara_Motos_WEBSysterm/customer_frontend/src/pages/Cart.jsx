// src/pages/Cart.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

const NO_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250' viewBox='0 0 250 250'%3E%3Crect width='250' height='250' fill='%23f3f4f6'/%3E%3Ctext x='125' y='115' text-anchor='middle' font-size='40'%3E%F0%9F%94%A7%3C/text%3E%3Ctext x='125' y='150' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='13' font-family='Arial'%3ENo Image%3C/text%3E%3C/svg%3E`

const formatLKR = (n) => {
  const val = Number(n || 0)
  return `Rs. ${val.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getImageUrl = (url) => {
  if (!url) return NO_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://localhost:8080/uploads/${url}`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE IMAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SafeImg = ({ src, alt, style }) => {
  const [imgSrc, setImgSrc] = useState(src || NO_IMAGE)
  useEffect(() => { setImgSrc(src || NO_IMAGE) }, [src])
  return (
    <img
      src={imgSrc}
      alt={alt || 'Product'}
      style={style}
      onError={() => setImgSrc(NO_IMAGE)}
    />
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CART SEARCH SECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CartSearchSection = () => {
  const navigate                        = useNavigate()
  const [searchTerm,  setSearchTerm]    = useState('')
  const [allProducts, setAllProducts]   = useState([])
  const [loading,     setLoading]       = useState(false)
  const inputRef                        = useRef(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const res = await axios.get('http://localhost:8080/api/spareparts/all')
        const all = Array.isArray(res.data) ? res.data : []
        setAllProducts(all.filter(p => Number(p.stockQty) > 0))
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = searchTerm.length >= 2
    ? allProducts.filter(p => {
        const q = searchTerm.toLowerCase()
        return (
          p.productName?.toLowerCase().includes(q)  ||
          p.partCategory?.toLowerCase().includes(q) ||
          p.productCode?.toLowerCase().includes(q)  ||
          p.brand?.toLowerCase().includes(q)        ||
          p.vehicleType?.toLowerCase().includes(q)
        )
      }).slice(0, 12)
    : []

  const showResults = searchTerm.length >= 2

  return (
    <div style={cs.wrap}>

      {/* Label */}
      <div style={cs.label}>
        <span style={{ fontSize: '18px' }}>🛍️</span>
        <span>Add More Products to Cart</span>
      </div>

      {/* Search Input */}
      <div style={cs.inputWrap}>
        <span style={{ fontSize: '18px', color: '#94a3b8', flexShrink: 0 }}>
          {loading ? '⏳' : '🔍'}
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search parts by name, category, brand or code..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && setSearchTerm('')}
          style={cs.input}
        />
        {searchTerm && (
          <button
            style={cs.clearBtn}
            onClick={() => { setSearchTerm(''); inputRef.current?.focus() }}
          >✕</button>
        )}
        {showResults && (
          <span style={cs.countBadge}>{filtered.length} found</span>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div style={{ marginTop: '14px', animation: 'slideDown 0.25s ease' }}>

          {/* Loading */}
          {loading && (
            <div style={cs.centerMsg}>
              <div style={cs.spinner} />
              <span style={{ fontSize: '13px', color: '#64748b' }}>Loading products...</span>
            </div>
          )}

          {/* No Results */}
          {!loading && filtered.length === 0 && (
            <div style={cs.centerMsg}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>
                No products found for "{searchTerm}"
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Try a different name, category or product code
              </div>
            </div>
          )}

          {/* Product Cards */}
          {!loading && filtered.length > 0 && (
            <>
              <div style={cs.resultsHeader}>
                <span style={cs.resultsCount}>
                  🛒 {filtered.length} products with stock available
                </span>
                <span style={cs.resultsHint}>
                  Click a card to view full product details
                </span>
              </div>

              <div style={cs.cardsGrid}>
                {filtered.map(product => {
                  const price    = Number(product.sellingPrice ?? product.price ?? 0)
                  const stock    = Number(product.stockQty)
                  const lowStock = stock > 0 && stock <= 5

                  return (
                    <div
                      key={product.productCode}
                      style={cs.card}
                      onClick={() => navigate(`/parts/${product.productCode}`)}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform   = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow   = '0 12px 30px rgba(230,126,34,0.2)'
                        e.currentTarget.style.borderColor = '#e67e22'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform   = 'translateY(0)'
                        e.currentTarget.style.boxShadow   = '0 4px 12px rgba(0,0,0,0.06)'
                        e.currentTarget.style.borderColor = '#f0f0f0'
                      }}
                    >
                      <div style={cs.cardImg}>
                        <SafeImg
                          src={getImageUrl(product.imageUrl)}
                          alt={product.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div style={cs.cardCategory}>
                        {product.partCategory || 'Part'}
                      </div>
                      <div style={cs.cardName}>
                        {product.productName}
                      </div>
                      {product.productCode && (
                        <div style={cs.cardCode}>#{product.productCode}</div>
                      )}
                      <div style={cs.cardStockRow}>
                        {lowStock
                          ? <span style={cs.stockLow}>⚠️ Only {stock} left</span>
                          : <span style={cs.stockIn}>✅ {stock} in stock</span>
                        }
                      </div>
                      <div style={cs.cardPrice}>{formatLKR(price)}</div>
                      <div style={cs.cardHint}>🔍 Click to view full details →</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TERMS MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TermsModal = ({ onClose }) => (
  <div style={ms.overlay} onClick={onClose}>
    <div style={ms.modal} onClick={e => e.stopPropagation()}>

      <div style={ms.header}>
        <div>
          <h2 style={ms.title}>📋 Terms & Conditions</h2>
          <p style={ms.subtitle}>Madara Motors — Effective Date: January 2025</p>
        </div>
        <button style={ms.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div style={ms.body}>

        {/* 1. Return */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>1. 📦 Return & Refund Policy</h3>
          <div style={ms.card}>
            {[
              { badge:'✅ Eligible',       bg:'#dcfce7', color:'#16a34a',
                text:'Items may be returned within <strong>7 days</strong> of purchase.' },
              { badge:'⚠️ Condition',      bg:'#fef3c7', color:'#d97706',
                text:'Items must be <strong>unused, uninstalled</strong>, in original packaging.' },
              { badge:'❌ Non-returnable', bg:'#fee2e2', color:'#dc2626',
                text:'<strong>Electrical parts, used/installed items</strong> and custom orders are not eligible.' },
              { badge:'💰 Refund',         bg:'#eff6ff', color:'#2563eb',
                text:'Approved refunds processed within <strong>5–7 business days</strong> after inspection.' },
            ].map((p, i) => (
              <div key={i} style={ms.policyRow}>
                <div style={{ ...ms.policyBadge, background: p.bg, color: p.color }}>{p.badge}</div>
                <div style={ms.policyText} dangerouslySetInnerHTML={{ __html: p.text }} />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Cancellation */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>2. ❌ Order Cancellation</h3>
          <div style={ms.card}>
            {[
              { badge:'✅ Free Cancel',      bg:'#dcfce7', color:'#16a34a',
                text:'Orders cancelled within <strong>24 hours</strong> — full refund guaranteed, no questions asked.' },
              { badge:'⚠️ After 24 Hours',   bg:'#fef3c7', color:'#d97706',
                text:'May incur a <strong>10% handling & processing fee</strong> if order is already being prepared.' },
              { badge:'❌ After Collection', bg:'#fee2e2', color:'#dc2626',
                text:'Once collected, orders <strong>cannot be cancelled</strong>. Standard return policy applies.' },
              { badge:'📋 How to Cancel',    bg:'#eff6ff', color:'#2563eb',
                text:'Call <strong>+94 76 992 4173</strong> or email <strong>madaramotors123@gmail.com</strong> with your Order ID immediately.' },
            ].map((p, i) => (
              <div key={i} style={ms.policyRow}>
                <div style={{ ...ms.policyBadge, background: p.bg, color: p.color }}>{p.badge}</div>
                <div style={ms.policyText} dangerouslySetInnerHTML={{ __html: p.text }} />
              </div>
            ))}
            <div style={ms.timeline}>
              <div style={ms.timelineTitle}>📅 Cancellation Timeline</div>
              {[
                { dot:'#16a34a', text:'<strong>0 – 24 hours:</strong> Free cancellation — 100% refund, no fee.' },
                { dot:'#d97706', text:'<strong>24 – 48 hours:</strong> 10% handling fee may apply if order in processing.' },
                { dot:'#f97316', text:'<strong>After 48 hours (not collected):</strong> Reviewed case-by-case. Contact us.' },
                { dot:'#dc2626', text:'<strong>After collection:</strong> No cancellation. Return process only.' },
              ].map((t, i) => (
                <React.Fragment key={i}>
                  <div style={ms.timelineRow}>
                    <div style={{ ...ms.timelineDot, background: t.dot }} />
                    <div style={ms.timelineContent} dangerouslySetInnerHTML={{ __html: t.text }} />
                  </div>
                  {i < 3 && <div style={ms.timelineLine} />}
                </React.Fragment>
              ))}
            </div>
            <div style={{
              marginTop:'14px', background:'#fef3c7',
              border:'1.5px solid #fde68a', borderRadius:'10px',
              padding:'12px 14px', fontSize:'13px',
              color:'#92400e', lineHeight:'1.6'
            }}>
              ⚠️ <strong>Important:</strong> Madara Motors reserves the right to decline cancellation
              for special-order or custom parts already sourced specifically for your order.
            </div>
          </div>
        </div>

        {/* 3. Pickup */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>3. 🏪 Shop Pickup Policy</h3>
          <div style={ms.card}>
            <div style={{
              background:'linear-gradient(135deg,#fff7ed,#ffedd5)',
              border:'2px solid #fed7aa', borderRadius:'12px',
              padding:'14px 16px', marginBottom:'16px',
              display:'flex', gap:'12px'
            }}>
              <span style={{ fontSize:'24px', flexShrink:0 }}>⚠️</span>
              <div>
                <div style={{ fontSize:'14px', fontWeight:'900', color:'#c2410c', marginBottom:'4px' }}>
                  No Delivery — Shop Pickup Only
                </div>
                <div style={{ fontSize:'13px', color:'#7c2d12', lineHeight:'1.6' }}>
                  All orders must be <strong>collected in person</strong> from our shop within <strong>7 days</strong>.
                </div>
              </div>
            </div>
            {[
              { icon:'📍', label:'Address',              desc:'Puththal Rd, Wariyapola, Sri Lanka.' },
              { icon:'🕐', label:'Business Hours',       desc:'Monday – Saturday: 8:00 AM – 6:00 PM. Closed Sundays & public holidays.' },
              { icon:'📞', label:'Call Before Visiting', desc:'+94 76 992 4173 — confirm stock availability before visiting.' },
              { icon:'📋', label:'Bring Order ID',       desc:'Show order confirmation number at the counter.' },
              { icon:'⏳', label:'7-Day Window',         desc:'Uncollected orders auto-cancelled & restocked after 7 calendar days.' },
              { icon:'🪪', label:'ID Required',          desc:'Valid government-issued ID required for orders above Rs. 50,000.' },
            ].map((item, i) => (
              <div key={i} style={ms.deliveryRow}>
                <span style={ms.deliveryIcon}>{item.icon}</span>
                <div>
                  <div style={ms.deliveryLabel}>{item.label}</div>
                  <div style={ms.deliveryDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Warranty */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>4. 🛡️ Warranty Policy</h3>
          <div style={ms.card}>
            {[
              { badge:'✅ Genuine OEM',   bg:'#dcfce7', color:'#16a34a',
                text:"OEM parts carry full <strong>manufacturer's warranty</strong>. Duration varies by brand." },
              { badge:'🔧 Aftermarket',   bg:'#eff6ff', color:'#2563eb',
                text:'Aftermarket parts: <strong>30-day warranty</strong> against manufacturing defects.' },
              { badge:'📋 How to Claim',  bg:'#fef3c7', color:'#d97706',
                text:'Visit in person with <strong>original receipt & defective part</strong> within warranty period.' },
              { badge:'❌ Warranty Void', bg:'#fee2e2', color:'#dc2626',
                text:'Void if <strong>improperly installed, modified or physically damaged</strong>.' },
            ].map((p, i) => (
              <div key={i} style={ms.policyRow}>
                <div style={{ ...ms.policyBadge, background: p.bg, color: p.color }}>{p.badge}</div>
                <div style={ms.policyText} dangerouslySetInnerHTML={{ __html: p.text }} />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Payment */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>5. 💳 Pricing & Payment</h3>
          <div style={ms.card}>
            {[
              { badge:'💵 Cash on Collection', bg:'#dcfce7', color:'#16a34a',
                text:'<strong>Cash payments only</strong> at time of collection. No online payments.' },
              { badge:'💱 Currency',            bg:'#eff6ff', color:'#2563eb',
                text:'All prices in <strong>Sri Lankan Rupees (LKR / Rs.)</strong>.' },
              { badge:'📊 Price Changes',       bg:'#fef3c7', color:'#d97706',
                text:'Prices <strong>subject to change</strong> due to market fluctuations without notice.' },
              { badge:'🧾 Official Receipt',    bg:'#f5f3ff', color:'#7c3aed',
                text:'<strong>Receipt issued at collection</strong>. Keep for warranty & return claims.' },
            ].map((p, i) => (
              <div key={i} style={ms.policyRow}>
                <div style={{ ...ms.policyBadge, background: p.bg, color: p.color }}>{p.badge}</div>
                <div style={ms.policyText} dangerouslySetInnerHTML={{ __html: p.text }} />
              </div>
            ))}
          </div>
        </div>

        {/* 6. Customer Responsibilities */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>6. 👤 Customer Responsibilities</h3>
          <div style={ms.card}>
            {[
              { badge:'🔍 Compatibility',        bg:'#eff6ff', color:'#2563eb',
                text:'Ensure parts are <strong>compatible with your vehicle</strong> before purchasing.' },
              { badge:'🔧 Professional Install', bg:'#fef3c7', color:'#d97706',
                text:'Recommend <strong>qualified mechanic</strong> installation. Improper install voids warranty.' },
              { badge:'📸 Report Defects',        bg:'#dcfce7', color:'#16a34a',
                text:'Report defects with photos <strong>within 24 hours</strong> of collection.' },
              { badge:'⚖️ Legal Compliance',     bg:'#fee2e2', color:'#dc2626',
                text:'Parts must comply with <strong>Sri Lankan vehicle regulations</strong>.' },
            ].map((p, i) => (
              <div key={i} style={ms.policyRow}>
                <div style={{ ...ms.policyBadge, background: p.bg, color: p.color }}>{p.badge}</div>
                <div style={ms.policyText} dangerouslySetInnerHTML={{ __html: p.text }} />
              </div>
            ))}
          </div>
        </div>

        {/* 7. Privacy */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>7. 🔒 Privacy Policy</h3>
          <div style={ms.card}>
            <p style={ms.plainText}>
              Your personal information is collected solely for <strong>order processing and customer support</strong>.
              We do not sell or share data with third parties. All data is securely stored.
              By using our website you consent to our data practices.
            </p>
          </div>
        </div>

        {/* 8. Contact */}
        <div style={ms.section}>
          <h3 style={ms.sectionTitle}>8. 📞 Contact & Support</h3>
          <div style={ms.card}>
            <div style={ms.contactGrid}>
              {[
                { icon:'📍', label:'Address', value:'Puththal Rd, Wariyapola, Sri Lanka' },
                { icon:'📞', label:'Phone',   value:'+94 76 992 4173'                    },
                { icon:'✉️', label:'Email',   value:'madaramotors123@gmail.com'          },
                { icon:'🕐', label:'Hours',   value:'Mon – Sat: 8:00 AM – 6:00 PM'      },
              ].map((c, i) => (
                <div key={i} style={ms.contactItem}>
                  <span style={ms.contactIcon}>{c.icon}</span>
                  <div>
                    <div style={ms.contactLabel}>{c.label}</div>
                    <div style={ms.contactValue}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div style={ms.footer}>
        <p style={ms.footerText}>By placing an order you agree to all Terms & Conditions above.</p>
        <button style={ms.agreeBtn} onClick={onClose}>✅ I Understand — Close</button>
      </div>

    </div>
  </div>
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN CART PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Cart = () => {
  const navigate = useNavigate()
  const {
    cartItems, totalPrice,
    addToCart, removeFromCart,
    increaseQty, decreaseQty,
    updateQuantity, clearCart
  } = useCart()

  const [agree,        setAgree]        = useState(false)
  const [showTerms,    setShowTerms]    = useState(false)
  const [hoveredItem,  setHoveredItem]  = useState(null)
  const [removingItem, setRemovingItem] = useState(null)

  const isEmpty = cartItems.length === 0

  // ✅ FIX: Remove item with animation
  const handleRemove = (code) => {
    setRemovingItem(code)
    setTimeout(() => {
      removeFromCart(code)
      setRemovingItem(null)
    }, 300)
  }

  // ✅ FIX: Checkout handler
  const handleCheckout = () => {
    if (agree) navigate('/checkout')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f8f9fa' }}>
      <Navbar />

      {/* Terms Modal */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {/* Global Animations */}
      <style>{`
        @keyframes fadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut   { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(40px)} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }

        .cart-item-enter { animation:fadeIn 0.35s ease both }
        .cart-item-exit  { animation:fadeOut 0.28s ease forwards }

        .qty-btn:hover:not(:disabled) {
          background: linear-gradient(135deg,#e67e22,#d35400) !important;
          color: white !important;
        }
        .qty-btn:disabled    { opacity:0.35; cursor:not-allowed !important }
        .remove-btn:hover    { background:#fee2e2 !important; border-color:#fca5a5 !important; color:#dc2626 !important }
        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 28px rgba(227,30,36,0.45) !important;
        }
        .continue-btn:hover  { color:#d35400 !important }
        .clear-btn:hover     { background:#fff1f2 !important }
        .item-card:hover     { box-shadow:0 12px 35px rgba(0,0,0,0.1) !important; border-color:rgba(230,126,34,0.3) !important }
        .terms-link:hover    { color:#c0392b !important }

        ::-webkit-scrollbar       { width:5px }
        ::-webkit-scrollbar-track { background:#f1f1f1; border-radius:10px }
        ::-webkit-scrollbar-thumb { background:#e67e22; border-radius:10px }
      `}</style>

      <div style={st.wrap}>

        {/* Breadcrumb */}
        <div style={st.breadcrumb}>
          <span style={st.breadLink} onClick={() => navigate('/')}>Home</span>
          <span style={{ color:'#cbd5e1' }}>›</span>
          <span style={{ color:'#1e293b', fontWeight:'700' }}>Your Shopping Cart</span>
        </div>

        {/* Page Header */}
        <div style={st.headerRow}>
          <div>
            <h1 style={st.pageTitle}>YOUR CART</h1>
            {!isEmpty && (
              <p style={st.itemCount}>
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            )}
          </div>
          {!isEmpty && (
            <button className="clear-btn" style={st.clearBtn} onClick={clearCart}>
              🗑 Clear Cart
            </button>
          )}
        </div>

        {/* Search Section */}
        <CartSearchSection />

        {/* Empty State */}
        {isEmpty ? (
          <div style={st.emptyWrap}>
            <div style={st.emptyBox}>
              <div style={st.emptyEmoji}>🛒</div>
              <h2 style={st.emptyTitle}>Your cart is empty</h2>
              <p style={st.emptyText}>Search for parts above or browse our catalog!</p>
              <button
                style={st.shopBtn}
                onClick={() => navigate('/parts')}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(230,126,34,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(230,126,34,0.3)'
                }}
              >
                🔍 Browse Parts Catalog
              </button>
            </div>
          </div>

        ) : (
          <div style={st.grid}>

            {/* ── LEFT: Cart Items ── */}
            <div style={st.left}>
              {cartItems.map((item) => {
                const unitPrice  = Number(item.price ?? item.sellingPrice ?? 0)
                const qty        = Number(item.qty || 1)
                const lineTotal  = unitPrice * qty
                const maxQty     = item.stockQty != null ? Number(item.stockQty) : 999
                const isRemoving = removingItem === item.productCode
                const isHovered  = hoveredItem  === item.productCode
                const outStock   = Number(item.stockQty) === 0
                const lowStock   = Number(item.stockQty) > 0 && Number(item.stockQty) <= 5

                return (
                  <div
                    key={item.productCode}
                    className={`item-card ${isRemoving ? 'cart-item-exit' : 'cart-item-enter'}`}
                    onMouseEnter={() => setHoveredItem(item.productCode)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      ...st.itemCard,
                      borderColor: isHovered ? 'rgba(230,126,34,0.3)' : '#f0f0f0'
                    }}
                  >
                    {/* Product Image */}
                    <div style={st.imgWrap}>
                      <SafeImg
                        src={getImageUrl(item.imageUrl)}
                        alt={item.productName}
                        style={st.itemImg}
                      />
                    </div>

                    {/* Product Info */}
                    <div style={st.itemBody}>

                      {/* Name + Remove */}
                      <div style={st.nameRow}>
                        <h3
                          style={{ ...st.itemName, cursor:'pointer' }}
                          onClick={() => navigate(`/parts/${item.productCode}`)}
                          onMouseEnter={e => e.currentTarget.style.color = '#e67e22'}
                          onMouseLeave={e => e.currentTarget.style.color = '#0f172a'}
                        >
                          {item.productName}
                        </h3>
                        <button
                          className="remove-btn"
                          style={st.removeBtn}
                          onClick={() => handleRemove(item.productCode)}
                        >×</button>
                      </div>

                      {/* Badges */}
                      <div style={st.metaRow}>
                        {item.partCategory && (
                          <span style={st.chip}>{item.partCategory}</span>
                        )}
                        {item.productCode && (
                          <span style={st.codeChip}>#{item.productCode}</span>
                        )}
                        {outStock && (
                          <span style={st.outStockChip}>❌ Out of Stock</span>
                        )}
                        {lowStock && (
                          <span style={st.lowStockChip}>⚠️ Only {item.stockQty} left</span>
                        )}
                        {!outStock && !lowStock && item.stockQty != null && (
                          <span style={st.inStockChip}>✅ In Stock ({item.stockQty})</span>
                        )}
                      </div>

                      {/* Price + Qty + Total */}
                      <div style={st.priceQtyRow}>

                        {/* Unit Price */}
                        <div>
                          <div style={st.priceLabel}>Unit Price</div>
                          <div style={st.unitPrice}>{formatLKR(unitPrice)}</div>
                        </div>

                        {/* Quantity */}
                        <div>
                          <div style={st.priceLabel}>Quantity</div>
                          <div style={st.qtyRow}>
                            <button
                              className="qty-btn"
                              style={st.qtyBtn}
                              onClick={() => decreaseQty(item.productCode)}
                              disabled={qty <= 1}
                            >−</button>
                            <input
                              style={st.qtyInput}
                              value={qty}
                              onChange={e => {
                                const v = e.target.value.replace(/[^\d]/g, '')
                                updateQuantity(item.productCode, v ? Number(v) : 1)
                              }}
                            />
                            <button
                              className="qty-btn"
                              style={st.qtyBtn}
                              onClick={() => increaseQty(item.productCode)}
                              disabled={qty >= maxQty}
                            >+</button>
                          </div>
                          {maxQty < 999 && (
                            <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>
                              Max: {maxQty}
                            </div>
                          )}
                        </div>

                        {/* Line Total */}
                        <div style={{ textAlign:'right' }}>
                          <div style={st.priceLabel}>Total</div>
                          <div style={st.lineTotal}>{formatLKR(lineTotal)}</div>
                        </div>

                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                className="continue-btn"
                style={st.continueBtn}
                onClick={() => navigate('/parts')}
              >
                ← Continue Shopping
              </button>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div style={st.right}>
              <div style={st.summaryCard}>
                <h2 style={st.summaryTitle}>Order Summary</h2>
                <div style={st.summaryDivider} />

                {/* Mini Item List */}
                <div style={st.miniList}>
                  {cartItems.map(item => (
                    <div key={item.productCode} style={st.miniItem}>
                      <span style={st.miniName}>
                        {item.productName?.length > 26
                          ? item.productName.slice(0, 26) + '…'
                          : item.productName}
                        <span style={st.miniQty}> ×{item.qty}</span>
                      </span>
                      <span style={st.miniPrice}>
                        {formatLKR(
                          Number(item.price ?? item.sellingPrice ?? 0) *
                          Number(item.qty || 1)
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={st.summaryDivider} />

                {/* Subtotal */}
                <div style={st.subtotalRow}>
                  <span style={st.subtotalLabel}>Subtotal</span>
                  <span style={st.subtotalValue}>{formatLKR(totalPrice)}</span>
                </div>

                {/* Pickup Notice */}
                <div style={st.pickupNote}>
                  <span style={{ fontSize:'18px' }}>🏪</span>
                  <div>
                    <div style={st.pickupTitle}>Shop Pickup Only</div>
                    <div style={st.pickupDesc}>
                      No delivery. Collect from Wariyapola within 7 days.
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label style={st.termsLabel}>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={e => setAgree(e.target.checked)}
                    style={st.checkbox}
                  />
                  <span style={st.termsText}>
                    I have read and agreed with the{' '}
                    <span
                      className="terms-link"
                      style={st.termsLink}
                      onClick={e => { e.preventDefault(); setShowTerms(true) }}
                    >
                      terms and conditions
                    </span>.
                  </span>
                </label>

                {/* ✅ CHECK OUT Button */}
                <button
                  className="checkout-btn"
                  style={{
                    ...st.checkoutBtn,
                    opacity:    agree ? 1 : 0.55,
                    cursor:     agree ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                  }}
                  disabled={!agree}
                  onClick={handleCheckout}
                >
                  CHECK OUT
                </button>

                {/* Trust Badges */}
                <div style={st.badgeRow}>
                  <span style={st.badge}>🔒 Secure</span>
                  <span style={st.badge}>✅ Genuine</span>
                  <span style={st.badge}>📞 Support</span>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES — SEARCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cs = {
  wrap:          { marginBottom:'24px' },
  label:         { display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'800', color:'#1e293b', marginBottom:'10px' },
  inputWrap:     { display:'flex', alignItems:'center', gap:'10px', background:'white', border:'2px solid #e5e7eb', borderRadius:'14px', padding:'13px 20px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', transition:'border-color 0.2s, box-shadow 0.2s' },
  input:         { flex:1, border:'none', outline:'none', fontSize:'15px', color:'#1e293b', background:'transparent' },
  clearBtn:      { border:'none', background:'#f1f5f9', borderRadius:'50%', width:'26px', height:'26px', cursor:'pointer', fontSize:'12px', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  countBadge:    { fontSize:'12px', fontWeight:'800', color:'#e67e22', background:'#fff7ed', border:'1px solid #fed7aa', padding:'3px 10px', borderRadius:'999px', flexShrink:0 },
  centerMsg:     { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'white', borderRadius:'16px', border:'2px solid #f0f0f0', textAlign:'center' },
  spinner:       { width:'28px', height:'28px', border:'3px solid #f0f0f0', borderTop:'3px solid #e67e22', borderRadius:'50%', animation:'spin 0.8s linear infinite', marginBottom:'12px' },
  resultsHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'6px' },
  resultsCount:  { fontSize:'13px', fontWeight:'800', color:'#e67e22' },
  resultsHint:   { fontSize:'12px', color:'#94a3b8' },
  cardsGrid:     { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'14px' },
  card:          { background:'white', border:'2px solid #f0f0f0', borderRadius:'16px', padding:'14px', cursor:'pointer', transition:'all 0.25s ease', boxShadow:'0 4px 12px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', gap:'6px' },
  cardImg:       { width:'100%', height:'110px', borderRadius:'12px', border:'1px solid #f0f0f0', background:'#fafafa', overflow:'hidden', marginBottom:'4px', display:'flex', alignItems:'center', justifyContent:'center' },
  cardCategory:  { fontSize:'10px', fontWeight:'800', color:'#e67e22', background:'#fff7ed', border:'1px solid #fed7aa', padding:'2px 8px', borderRadius:'999px', display:'inline-block', width:'fit-content', textTransform:'uppercase', letterSpacing:'0.3px' },
  cardName:      { fontSize:'13px', fontWeight:'800', color:'#0f172a', lineHeight:'1.35', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' },
  cardCode:      { fontSize:'11px', color:'#94a3b8', fontWeight:'600' },
  cardStockRow:  { marginTop:'2px' },
  stockIn:       { fontSize:'11px', fontWeight:'700', color:'#16a34a' },
  stockLow:      { fontSize:'11px', fontWeight:'700', color:'#d97706' },
  cardPrice:     { fontSize:'15px', fontWeight:'900', color:'#e31e24', marginTop:'4px' },
  cardHint:      { fontSize:'11px', color:'#94a3b8', fontWeight:'600', marginTop:'4px' },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES — TERMS MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ms = {
  overlay:        { position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(4px)' },
  modal:          { background:'white', borderRadius:'24px', width:'100%', maxWidth:'700px', maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 30px 80px rgba(0,0,0,0.35)', animation:'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)', overflow:'hidden' },
  header:         { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'24px 28px 20px', background:'linear-gradient(135deg,#1a1a2e,#2d2d44)', flexShrink:0 },
  title:          { margin:'0 0 4px', fontSize:'22px', fontWeight:'900', color:'white' },
  subtitle:       { margin:0, fontSize:'12px', color:'#94a3b8' },
  closeBtn:       { background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:'36px', height:'36px', cursor:'pointer', fontSize:'16px', color:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  body:           { overflowY:'auto', padding:'24px 28px', flex:1 },
  section:        { marginBottom:'22px' },
  sectionTitle:   { fontSize:'15px', fontWeight:'900', color:'#0f172a', margin:'0 0 12px' },
  card:           { background:'#f8fafc', borderRadius:'14px', padding:'16px', border:'1px solid #e2e8f0' },
  policyRow:      { display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'10px' },
  policyBadge:    { padding:'4px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:'800', flexShrink:0, whiteSpace:'nowrap' },
  policyText:     { fontSize:'13px', color:'#334155', lineHeight:'1.6' },
  timeline:       { marginTop:'14px', paddingTop:'14px', borderTop:'1px solid #e2e8f0' },
  timelineTitle:  { fontSize:'12px', fontWeight:'800', color:'#64748b', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px' },
  timelineRow:    { display:'flex', alignItems:'flex-start', gap:'10px' },
  timelineDot:    { width:'12px', height:'12px', borderRadius:'50%', flexShrink:0, marginTop:'3px' },
  timelineLine:   { width:'2px', height:'14px', background:'#e2e8f0', marginLeft:'5px' },
  timelineContent:{ fontSize:'13px', color:'#334155', lineHeight:'1.5' },
  deliveryRow:    { display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'10px' },
  deliveryIcon:   { fontSize:'20px', flexShrink:0 },
  deliveryLabel:  { fontSize:'13px', fontWeight:'800', color:'#0f172a', marginBottom:'2px' },
  deliveryDesc:   { fontSize:'12px', color:'#64748b', lineHeight:'1.5' },
  plainText:      { fontSize:'13px', color:'#334155', lineHeight:'1.7', margin:0 },
  contactGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  contactItem:    { display:'flex', gap:'10px', alignItems:'flex-start' },
  contactIcon:    { fontSize:'18px', flexShrink:0 },
  contactLabel:   { fontSize:'11px', color:'#64748b', fontWeight:'700' },
  contactValue:   { fontSize:'13px', color:'#0f172a', fontWeight:'600' },
  footer:         { padding:'18px 28px', background:'#f8fafc', borderTop:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, flexWrap:'wrap', gap:'12px' },
  footerText:     { margin:0, fontSize:'12px', color:'#64748b', fontWeight:'600', flex:1 },
  agreeBtn:       { padding:'11px 24px', background:'linear-gradient(135deg,#e67e22,#d35400)', border:'none', borderRadius:'999px', color:'white', fontWeight:'800', fontSize:'14px', cursor:'pointer', boxShadow:'0 4px 12px rgba(230,126,34,0.3)' },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES — CART PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const st = {
  wrap:          { width:'100%', maxWidth:'1280px', margin:'0 auto', padding:'30px 20px 70px', flex:1 },
  breadcrumb:    { display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#64748b', marginBottom:22 },
  breadLink:     { cursor:'pointer', fontWeight:'700', color:'#64748b', transition:'color 0.2s' },
  headerRow:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 },
  pageTitle:     { margin:0, fontSize:36, fontWeight:900, color:'#0f172a', letterSpacing:1 },
  itemCount:     { margin:'6px 0 0', fontSize:14, color:'#64748b', fontWeight:600 },
  clearBtn:      { padding:'10px 18px', borderRadius:12, border:'1.5px solid #fecaca', background:'#fff5f5', color:'#dc2626', fontWeight:800, fontSize:13, cursor:'pointer', transition:'background 0.2s' },

  emptyWrap:     { display:'flex', justifyContent:'center', padding:'50px 20px' },
  emptyBox:      { background:'white', borderRadius:24, padding:'60px 40px', textAlign:'center', maxWidth:440, border:'2px solid #f0f0f0', boxShadow:'0 10px 40px rgba(0,0,0,0.07)' },
  emptyEmoji:    { fontSize:64, marginBottom:16 },
  emptyTitle:    { fontSize:24, fontWeight:900, color:'#0f172a', margin:'0 0 10px' },
  emptyText:     { color:'#64748b', fontSize:15, margin:'0 0 28px', lineHeight:1.6 },
  shopBtn:       { padding:'14px 32px', borderRadius:999, background:'linear-gradient(135deg,#e67e22,#d35400)', color:'white', border:'none', fontWeight:900, fontSize:15, cursor:'pointer', boxShadow:'0 6px 18px rgba(230,126,34,0.3)', transition:'all 0.3s ease' },

  grid:          { display:'grid', gridTemplateColumns:'1fr 370px', gap:24, alignItems:'start' },
  left:          { display:'flex', flexDirection:'column', gap:14 },
  right:         {},

  itemCard:      { display:'grid', gridTemplateColumns:'130px 1fr', gap:18, background:'white', border:'2px solid #f0f0f0', borderRadius:20, padding:18, boxShadow:'0 4px 18px rgba(0,0,0,0.06)', transition:'box-shadow 0.3s, border-color 0.3s' },
  imgWrap:       { height:130, borderRadius:14, border:'1px solid #f0f0f0', background:'#fafafa', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  itemImg:       { width:'100%', height:'100%', objectFit:'contain' },
  itemBody:      { minWidth:0, display:'flex', flexDirection:'column', gap:10 },
  nameRow:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 },
  itemName:      { margin:0, fontSize:15, fontWeight:900, color:'#0f172a', lineHeight:1.35, flex:1, transition:'color 0.2s' },
  removeBtn:     { width:34, height:34, borderRadius:10, border:'1.5px solid #e5e7eb', background:'white', cursor:'pointer', fontSize:22, fontWeight:900, color:'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s', lineHeight:1 },

  metaRow:       { display:'flex', flexWrap:'wrap', gap:7 },
  chip:          { fontSize:11, fontWeight:800, color:'#e67e22', background:'#fff7ed', border:'1px solid #fed7aa', padding:'4px 10px', borderRadius:999 },
  codeChip:      { fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', border:'1px solid #e2e8f0', padding:'4px 10px', borderRadius:999 },
  outStockChip:  { fontSize:11, fontWeight:800, color:'#dc2626', background:'#fef2f2', border:'1px solid #fca5a5', padding:'4px 10px', borderRadius:999 },
  lowStockChip:  { fontSize:11, fontWeight:800, color:'#d97706', background:'#fffbeb', border:'1px solid #fde68a', padding:'4px 10px', borderRadius:999 },
  inStockChip:   { fontSize:11, fontWeight:800, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'4px 10px', borderRadius:999 },

  priceQtyRow:   { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, alignItems:'end', paddingTop:10, borderTop:'1px dashed #f1f5f9' },
  priceLabel:    { fontSize:11, color:'#94a3b8', fontWeight:800, marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 },
  unitPrice:     { fontSize:16, fontWeight:900, color:'#e31e24' },
  lineTotal:     { fontSize:16, fontWeight:900, color:'#0f172a', textAlign:'right' },

  qtyRow:        { display:'grid', gridTemplateColumns:'36px 48px 36px', border:'1.5px solid #e5e7eb', borderRadius:12, overflow:'hidden', background:'white' },
  qtyBtn:        { border:'none', background:'#f8fafc', cursor:'pointer', fontSize:18, fontWeight:900, color:'#1e293b', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 0' },
  qtyInput:      { border:'none', outline:'none', textAlign:'center', fontSize:14, fontWeight:900, color:'#0f172a', background:'white' },

  continueBtn:   { border:'none', background:'transparent', color:'#e67e22', fontWeight:800, fontSize:14, cursor:'pointer', textAlign:'left', padding:'4px 0', transition:'color 0.2s' },

  summaryCard:   { position:'sticky', top:100, background:'white', border:'2px solid #f0f0f0', borderRadius:22, padding:'22px 20px', boxShadow:'0 10px 40px rgba(0,0,0,0.08)' },
  summaryTitle:  { margin:'0 0 14px', fontSize:20, fontWeight:900, color:'#0f172a' },
  summaryDivider:{ height:1, background:'#f1f5f9', margin:'14px 0' },
  miniList:      { display:'flex', flexDirection:'column', gap:8 },
  miniItem:      { display:'flex', justifyContent:'space-between', gap:8 },
  miniName:      { fontSize:12, color:'#334155', fontWeight:600, flex:1 },
  miniQty:       { color:'#94a3b8', fontWeight:700 },
  miniPrice:     { fontSize:12, fontWeight:800, color:'#0f172a', flexShrink:0 },
  subtotalRow:   { display:'flex', justifyContent:'space-between', alignItems:'center' },
  subtotalLabel: { fontSize:18, fontWeight:900, color:'#0f172a' },
  subtotalValue: { fontSize:22, fontWeight:900, color:'#e31e24' },

  pickupNote:    { display:'flex', gap:'10px', alignItems:'flex-start', background:'linear-gradient(135deg,#fff7ed,#ffedd5)', border:'1.5px solid #fed7aa', borderRadius:'12px', padding:'12px 14px', marginTop:'12px' },
  pickupTitle:   { fontSize:'13px', fontWeight:'800', color:'#c2410c', marginBottom:'3px' },
  pickupDesc:    { fontSize:'11px', color:'#7c2d12', lineHeight:'1.5' },

  termsLabel:    { display:'flex', gap:10, alignItems:'flex-start', marginTop:18, cursor:'pointer' },
  checkbox:      { marginTop:3, width:18, height:18, accentColor:'#e67e22', flexShrink:0, cursor:'pointer' },
  termsText:     { fontSize:13, color:'#334155', fontWeight:600, lineHeight:1.5 },
  termsLink:     { color:'#e31e24', textDecoration:'underline', cursor:'pointer', fontWeight:800, transition:'color 0.2s' },

  checkoutBtn:   { display:'block', width:'100%', marginTop:16, padding:'15px 18px', border:'none', borderRadius:999, fontWeight:900, fontSize:15, letterSpacing:1, color:'white', background:'linear-gradient(135deg,#e31e24,#c0392b)', boxShadow:'0 6px 20px rgba(227,30,36,0.3)' },

  badgeRow:      { display:'flex', justifyContent:'center', gap:8, marginTop:14, flexWrap:'wrap' },
  badge:         { fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', border:'1px solid #e2e8f0', padding:'5px 10px', borderRadius:999 },
}

export default Cart