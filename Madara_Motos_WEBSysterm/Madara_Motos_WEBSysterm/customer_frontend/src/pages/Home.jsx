// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

const NO_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250' viewBox='0 0 250 250'%3E%3Crect width='250' height='250' fill='%23f3f4f6'/%3E%3Ctext x='125' y='115' text-anchor='middle' font-size='40'%3E%F0%9F%94%A7%3C/text%3E%3Ctext x='125' y='150' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='13' font-family='Arial'%3ENo Image%3C/text%3E%3C/svg%3E`

const useScrollAnimation = (threshold = 0.15) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, visible]
}

const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const [ref, visible] = useScrollAnimation()
  const started = useRef(false)
  useEffect(() => { started.current = false; setCount(0) }, [target])
  useEffect(() => {
    if (!visible || started.current || target === 0) return
    started.current = true
    const numeric = parseInt(target.toString().replace(/\D/g, ''))
    if (!numeric) { setCount(target); return }
    const step = numeric / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= numeric) { setCount(numeric); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [visible, target, duration])
  return <span ref={ref}>{count}{suffix}</span>
}

const heroSlides = [
  {
    id: 0,
    headline: 'FIND GENUINE PARTS',
    sub: 'FOR YOUR VEHICLE',
    tag: '🇱🇰 Sri Lanka\'s #1 Auto Parts Store',
    accentColor: '#e67e22',
    animClass: 'scene-car-drive',
    bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0f172a 100%)',
  },
  {
    id: 1,
    headline: 'ENGINE PARTS',
    sub: 'POWER & PRECISION',
    tag: '⚙️ OEM Certified Components',
    accentColor: '#e31e24',
    animClass: 'scene-engine',
    bgGradient: 'linear-gradient(135deg, #0f0000 0%, #1a0000 50%, #0a0a0a 100%)',
  },
  {
    id: 2,
    headline: 'BRAKE SYSTEMS',
    sub: 'SAFETY FIRST',
    tag: '🛑 Certified Braking Solutions',
    accentColor: '#e31e24',
    animClass: 'scene-brake',
    bgGradient: 'linear-gradient(135deg, #0a0000 0%, #150000 60%, #0a0a0a 100%)',
  },
  {
    id: 3,
    headline: 'ELECTRICAL PARTS',
    sub: 'POWER YOUR RIDE',
    tag: '⚡ Smart Electrical Systems',
    accentColor: '#f39c12',
    animClass: 'scene-electric',
    bgGradient: 'linear-gradient(135deg, #0a0800 0%, #120e00 50%, #0a0a0f 100%)',
  },
  {
    id: 4,
    headline: 'SUSPENSION',
    sub: 'SMOOTH EVERY ROAD',
    tag: '🔧 Premium Suspension Parts',
    accentColor: '#e67e22',
    animClass: 'scene-suspension',
    bgGradient: 'linear-gradient(135deg, #050a14 0%, #0a1428 50%, #050a0a 100%)',
  },
  {
    id: 5,
    headline: 'TRUCK & LORRY',
    sub: 'HEAVY DUTY PARTS',
    tag: '🚛 Commercial Vehicle Range',
    accentColor: '#d35400',
    animClass: 'scene-truck',
    bgGradient: 'linear-gradient(135deg, #080500 0%, #140a00 50%, #0a0a0a 100%)',
  },
  {
    id: 6,
    headline: 'COOLING SYSTEM',
    sub: 'KEEP IT RUNNING',
    tag: '❄️ Radiator & Cooling Parts',
    accentColor: '#3498db',
    animClass: 'scene-cooling',
    bgGradient: 'linear-gradient(135deg, #00050f 0%, #000a1e 60%, #0a0a0f 100%)',
  },
  {
    id: 7,
    headline: 'TYRE & WHEELS',
    sub: 'GRIP THE ROAD',
    tag: '⭕ Premium Tyres & Rims',
    accentColor: '#e67e22',
    animClass: 'scene-wheel',
    bgGradient: 'linear-gradient(135deg, #0a0500 0%, #1a0a00 50%, #0f0f0f 100%)',
  },
  {
    id: 8,
    headline: 'FILTERS & OILS',
    sub: 'PURE PERFORMANCE',
    tag: '🛢️ Engine Oils & Filters',
    accentColor: '#f39c12',
    animClass: 'scene-oil',
    bgGradient: 'linear-gradient(135deg, #0a0800 0%, #1a1000 50%, #0a0a0a 100%)',
  },
  {
    id: 9,
    headline: 'PERFORMANCE BOOST',
    sub: 'UPGRADE YOUR RIDE',
    tag: '🏎️ High Performance Auto Parts',
    accentColor: '#ff3b3b',
    animClass: 'scene-performance',
    bgGradient: 'linear-gradient(135deg, #0f0c29 0%, #1a0f2e 50%, #302060 100%)',
  },
    {
    id: 10,
    headline: 'TURBO & EXHAUST',
    sub: 'UNLEASH THE BEAST',
    tag: '🌀 Turbo Charged Performance',
    accentColor: '#00bcd4',
    animClass: 'scene-turbo',
    bgGradient: 'linear-gradient(135deg, #000a0f 0%, #001525 50%, #000f1a 100%)',
  },
  {
    id: 11,
    headline: 'AIR & INTAKE',
    sub: 'BREATHE BETTER POWER',
    tag: '🌀 Air Filters & Intake Systems',
    accentColor: '#00bcd4',
    animClass: 'scene-air',
    bgGradient: 'linear-gradient(135deg, #000a0f 0%, #001020 60%, #0a0a0f 100%)',
  },
]

