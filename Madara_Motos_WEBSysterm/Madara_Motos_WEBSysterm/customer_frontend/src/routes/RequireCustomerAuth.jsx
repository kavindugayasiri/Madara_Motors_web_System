
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RequireCustomerAuth = ({ children }) => {
  const { token } = useAuth()  

  if (!token) {
    return <Navigate to="/customer/login" replace />
  }

  return children
}

export default RequireCustomerAuth