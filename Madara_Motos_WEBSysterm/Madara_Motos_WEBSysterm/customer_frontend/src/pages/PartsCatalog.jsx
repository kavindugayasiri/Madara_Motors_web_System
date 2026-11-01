
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import axios from 'axios'

const API_BASE = 'http://localhost:8080'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORY ICON SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const categoryIcons = {
  'engine parts': '⚙️', 'engine': '⚙️',
  'body parts': '🚗', 'body': '🚗',
  'electrical': '⚡', 'electrical system': '⚡',
  'suspension': '🔧',
  'braking system': '🛑', 'brakes': '🛑', 'brake': '🛑',
  'cooling': '❄️', 'cooling system': '❄️',
  'filters': '🔲', 'filter': '🔲',
  'audio': '🔊', 'audio systems': '🔊',
  'interior': '🪑',
  'lighting': '💡', 'lights': '💡',
  'tyres': '⭕', 'tires': '⭕', 'tyre': '⭕', 'tire': '⭕',
  'lubricants': '🛢️', 'lubricant': '🛢️',
  'aftermarket': '🔩', 'aftermarket items': '🔩',
  'accessories': '🔑',
  'exhaust': '💨',
  'steering': '🎯',
  'fuel': '⛽', 'fuel system': '⛽',
  'transmission': '🔄', 'gearbox': '🔄',
  'battery': '🔋',
  'radiator': '❄️',
  'clutch': '🔘',
  'belt': '🔗', 'timing belt': '🔗',
  'oil': '🛢️', 'engine oil': '🛢️',
  'turbo': '🏎️',
  'sensor': '📡',
  'tools': '🔨',
  'performance': '🏎️',
  'wheel': '⭕', 'rim': '⭕',
  'seat': '🪑',
  'camera': '📷',
  'gasket': '🔩',
  'hose': '💧',
  'pump': '💧',
}

const keywordMap = [
  { keys: ['engine', 'motor', 'piston', 'crank'],           icon: '⚙️' },
  { keys: ['brake', 'stop', 'caliper', 'disc', 'drum'],     icon: '🛑' },
  { keys: ['electr', 'power', 'wiring', 'fuse', 'switch'],  icon: '⚡' },
  { keys: ['cool', 'thermo', 'radiator'],                    icon: '❄️' },
  { keys: ['filter'],                                        icon: '🔲' },
  { keys: ['light', 'lamp', 'led', 'bulb'],                 icon: '💡' },
  { keys: ['fuel', 'petrol', 'diesel', 'inject', 'carb'],   icon: '⛽' },
  { keys: ['tyre', 'tire', 'wheel', 'rim', 'alloy'],        icon: '⭕' },
  { keys: ['oil', 'fluid', 'lubri', 'grease'],              icon: '🛢️' },
  { keys: ['body', 'panel', 'bumper', 'fender', 'door'],    icon: '🚗' },
  { keys: ['audio', 'sound', 'speaker', 'music'],           icon: '🔊' },
  { keys: ['seat', 'interior', 'carpet', 'cabin'],          icon: '🪑' },
  { keys: ['exhaust', 'muffler', 'pipe', 'emission'],       icon: '💨' },
  { keys: ['steer'],                                         icon: '🎯' },
  { keys: ['suspen', 'shock', 'spring', 'strut'],           icon: '🔧' },
  { keys: ['belt', 'chain', 'timing'],                      icon: '🔗' },
  { keys: ['sensor', 'camera', 'gps', 'monitor'],           icon: '📡' },
  { keys: ['turbo', 'boost', 'performance', 'sport'],       icon: '🏎️' },
  { keys: ['access', 'key', 'lock', 'remote'],              icon: '🔑' },
  { keys: ['tool', 'kit', 'equip'],                         icon: '🔨' },
  { keys: ['battery', 'altern', 'starter', 'charge'],       icon: '🔋' },
  { keys: ['trans', 'gear', 'clutch', 'shift'],             icon: '🔄' },
  { keys: ['pump', 'hose', 'valve', 'seal'],                icon: '💧' },
  { keys: ['glass', 'window', 'mirror', 'wind'],            icon: '🪟' },
  { keys: ['air', 'ac', 'condition', 'vent', 'fan'],        icon: '🌀' },
]