const HeroCarousel = ({ searchWrapRef, searchTerm, onSearch, onSearchSubmit, onKeyDown, onFocus, showResults, children }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const progressRef = useRef(null)
  const SLIDE_DURATION = 8000

  const startSlide = (idx) => {
    setCurrentSlide(idx)
    setProgress(0)
    setTransitioning(true)
    setTimeout(() => setTransitioning(false), 800)
  }

  useEffect(() => {
    let start = null
    const animateProgress = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100))
      if (elapsed < SLIDE_DURATION) {
        progressRef.current = requestAnimationFrame(animateProgress)
      }
    }
    progressRef.current = requestAnimationFrame(animateProgress)

    intervalRef.current = setInterval(() => {
      start = null
      setCurrentSlide(prev => {
        const next = (prev + 1) % heroSlides.length
        setTransitioning(true)
        setTimeout(() => setTransitioning(false), 800)
        return next
      })
    }, SLIDE_DURATION)

    return () => {
      clearInterval(intervalRef.current)
      cancelAnimationFrame(progressRef.current)
    }
  }, [currentSlide])

  const slide = heroSlides[currentSlide]

  return (
    <section style={{
      position: 'relative',
      minHeight: '700px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>

      {/* BG GRADIENT */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: slide.bgGradient,
        transition: 'background 1.2s ease',
      }} />

      {/* CSS ANIMATION SCENE */}
      <div className={`hero-scene ${slide.animClass}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      {/* PARTICLE LAYER */}
      <div className="hero-particles" style={{ position: 'absolute', inset: 0, zIndex: 2 }} />

      {/* DARK VIGNETTE */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* ACCENT GLOW */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: `radial-gradient(ellipse at 75% 50%, ${slide.accentColor}22 0%, transparent 65%)`,
        transition: 'background 1.2s ease',
      }} />

      {/* BOTTOM GRADIENT FADE */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '200px', zIndex: 3,
        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
      }} />

      {/* CONTENT */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        textAlign: 'center',
        padding: '60px 20px 80px',
        width: '100%',
        maxWidth: '920px',
      }}>
        {/* ANIMATED TEXT BLOCK */}
        <div style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(22px) scale(0.97)' : 'translateY(0) scale(1)',
          transition: 'opacity 0.75s ease, transform 0.75s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* TAG PILL */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: `linear-gradient(135deg, ${slide.accentColor}ee, ${slide.accentColor}99)`,
            color: 'white',
            padding: '8px 26px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '28px',
            boxShadow: `0 4px 20px ${slide.accentColor}55`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${slide.accentColor}44`,
            letterSpacing: '0.5px',
          }}>
            {slide.tag}
          </div>

          {/* HEADLINE */}
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: '900',
            marginBottom: '12px',
            letterSpacing: '2px',
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            lineHeight: '1.1',
          }}>
            {slide.headline}
          </h1>

          {/* SUB HEADLINE */}
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)',
            fontWeight: '900',
            marginBottom: '20px',
            backgroundImage: `linear-gradient(135deg, ${slide.accentColor}, #ffffff, ${slide.accentColor})`,
            backgroundSize: '200% auto',
            animation: 'shimmer 3s linear infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '1px',
          }}>
            {slide.sub}
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '1.05rem',
            marginBottom: '35px',
            letterSpacing: '0.3px',
          }}>
            Trusted by thousands of Sri Lankan vehicle owners
          </p>
        </div>

        {/* SEARCH BOX — NOT animated */}
        <div ref={searchWrapRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '50px',
            padding: '8px 8px 8px 24px',
            gap: '10px',
            boxShadow: `0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px ${slide.accentColor}33`,
            backdropFilter: 'blur(10px)',
            transition: 'box-shadow 0.3s ease',
          }}>
            <span style={{ fontSize: '20px', color: '#999', flexShrink: 0 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by part name, category or code..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                background: 'transparent',
                color: '#1e293b',
              }}
              value={searchTerm}
              onChange={e => onSearch(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
            />
            <button
              style={{
                padding: '12px 32px',
                background: `linear-gradient(135deg, ${slide.accentColor}, #e31e24)`,
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '14px',
                letterSpacing: '0.5px',
                boxShadow: `0 6px 20px ${slide.accentColor}66`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                flexShrink: 0,
              }}
              onClick={onSearchSubmit}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE PROGRESS DOTS */}
      <div style={{
        position: 'absolute', bottom: '28px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 6,
        display: 'flex', gap: '8px', alignItems: 'center',
      }}>
        {heroSlides.map((s, i) => (
          <div
            key={i}
            onClick={() => startSlide(i)}
            style={{
              position: 'relative',
              width: i === currentSlide ? '40px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === currentSlide ? 'transparent' : 'rgba(255,255,255,0.25)',
              overflow: 'hidden',
              transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              cursor: 'pointer',
            }}>
            {i === currentSlide && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: `${progress}%`,
                  background: slide.accentColor,
                  borderRadius: '4px',
                  transition: 'width 0.1s linear',
                }} />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

const vehicleTypes = [
  {
    type: 'Car', emoji: '🚗', label: 'Cars',
    image: '/assets/images/car_bg.jpg',
    brands: [
      { name: 'Toyota',     logo: '/assets/logos/toyota.png' },
      { name: 'Honda',      logo: '/assets/logos/honda.png' },
      { name: 'Nissan',     logo: '/assets/logos/nissan.png' },
      { name: 'Suzuki',     logo: '/assets/logos/suzuki.png' },
      { name: 'BMW',        logo: '/assets/logos/bmw.png' },
      { name: 'Mercedes',   logo: '/assets/logos/mercedes.png' },
      { name: 'Hyundai',    logo: '/assets/logos/hyundai.png' },
      { name: 'Mazda',      logo: '/assets/logos/mazda.png' },
      { name: 'Mitsubishi', logo: '/assets/logos/mitsubishi.png' },
      { name: 'Kia',        logo: '/assets/logos/kia.png' },
      { name: 'Audi',       logo: '/assets/logos/audi.png' },
      { name: 'Volkswagen', logo: '/assets/logos/volkswagen.png' },
    ],
  },
  {
    type: 'Van', emoji: '🚐', label: 'Vans',
    image: '/assets/images/van_bg.jpg',
    brands: [
      { name: 'Toyota',     logo: '/assets/logos/toyota.png' },
      { name: 'Nissan',     logo: '/assets/logos/nissan.png' },
      { name: 'Mitsubishi', logo: '/assets/logos/mitsubishi.png' },
      { name: 'Mercedes',   logo: '/assets/logos/mercedes.png' },
      { name: 'Ford',       logo: '/assets/logos/ford.png' },
      { name: 'Honda',      logo: '/assets/logos/honda.png' },
      { name: 'Hyundai',    logo: '/assets/logos/hyundai.png' },
    ],
  },
  {
    type: 'SUV', emoji: '🚙', label: 'Jeeps / SUVs',
    image: '/assets/images/suv_bg.jpg',
    brands: [
      { name: 'Toyota',     logo: '/assets/logos/toyota.png' },
      { name: 'Jeep',       logo: '/assets/logos/jeep.png' },
      { name: 'BMW',        logo: '/assets/logos/bmw.png' },
      { name: 'Mitsubishi', logo: '/assets/logos/mitsubishi.png' },
      { name: 'Nissan',     logo: '/assets/logos/nissan.png' },
      { name: 'Land Rover', logo: '/assets/logos/land_rover.png' },
      { name: 'Suzuki',     logo: '/assets/logos/suzuki.png' },
      { name: 'Kia',        logo: '/assets/logos/kia.png' },
      { name: 'Hyundai',    logo: '/assets/logos/hyundai.png' },
    ],
  },
  {
    type: 'Lorry', emoji: '🚛', label: 'Lorries / Trucks',
    image: '/assets/images/lorry_bg.jpg',
    brands: [
      { name: 'Isuzu',     logo: '/assets/logos/isuzu.png' },
      { name: 'Tata',      logo: '/assets/logos/tata.png' },
      { name: 'Ashok',     logo: '/assets/logos/Ashok_Leyland.png' },
      { name: 'Mercedes',  logo: '/assets/logos/mercedes.png' },
      { name: 'Volvo',     logo: '/assets/logos/volvo.png' },
      { name: 'Mitsubishi',logo: '/assets/logos/mitsubishi.png' },
      { name: 'Nissan',    logo: '/assets/logos/nissan.png' },
      { name: 'Hino',      logo: '/assets/logos/hino.png' },
    ],
  },
  {
    type: 'Bus', emoji: '🚌', label: 'Buses',
    image: '/assets/images/bus_bg.jpg',
    brands: [
      { name: 'Ashok',    logo: '/assets/logos/Ashok_Leyland.png' },
      { name: 'Tata',     logo: '/assets/logos/tata.png' },
      { name: 'Isuzu',    logo: '/assets/logos/isuzu.png' },
      { name: 'Mercedes', logo: '/assets/logos/mercedes.png' },
      { name: 'Volvo',    logo: '/assets/logos/volvo.png' },
      { name: 'Rosa',     logo: '/assets/logos/rosa.png' },
    ],
  },
  {
    type: 'Pickup', emoji: '🛻', label: 'Pickups / Cabs',
    image: '/assets/images/pickup_bg.jpg',
    brands: [
      { name: 'Toyota',     logo: '/assets/logos/toyota.png' },
      { name: 'Ford',       logo: '/assets/logos/ford.png' },
      { name: 'Nissan',     logo: '/assets/logos/nissan.png' },
      { name: 'Mitsubishi', logo: '/assets/logos/mitsubishi.png' },
      { name: 'Isuzu',      logo: '/assets/logos/isuzu.png' },
      { name: 'Tata',       logo: '/assets/logos/tata.png' },
      { name: 'Mahindra',   logo: '/assets/logos/mahindra.png' },
    ],
  },
  {
    type: 'Tractor', emoji: '🚜', label: 'Tractors / Agricultural',
    image: '/assets/images/tractor_bg.jpg',
    brands: [
      { name: 'Mahindra',  logo: '/assets/logos/mahindra.png' },
      { name: 'John Deere',logo: '/assets/logos/john_deere.png' },
      { name: 'Kubota',    logo: '/assets/logos/kubota.png' },
      { name: 'Tata',      logo: '/assets/logos/tata.png' },
    ],
  },
  {
    type: 'Heavy', emoji: '🏗️', label: 'Heavy Machinery',
    image: '/assets/images/heavy_machinery_bg.jpg',
    brands: [
      { name: 'CAT',     logo: '/assets/logos/cat.png' },
      { name: 'Komatsu', logo: '/assets/logos/komatsu.png' },
      { name: 'Hitachi', logo: '/assets/logos/hitachi.png' },
      { name: 'JCB',     logo: '/assets/logos/jcb.png' },
      { name: 'Volvo',   logo: '/assets/logos/volvo.png' },
    ],
  },
]

const categoryIcons = {
  'engine parts':'⚙️','engine':'⚙️','body parts':'🚗','body':'🚗',
  'electrical':'⚡','electrical system':'⚡','suspension':'🔧',
  'braking system':'🛑','brakes':'🛑','brake':'🛑','cooling':'❄️',
  'cooling system':'❄️','filters':'🔲','filter':'🔲','audio':'🔊',
  'audio systems':'🔊','interior':'🪑','lighting':'💡','lights':'💡',
  'tyres':'⭕','tires':'⭕','tyre':'⭕','tire':'⭕','lubricants':'🛢️',
  'lubricant':'🛢️','aftermarket':'🔩','aftermarket items':'🔩',
  'accessories':'🔑','exhaust':'💨','steering':'🎯','fuel':'⛽',
  'fuel system':'⛽','transmission':'🔄','gearbox':'🔄','battery':'🔋',
  'radiator':'❄️','clutch':'🔘','belt':'🔗','timing belt':'🔗',
  'oil':'🛢️','engine oil':'🛢️','turbo':'🏎️','sensor':'📡',
  'tools':'🔨','performance':'🏎️','wheel':'⭕','rim':'⭕',
  'seat':'🪑','camera':'📷','gasket':'🔩','hose':'💧','pump':'💧',
}
const keywordMap = [
  { keys:['engine','motor','piston','crank'],         icon:'⚙️' },
  { keys:['brake','stop','caliper','disc','drum'],    icon:'🛑' },
  { keys:['electr','power','wiring','fuse','switch'], icon:'⚡' },
  { keys:['cool','thermo','radiator'],                icon:'❄️' },
  { keys:['filter'],                                  icon:'🔲' },
  { keys:['light','lamp','led','bulb'],               icon:'💡' },
  { keys:['fuel','petrol','diesel','inject','carb'],  icon:'⛽' },
  { keys:['tyre','tire','wheel','rim','alloy'],       icon:'⭕' },
  { keys:['oil','fluid','lubri','grease'],            icon:'🛢️' },
  { keys:['body','panel','bumper','fender','door'],   icon:'🚗' },
  { keys:['audio','sound','speaker','music'],         icon:'🔊' },
  { keys:['seat','interior','carpet','cabin'],        icon:'🪑' },
  { keys:['exhaust','muffler','pipe','emission'],     icon:'💨' },
  { keys:['steer'],                                   icon:'🎯' },
  { keys:['suspen','shock','spring','strut'],         icon:'🔧' },
  { keys:['belt','chain','timing'],                   icon:'🔗' },
  { keys:['sensor','camera','gps','monitor'],         icon:'📡' },
  { keys:['turbo','boost','performance','sport'],     icon:'🏎️' },
  { keys:['access','key','lock','remote'],            icon:'🔑' },
  { keys:['tool','kit','equip'],                      icon:'🔨' },
  { keys:['battery','altern','starter','charge'],     icon:'🔋' },
  { keys:['trans','gear','clutch','shift'],           icon:'🔄' },
  { keys:['pump','hose','valve','seal'],              icon:'💧' },
  { keys:['glass','window','mirror','wind'],          icon:'🪟' },
  { keys:['air','ac','condition','vent','fan'],       icon:'🌀' },
]
const fallbackEmojis = ['🔧','🔩','⚙️','🛠️','🔨','🪛','🔌','🏎️','🚘','🚙','🛻','🚐','🏍️','💡','🔋','📡','🌀','💧','🔗']
const hashString = str => { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return Math.abs(h) }
const getCategoryIcon = (cat) => {
  if (!cat) return '🔧'
  const lower = cat.toLowerCase().trim()
  if (categoryIcons[lower]) return categoryIcons[lower]
  for (const key of Object.keys(categoryIcons)) if (lower.includes(key) || key.includes(lower)) return categoryIcons[key]
  for (const { keys, icon } of keywordMap) for (const kw of keys) if (lower.includes(kw)) return icon
  return fallbackEmojis[hashString(lower) % fallbackEmojis.length]
}

const SafeImg = ({ src, alt, style }) => {
  const [imgSrc, setImgSrc] = useState(src || NO_IMAGE)
  useEffect(() => setImgSrc(src || NO_IMAGE), [src])
  return <img src={imgSrc} alt={alt || 'Product'} style={style} onError={() => setImgSrc(NO_IMAGE)} />
}

const VehicleTypeSection = ({ navigate }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [hoveredVehicle,  setHoveredVehicle]  = useState(null)
  const [hoveredBrand,    setHoveredBrand]    = useState(null)
  const [animateIn,       setAnimateIn]       = useState(false)
  const [sectionRef,      sectionVisible]     = useScrollAnimation(0.1)

  // 🟢 අලුතින් එකතු කරපු Ref එක
  const brandsSectionRef = useRef(null);

  // 🟢 Category එකක් click කරපු ගමන් ඒකට Auto Smooth Scroll වෙන Effect එක
  useEffect(() => {
    if (selectedVehicle && brandsSectionRef.current) {
      setTimeout(() => {
        brandsSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100); // UI එක render වෙන්න පොඩි ඩිලේ එකක් දෙනවා
    }
  }, [selectedVehicle]);

  const handleVehicleClick = (vehicle) => {
    if (selectedVehicle?.type === vehicle.type) { setSelectedVehicle(null); setAnimateIn(false) }
    else { setSelectedVehicle(vehicle); setAnimateIn(false); setTimeout(() => setAnimateIn(true), 50) }
  }

  return (
// ...
    <section ref={sectionRef} style={vstyles.section}>
      <div style={{ ...vstyles.header, opacity: sectionVisible ? 1 : 0, transform: sectionVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}>
        <p style={vstyles.headerTag}>🔍 FIND BY VEHICLE</p>
        <h2 style={vstyles.headerTitle}>SHOP BY VEHICLE TYPE</h2>
        <div style={vstyles.headerLine} />
        <p style={vstyles.headerSub}>Select your vehicle type, then choose your brand to find compatible parts</p>
      </div>
      <div style={vstyles.vehicleGrid}>
        {vehicleTypes.map((vehicle, idx) => {
          const isSelected = selectedVehicle?.type === vehicle.type
          const isHovered  = hoveredVehicle === vehicle.type
          return (
            <div key={vehicle.type}
              onClick={() => handleVehicleClick(vehicle)}
              onMouseEnter={() => setHoveredVehicle(vehicle.type)}
              onMouseLeave={() => setHoveredVehicle(null)}
              style={{
                ...vstyles.vehicleCard,
                opacity: sectionVisible ? 1 : 0,
                transform: sectionVisible ? (isSelected ? 'translateY(-10px) scale(1.03)' : isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)') : 'translateY(40px) scale(0.95)',
                transition: sectionVisible ? `opacity 0.5s ease ${idx * 0.1}s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s, background 0.3s` : `opacity 0.5s ease ${idx * 0.1}s, transform 0.5s ease ${idx * 0.1}s`,
                boxShadow: isSelected ? '0 25px 60px rgba(230,126,34,0.45)' : isHovered ? '0 15px 40px rgba(0,0,0,0.15)' : '0 6px 20px rgba(0,0,0,0.08)',
                border: isSelected ? '2.5px solid #e67e22' : isHovered ? '2.5px solid rgba(230,126,34,0.4)' : '2.5px solid #f0f0f0',
                background: isSelected ? 'linear-gradient(135deg,#fff8f0,#fff3e6)' : 'white',
              }}
            >
              <div style={vstyles.vehicleImgWrap}>
                <img src={vehicle.image} alt={vehicle.label} style={{ ...vstyles.vehicleImg, transform: isSelected || isHovered ? 'scale(1.08)' : 'scale(1)' }} onError={e => { e.target.style.display = 'none' }} />
                <div style={{ ...vstyles.vehicleImgOverlay, background: isSelected ? 'linear-gradient(to top,rgba(230,126,34,0.7) 0%,transparent 60%)' : 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)' }} />
                <div style={vstyles.vehicleEmoji}>{vehicle.emoji}</div>
              </div>
              <div style={vstyles.vehicleCardBody}>
                <h3 style={{ ...vstyles.vehicleCardTitle, color: isSelected ? '#e67e22' : '#1e293b' }}>{vehicle.label}</h3>
                <p style={vstyles.vehicleCardSub}>{vehicle.brands.length} Brands Available</p>
                {isSelected && <div style={vstyles.selectedBadge}>✓ Select a Brand Below</div>}
                {!isSelected && <div style={{ ...vstyles.clickHint, opacity: isHovered ? 1 : 0 }}>Click to explore →</div>}
              </div>
            </div>
          )
        })}
      </div>

     {selectedVehicle && (
        <div 
          ref={brandsSectionRef} /* 🟢 මෙන්න මෙතනට තමා Ref එක දෙන්නේ */
          style={{ ...vstyles.brandSection, opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)', transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <div style={vstyles.brandHeader}>
            <div style={vstyles.brandHeaderLeft}>
              <div style={vstyles.brandHeaderEmoji}>{selectedVehicle.emoji}</div>
              <div>
                <h3 style={vstyles.brandHeaderTitle}>{selectedVehicle.label} Brands</h3>
                <p style={vstyles.brandHeaderSub}>Choose your brand to browse compatible parts</p>
              </div>
            </div>
            <button style={vstyles.closeBtn} onClick={() => { setSelectedVehicle(null); setAnimateIn(false) }}
              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}>✕ Close</button>
          </div>
          <div style={vstyles.brandGrid}>
            {selectedVehicle.brands.map((brand, bi) => {
              const isHov = hoveredBrand === `${selectedVehicle.type}-${brand.name}`
              return (
                <div key={brand.name}
                  onClick={() => navigate(`/parts?vehicle=${selectedVehicle.type}&brand=${brand.name}`)}
                  onMouseEnter={() => setHoveredBrand(`${selectedVehicle.type}-${brand.name}`)}
                  onMouseLeave={() => setHoveredBrand(null)}
                  style={{
                    ...vstyles.brandCard,
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? (isHov ? 'translateY(-5px) scale(1.04)' : 'translateY(0) scale(1)') : 'translateY(15px)',
                    transition: `opacity 0.4s ease ${bi * 0.06}s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s, background 0.3s`,
                    boxShadow:  isHov ? '0 15px 35px rgba(230,126,34,0.3)' : '0 4px 15px rgba(0,0,0,0.07)',
                    border:     isHov ? '2px solid #e67e22' : '2px solid #f0f0f0',
                    background: isHov ? 'linear-gradient(135deg,#fff8f0,#fff3e6)' : 'white',
                  }}
                >
                  <div style={vstyles.brandLogoWrap}>
                    <img src={brand.logo} alt={brand.name} style={vstyles.brandLogo}
                      onError={e => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex' }} />
                    <div style={{ ...vstyles.brandLogoFallback, display: 'none' }}>{brand.name.slice(0, 2).toUpperCase()}</div>
                  </div>
                  <p style={{ ...vstyles.brandName, color: isHov ? '#e67e22' : '#1e293b' }}>{brand.name}</p>
                  {isHov && <span style={vstyles.brandArrow}>Browse Parts →</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>

  )
}

const Home = () => {
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const searchWrapRef = useRef(null)

  const [products,          setProducts]          = useState([])
  const [loading,           setLoading]           = useState(true)
  const [categories,        setCategories]        = useState([])
  const [categoryCounts,    setCategoryCounts]    = useState({})
  const [addedProduct,      setAddedProduct]      = useState(null)
  const [searchTerm,        setSearchTerm]        = useState('')
  const [searchResults,     setSearchResults]     = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [dropdownPos,       setDropdownPos]       = useState({ top:0, left:0, width:0 })

  const [statsRef,    statsVisible]    = useScrollAnimation(0.3)
  const [catRef,      catVisible]      = useScrollAnimation(0.1)
  const [promoRef,    promoVisible]    = useScrollAnimation(0.2)
  const [productsRef, productsVisible] = useScrollAnimation(0.1)
  const [whyRef,      whyVisible]      = useScrollAnimation(0.1)

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const updatePos = () => {
      if (searchWrapRef.current && showSearchResults) {
        const rect = searchWrapRef.current.getBoundingClientRect()
        setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
      }
    }
    updatePos()
    window.addEventListener('resize', updatePos)
    window.addEventListener('scroll', updatePos)
    return () => { window.removeEventListener('resize', updatePos); window.removeEventListener('scroll', updatePos) }
  }, [showSearchResults])

  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdown = document.querySelector('.search-drop-scroll')
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target) &&
        dropdown &&
        !dropdown.contains(e.target)
      ) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/spareparts/all'),
        axios.get('http://localhost:8080/api/products/categories'),
      ])
      const prods = Array.isArray(productsRes.data)   ? productsRes.data   : []
      const cats  = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
      setProducts(prods); setCategories(cats)
      const counts = {}
      cats.forEach(cat => { counts[cat] = prods.filter(p => (p.partCategory || '').toLowerCase().trim() === cat.toLowerCase().trim()).length })
      setCategoryCounts(counts)
    } catch {
      try {
        const productsRes = await axios.get('http://localhost:8080/api/spareparts/all')
        const prods = Array.isArray(productsRes.data) ? productsRes.data : []
        setProducts(prods)
        const catSet = new Set()
        prods.forEach(p => { if (p.partCategory) catSet.add(p.partCategory) })
        const extractedCats = Array.from(catSet).sort()
        setCategories(extractedCats)
        const counts = {}
        extractedCats.forEach(cat => { counts[cat] = prods.filter(p => (p.partCategory || '').toLowerCase().trim() === cat.toLowerCase().trim()).length })
        setCategoryCounts(counts)
      } catch (e) { console.error('Load error:', e) }
    } finally { setLoading(false) }
  }

  const handleHeroSearch = val => {
    setSearchTerm(val)
    if (val.length >= 2) {
      const filtered = products.filter(p =>
        p.productName?.toLowerCase().includes(val.toLowerCase()) ||
        (p.partCategory || '').toLowerCase().includes(val.toLowerCase()) ||
        p.productCode?.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8)
      setSearchResults(filtered)
      setShowSearchResults(true)
      if (searchWrapRef.current) {
        const rect = searchWrapRef.current.getBoundingClientRect()
        setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
      }
    } else { setSearchResults([]); setShowSearchResults(false) }
  }

  const getImageUrl = url => { if (!url) return NO_IMAGE; if (url.startsWith('http')) return url; return `http://localhost:8080/uploads/${url}` }
  const formatPrice = product => { const val = parseFloat(product?.sellingPrice || product?.price || 0); return `Rs. ${val.toLocaleString('en-LK')}` }

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    if (product.stockQty === 0) return
    addToCart({ ...product, price: product.sellingPrice || product.price })
    setAddedProduct(product.productCode)
    setTimeout(() => setAddedProduct(null), 2000)
  }

  const handleProductClick = productCode => { navigate(`/parts/${productCode}`); window.scrollTo(0, 0) }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f8f9fa' }}>
      <Navbar />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ALL KEYFRAMES & ANIMATIONS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <style>{`

        /* ═══════════════════════════════════════
           BASE KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes spin            { to { transform: rotate(360deg) } }
        @keyframes fadeDown        { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeUp          { from { opacity:0; transform:translateY(30px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer         { 0% { background-position:-200% center } 100% { background-position:200% center } }
        @keyframes float           { 0%,100% { transform:translateY(0px) } 50% { transform:translateY(-12px) } }
        @keyframes floatX          { 0%,100% { transform:translateX(0px) } 50% { transform:translateX(-10px) } }
        @keyframes gradientShift   { 0% { background-position:0% 50% } 50% { background-position:100% 50% } 100% { background-position:0% 50% } }
        @keyframes countUp         { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse           { 0%,100% { opacity:0.3 } 50% { opacity:1 } }
        @keyframes pulse2          { 0%,100% { transform:scale(1); opacity:0.6 } 50% { transform:scale(1.2); opacity:1 } }
        @keyframes breathe         { 0%,100% { transform:scale(1) } 50% { transform:scale(1.06) } }
        @keyframes iconPulse       { 0%,100% { transform:scale(1) } 50% { transform:scale(1.1) } }

        /* ═══════════════════════════════════════
           ROAD & VEHICLE KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes roadMove        { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes roadMoveFast    { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes carBounce       { 0%,100% { transform:translateX(-50%) translateY(0px)   } 25% { transform:translateX(-50%) translateY(-6px)  } 75% { transform:translateX(-50%) translateY(-3px)  } }
        @keyframes truckBounce     { 0%,100% { transform:translateX(-50%) translateY(0px)   } 30% { transform:translateX(-50%) translateY(-5px)  } 70% { transform:translateX(-50%) translateY(-2px)  } }
        @keyframes exhaustSmoke    { 0% { transform:translateX(0) translateY(0) scale(0.5); opacity:0.8 } 100% { transform:translateX(-40px) translateY(-30px) scale(2); opacity:0 } }
        @keyframes speedLine       { 0% { transform:translateX(100vw); opacity:0 } 10% { opacity:0.7 } 90% { opacity:0.5 } 100% { transform:translateX(-100px); opacity:0 } }

        /* ═══════════════════════════════════════
           GEAR / ENGINE KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes gearSpin        { from { transform:rotate(0deg)   } to { transform:rotate(360deg)  } }
        @keyframes gearSpinRev     { from { transform:rotate(0deg)   } to { transform:rotate(-360deg) } }
        @keyframes pistonPump      { 0%,100% { transform:translateY(0px)  } 50% { transform:translateY(22px) } }
        @keyframes enginePulse     { 0%,100% { filter:drop-shadow(0 0 15px #e31e24) } 50% { filter:drop-shadow(0 0 40px #ff6b6b) } }

        /* ═══════════════════════════════════════
           BRAKE KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes discSpin        { from { transform:translate(-50%,-50%) rotate(0deg)    } to { transform:translate(-50%,-50%) rotate(-360deg) } }
        @keyframes brakeCaliperPush { 0%,100% { transform:translateX(0)  } 50% { transform:translateX(-8px) } }
        @keyframes brakeSpark      { 0%,100% { opacity:0; transform:translate(-50%,-50%) scale(0.5) } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.4) } }
        @keyframes brakeGlow       { 0%,100% { box-shadow:0 0 20px #e31e24 } 50% { box-shadow:0 0 60px #ff0000, 0 0 100px #ff000044 } }

        /* ═══════════════════════════════════════
           ELECTRIC KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes electricFlash   { 0%,100% { opacity:0 } 10%,30%,50% { opacity:1 } 20%,40% { opacity:0.3 } }
        @keyframes electricArcMove { 0% { transform:scaleX(1) scaleY(1) } 50% { transform:scaleX(0.9) scaleY(1.3) } 100% { transform:scaleX(1) scaleY(1) } }
        @keyframes sparkFloat      { 0% { transform:translate(0,0) scale(1); opacity:1 } 100% { transform:translate(var(--sx,20px),var(--sy,-60px)) scale(0); opacity:0 } }
        @keyframes circuitFlow     { 0% { stroke-dashoffset:300 } 100% { stroke-dashoffset:0 } }
        @keyframes voltPulse       { 0%,100% { transform:scale(1); opacity:0.8 } 50% { transform:scale(1.15); opacity:1 } }

        /* ═══════════════════════════════════════
           SUSPENSION KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes suspBounce      { 0%,100% { transform:translateX(-50%) translateY(0px)  } 30% { transform:translateX(-50%) translateY(-22px) } 60% { transform:translateX(-50%) translateY(-10px) } 80% { transform:translateX(-50%) translateY(-18px) } }
        @keyframes springCoil      { 0%,100% { transform:scaleY(1)    } 30% { transform:scaleY(0.65) } 60% { transform:scaleY(0.85) } }
        @keyframes shockAbsorb     { 0%,100% { height:60px } 30% { height:38px } 60% { height:50px } }

        /* ═══════════════════════════════════════
           COOLING KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes coolFanSpin     { from { transform:rotate(0deg)   } to { transform:rotate(360deg)  } }
        @keyframes coolantFlow     { 0% { stroke-dashoffset:400 } 100% { stroke-dashoffset:0 } }
        @keyframes snowflakeSpin   { from { transform:rotate(0deg) scale(1) } to { transform:rotate(360deg) scale(1) } }
        @keyframes tempPulse       { 0%,100% { filter:drop-shadow(0 0 10px #3498db) } 50% { filter:drop-shadow(0 0 35px #00d4ff) } }
        @keyframes waterDrop       { 0% { transform:translateY(-20px); opacity:0 } 50% { opacity:1 } 100% { transform:translateY(50px); opacity:0 } }

        /* ═══════════════════════════════════════
           WHEEL / TYRE KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes tyreRoll        { from { transform:translateX(-50%) translateY(-50%) rotate(0deg)   } to { transform:translateX(-50%) translateY(-50%) rotate(360deg)  } }
        @keyframes tyreRollRight   { from { transform:translateX(-50%) translateY(-50%) rotate(0deg)   } to { transform:translateX(-50%) translateY(-50%) rotate(-360deg) } }
        @keyframes rimGlow         { 0%,100% { filter:drop-shadow(0 0 10px #e67e22) } 50% { filter:drop-shadow(0 0 30px #ff9933) } }
        @keyframes roadDust        { 0% { transform:scale(0) translateY(0); opacity:0.8 } 100% { transform:scale(3) translateY(-20px); opacity:0 } }

        /* ═══════════════════════════════════════
           OIL KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes oilDrip         { 0% { transform:translateY(-5px); opacity:0 } 20% { opacity:1 } 80% { opacity:1 } 100% { transform:translateY(45px); opacity:0 } }
        @keyframes oilFloat        { 0%,100% { transform:rotate(-5deg) translateY(0)  } 50% { transform:rotate(5deg) translateY(-10px) } }
        @keyframes oilGlow         { 0%,100% { filter:drop-shadow(0 0 10px #f39c12) } 50% { filter:drop-shadow(0 0 30px #ffaa00) } }
        @keyframes filterRotate    { 0%,100% { transform:rotate(0deg) } 50% { transform:rotate(8deg) } }

        /* ═══════════════════════════════════════
           PERFORMANCE KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes performanceRace { 0%,100% { transform:translateX(-50%) translateY(0px)  } 50% { transform:translateX(-50%) translateY(-18px) } }
        @keyframes nitroPulse      { 0%,100% { transform:scale(1); opacity:0.6 } 50% { transform:scale(1.3); opacity:1 } }
        @keyframes flameFlicker    { 0%,100% { transform:scaleY(1) scaleX(1); opacity:0.9 } 33% { transform:scaleY(1.3) scaleX(0.8); opacity:1 } 66% { transform:scaleY(0.9) scaleX(1.1); opacity:0.8 } }
        @keyframes starField       { 0% { transform:translateX(0) translateY(0); opacity:1 } 100% { transform:translateX(-8px) translateY(-20px); opacity:0 } }

        /* ═══════════════════════════════════════
           DELIVERY KEYFRAMES
        ═══════════════════════════════════════ */
        @keyframes deliveryBounce  { 0%,100% { transform:translateX(-50%) translateY(0px)  } 50% { transform:translateX(-50%) translateY(-10px) } }
        @keyframes packageFloat    { 0%,100% { transform:translateY(0) rotate(-5deg) } 50% { transform:translateY(-15px) rotate(5deg) } }
        @keyframes checkmarkPop    { 0% { transform:scale(0) rotate(-180deg); opacity:0 } 70% { transform:scale(1.2) rotate(10deg) } 100% { transform:scale(1) rotate(0deg); opacity:1 } }

        /* ═══════════════════════════════════════
           AIR/INTAKE KEYFRAMES
        ═══════════════════════════════════════ */
        
          @keyframes turboSpin {
            0%   { transform: translate(-50%, -50%) rotate(0deg)   scale(1);    }
            50%  { transform: translate(-50%, -50%) rotate(180deg) scale(1.08); }
            100% { transform: translate(-50%, -50%) rotate(360deg) scale(1);    }
          }

          @keyframes turboGlow {
            0%,100% {
              filter: drop-shadow(0 0 20px #00bcd4)
                      drop-shadow(0 0 50px #00bcd433);
            }
            50% {
              filter: drop-shadow(0 0 50px #00eeff)
                      drop-shadow(0 0 100px #00bcd466)
                      drop-shadow(0 0 150px #00bcd422);
            }
          }

          @keyframes exhaustPuff {
            0%   { transform: translateX(0) translateY(0) scale(0.5); opacity: 0.8; }
            50%  { opacity: 0.5; }
            100% { transform: translateX(-60px) translateY(-40px) scale(2.5); opacity: 0; }
          }

          @keyframes boostLineFade {
            0%,100% { opacity: 0;   }
            50%      { opacity: 0.5; }
          }
        /* ═══════════════════════════════════════
           PARTICLE SYSTEM
        ═══════════════════════════════════════ */
        @keyframes particleDrift   { 0% { transform:translateY(100vh) translateX(0) scale(0); opacity:0 } 10% { opacity:1 } 90% { opacity:0.5 } 100% { transform:translateY(-50px) translateX(var(--drift,30px)) scale(1); opacity:0 } }
        @keyframes particleGlow    { 0%,100% { box-shadow:0 0 4px currentColor } 50% { box-shadow:0 0 12px currentColor, 0 0 20px currentColor } }

        /* ═══════════════════════════════════════
           SCENE 0: CAR DRIVING
        ═══════════════════════════════════════ */
        .scene-car-drive {
          overflow: hidden;
        }

        /* Road lines */
        .scene-car-drive::before {
          content: '';
          position: absolute;
          bottom: 80px;
          left: 0;
          width: 200%;
          height: 4px;
          background: repeating-linear-gradient(
            90deg,
            #e67e22 0px, #e67e22 50px,
            transparent 50px, transparent 100px
          );
          animation: roadMove 1.2s linear infinite;
          opacity: 0.5;
          z-index: 2;
        }

        /* Car emoji */
        .scene-car-drive::after {
          content: '🚗';
          position: absolute;
          bottom: 84px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 100px;
          filter: drop-shadow(0 15px 40px rgba(230,126,34,0.7)) drop-shadow(0 5px 15px rgba(0,0,0,0.5));
          animation: carBounce 2.5s ease-in-out infinite;
          z-index: 3;
        }

        /* Speed lines */
        .scene-car-drive .speed-line-1,
        .scene-car-drive .speed-line-2,
        .scene-car-drive .speed-line-3 { display: none; }

        /* Fake speed lines via pseudo — use box shadows trick */
        .hero-scene.scene-car-drive {
          background-image:
            linear-gradient(90deg, transparent 40%, rgba(230,126,34,0.08) 41%, rgba(230,126,34,0.08) 42%, transparent 43%),
            linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.04) 61%, rgba(255,255,255,0.04) 61.5%, transparent 62.5%),
            linear-gradient(90deg, transparent 25%, rgba(230,126,34,0.05) 26%, rgba(230,126,34,0.05) 26.8%, transparent 27.5%);
        }

        /* ═══════════════════════════════════════
           SCENE 1: ENGINE GEARS
        ═══════════════════════════════════════ */
        .scene-engine::before {
          content: '⚙️';
          position: absolute;
          left: 12%;
          top: 50%;
          margin-top: -90px;
          font-size: 180px;
          opacity: 0.22;
          animation: gearSpin 5s linear infinite;
          filter: drop-shadow(0 0 30px #e31e24) drop-shadow(0 0 60px #ff000033);
          z-index: 2;
        }
        .scene-engine::after {
          content: '⚙️';
          position: absolute;
          right: 12%;
          top: 50%;
          margin-top: -65px;
          font-size: 130px;
          opacity: 0.18;
          animation: gearSpinRev 3.5s linear infinite;
          filter: drop-shadow(0 0 20px #e31e24);
          z-index: 2;
        }

        /* ═══════════════════════════════════════
           SCENE 2: BRAKE SYSTEM
        ═══════════════════════════════════════ */
        .scene-brake::before {
          content: '🔴';
          position: absolute;
          left: 50%;
          top: 42%;
          margin-left: -110px;
          margin-top: -110px;
          font-size: 220px;
          opacity: 0.15;
          animation: discSpin 1.8s linear infinite;
          filter: drop-shadow(0 0 40px #e31e24) drop-shadow(0 0 80px #ff000044);
          z-index: 2;
        }
        .scene-brake::after {
          content: '✨';
          position: absolute;
          left: 65%;
          top: 30%;
          font-size: 60px;
          opacity: 0.7;
          animation: brakeSpark 1.2s ease-in-out infinite;
          filter: drop-shadow(0 0 20px #ff6b6b);
          z-index: 3;
        }

        /* ═══════════════════════════════════════
           SCENE 3: ELECTRICAL
        ═══════════════════════════════════════ */
        .scene-electric::before {
          content: '⚡';
          position: absolute;
          left: 18%;
          top: 28%;
          font-size: 180px;
          opacity: 0.18;
          animation: electricFlash 2.5s ease-in-out infinite;
          filter: drop-shadow(0 0 40px #f39c12) drop-shadow(0 0 80px #ffaa0044);
          z-index: 2;
        }
        .scene-electric::after {
          content: '⚡';
          position: absolute;
          right: 18%;
          bottom: 22%;
          font-size: 120px;
          opacity: 0.14;
          animation: electricFlash 2.5s ease-in-out infinite 1.2s;
          filter: drop-shadow(0 0 30px #f39c12);
          z-index: 2;
        }

        /* ═══════════════════════════════════════
           SCENE 4: SUSPENSION
        ═══════════════════════════════════════ */
        .scene-suspension::before {
          content: '🚙';
          position: absolute;
          left: 50%;
          top: 42%;
          font-size: 150px;
          opacity: 0.25;
          animation: suspBounce 2.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
          filter: drop-shadow(0 20px 30px rgba(230,126,34,0.6));
          z-index: 3;
        }
        .scene-suspension::after {
          content: '🔧';
          position: absolute;
          right: 16%;
          top: 32%;
          font-size: 90px;
          opacity: 0.2;
          animation: float 3.5s ease-in-out infinite 1.2s;
          filter: drop-shadow(0 0 20px #e67e22);
          z-index: 2;
        }

        /* ═══════════════════════════════════════
           SCENE 5: TRUCK
        ═══════════════════════════════════════ */
        .scene-truck::before {
          content: '';
          position: absolute;
          bottom: 75px;
          left: 0;
          width: 200%;
          height: 5px;
          background: repeating-linear-gradient(
            90deg,
            #d35400 0px, #d35400 70px,
            transparent 70px, transparent 140px
          );
          animation: roadMove 1.8s linear infinite;
          opacity: 0.4;
          z-index: 2;
        }
        .scene-truck::after {
          content: '🚛';
          position: absolute;
          bottom: 80px;
          left: 50%;
          font-size: 110px;
          opacity: 0.32;
          animation: truckBounce 3s ease-in-out infinite;
          filter: drop-shadow(0 12px 30px rgba(211,84,0,0.7));
          z-index: 3;
        }

        /* ═══════════════════════════════════════
           SCENE 6: COOLING
        ═══════════════════════════════════════ */
        .scene-cooling::before {
          content: '❄️';
          position: absolute;
          left: 18%;
          top: 32%;
          font-size: 170px;
          opacity: 0.18;
          animation: snowflakeSpin 8s linear infinite;
          filter: drop-shadow(0 0 40px #3498db) drop-shadow(0 0 80px #00aaff44);
          z-index: 2;
        }
        .scene-cooling::after {
          content: '💧';
          position: absolute;
          right: 20%;
          bottom: 25%;
          font-size: 110px;
          opacity: 0.18;
          animation: waterDrop 2.2s ease-in-out infinite 0.8s;
          filter: drop-shadow(0 0 25px #3498db);
          z-index: 2;
        }

        /* ═══════════════════════════════════════
           SCENE 7: TYRE & WHEELS
        ═══════════════════════════════════════ */
        .scene-wheel::before {
          content: '⭕';
          position: absolute;
          left: 20%;
          top: 50%;
          margin-top: -120px;
          margin-left: -120px;
          font-size: 240px;
          opacity: 0.14;
          animation: gearSpin 2.5s linear infinite;
          filter: drop-shadow(0 0 35px #e67e22) drop-shadow(0 0 70px #ff990033);
          z-index: 2;
        }
        .scene-wheel::after {
          content: '⭕';
          position: absolute;
          right: 20%;
          top: 50%;
          margin-top: -80px;
          margin-right: -80px;
          font-size: 160px;
          opacity: 0.12;
          animation: gearSpinRev 1.8s linear infinite;
          filter: drop-shadow(0 0 25px #e67e22);
          z-index: 2;
        }

        /* ═══════════════════════════════════════
           SCENE 8: OIL & FILTERS
        ═══════════════════════════════════════ */
        .scene-oil::before {
          content: '🛢️';
          position: absolute;
          left: 20%;
          top: 28%;
          font-size: 160px;
          opacity: 0.22;
          animation: oilFloat 4s ease-in-out infinite;
          filter: drop-shadow(0 0 30px #f39c12) drop-shadow(0 0 60px #ffaa0033);
          z-index: 2;
        }
        .scene-oil::after {
          content: '💧';
          position: absolute;
          right: 24%;
          top: 35%;
          font-size: 100px;
          opacity: 0.25;
          animation: oilDrip 2s ease-in-out infinite;
          filter: drop-shadow(0 0 20px #f39c12) sepia(1) saturate(8) hue-rotate(5deg);
          z-index: 2;
        }

        /* ═══════════════════════════════════════
           SCENE 9: PERFORMANCE
        ═══════════════════════════════════════ */
        .scene-performance::before {
          content: '🏎️';
          position: absolute;
          left: 50%;
          bottom: 85px;
          font-size: 130px;
          opacity: 0.85;
          animation: performanceRace 2.5s ease-in-out infinite;
          filter:
            drop-shadow(0 0 30px #ff3b3b)
            drop-shadow(0 20px 40px rgba(255,59,59,0.5))
            drop-shadow(0 -5px 20px rgba(255,100,0,0.4));
          z-index: 3;
        }
        .scene-performance::after {
          content: '';
          position: absolute;
          bottom: 80px;
          left: 0;
          width: 200%;
          height: 3px;
          background: repeating-linear-gradient(
            90deg,
            #ff3b3b 0px, #ff3b3b 30px,
            transparent 30px, transparent 60px
          );
          animation: roadMove 0.8s linear infinite;
          opacity: 0.35;
          z-index: 2;
        }

        /* ═══════════════════════════════════════
           SCENE 10: DELIVERY
        ═══════════════════════════════════════ */
        .scene-delivery::before {
          content: '';
          position: absolute;
          bottom: 75px;
          left: 0;
          width: 200%;
          height: 4px;
          background: repeating-linear-gradient(
            90deg,
            #27ae60 0px, #27ae60 55px,
            transparent 55px, transparent 110px
          );
          animation: roadMove 1.6s linear infinite;
          opacity: 0.4;
          z-index: 2;
        }
        .scene-delivery::after {
          content: '🚚';
          position: absolute;
          bottom: 79px;
          left: 50%;
          font-size: 95px;
          opacity: 0.3;
          animation: deliveryBounce 2.2s ease-in-out infinite;
          filter: drop-shadow(0 10px 28px rgba(39,174,96,0.7));
          z-index: 3;
        }

        /* ═══════════════════════════════════════
           SCENE 11: AIR & INTAKE
        ═══════════════════════════════════════ */
        .scene-turbo::before {
          content: '🌀';
          position: absolute;
          left: 50%;
          top: 45%;
          font-size: 260px;
          opacity: 0.28;
          animation:
            turboSpin 1.8s linear infinite,
            turboGlow 2.5s ease-in-out infinite;
          z-index: 2;
          pointer-events: none;
        }

        .scene-turbo::after {
          content: '💨';
          position: absolute;
          left: 30%;
          top: 40%;
          font-size: 110px;
          opacity: 0.22;
          animation: exhaustPuff 2s ease-out infinite;
          filter: drop-shadow(0 0 20px #00bcd4);
          z-index: 2;
          pointer-events: none;
        }

        .hero-scene.scene-turbo {
          background-image:
            linear-gradient(90deg,
              transparent 0%,
              transparent 30%,
              rgba(0,188,212,0.07) 31%,
              rgba(0,188,212,0.07) 31.4%,
              transparent 31.5%,
              transparent 55%,
              rgba(0,188,212,0.05) 55.2%,
              rgba(0,188,212,0.05) 55.5%,
              transparent 56%,
              transparent 70%,
              rgba(0,188,212,0.04) 70.3%,
              rgba(0,188,212,0.04) 70.6%,
              transparent 71%
            ),
            radial-gradient(
              ellipse at 50% 45%,
              rgba(0,188,212,0.12) 0%,
              transparent 60%
            );
          animation: boostLineFade 3s ease-in-out infinite;
        }

        /* ═══════════════════════════════════════
           SHARED HERO DECORATIONS
           (floating particles via multiple backgrounds)
        ═══════════════════════════════════════ */
        .hero-particles {
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 120px 120px, 80px 80px, 200px 200px;
          background-position: 0 0, 40px 40px, 20px 20px;
          animation: breathe 8s ease-in-out infinite;
          pointer-events: none;
        }

        /* ═══════════════════════════════════════
           PRODUCT & CATEGORY HOVER
        ═══════════════════════════════════════ */
        .prod-card { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1) !important }
        .prod-card:hover { transform:translateY(-10px) scale(1.02) !important; box-shadow:0 25px 55px rgba(0,0,0,0.15) !important }
        .prod-card:hover .view-overlay { opacity:1 !important }

        .cat-card { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1) !important }
        .cat-card:hover { transform:translateY(-10px) scale(1.04) !important }

        .promo-btn:hover { background:rgba(255,255,255,0.15) !important; transform:translateX(6px) !important }

        .stat-item { animation: countUp 0.6s ease both }
        .stat-loading { animation: pulse 1.5s ease infinite }

        /* ═══════════════════════════════════════
           SCROLLBAR
        ═══════════════════════════════════════ */
        .search-drop-scroll::-webkit-scrollbar       { width: 5px }
        .search-drop-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px }
        .search-drop-scroll::-webkit-scrollbar-thumb { background: #e67e22; border-radius: 10px }
        .search-drop-scroll::-webkit-scrollbar-thumb:hover { background: #d35400 }
        .search-result-item:hover { background: #fff8f0 !important }

        /* ═══════════════════════════════════════
           WHY SECTION
        ═══════════════════════════════════════ */
        .why-card-animated {
          transition: all 0.35s ease;
          backdrop-filter: blur(10px);
        }
        .why-card-animated:hover {
          transform: translateY(-12px) scale(1.03) !important;
          border-color: #e67e22 !important;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .why-icon-glow {
          animation: iconPulse 3s ease-in-out infinite;
          transition: all 0.3s ease;
        }
        .why-card-animated:hover .why-icon-glow {
          transform: scale(1.18) rotate(8deg);
          box-shadow: 0 0 30px rgba(230,126,34,0.6);
        }

        /* ═══════════════════════════════════════
           VIEW ALL BUTTON
        ═══════════════════════════════════════ */
        .view-all-btn:hover {
          transform: translateY(-4px) scale(1.04) !important;
          box-shadow: 0 20px 45px rgba(230,126,34,0.45) !important;
        }

      `}</style>

      {/* Toast */}
      {addedProduct && (
        <div style={{ ...st.toast, animation:'fadeDown 0.3s ease' }}>✅ Added to cart!</div>
      )}

      {/* SEARCH DROPDOWN */}
      {showSearchResults && (
        <div className="search-drop-scroll" style={{
          position:'fixed', top:dropdownPos.top, left:dropdownPos.left, width:dropdownPos.width,
          background:'white', borderRadius:'16px', boxShadow:'0 20px 60px rgba(0,0,0,0.25)',
          zIndex: 9999999, maxHeight:'350px', overflowY:'auto', overflowX:'hidden',
          animation:'fadeDown 0.25s ease', border:'1px solid #f0f0f0',
        }}>
          {searchResults.length > 0 ? (
            <>
              <div style={{ padding:'10px 15px', background:'linear-gradient(135deg,#fff8f0,#fff3e6)', borderBottom:'1px solid #f0e6d3', fontSize:'12px', fontWeight:'700', color:'#e67e22', letterSpacing:'0.5px' }}>
                🔍 {searchResults.length} Results Found
              </div>
              {searchResults.map((p) => (
                <div key={p.productCode} className="search-result-item"
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 15px', cursor:'pointer', background:'white', position:'relative', zIndex: 1000000 }}
                  onClick={() => { navigate(`/parts/${p.productCode}`); setShowSearchResults(false); setSearchTerm(''); window.scrollTo(0,0) }}
                >
                  <div style={{ width:'50px', height:'50px', borderRadius:'10px', border:'1px solid #f0f0f0', background:'#fafafa', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    <SafeImg src={getImageUrl(p.imageUrl)} alt={p.productName} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:'600', fontSize:'14px', color:'#1e293b', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.productName}</div>
                    <div style={{ fontSize:'12px', color:'#94a3b8' }}>{getCategoryIcon(p.partCategory)} {p.partCategory || 'Spare Part'}</div>
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:'800', color:'#e31e24', flexShrink:0 }}>{formatPrice(p)}</div>
                </div>
              ))}
              <div style={{ padding:'13px 15px', background:'linear-gradient(135deg,#fff8f0,#fff3e6)', color:'#e67e22', fontWeight:'700', fontSize:'13px', cursor:'pointer', textAlign:'center', borderTop:'1px solid #f0e6d3', transition:'background 0.2s' }}
                onClick={() => { navigate(`/parts?search=${searchTerm}`); setShowSearchResults(false) }}
                onMouseEnter={e => e.currentTarget.style.background = '#fde8d0'}
                onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg,#fff8f0,#fff3e6)'}
              >View all results for "{searchTerm}" →</div>
            </>
          ) : (
            <div style={{ padding:'30px 20px', textAlign:'center' }}>
              <div style={{ fontSize:'32px', marginBottom:'10px' }}>🔍</div>
              <div style={{ fontWeight:'700', color:'#333', marginBottom:'5px' }}>No results found</div>
              <div style={{ fontSize:'13px', color:'#888' }}>No parts found for "{searchTerm}"</div>
            </div>
          )}
        </div>
      )}

      {/* HERO CAROUSEL */}
      <HeroCarousel
        searchWrapRef={searchWrapRef}
        searchTerm={searchTerm}
        onSearch={handleHeroSearch}
        onSearchSubmit={() => { if (searchTerm.trim()) { navigate(`/parts?search=${searchTerm}`); setShowSearchResults(false) } }}
        onKeyDown={e => {
          if (e.key === 'Enter' && searchTerm.trim()) { navigate(`/parts?search=${searchTerm}`); setShowSearchResults(false) }
          if (e.key === 'Escape') setShowSearchResults(false)
        }}
        onFocus={() => {
          if (searchTerm.length >= 2 && searchResults.length > 0) {
            setShowSearchResults(true)
            if (searchWrapRef.current) {
              const rect = searchWrapRef.current.getBoundingClientRect()
              setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
            }
          }
        }}
      />

      {/* STATS BAR */}
      <div ref={statsRef} style={st.statsBar}>
        {[
          { value: loading ? null : products.length,   suffix:'+', label:'Parts Available'  },
          { value: loading ? null : categories.length, suffix:'+', label:'Categories'       },
          { value: 500,                                 suffix:'+', label:'Happy Customers'  },
          { value: 5,                                   suffix:'+', label:'Years Experience' },
        ].map((s, i) => (
          <div key={i} className="stat-item" style={{ ...st.statItem, animationDelay:`${i * 0.15}s`, opacity: statsVisible ? 1 : 0 }}>
            <div style={st.statValue}>
              {s.value === null ? (
                <span className="stat-loading" style={{ display:'inline-block', width:'50px', height:'6px', background:'rgba(255,255,255,0.4)', borderRadius:'3px', verticalAlign:'middle' }} />
              ) : statsVisible ? (
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              ) : `0${s.suffix}`}
            </div>
            <div style={st.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* VEHICLE TYPE SECTION */}
      <VehicleTypeSection navigate={navigate} />

      {/* SHOP BY CATEGORY */}
      <section ref={catRef} style={st.section}>
        <div style={{ ...st.sectionHeader, opacity: catVisible ? 1 : 0, transform: catVisible ? 'translateY(0)' : 'translateY(25px)', transition: 'all 0.6s ease' }}>
          <h2 style={st.sectionTitle}>SHOP BY CATEGORY</h2>
          <div style={st.sectionLine} />
          <p style={st.sectionSub}>Find parts by your vehicle's needs</p>
        </div>
        {loading ? (
          <div style={st.loadingWrap}><div style={st.spinner} /><p style={{ color:'#888', marginTop:12 }}>Loading categories...</p></div>
        ) : (
          <div style={st.categoryGrid}>
            {categories.map((cat, i) => (
              <div key={i} className="cat-card"
                style={{ ...st.categoryCard, opacity: catVisible ? 1 : 0, transform: catVisible ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s, box-shadow 0.35s, border-color 0.35s, background 0.35s` }}
                onClick={() => navigate(`/parts?category=${encodeURIComponent(cat)}`)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#e67e22'; e.currentTarget.style.background = '#fff9f5' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = 'white' }}
              >
                <div style={st.catIconWrap}><span style={st.catIcon}>{getCategoryIcon(cat)}</span></div>
                <div style={st.catName}>{cat}</div>
                <div style={st.catCount}>{categoryCounts[cat] || 0} parts</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROMO BANNER */}
      <section ref={promoRef} style={st.promoBanner}>
        <div style={{ ...st.promoLeft, opacity: promoVisible ? 1 : 0, transform: promoVisible ? 'translateX(0)' : 'translateX(-50px)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <span style={st.promoTag}>✨ PREMIUM UPGRADES</span>
          <h2 style={st.promoTitle}>UNLEASH YOUR<span style={{ ...st.promoHighlight, backgroundSize:'200% auto', animation: promoVisible ? 'shimmer 3s linear infinite' : 'none' }}> VEHICLE'S POTENTIAL</span></h2>
          <p style={st.promoDesc}>Exclusive deals on genuine parts for all vehicle types. Quality you can trust, prices you'll love.</p>
          <button className="promo-btn" style={{ ...st.promoBtn, transition:'all 0.3s ease' }} onClick={() => navigate('/parts')}>EXPLORE PARTS →</button>
        </div>
        <div style={{ ...st.promoRight, opacity: promoVisible ? 1 : 0, transform: promoVisible ? 'translateX(0)' : 'translateX(50px)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.15s' }}>
          <img src="https://images.unsplash.com/photo-1611821064430-0d41765a610d?q=80&w=600" alt="Premium Parts"
            style={{ ...st.promoImg, animation: promoVisible ? 'float 4s ease-in-out infinite' : 'none' }}
            onError={e => { e.target.onerror = null; e.target.style.display = 'none' }} />
        </div>
      </section>

      {/* LATEST ARRIVALS */}
      <section ref={productsRef} style={st.section}>
        <div style={{ ...st.sectionHeader, opacity: productsVisible ? 1 : 0, transform: productsVisible ? 'translateY(0)' : 'translateY(25px)', transition: 'all 0.6s ease' }}>
          <h2 style={st.sectionTitle}>LATEST ARRIVALS</h2>
          <div style={st.sectionLine} />
          <p style={st.sectionSub}>Premium selection of genuine vehicle parts</p>
        </div>
        {loading ? (
          <div style={st.loadingWrap}><div style={st.spinner} /><p style={{ color:'#888', marginTop:12 }}>Loading products...</p></div>
        ) : (
          <>
            <div style={st.productGrid}>
              {products.slice(0, 8).map((product, i) => (
                <div key={product.productCode} className="prod-card"
                  style={{ ...st.productCard, opacity: productsVisible ? 1 : 0, transform: productsVisible ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s` }}
                  onClick={() => handleProductClick(product.productCode)}
                >
                  <div style={st.imgWrap}>
                    <SafeImg src={getImageUrl(product.imageUrl)} alt={product.productName} style={st.productImg} />
                    <div className="view-overlay" style={st.viewOverlay}><span style={st.viewOverlayText}>👁️ View Details</span></div>
                    {product.stockQty === 0 && <span style={{ ...st.badge, background:'#e74c3c' }}>Out of Stock</span>}
                    {product.stockQty > 0 && product.stockQty <= 5 && <span style={{ ...st.badge, background:'#f39c12' }}>Low Stock</span>}
                  </div>
                  <div style={st.cardBody}>
                    <span style={st.catTag}>{getCategoryIcon(product.partCategory)} {product.partCategory || 'Spare Part'}</span>
                    <h3 style={st.productName}>{product.productName}</h3>
                    <div style={{ fontSize:'12px', color:'#f39c12', marginBottom:'10px' }}>★★★★★</div>
                    <div style={st.priceRow}>
                      <span style={st.price}>{formatPrice(product)}</span>
                      <button
                        style={{ ...st.addBtn, opacity: product.stockQty === 0 ? 0.5 : 1, cursor: product.stockQty === 0 ? 'not-allowed' : 'pointer', background: addedProduct === product.productCode ? '#27ae60' : '#1e293b', transform: addedProduct === product.productCode ? 'scale(1.05)' : 'scale(1)', transition:'all 0.3s ease' }}
                        disabled={product.stockQty === 0}
                        onClick={e => handleAddToCart(e, product)}
                      >
                        {addedProduct === product.productCode ? '✓ Added' : '🛒 Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length > 8 && (
              <div style={{ textAlign:'center', marginTop:'40px', opacity: productsVisible ? 1 : 0, transition:'opacity 0.6s ease 0.6s' }}>
                <button
                  className="view-all-btn"
                  style={{ ...st.viewAllBtn, transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                  onClick={() => navigate('/parts')}
                >
                  View All {products.length} Products →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section ref={whyRef} style={st.whySection}>
        <div style={{ ...st.sectionHeader, opacity: whyVisible ? 1 : 0, transform: whyVisible ? 'translateY(0)' : 'translateY(25px)', transition: 'all 0.6s ease' }}>
          <h2 style={{ ...st.sectionTitle, color: 'white' }}>WHY CHOOSE MADARA MOTORS?</h2>
          <div style={st.sectionLine} />
          <p style={{ ...st.sectionSub, color: '#aaa' }}>Sri Lanka's most trusted auto parts marketplace</p>
        </div>
        <div style={st.whyGrid}>
          {[
            { icon:'✅', title:'Genuine Parts',   desc:'100% authentic OEM & aftermarket parts guaranteed',              color:'#27ae60', bg:'rgba(39,174,96,0.1)'   },
            { icon:'👨‍🔧', title:'Expert Support',  desc:'Professional mechanic guidance for selecting the right parts', color:'#3b82f6', bg:'rgba(59,130,246,0.1)'  },
            { icon:'💰', title:'Best Prices',     desc:'Competitive pricing with zero hidden charges',                  color:'#f39c12', bg:'rgba(243,156,18,0.1)'  },
            { icon:'🛡️', title:'Warranty',        desc:'All parts come with manufacturer warranty',                    color:'#e67e22', bg:'rgba(230,126,34,0.1)'  },
          ].map((item, i) => (
            <div key={i} className="why-card-animated"
              style={{ ...st.whyCard, opacity: whyVisible ? 1 : 0, transform: whyVisible ? 'translateY(0)' : 'translateY(40px)', transition: `all 0.6s ease ${i * 0.12}s`, border:'1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="why-icon-glow" style={{ ...st.whyIconWrap, background: item.bg, border: `2px solid ${item.color}40` }}>
                <span style={st.whyIcon}>{item.icon}</span>
              </div>
              <h3 style={{ ...st.whyTitle, color: item.color }}>{item.title}</h3>
              <p style={st.whyDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VEHICLE SECTION STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const vstyles = {
  section:          { padding:'80px 60px', background:'linear-gradient(135deg,#f8f9ff 0%,#f0f4ff 100%)', width:'100%', boxSizing:'border-box' },
  header:           { textAlign:'center', maxWidth:'1300px', margin:'0 auto 50px auto' },
  headerTag:        { color:'#e67e22', fontWeight:'700', letterSpacing:'3px', fontSize:'13px', marginBottom:'10px' },
  headerTitle:      { fontSize:'28px', fontWeight:'900', color:'#1e293b', marginBottom:'12px', letterSpacing:'1px' },
  headerLine:       { width:'60px', height:'4px', background:'linear-gradient(to right,#e67e22,#e31e24)', margin:'0 auto 15px', borderRadius:'2px' },
  headerSub:        { color:'#888', fontSize:'15px' },
  vehicleGrid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'18px', maxWidth:'1300px', margin:'0 auto 40px auto' },
  vehicleCard:      { borderRadius:'20px', overflow:'hidden', cursor:'pointer' },
  vehicleImgWrap:   { position:'relative', height:'160px', overflow:'hidden' },
  vehicleImg:       { width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' },
  vehicleImgOverlay:{ position:'absolute', inset:0, transition:'background 0.3s ease' },
  vehicleEmoji:     { position:'absolute', top:'10px', right:'10px', fontSize:'24px', background:'rgba(255,255,255,0.9)', borderRadius:'50%', width:'42px', height:'42px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.15)' },
  vehicleCardBody:  { padding:'15px 18px 18px' },
  vehicleCardTitle: { fontSize:'17px', fontWeight:'800', margin:'0 0 4px 0', transition:'color 0.3s' },
  vehicleCardSub:   { fontSize:'12px', color:'#888', margin:0 },
  selectedBadge:    { display:'inline-block', marginTop:'8px', background:'linear-gradient(135deg,#e67e22,#d35400)', color:'white', fontSize:'11px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px' },
  clickHint:        { marginTop:'8px', fontSize:'12px', color:'#e67e22', fontWeight:'600', transition:'opacity 0.3s' },
  brandSection:     { maxWidth:'1300px', margin:'0 auto', background:'white', borderRadius:'24px', padding:'30px 35px', boxShadow:'0 15px 50px rgba(0,0,0,0.1)', border:'2px solid #f0f0f0' },
  brandHeader:      { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'25px', flexWrap:'wrap', gap:'12px' },
  brandHeaderLeft:  { display:'flex', alignItems:'center', gap:'14px' },
  brandHeaderEmoji: { fontSize:'36px', background:'linear-gradient(135deg,#fff8f0,#ffe4cc)', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  brandHeaderTitle: { fontSize:'19px', fontWeight:'800', color:'#1e293b', margin:'0 0 3px 0' },
  brandHeaderSub:   { fontSize:'13px', color:'#888', margin:0 },
  closeBtn:         { padding:'8px 18px', background:'#fff5f5', border:'1.5px solid #fecaca', borderRadius:'10px', color:'#e74c3c', fontWeight:'700', fontSize:'13px', cursor:'pointer', transition:'background 0.2s', flexShrink:0 },
  brandGrid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'12px' },
  brandCard:        { borderRadius:'14px', padding:'18px 12px', textAlign:'center', cursor:'pointer', position:'relative' },
  brandLogoWrap:    { height:'50px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px' },
  brandLogo:        { maxWidth:'75px', maxHeight:'45px', objectFit:'contain', filter:'grayscale(20%)' },
  brandLogoFallback:{ width:'50px', height:'50px', background:'linear-gradient(135deg,#e67e22,#d35400)', borderRadius:'50%', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'900', fontSize:'16px' },
  brandName:        { fontSize:'13px', fontWeight:'700', margin:'0 0 3px 0', transition:'color 0.3s' },
  brandArrow:       { fontSize:'11px', color:'#e67e22', fontWeight:'600' },
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const st = {
  toast:        { position:'fixed', top:'80px', right:'20px', background:'#27ae60', color:'white', padding:'12px 24px', borderRadius:'10px', fontWeight:'700', fontSize:'14px', zIndex:9999, boxShadow:'0 8px 20px rgba(39,174,96,0.4)' },
  loadingWrap:  { textAlign:'center', padding:'50px', display:'flex', flexDirection:'column', alignItems:'center' },
  spinner:      { width:'40px', height:'40px', border:'4px solid #f0f0f0', borderTop:'4px solid #e67e22', borderRadius:'50%', animation:'spin 0.9s linear infinite' },
  statsBar:     { display:'flex', justifyContent:'center', background:'linear-gradient(135deg,#e67e22,#d35400)', padding:'28px 40px', gap:'60px', flexWrap:'wrap' },
  statItem:     { textAlign:'center', color:'white', minWidth:'100px' },
  statValue:    { fontSize:'34px', fontWeight:'900', minHeight:'44px', display:'flex', alignItems:'center', justifyContent:'center' },
  statLabel:    { fontSize:'13px', opacity:0.9, marginTop:'4px' },
  section:      { padding:'70px 60px', maxWidth:'1300px', margin:'0 auto', width:'100%', boxSizing:'border-box' },
  sectionHeader:{ textAlign:'center', marginBottom:'45px' },
  sectionTitle: { fontSize:'26px', fontWeight:'900', color:'#1e293b', marginBottom:'12px', letterSpacing:'1px' },
  sectionLine:  { width:'60px', height:'4px', background:'linear-gradient(to right,#e67e22,#e31e24)', margin:'0 auto 12px', borderRadius:'2px' },
  sectionSub:   { color:'#888', fontSize:'15px' },
  categoryGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'20px' },
  categoryCard: { background:'white', borderRadius:'16px', padding:'28px 15px', textAlign:'center', cursor:'pointer', border:'2px solid #f0f0f0', boxShadow:'0 4px 15px rgba(0,0,0,0.06)' },
  catIconWrap:  { width:'64px', height:'64px', borderRadius:'50%', background:'#fff5eb', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' },
  catIcon:      { fontSize:'32px' },
  catName:      { fontSize:'13px', fontWeight:'700', color:'#1e293b', lineHeight:'1.3', marginBottom:'6px' },
  catCount:     { fontSize:'12px', color:'#e67e22', fontWeight:'600' },
  promoBanner:  { background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'70px 80px', gap:'40px', flexWrap:'wrap', overflow:'hidden' },
  promoLeft:    { flex:1, minWidth:'280px' },
  promoRight:   { flex:1, display:'flex', justifyContent:'center', minWidth:'250px' },
  promoTag:     { color:'#fbbf24', fontSize:'13px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', display:'block', marginBottom:'15px' },
  promoTitle:   { color:'white', fontSize:'2.8rem', fontWeight:'900', lineHeight:'1.2', marginBottom:'15px', textTransform:'uppercase' },
  promoHighlight:{ background:'linear-gradient(to right,#fcd34d,#f59e0b,#fcd34d)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  promoDesc:    { color:'#94a3b8', fontSize:'1rem', marginBottom:'30px', lineHeight:'1.7', maxWidth:'400px' },
  promoBtn:     { padding:'14px 32px', background:'transparent', border:'2px solid rgba(255,255,255,0.3)', borderRadius:'50px', color:'white', fontWeight:'700', cursor:'pointer', fontSize:'14px', letterSpacing:'0.5px' },
  promoImg:     { width:'100%', maxWidth:'420px', borderRadius:'20px', boxShadow:'0 30px 60px rgba(0,0,0,0.4)' },
  productGrid:  { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(235px,1fr))', gap:'22px' },
  productCard:  { background:'white', borderRadius:'14px', border:'2px solid #f0f0f0', boxShadow:'0 4px 15px rgba(0,0,0,0.06)', overflow:'hidden', cursor:'pointer' },
  imgWrap:      { position:'relative', height:'200px', background:'#fafafa', display:'flex', alignItems:'center', justifyContent:'center', padding:'15px', overflow:'hidden' },
  productImg:   { maxWidth:'100%', maxHeight:'100%', objectFit:'contain' },
  viewOverlay:  { position:'absolute', inset:0, background:'rgba(230,126,34,0.88)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.3s ease' },
  viewOverlayText:{ color:'white', fontWeight:'800', fontSize:'15px', letterSpacing:'0.5px' },
  badge:        { position:'absolute', top:'10px', left:'10px', color:'white', fontSize:'11px', padding:'4px 10px', borderRadius:'20px', fontWeight:'700' },
  cardBody:     { padding:'16px' },
  catTag:       { fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', fontWeight:'700' },
  productName:  { fontSize:'15px', fontWeight:'700', color:'#1e293b', margin:'6px 0 4px', height:'42px', overflow:'hidden', lineHeight:'1.4' },
  priceRow:     { display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f5f5f5', paddingTop:'12px' },
  price:        { fontSize:'17px', fontWeight:'800', color:'#e31e24' },
  addBtn:       { padding:'8px 14px', background:'#1e293b', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'700' },
  viewAllBtn:   { padding:'14px 50px', background:'linear-gradient(135deg,#e67e22,#d35400)', color:'white', border:'none', borderRadius:'30px', fontSize:'15px', fontWeight:'700', cursor:'pointer', boxShadow:'0 8px 25px rgba(230,126,34,0.35)' },
  whySection:   { background:'linear-gradient(135deg,#0f172a 0%,#1a1a2e 50%,#0f172a 100%)', padding:'80px 60px' },
  whyGrid:      { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'25px', maxWidth:'1200px', margin:'0 auto' },
  whyCard:      { background:'rgba(255,255,255,0.05)', borderRadius:'20px', padding:'35px 25px', textAlign:'center', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(10px)' },
  whyIconWrap:  { width:'70px', height:'70px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' },
  whyIcon:      { fontSize:'32px' },
  whyTitle:     { fontSize:'17px', fontWeight:'800', marginBottom:'10px' },
  whyDesc:      { color:'#94a3b8', fontSize:'14px', lineHeight:'1.7' },
}

export default Home