// src/services/api.js
import axios from 'axios'

// --------------------
// Base URL
// --------------------
var API_BASE =
    (
        import.meta &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE_URL) ?
    import.meta.env.VITE_API_BASE_URL :
    'http://localhost:8080'

var BASE_URL = API_BASE + '/api'

// --------------------
// Token helpers
// --------------------
var TOKEN_KEY = 'customerToken'

export function getCustomerToken() {
    return localStorage.getItem(TOKEN_KEY)
}
export function setCustomerToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token)
}
export function clearCustomerToken() {
    localStorage.removeItem(TOKEN_KEY)
}

// --------------------
// Axios instances
// --------------------
var publicApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

var authApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach token
authApi.interceptors.request.use(function(config) {
    var token = getCustomerToken()
    if (token) {
        if (!config.headers) config.headers = {}
        config.headers.Authorization = 'Bearer ' + token
    }
    return config
})

// Handle 401
authApi.interceptors.response.use(
    function(res) { return res },
    function(err) {
        if (err && err.response && err.response.status === 401) {
            clearCustomerToken()
        }
        return Promise.reject(err)
    }
)

// --------------------
// PUBLIC - Products
// --------------------
export function getAllProducts() {
    return publicApi.get('/spareparts/all')
}
export function getCategories() {
    return publicApi.get('/products/categories')
}
export function searchProducts(params) {
    return publicApi.get('/products/search', { params: params })
}

// --------------------
// CUSTOMER AUTH
// --------------------
export function registerCustomer(data) {
    return publicApi.post('/customer/auth/register', data)
}
export function loginCustomer(data) {
    return publicApi.post('/customer/auth/login', data)
}
export function verifyCustomerEmail(data) {
    return publicApi.post('/customer/auth/verify-email', data)
}
export function resendCustomerOtp(data) {
    return publicApi.post('/customer/auth/resend-otp', data)
}

// --------------------
// SOCIAL AUTH
// --------------------
export function googleAuth(accessToken) {
    return publicApi.post('/customer/auth/google', { accessToken })
}
export function facebookAuth(accessToken) {
    return publicApi.post('/customer/auth/facebook', { accessToken })
}

// --------------------
// CUSTOMER Profile

// --------------------
export function getMyProfile(email) {
    return authApi.get('/customer/profile', { params: { email } })
}


export function updateMyProfile(data) {
    return authApi.put('/customer/profile', data)
}

// --------------------
// ✅ ORDERS
// --------------------
export function placeOrder(data) {
    return publicApi.post('/orders', data)
}
export function getMyOrders(email) {
    return publicApi.get('/orders/customer/' + email)
}
export function cancelOrder(orderId) {
    return publicApi.put('/orders/' + orderId + '/cancel')
}

// --------------------
// CART
// --------------------
export function getMyCart() {
    return authApi.get('/customer/cart')
}
export function addToCart(data) {
    return authApi.post('/customer/cart', data)
}
export function removeFromCart(itemId) {
    return authApi.delete('/customer/cart/' + itemId)
}

// --------------------
// ✅ CUSTOMER FORGOT PASSWORD FLOW (NEW)
// --------------------
export const sendOtp = async(data) => {
    // data = { email: "..." }
    return await publicApi.post('/auth/forgot-password', data);
};

export const verifyOtp = async(data) => {
    // data = { email: "...", otp: "..." }
    return await publicApi.post('/auth/verify-otp', data);
};

export const resetPassword = async(data) => {
    // data = { email: "...", otp: "...", newPassword: "..." }
    return await publicApi.post('/auth/reset-password', data);
};

// --------------------
// Exports
// --------------------
export { publicApi, authApi }
export default authApi