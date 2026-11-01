import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth }   from './context/AuthContext'
import { CartProvider }            from './context/CartContext'

// Pages Import
import Home              from './pages/Home'
import CustomerLogin     from './pages/CustomerLogin'
import CustomerRegister  from './pages/CustomerRegister'
import CustomerDashboard from './pages/CustomerDashboard'
import PartsCatalog      from './pages/PartsCatalog'
import ProductDetail     from './pages/ProductDetail'
import AboutUs           from './pages/AboutUs'
import Contact           from './pages/Contact'
import EmailVerify       from './pages/EmailVerify'
import Cart              from './pages/Cart'
import Checkout          from './pages/Checkout'
import MyOrders          from './pages/MyOrders'   
import MyProfile         from './pages/MyProfile'  

// ✅ NEW: Forgot Password Flow Pages
import ForgotPassword    from './pages/auth/ForgotPassword'
import VerifyOTP         from './pages/auth/VerifyOTP'
import ResetPassword     from './pages/auth/ResetPassword'


const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  if (loading)     return null
  if (!isLoggedIn) return <Navigate to="/customer/login" replace />
  return children
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// App Routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AppRoutes = () => {
  return (
    <Routes>

      {/* ── Public Routes ── */}
      <Route path="/"        element={<Home />} />
      <Route path="/about"   element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<Contact />} /> 

      {/* ── Parts Catalog ── */}
      <Route path="/parts-catalog"      element={<PartsCatalog />} />
      <Route path="/parts"              element={<PartsCatalog />} />
      <Route path="/parts/:productCode" element={<ProductDetail />} />

      {/* ── Cart & Checkout ── */}
      <Route path="/cart"     element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* ── Customer Auth ── */}
      <Route path="/customer/login"        element={<CustomerLogin />}    />
      <Route path="/customer/register"     element={<CustomerRegister />} />
      <Route path="/customer/verify-email" element={<EmailVerify />}      />

    
      <Route path="/forgot-password"       element={<ForgotPassword />}   />
      <Route path="/verify-otp"            element={<VerifyOTP />}        />
      <Route path="/reset-password"        element={<ResetPassword />}    />

     
     
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

     
      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />

     
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />

    
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main App
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App