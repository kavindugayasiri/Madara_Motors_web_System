
import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getAllProducts } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext' 
import api from '../services/api'

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
  'tyres': '⭕', 'tires': '⭕',
  'lubricants': '🛢️',
  'aftermarket': '🔩', 'aftermarket items': '🔩',
  'accessories': '🔑',
  'exhaust': '💨',
  'steering': '🎯',
  'fuel': '⛽', 'fuel system': '⛽',
}

const getCategoryIcon = (category) => {
  if (!category) return '🔧'
  const lower = category.toLowerCase().trim()
  if (categoryIcons[lower]) return categoryIcons[lower]
  for (const key of Object.keys(categoryIcons)) {
    if (lower.includes(key) || key.includes(lower)) return categoryIcons[key]
  }
  return '🔩'
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
// ⭐ STAR RATING COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StarRating = ({ rating, onRate, interactive = false, size = '24px' }) => {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            fontSize: size,
            color: star <= (hover || rating) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  )
}



// 📝 REVIEW FORM COMPONENT 

const ReviewForm = ({ productCode, onReviewAdded }) => {
  const { customer } = useAuth(); // Needed to get the customer's name

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const ratingLabels = ['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Very Good 😊', 'Excellent 🤩']

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
        setError('Please select a star rating before submitting.');
        return;
    }
    
    setLoading(true);

    try {
        const payload = {
            productCode: productCode,
            customerName: customer?.name || "Verified Customer", // Use actual customer name
            rating: rating,
            comment: comment // No longer checking length
        };

        const res = await api.post('/reviews/add', payload);
        
        setSuccess(true);
        if(onReviewAdded) onReviewAdded(res.data);
        
        // Reset form after showing success message briefly (optional)
        setTimeout(() => {
            setSuccess(false);
            setRating(0);
            setComment('');
        }, 3000);

    } catch (err) {
        console.error('Review submit error:', err);
        
        // 🟢 FIXED: Safe error message extraction
        const resData = err?.response?.data;
      
        const errorMessage = resData?.error || resData?.message || (typeof resData === 'string' ? resData : 'Failed to submit review. Please try again.');
        
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        background: '#f0fdf4', border: '1px solid #86efac',
        borderRadius: '12px', padding: '24px', textAlign: 'center',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '40px' }}>✅</div>
        <h4 style={{ color: '#16a34a', margin: '10px 0 6px', fontWeight: '700' }}>
          Review Submitted Successfully!
        </h4>
        <p style={{ color: '#15803d', fontSize: '14px', margin: 0 }}>
          Thank you for your feedback 🙏
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '12px', padding: '24px', marginBottom: '24px',
    }}>
      <h4 style={{ margin: '0 0 20px', color: '#1f2937', fontWeight: '700', fontSize: '16px' }}>
        📝 Write Your Review
      </h4>

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div style={{ marginBottom: '18px' }}>
          <label style={rv.label}>Your Rating *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StarRating rating={rating} onRate={setRating} interactive={true} size="32px" />
            {rating > 0 && (
              <span style={{
                color: '#e67e22', fontWeight: '600', fontSize: '14px',
                background: '#fff5eb', padding: '4px 12px', borderRadius: '20px',
              }}>
                {ratingLabels[rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '18px' }}>
          <label style={rv.label}>Your Review (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience about this product..."
            rows={4}
            maxLength={1000}
            style={rv.textarea}
            onFocus={(e) => {
              e.target.style.borderColor = '#e67e22'
              e.target.style.boxShadow = '0 0 0 3px rgba(230,126,34,0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
              e.target.style.boxShadow = 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>{comment.length}/1000</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: '8px', padding: '12px 16px',
            color: '#dc2626', fontSize: '14px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #e67e22, #d35400)',
            color: '#fff', border: 'none',
            borderRadius: '8px', padding: '12px 28px',
            fontSize: '15px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: '16px', height: '16px',
                border: '2px solid #fff', borderTop: '2px solid transparent',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }} />
              Submitting...
            </>
          ) : '🚀 Submit Review'}
        </button>
      </form>
    </div>
  )
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 SINGLE REVIEW CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ReviewCard = ({ review }) => {
  const date = new Date(review.createdAt).toLocaleDateString('en-LK', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const avatarColors = ['#e67e22','#3b82f6','#10b981','#8b5cf6','#ef4444','#06b6d4']
  const colorIndex = (review.customerName || "U").charCodeAt(0) % avatarColors.length
  const avatarColor = avatarColors[colorIndex]

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '12px', padding: '20px', marginBottom: '14px',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '12px',
      }}>
        {/* Customer Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: avatarColor, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '800', fontSize: '20px', flexShrink: 0,
          }}>
            {(review.customerName || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: '700', color: '#1f2937', margin: '0 0 2px', fontSize: '15px' }}>
              {review.customerName || "Verified Customer"}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              🗓️ {date}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div style={{ textAlign: 'right' }}>
          <StarRating rating={review.rating} size="18px" />
          <span style={{
            fontSize: '12px', color: '#6b7280',
            fontWeight: '600', display: 'block', marginTop: '2px',
          }}>
            {review.rating}/5
          </span>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p style={{
          color: '#374151', lineHeight: '1.7', fontSize: '14px', margin: 0,
          background: '#f9fafb', padding: '12px 14px',
          borderRadius: '8px', borderLeft: '3px solid #e67e22',
        }}>
          "{review.comment}"
        </p>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌟 REVIEWS SECTION COMPONENT - FIXED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ReviewsSection = ({ productCode, productName }) => {
  const { customer } = useAuth()

  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [productCode])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/reviews/product/${productCode}`)
      setReviews(response.data.reviews || [])
      setAverageRating(response.data.averageRating || 0)
      setTotalReviews(response.data.totalReviews || 0)
    } catch (error) {
      console.error('Reviews load error:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleReviewAdded = (newReview) => {
    // Optimistically update the list without a full refetch immediately 
    // OR just refetch to get updated averages. Refetching is safer.
    fetchReviews();
  }

  const getRatingCount = (star) => reviews.filter(r => r.rating === star).length

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* Rating Summary - Show only if reviews exist */}
      {totalReviews > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed, #fff)',
          border: '1px solid #fed7aa', borderRadius: '14px',
          padding: '24px', marginBottom: '28px',
          display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '52px', fontWeight: '900', color: '#e67e22', lineHeight: 1 }}>
              {Number(averageRating).toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size="20px" />
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>
              {totalReviews} Review{totalReviews > 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = getRatingCount(star)
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={star} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600', minWidth: '16px' }}>
                    {star}
                  </span>
                  <span style={{ fontSize: '14px', color: '#f59e0b' }}>★</span>
                  <div style={{
                    flex: 1, height: '8px',
                    background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #e67e22)',
                      borderRadius: '4px', transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '20px' }}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ✅ Show Review Form only if Logged In */}
      {customer && (
        <ReviewForm
          productCode={productCode}
          onReviewAdded={handleReviewAdded}
        />
      )}

      {/* Reviews List */}
      <div>
        <h4 style={{
          color: '#1f2937', fontWeight: '700', fontSize: '16px',
          marginBottom: '16px', paddingBottom: '10px',
          borderBottom: '2px solid #f3f4f6',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          💬 Customer Reviews
          <span style={{
            background: '#e67e22', color: '#fff',
            fontSize: '12px', fontWeight: '700',
            padding: '2px 10px', borderRadius: '12px',
          }}>
            {totalReviews}
          </span>
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <div style={{
              width: '36px', height: '36px',
              border: '3px solid #f0f0f0', borderTop: '3px solid #e67e22',
              borderRadius: '50%', animation: 'spin 0.9s linear infinite',
              margin: '0 auto 12px',
            }} />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          /* ✅ No Reviews - English text */
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>💬</div>
            <h4 style={{ color: '#374151', fontWeight: '700', margin: '0 0 8px' }}>
              No reviews yet
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 16px' }}>
              Be the first to review "{productName}"
            </p>
            {/* ✅ Login hint if not logged in */}
            {!customer && (
              <p style={{
                color: '#cbd5e1', fontSize: '13px', margin: 0,
              }}>
                Login to write a review
              </p>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 MAIN PRODUCT DETAIL COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProductDetail = () => {
  const { productCode } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedImg, setSelectedImg] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    loadProducts()
    window.scrollTo(0, 0)
  }, [productCode])

  useEffect(() => {
    if (productCode) {
      api.get(`/reviews/product/${productCode}`)
        .then(res => setReviewCount(res.data.totalReviews || 0))
        .catch(() => {})
    }
  }, [productCode])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await getAllProducts()
      const prods = Array.isArray(res.data) ? res.data : []
      const found = prods.find(p => p.productCode === productCode)
      if (found) {
        setProduct(found)
        const related = prods.filter(p =>
          p.productCode !== productCode &&
          getProductCategory(p).toLowerCase() === getProductCategory(found).toLowerCase()
        ).slice(0, 5)
        setRelatedProducts(related)
      }
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  const handleAddToCart = () => {
    if (!product || stock === 0) return
    for (let i = 0; i < qty; i++) {
      addToCart({ ...product, price: product.sellingPrice || product.price })
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={st.loadWrap}>
          <div style={st.spinner} />
          <p style={{ color: '#888', marginTop: '16px' }}>Loading product...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={st.notFound}>
          <p style={{ fontSize: '64px' }}>😕</p>
          <h2>Product Not Found</h2>
          <p style={{ color: '#888' }}>The product you're looking for doesn't exist.</p>
          <button style={st.backBtn} onClick={() => navigate('/parts')}>
            ← Back to Catalog
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const stock = product.stockQty ?? product.stock ?? 0
  const price = parseFloat(product.sellingPrice || product.price || 0)
  const imgUrl = getImageUrl(product.imageUrl)
  const category = getProductCategory(product)
  const images = product.images?.length > 0 ? product.images : imgUrl ? [imgUrl] : []

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .rel-card:hover   { transform: translateY(-4px) !important; box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important; }
        .tab-btn:hover    { color: #e67e22 !important; }
        .qty-btn:hover:not(:disabled) { background: #e67e22 !important; color: white !important; }
      `}</style>

      {/* BREADCRUMB */}
      <div style={st.breadcrumbBar}>
        <div style={st.breadcrumbInner}>
          <Link to="/" style={st.breadLink}>Home</Link>
          <span style={st.breadSep}>/</span>
          <Link to="/parts" style={st.breadLink}>Parts Catalog</Link>
          <span style={st.breadSep}>/</span>
          <Link to={`/parts?category=${encodeURIComponent(category)}`} style={st.breadLink}>
            {category}
          </Link>
          <span style={st.breadSep}>/</span>
          <span style={st.breadCurrent}>{product.productName}</span>
        </div>
      </div>

      <div style={st.main}>

        {/* PRODUCT SECTION */}
        <div style={st.productSection}>

          {/* LEFT: Images */}
          <div style={st.imgCol}>
            <div style={st.mainImgBox}>
              {images.length > 0 ? (
                <img
                  src={images[selectedImg] || imgUrl}
                  alt={product.productName}
                  style={st.mainImg}
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <div style={st.noImg}>
                  <span style={{ fontSize: '72px' }}>🔧</span>
                  <p style={{ color: '#94a3b8', marginTop: '12px' }}>No Image Available</p>
                </div>
              )}
              <div style={st.zoomHint}>🔍</div>
            </div>

            {images.length > 1 && (
              <div style={st.thumbStrip}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    style={{ ...st.thumb, borderColor: selectedImg === i ? '#e67e22' : '#e2e8f0' }}
                    onClick={() => setSelectedImg(i)}
                  >
                    <img src={img} alt={`view-${i}`} style={st.thumbImg}
                      onError={e => { e.target.style.display = 'none' }} />
                  </div>
                ))}
              </div>
            )}

            <div style={st.trustBox}>
              <div style={st.trustItem}>🔄 7-day returns</div>
              <div style={st.trustItem}>🛡️ Genuine parts</div>
              <div style={st.trustItem}>📞 +94 76 992 4173</div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div style={st.infoCol}>
            <div style={st.catTag}>
              {getCategoryIcon(category)} {category || 'Spare Part'}
            </div>

            <h1 style={st.productName}>{product.productName}</h1>
            <p style={st.sku}>SKU: <strong>{product.productCode}</strong></p>

            <div style={st.ratingRow}>
              <StarRating rating={Math.round(product.rating || 4.5)} size="20px" />
              <span style={st.ratingText}>{product.rating || '4.5'}</span>
              <span style={st.reviewCount}>
                ({reviewCount || product.reviewCount || 0} reviews)
              </span>
            </div>

            <div style={st.divider} />

            <div style={st.priceBlock}>
              <span style={st.price}>{formatPrice(product)}</span>
              {product.originalPrice && (
                <>
                  <span style={st.originalPrice}>
                    Rs. {parseFloat(product.originalPrice).toLocaleString('en-LK')}
                  </span>
                  <span style={st.discountBadge}>
                    {Math.round((1 - price / parseFloat(product.originalPrice)) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <div style={st.divider} />

            <p style={st.shortDesc}>
              {product.description ||
                'High quality genuine vehicle spare part. Compatible with most vehicle models. Tested and certified for performance and durability.'}
            </p>

            <div style={{
              ...st.stockStatus,
              background: stock === 0 ? '#fee2e2' : stock <= 5 ? '#fef3c7' : '#dcfce7',
              color:      stock === 0 ? '#dc2626' : stock <= 5 ? '#d97706' : '#16a34a',
              border:    `1px solid ${stock === 0 ? '#fca5a5' : stock <= 5 ? '#fcd34d' : '#86efac'}`,
            }}>
              {stock === 0
                ? '❌ Out of Stock'
                : stock <= 5
                ? `⚠️ Only ${stock} units left - Order soon!`
                : `✅ In Stock — ${stock} units available`}
            </div>

            {stock > 0 && (
              <div style={st.cartRow}>
                <div style={st.qtyWrap}>
                  <span style={st.qtyLabel}>Qty:</span>
                  <div style={st.qtyBox}>
                    <button
                      className="qty-btn"
                      style={{ ...st.qtyBtn, opacity: qty <= 1 ? 0.4 : 1 }}
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                    >−</button>
                    <span style={st.qtyNum}>{qty}</span>
                    <button
                      className="qty-btn"
                      style={{ ...st.qtyBtn, opacity: qty >= stock ? 0.4 : 1 }}
                      onClick={() => setQty(q => Math.min(stock, q + 1))}
                      disabled={qty >= stock}
                    >+</button>
                  </div>
                </div>

                <button
                  style={{
                    ...st.addCartBtn,
                    background: addedToCart
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'linear-gradient(135deg, #e67e22, #d35400)',
                  }}
                  onClick={handleAddToCart}
                >
                  {addedToCart
                    ? `✅ Added! (${qty} item${qty > 1 ? 's' : ''})`
                    : `🛒 ADD TO CART`}
                </button>
              </div>
            )}

            {qty > 1 && stock > 0 && (
              <p style={st.totalText}>
                Total: <strong>Rs. {(price * qty).toLocaleString('en-LK')}</strong>
              </p>
            )}

            <div style={st.divider} />

            <div style={st.metaGrid}>
              <div style={st.metaItem}>
                <span style={st.metaLabel}>SKU</span>
                <span style={st.metaVal}>{product.productCode}</span>
              </div>
              <div style={st.metaItem}>
                <span style={st.metaLabel}>Category</span>
                <Link
                  to={`/parts?category=${encodeURIComponent(category)}`}
                  style={{ ...st.metaVal, color: '#e67e22', textDecoration: 'none' }}
                >
                  {category}
                </Link>
              </div>
              {product.brand && (
                <div style={st.metaItem}>
                  <span style={st.metaLabel}>Brand</span>
                  <span style={st.metaVal}>{product.brand}</span>
                </div>
              )}
              {product.warranty && (
                <div style={st.metaItem}>
                  <span style={st.metaLabel}>Warranty</span>
                  <span style={st.metaVal}>{product.warranty}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={st.tabsSection}>
          <div style={st.tabBar}>
            {['description', 'additional', 'reviews'].map(tab => (
              <button
                key={tab}
                className="tab-btn"
                style={{
                  ...st.tabBtn,
                  borderBottom: activeTab === tab ? '3px solid #e67e22' : '3px solid transparent',
                  color:        activeTab === tab ? '#e67e22' : '#555',
                  fontWeight:   activeTab === tab ? '700' : '500',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' ? 'DESCRIPTION'
                  : tab === 'additional' ? 'ADDITIONAL INFORMATION'
                  : `REVIEWS (${reviewCount})`}
              </button>
            ))}
          </div>

          <div style={st.tabContent}>
            {/* Description */}
            {activeTab === 'description' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <p style={st.tabText}>
                  {product.description ||
                    `${product.productName} - High quality genuine vehicle spare part available at Madara Motors.`}
                </p>
                <div style={st.featureGrid}>
                  <div style={st.featureItem}>✅ Genuine Quality</div>
                  <div style={st.featureItem}>✅ Island-wide Delivery</div>
                  <div style={st.featureItem}>✅ Easy Returns</div>
                  <div style={st.featureItem}>✅ Expert Support</div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            {activeTab === 'additional' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <table style={st.infoTable}>
                  <tbody>
                    <tr style={st.tableRow}>
                      <td style={st.tableLabel}>Product Code</td>
                      <td style={st.tableVal}>{product.productCode}</td>
                    </tr>
                    <tr style={st.tableRow}>
                      <td style={st.tableLabel}>Category</td>
                      <td style={st.tableVal}>{category}</td>
                    </tr>
                    <tr style={st.tableRow}>
                      <td style={st.tableLabel}>Stock</td>
                      <td style={st.tableVal}>{stock} units</td>
                    </tr>
                    {product.brand && (
                      <tr style={st.tableRow}>
                        <td style={st.tableLabel}>Brand</td>
                        <td style={st.tableVal}>{product.brand}</td>
                      </tr>
                    )}
                    {product.weight && (
                      <tr style={st.tableRow}>
                        <td style={st.tableLabel}>Weight</td>
                        <td style={st.tableVal}>{product.weight}</td>
                      </tr>
                    )}
                    {product.warranty && (
                      <tr style={st.tableRow}>
                        <td style={st.tableLabel}>Warranty</td>
                        <td style={st.tableVal}>{product.warranty}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ✅ REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <ReviewsSection
                productCode={productCode}
                productName={product.productName}
              />
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div style={st.relatedSection}>
            <div style={st.relatedHeader}>
              <h2 style={st.relatedTitle}>Related Products</h2>
              <Link
                to={`/parts?category=${encodeURIComponent(category)}`}
                style={st.seeAllBtn}
              >
                See All →
              </Link>
            </div>

            <div style={st.relatedGrid}>
              {relatedProducts.map(p => {
                const pStock  = p.stockQty ?? p.stock ?? 0
                const pImgUrl = getImageUrl(p.imageUrl)
                return (
                  <div
                    key={p.productCode}
                    className="rel-card"
                    style={st.relCard}
                    onClick={() => { navigate(`/parts/${p.productCode}`); window.scrollTo(0, 0) }}
                  >
                    <div style={st.relImgWrap}>
                      {pImgUrl ? (
                        <img src={pImgUrl} alt={p.productName} style={st.relImg}
                          onError={e => { e.target.style.display = 'none' }} />
                      ) : (
                        <div style={st.relNoImg}>
                          <span style={{ fontSize: '30px' }}>🔧</span>
                        </div>
                      )}
                      <span style={{
                        ...st.relBadge,
                        background: pStock === 0 ? '#e74c3c' : pStock <= 5 ? '#f39c12' : '#27ae60',
                      }}>
                        {pStock === 0 ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div style={st.relBody}>
                      <p style={st.relCat}>{getCategoryIcon(getProductCategory(p))} {getProductCategory(p)}</p>
                      <h4 style={st.relName}>{p.productName}</h4>
                      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                        {'⭐'.repeat(5)}
                        <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px' }}>4.5</span>
                      </div>
                      <div style={st.relPriceRow}>
                        <span style={st.relPrice}>
                          Rs. {parseFloat(p.sellingPrice || p.price || 0).toLocaleString('en-LK')}
                        </span>
                      </div>
                      <div style={st.relCartRow} onClick={e => e.stopPropagation()}>
                        <div style={st.relQtyBox}>
                          <button style={st.relQtyBtn} onClick={e => e.stopPropagation()}>−</button>
                          <span style={st.relQtyNum}>1</span>
                          <button style={st.relQtyBtn} onClick={e => e.stopPropagation()}>+</button>
                        </div>
                        <button
                          style={{
                            ...st.relAddBtn,
                            opacity: pStock === 0 ? 0.5 : 1,
                            cursor:  pStock === 0 ? 'not-allowed' : 'pointer',
                          }}
                          disabled={pStock === 0}
                          onClick={e => {
                            e.stopPropagation()
                            addToCart({ ...p, price: p.sellingPrice || p.price })
                          }}
                        >
                          🛒 ADD TO CART
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const rv = {
  label: {
    display: 'block', marginBottom: '8px',
    color: '#374151', fontWeight: '600', fontSize: '14px',
  },
  textarea: {
    width: '100%', padding: '12px',
    border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '14px', resize: 'vertical',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
}

const st = {
  loadWrap:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner:     { width: '44px', height: '44px', border: '4px solid #f0f0f0', borderTop: '4px solid #e67e22', borderRadius: '50%', animation: 'spin 0.9s linear infinite' },
  notFound:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' },
  backBtn:     { marginTop: '16px', padding: '12px 28px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' },
  breadcrumbBar:   { background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 0' },
  breadcrumbInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  breadLink:    { color: '#e67e22', textDecoration: 'none', fontSize: '13px', fontWeight: '500' },
  breadSep:     { color: '#94a3b8', fontSize: '13px' },
  breadCurrent: { color: '#64748b', fontSize: '13px' },
  main:         { maxWidth: '1200px', margin: '0 auto', padding: '30px 24px 60px', width: '100%' },
  productSection: { display: 'flex', gap: '40px', flexWrap: 'wrap', background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '30px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
  imgCol:      { width: '420px', flexShrink: 0, minWidth: '280px' },
  mainImgBox:  { position: 'relative', width: '100%', height: '380px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '12px' },
  mainImg:     { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '16px' },
  noImg:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  zoomHint:    { position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.4)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },
  thumbStrip:  { display: 'flex', gap: '8px', marginBottom: '16px' },
  thumb:       { width: '70px', height: '70px', border: '2px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  thumbImg:    { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  trustBox:    { background: '#f8fafc', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e2e8f0' },
  trustItem:   { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  infoCol:     { flex: 1, minWidth: '280px' },
  catTag:      { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff5eb', color: '#e67e22', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' },
  productName: { fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px', lineHeight: '1.3' },
  sku:         { fontSize: '13px', color: '#94a3b8', marginBottom: '10px' },
  ratingRow:   { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' },
  ratingText:  { fontSize: '14px', fontWeight: '700', color: '#f59e0b', marginLet: '6px' },
  reviewCount: { fontSize: '13px', color: '#94a3b8' },
  divider:     { height: '1px', background: '#f1f5f9', margin: '16px 0' },
  priceBlock:  { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  price:          { fontSize: '32px', fontWeight: '900', color: '#e31e24' },
  originalPrice:  { fontSize: '18px', color: '#94a3b8', textDecoration: 'line-through' },
  discountBadge:  { background: '#e31e24', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' },
  shortDesc:   { fontSize: '14px', color: '#64748b', lineHeight: '1.7', marginBottom: '16px' },
  stockStatus: { padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', marginBottom: '20px' },
  cartRow:     { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' },
  qtyWrap:     { display: 'flex', alignItems: 'center', gap: '10px' },
  qtyLabel:    { fontSize: '14px', fontWeight: '700', color: '#374151' },
  qtyBox:      { display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' },
  qtyBtn:      { width: '40px', height: '42px', background: '#f8fafc', border: 'none', fontSize: '22px', cursor: 'pointer', fontWeight: '700', color: '#374151', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum:      { width: '48px', textAlign: 'center', fontSize: '17px', fontWeight: '800', color: '#1e293b' },
  addCartBtn:  { flex: 1, padding: '14px 24px', border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px', transition: 'all 0.3s ease', minWidth: '180px' },
  totalText:   { fontSize: '15px', color: '#e67e22', marginBottom: '10px' },
  metaGrid:    { display: 'flex', flexDirection: 'column', gap: '8px' },
  metaItem:    { display: 'flex', gap: '12px', alignItems: 'center' },
  metaLabel:   { fontSize: '13px', color: '#94a3b8', fontWeight: '600', minWidth: '90px' },
  metaVal:     { fontSize: '13px', color: '#374151', fontWeight: '600' },
  tabsSection: { background: 'white', borderRadius: '16px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', marginBottom: '30px', overflow: 'hidden' },
  tabBar:      { display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px' },
  tabBtn:      { padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.5px', transition: 'all 0.2s' },
  tabContent:  { padding: '28px 32px' },
  tabText:     { fontSize: '15px', color: '#64748b', lineHeight: '1.8', margin: '0 0 20px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '10px' },
  featureItem: { background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: '1px solid #bbf7d0' },
  infoTable:   { width: '100%', borderCollapse: 'collapse' },
  tableRow:    { borderBottom: '1px solid #f1f5f9' },
  tableLabel:  { padding: '12px 16px', fontSize: '14px', color: '#94a3b8', fontWeight: '600', background: '#f8fafc', width: '200px' },
  tableVal:    { padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500' },
  relatedSection: { background: 'white', borderRadius: '16px', padding: '28px 32px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
  relatedHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  relatedTitle:   { fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 },
  seeAllBtn:      { color: '#e67e22', textDecoration: 'none', fontWeight: '700', fontSize: '14px' },
  relatedGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  relCard:     { border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease', background: 'white' },
  relImgWrap:  { position: 'relative', height: '170px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  relImg:      { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '10px' },
  relNoImg:    { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  relBadge:    { position: 'absolute', top: '8px', left: '8px', color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' },
  relBody:     { padding: '12px' },
  relCat:      { fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px' },
  relName:     { fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px', height: '36px', overflow: 'hidden', lineHeight: '1.4' },
  relPriceRow: { marginBottom: '10px' },
  relPrice:    { fontSize: '15px', fontWeight: '800', color: '#e31e24' },
  relCartRow:  { display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' },
  relQtyBox:   { display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' },
  relQtyBtn:   { width: '28px', height: '30px', background: '#f8fafc', border: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: '700', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  relQtyNum:   { width: '30px', textAlign: 'center', fontSize: '13px', fontWeight: '700' },
  relAddBtn:   { flex: 1, padding: '7px 4px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
}

export default ProductDetail