const fallbackEmojis = [
  '🔧', '🔩', '⚙️', '🛠️', '🔨', '🪛', '🔌',
  '🏎️', '🚘', '🚙', '🛻', '🚐', '🏍️',
  '💡', '🔋', '📡', '🌀', '💧', '🔗',
]

const hashString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const getCategoryIcon = (cat) => {
  if (!cat) return '🔧'
  const lower = cat.toLowerCase().trim()
  if (categoryIcons[lower]) return categoryIcons[lower]
  for (const key of Object.keys(categoryIcons)) {
    if (lower.includes(key) || key.includes(lower)) return categoryIcons[key]
  }
  for (const { keys, icon } of keywordMap) {
    for (const keyword of keys) {
      if (lower.includes(keyword)) return icon
    }
  }
  return fallbackEmojis[hashString(lower) % fallbackEmojis.length]
}

const getProductCategory = (p) => (p.partCategory || '').trim()

const getImageUrl = (url) => {
  if (!url) return null
  return url.startsWith('http') ? url : `/assets/products/${url}`
}

const formatPrice = (product) => {
  const val = parseFloat(product?.sellingPrice || product?.price || 0)
  return `Rs. ${val.toLocaleString('en-LK')}`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VEHICLE ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const vehicleIcons = {
  'car':   '🚗',
  'bike':  '🏍️',
  'van':   '🚐',
  'truck': '🚛',
}

const getVehicleIcon = (v) => {
  if (!v) return '🚗'
  return vehicleIcons[v.toLowerCase()] || '🚗'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCT CARD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProductCard = ({ product, onCardClick, onAddToCart }) => {
  const [hovered,  setHovered]  = useState(false)
  const [addedMsg, setAddedMsg] = useState(false)

  const stock  = product.stockQty ?? product.stock ?? 0
  const imgUrl = getImageUrl(product.imageUrl)

  const handleAdd = (e) => {
    e.stopPropagation()
    if (stock === 0) return
    onAddToCart({ ...product, price: product.sellingPrice || product.price })
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 1500)
  }

  return (
    <div
      style={{
        background:    'white',
        borderRadius:  '14px',
        // ✅ FIXED - border shorthand නෑ, separate properties
        borderWidth:   '1.5px',
        borderStyle:   'solid',
        borderColor:   hovered ? '#e67e22' : '#eee',
        overflow:      'hidden',
        cursor:        'pointer',
        transition:    'all 0.28s ease',
        transform:     hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow:     hovered
          ? '0 20px 40px rgba(0,0,0,0.13)'
          : '0 2px 10px rgba(0,0,0,0.06)',
      }}
      onClick={() => onCardClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={cardSt.imgWrap}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.productName}
            style={cardSt.img}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div style={cardSt.noImg}>
            <span style={{ fontSize: '48px' }}>
              {getCategoryIcon(getProductCategory(product))}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              No Image
            </span>
          </div>
        )}

        {/* Stock Badge */}
        <span style={{
          ...cardSt.badge,
          background: stock === 0
            ? '#e74c3c'
            : stock <= 5 ? '#f39c12' : '#27ae60',
        }}>
          {stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'}
        </span>

        {/* Hover Overlay */}
        <div style={{ ...cardSt.overlay, opacity: hovered ? 1 : 0 }}>
          <span style={{ fontSize: '30px' }}>👁️</span>
          <span style={cardSt.overlayText}>View Details</span>
        </div>
      </div>

      {/* Card Body */}
      <div style={cardSt.body}>
        <div style={cardSt.catTag}>
          {getCategoryIcon(getProductCategory(product))}{' '}
          {getProductCategory(product) || 'Spare Part'}
        </div>

        <h3 style={cardSt.name} title={product.productName}>
          {product.productName}
        </h3>

        <p style={cardSt.code}>Code: {product.productCode}</p>

        {/* Vehicle + Brand info */}
        {(product.vehicleType || product.brand) && (
          <p style={cardSt.vehicleInfo}>
            {product.vehicleType && (
              <span>{getVehicleIcon(product.vehicleType)} {product.vehicleType}</span>
            )}
            {product.vehicleType && product.brand && (
              <span style={{ margin: '0 4px', color: '#ddd' }}>|</span>
            )}
            {product.brand && (
              <span>🏷️ {product.brand}</span>
            )}
          </p>
        )}

        <div style={cardSt.stars}>
          {'⭐'.repeat(5)}
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px' }}>
            4.5
          </span>
        </div>

        <div style={cardSt.priceRow}>
          <span style={cardSt.price}>{formatPrice(product)}</span>
          <button
            style={{
              ...cardSt.addBtn,
              background: addedMsg ? '#27ae60' : '#1e293b',
              opacity:    stock === 0 ? 0.5 : 1,
              cursor:     stock === 0 ? 'not-allowed' : 'pointer',
            }}
            disabled={stock === 0}
            onClick={handleAdd}
          >
            {addedMsg ? '✅ Added' : '🛒 Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PARTS CATALOG PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PartsCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [allProducts,      setAllProducts]      = useState([])
  const [categories,       setCategories]       = useState([])
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  )
  const [searchTerm,  setSearchTerm]  = useState(searchParams.get('search') || '')
  const [sortBy,      setSortBy]      = useState('default')
  const [priceRange,  setPriceRange]  = useState('all')

  // ✅ URL params
  const urlVehicle = searchParams.get('vehicle') || ''
  const urlBrand   = searchParams.get('brand')   || ''


  useEffect(() => {
    loadData()
  }, [urlVehicle, urlBrand])

  // ✅ Category / search params sync
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '')
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOAD DATA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const vehicle = searchParams.get('vehicle') || ''
      const brand   = searchParams.get('brand')   || ''

      let prods = []

      if (vehicle || brand) {
        // ✅ Filter API
        const params = {}
        if (vehicle) params.vehicle = vehicle
        if (brand)   params.brand   = brand

        const res = await axios.get(
          `${API_BASE}/api/spareparts/filter`,
          { params }
        )
        prods = Array.isArray(res.data) ? res.data : []
      } else {
        // ✅ Get all
        const res = await axios.get(`${API_BASE}/api/spareparts/all`)
        prods = Array.isArray(res.data) ? res.data : []
      }

      setAllProducts(prods)

      // ✅ Auto generate categories
      const catSet = new Set()
      prods.forEach(p => {
        const c = getProductCategory(p)
        if (c) catSet.add(c)
      })
      setCategories(Array.from(catSet).sort())

    } catch (err) {
      console.error('Load error:', err)
      setError('Failed to load parts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CATEGORY SELECT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleCategorySelect = (cat) => {
    const newParams = {}
    if (urlVehicle) newParams.vehicle = urlVehicle
    if (urlBrand)   newParams.brand   = urlBrand

    if (selectedCategory === cat) {
      setSelectedCategory('')
    } else {
      setSelectedCategory(cat)
      newParams.category = cat
      setSearchTerm('')
    }
    setSearchParams(newParams)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEAR VEHICLE FILTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const clearVehicleFilter = () => {
    setSearchParams({})
    setSelectedCategory('')
    setSearchTerm('')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FILTER + SORT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const filteredProducts = allProducts.filter(p => {
    const pCat = getProductCategory(p).toLowerCase()

    const matchCat = selectedCategory
      ? pCat === selectedCategory.toLowerCase().trim()
      : true

    const matchSearch = searchTerm
      ? p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pCat.includes(searchTerm.toLowerCase()) ||
        p.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const price = parseFloat(p.sellingPrice || p.price || 0)
    const matchPrice =
      priceRange === 'all'     ? true :
      priceRange === 'under5k' ? price < 5000 :
      priceRange === '5k-15k'  ? price >= 5000  && price <= 15000 :
      priceRange === '15k-50k' ? price >= 15000 && price <= 50000 :
      priceRange === 'over50k' ? price > 50000  : true

    return matchCat && matchSearch && matchPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const pa = parseFloat(a.sellingPrice || a.price || 0)
    const pb = parseFloat(b.sellingPrice || b.price || 0)
    if (sortBy === 'price-low')  return pa - pb
    if (sortBy === 'price-high') return pb - pa
    if (sortBy === 'name')
      return a.productName?.localeCompare(b.productName)
    return 0
  })

  const handleCardClick = (product) => {
    navigate(`/parts/${product.productCode}`)
    window.scrollTo(0, 0)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE TITLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const getPageTitle = () => {
    if (urlVehicle && urlBrand)
      return `${getVehicleIcon(urlVehicle)} ${urlBrand} ${urlVehicle} Parts`
    if (urlVehicle)
      return `${getVehicleIcon(urlVehicle)} ${urlVehicle} Parts`
    if (selectedCategory)
      return `${getCategoryIcon(selectedCategory)} ${selectedCategory}`
    return '🔧 Parts Catalog'
  }

  const getPageSubtitle = () => {
    if (urlVehicle && urlBrand)
      return `Showing all parts for ${urlBrand} ${urlVehicle}`
    if (urlVehicle)
      return `Showing all ${urlVehicle} parts`
    if (selectedCategory)
      return `Showing all parts in "${selectedCategory}"`
    return 'Premium selection of genuine vehicle parts'
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .cat-item:hover   { background: #fff5eb !important; color: #e67e22 !important; }
        .tab-item:hover   { background: #fff5eb !important; color: #e67e22 !important; }
        .price-item:hover { background: #fff5eb !important; color: #e67e22 !important; }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER ━━━━━━━━━━━━━━━━━━━━ */}
      <div style={pgSt.header}>
        <h1 style={pgSt.headerTitle}>{getPageTitle()}</h1>
        <p style={pgSt.headerSub}>{getPageSubtitle()}</p>

        {/* ✅ Active Vehicle/Brand Filter Badges */}
        {(urlVehicle || urlBrand) && (
          <div style={{
            display: 'flex', gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: '16px',
          }}>
            {urlVehicle && (
              <span style={pgSt.filterBadge}>
                {getVehicleIcon(urlVehicle)} {urlVehicle}
              </span>
            )}
            {urlBrand && (
              <span style={pgSt.filterBadge}>
                🏷️ {urlBrand}
              </span>
            )}
            <button style={pgSt.clearFilterBadgeBtn} onClick={clearVehicleFilter}>
              ✕ Clear Filter
            </button>
          </div>
        )}

        {/* Search */}
        <div style={pgSt.searchRow}>
          <input
            type="text"
            style={pgSt.searchInput}
            placeholder="🔍 Search by name, category or code..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
              setSelectedCategory('')
              const newParams = {}
              if (urlVehicle) newParams.vehicle = urlVehicle
              if (urlBrand)   newParams.brand   = urlBrand
              if (e.target.value) newParams.search = e.target.value
              setSearchParams(newParams)
            }}
          />
          {(searchTerm || selectedCategory) && (
            <button
              style={pgSt.clearBtn}
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                const newParams = {}
                if (urlVehicle) newParams.vehicle = urlVehicle
                if (urlBrand)   newParams.brand   = urlBrand
                setSearchParams(newParams)
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ MAIN LAYOUT ━━━━━━━━━━━━━━━━━━━━ */}
      <div style={pgSt.layout}>

        {/* ━━━━━━━━━━━━ SIDEBAR ━━━━━━━━━━━━ */}
        <div style={pgSt.sidebar}>
          <h3 style={pgSt.sideTitle}>📂 Categories</h3>

          {/* All Parts */}
          <div
            className="cat-item"
            style={{
              ...pgSt.catItem,
              ...(selectedCategory === '' ? pgSt.catActive : {}),
            }}
            onClick={() => {
              setSelectedCategory('')
              const newParams = {}
              if (urlVehicle) newParams.vehicle = urlVehicle
              if (urlBrand)   newParams.brand   = urlBrand
              setSearchParams(newParams)
            }}
          >
            <span>🔧</span>
            <span style={pgSt.catName}>All Parts</span>
            <span style={pgSt.catCount}>({allProducts.length})</span>
          </div>

          {/* Category List */}
          {categories.map((cat, i) => {
            const count = allProducts.filter(p =>
              getProductCategory(p).toLowerCase().trim() ===
              cat.toLowerCase().trim()
            ).length
            return (
              <div
                key={i}
                className="cat-item"
                style={{
                  ...pgSt.catItem,
                  ...(selectedCategory === cat ? pgSt.catActive : {}),
                }}
                onClick={() => handleCategorySelect(cat)}
              >
                <span>{getCategoryIcon(cat)}</span>
                <span style={pgSt.catName}>{cat}</span>
                <span style={pgSt.catCount}>({count})</span>
              </div>
            )
          })}

          {/* Price Filter */}
          <h3 style={{ ...pgSt.sideTitle, marginTop: '24px' }}>💰 Price Range</h3>
          {[
            { v: 'all',     l: 'All Prices'           },
            { v: 'under5k', l: 'Under Rs. 5,000'      },
            { v: '5k-15k',  l: 'Rs. 5,000 – 15,000'  },
            { v: '15k-50k', l: 'Rs. 15,000 – 50,000' },
            { v: 'over50k', l: 'Over Rs. 50,000'      },
          ].map(o => (
            <div
              key={o.v}
              className="price-item"
              style={{
                ...pgSt.priceItem,
                ...(priceRange === o.v ? pgSt.priceActive : {}),
              }}
              onClick={() => setPriceRange(o.v)}
            >
              {priceRange === o.v ? '🔵' : '⚪'} {o.l}
            </div>
          ))}
        </div>

        {/* ━━━━━━━━━━━━ RIGHT SIDE ━━━━━━━━━━━━ */}
        <div style={pgSt.right}>

          {/* Top Bar */}
          <div style={pgSt.topBar}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '10px', flexWrap: 'wrap',
            }}>
              {selectedCategory && (
                <span style={pgSt.activeBadge}>
                  {getCategoryIcon(selectedCategory)} {selectedCategory}
                  <span
                    style={{ cursor: 'pointer', marginLeft: '6px' }}
                    onClick={() => {
                      setSelectedCategory('')
                      const newParams = {}
                      if (urlVehicle) newParams.vehicle = urlVehicle
                      if (urlBrand)   newParams.brand   = urlBrand
                      setSearchParams(newParams)
                    }}
                  >✕</span>
                </span>
              )}
              <span style={{ fontSize: '14px', color: '#666' }}>
                <strong>{sortedProducts.length}</strong> parts found
                {(urlVehicle || urlBrand) && (
                  <span style={{ color: '#e67e22', marginLeft: '6px' }}>
                    {urlVehicle && `• ${urlVehicle}`}
                    {urlBrand   && ` • ${urlBrand}`}
                  </span>
                )}
              </span>
            </div>
            <select
              style={pgSt.sort}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name: A → Z</option>
            </select>
          </div>

          {/* Category Quick Tabs */}
          <div style={pgSt.tabs}>
            <div
              className="tab-item"
              style={{
                ...pgSt.tab,
                ...(selectedCategory === '' ? pgSt.tabActive : {}),
              }}
              onClick={() => {
                setSelectedCategory('')
                const newParams = {}
                if (urlVehicle) newParams.vehicle = urlVehicle
                if (urlBrand)   newParams.brand   = urlBrand
                setSearchParams(newParams)
              }}
            >
              All
            </div>
            {categories.map((cat, i) => (
              <div
                key={i}
                className="tab-item"
                style={{
                  ...pgSt.tab,
                  ...(selectedCategory === cat ? pgSt.tabActive : {}),
                }}
                onClick={() => handleCategorySelect(cat)}
              >
                {getCategoryIcon(cat)} {cat}
              </div>
            ))}
          </div>

          {/* ━━━━━━ PRODUCT GRID ━━━━━━ */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <div style={pgSt.spinner} />
              <p style={{ color: '#888', marginTop: '18px' }}>
                Loading parts...
              </p>
            </div>
          ) : error ? (
            <div style={pgSt.empty}>
              <p style={{ fontSize: '56px' }}>⚠️</p>
              <h3 style={{ color: '#e74c3c' }}>{error}</h3>
              <button style={pgSt.clearFilterBtn} onClick={loadData}>
                🔄 Retry
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div style={pgSt.empty}>
              <p style={{ fontSize: '56px' }}>🔍</p>
              <h3 style={{ color: '#555' }}>No parts found!</h3>
              <p style={{ color: '#888' }}>
                {urlVehicle && urlBrand
                  ? `No parts found for ${urlBrand} ${urlVehicle}`
                  : selectedCategory
                  ? `No parts in "${selectedCategory}"`
                  : `No results for "${searchTerm}"`}
              </p>
              <button
                style={pgSt.clearFilterBtn}
                onClick={() => {
                  setSelectedCategory('')
                  setSearchTerm('')
                  setSearchParams({})
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={pgSt.grid}>
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.productCode}
                  product={product}
                  onCardClick={handleCardClick}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ STICKY BOTTOM BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div style={pgSt.stickyBar}>
        <div style={pgSt.stickyInner}>
          <div
            style={{
              ...pgSt.stickyItem,
              ...(selectedCategory === '' ? pgSt.stickyActive : {}),
            }}
            onClick={() => {
              setSelectedCategory('')
              const newParams = {}
              if (urlVehicle) newParams.vehicle = urlVehicle
              if (urlBrand)   newParams.brand   = urlBrand
              setSearchParams(newParams)
            }}
          >
            <span style={{ fontSize: '22px' }}>🔧</span>
            <span style={pgSt.stickyLabel}>All</span>
          </div>
          {categories.map((cat, i) => (
            <div
              key={i}
              style={{
                ...pgSt.stickyItem,
                ...(selectedCategory === cat ? pgSt.stickyActive : {}),
              }}
              onClick={() => handleCategorySelect(cat)}
            >
              <span style={{ fontSize: '22px' }}>{getCategoryIcon(cat)}</span>
              <span style={pgSt.stickyLabel}>{cat.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARD STYLES 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cardSt = {
  card: {
    background:   'white',
    borderRadius: '14px',
    // ✅ border shorthand REMOVE - separate properties
    borderWidth:  '1.5px',
    borderStyle:  'solid',
    borderColor:  '#eee',
    overflow:     'hidden',
    cursor:       'pointer',
    transition:   'all 0.28s ease',
  },
  imgWrap: {
    position: 'relative', height: '190px',
    background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '15px', overflow: 'hidden',
  },
  img:   { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  noImg: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    width: '100%', height: '100%',
  },
  badge: {
    position: 'absolute', top: '8px', left: '8px',
    color: 'white', fontSize: '10px',
    padding: '3px 8px', borderRadius: '4px', fontWeight: '700',
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(230,126,34,0.88)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'opacity 0.25s ease',
  },
  overlayText: {
    color: 'white', fontSize: '15px',
    fontWeight: '700', letterSpacing: '0.5px',
  },
  body: { padding: '14px' },
  catTag: {
    fontSize: '11px', color: '#94a3b8',
    textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px',
  },
  name: {
    fontSize: '14px', fontWeight: '700', color: '#1e293b',
    margin: '5px 0 3px', height: '40px',
    overflow: 'hidden', lineHeight: '1.4',
  },
  code: { fontSize: '11px', color: '#bbb', marginBottom: '4px' },
  vehicleInfo: {
    fontSize: '11px', color: '#94a3b8',
    marginBottom: '4px',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  stars: {
    fontSize: '12px', marginBottom: '8px',
    display: 'flex', alignItems: 'center',
  },
  priceRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid #f1f5f9', paddingTop: '10px',
  },
  price:  { fontSize: '16px', fontWeight: '800', color: '#e31e24' },
  addBtn: {
    padding: '6px 13px', color: 'white',
    border: 'none', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600',
    transition: 'background 0.3s',
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGE STYLES - ✅ FIXED (border warnings නෑ)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const pgSt = {
  header: {
    background: 'linear-gradient(135deg,#1a1a2e,#2d2d44)',
    color: 'white', padding: '50px 40px 40px', textAlign: 'center',
  },
  headerTitle: { fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  headerSub:   { color: '#aaa', marginBottom: '20px', fontSize: '15px' },
  filterBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(230,126,34,0.2)',
    // ✅ FIXED
    borderWidth: '1px', borderStyle: 'solid',
    borderColor: 'rgba(230,126,34,0.5)',
    color: '#f39c12', padding: '5px 14px',
    borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  },
  clearFilterBadgeBtn: {
    padding: '5px 14px',
    background: 'rgba(255,255,255,0.15)',
    // ✅ FIXED
    borderWidth: '1px', borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: '20px', color: 'white',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
  searchRow: {
    display: 'flex', gap: '10px',
    justifyContent: 'center', alignItems: 'center',
  },
  searchInput: {
    width: '100%', maxWidth: '500px',
    padding: '13px 20px', borderRadius: '30px',
    border: 'none', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  },
  clearBtn: {
    padding: '13px 20px',
    background: 'rgba(255,255,255,0.2)',
    // ✅ FIXED
    borderWidth: '1px', borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: '30px', color: 'white',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  layout: {
    display: 'flex', flex: 1,
    maxWidth: '1400px', margin: '0 auto',
    width: '100%', padding: '30px 20px 110px', gap: '24px',
  },
  sidebar: {
    width: '240px', flexShrink: 0,
    background: 'white', borderRadius: '14px',
    padding: '20px', height: 'fit-content',
    boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
    position: 'sticky', top: '80px',
  },
  sideTitle: {
    fontSize: '15px', fontWeight: '700', color: '#1a1a2e',
    marginBottom: '12px', paddingBottom: '8px',
    borderBottom: '2px solid #f0f0f0',
  },
  catItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 12px', borderRadius: '10px',
    cursor: 'pointer', marginBottom: '4px',
    transition: 'all 0.2s',
    // ✅ FIXED
    borderWidth: '1px', borderStyle: 'solid',
    borderColor: 'transparent',
  },
  catActive: {
    background: '#fff5eb',
    borderColor: '#e67e22',  // ✅ OK - borderColor alone
    color: '#e67e22',
  },
  catName:  { flex: 1, fontSize: '13px', fontWeight: '500', color: '#444' },
  catCount: { fontSize: '12px', color: '#aaa' },
  priceItem: {
    padding: '8px 12px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', color: '#555',
    marginBottom: '4px', transition: 'all 0.2s',
  },
  priceActive: { background: '#fff5eb', color: '#e67e22', fontWeight: '600' },
  right: { flex: 1 },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '15px', background: 'white', padding: '12px 20px',
    borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    flexWrap: 'wrap', gap: '10px',
  },
  activeBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: '#fff5eb',
    // ✅ FIXED
    borderWidth: '1px', borderStyle: 'solid',
    borderColor: '#e67e22',
    color: '#e67e22', padding: '4px 12px',
    borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  },
  sort: {
    padding: '8px 12px',
    // ✅ FIXED
    borderWidth: '1px', borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '8px', fontSize: '13px',
    outline: 'none', cursor: 'pointer',
    background: 'white', color: '#444',
  },
  tabs: {
    display: 'flex', gap: '8px', overflowX: 'auto',
    marginBottom: '20px', paddingBottom: '5px', scrollbarWidth: 'none',
  },
  tab: {
    padding: '7px 16px', borderRadius: '25px',
    // ✅ FIXED
    borderWidth: '1.5px', borderStyle: 'solid',
    borderColor: '#e5e7eb',
    background: 'white', color: '#555',
    fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', whiteSpace: 'nowrap',
    flexShrink: 0, transition: 'all 0.2s',
  },
  tabActive: {
    background: '#e67e22',
    borderColor: '#e67e22',  // ✅ OK
    color: 'white', fontWeight: '700',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '20px',
  },
  empty: {
    textAlign: 'center', padding: '80px 20px',
    background: 'white', borderRadius: '14px',
  },
  clearFilterBtn: {
    marginTop: '15px', padding: '10px 25px',
    background: '#e67e22', color: 'white',
    border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600', fontSize: '14px',
  },
  spinner: {
    width: '42px', height: '42px', margin: '0 auto',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #e67e22',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
  stickyBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'white', borderTop: '1px solid #e2e8f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    zIndex: 1000, padding: '6px 0',
  },
  stickyInner: {
    display: 'flex', gap: '4px', overflowX: 'auto',
    maxWidth: '1400px', margin: '0 auto',
    padding: '0 16px', scrollbarWidth: 'none',
    justifyContent: 'center',
  },
  stickyItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '2px', padding: '6px 14px', borderRadius: '10px',
    cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
  },
  stickyActive: { background: '#fff5eb' },
  stickyLabel: {
    fontSize: '10px', fontWeight: '600',
    color: '#555', whiteSpace: 'nowrap',
  },
}

export default PartsCatalog