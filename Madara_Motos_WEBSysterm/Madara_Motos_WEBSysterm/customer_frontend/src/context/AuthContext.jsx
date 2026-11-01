
import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null)
  const [token, setToken]       = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const savedToken    = localStorage.getItem('customerToken')
    const savedCustomer = localStorage.getItem('customerData')

    if (savedToken && savedCustomer) {
      try {
        setToken(savedToken)
        setCustomer(JSON.parse(savedCustomer))
      } catch (e) {
        localStorage.removeItem('customerToken')
        localStorage.removeItem('customerData')
      }
    }
    setLoading(false)
  }, [])

  const login = (customerData, authToken) => {
    setCustomer(customerData)
    setToken(authToken)
    localStorage.setItem('customerToken', authToken)
    localStorage.setItem('customerData', JSON.stringify(customerData))
  }

  const logout = () => {
    setCustomer(null)
    setToken(null)
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customerData')
  }

  
  const updateCustomer = (updatedData) => {
    setCustomer(updatedData)
    localStorage.setItem('customerData', JSON.stringify(updatedData))
  }

  if (loading) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100vh',
        background:     '#f5f7fa',
      }}>
        <div style={{
          width:        '40px',
          height:       '40px',
          border:       '4px solid #eee',
          borderTop:    '4px solid #e67e22',
          borderRadius: '50%',
          animation:    'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      customer,
      token,
      login,
      logout,
      isLoggedIn: !!token,
      loading,
      setCustomer: updateCustomer,  
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export default AuthProvider