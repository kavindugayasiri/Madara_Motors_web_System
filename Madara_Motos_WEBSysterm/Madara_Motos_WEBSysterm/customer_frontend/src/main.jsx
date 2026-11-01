// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google'
// (Optional) if you already use these in your project, keep them:
// import { BrowserRouter } from 'react-router-dom'
// import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* If your App.jsx already wraps Router/AuthProvider, no need to add here */}
      {/* <BrowserRouter>
        <AuthProvider> */}
          <App />
      {/*   </AuthProvider>
      </BrowserRouter> */}
    </GoogleOAuthProvider>
  </React.StrictMode>,
)