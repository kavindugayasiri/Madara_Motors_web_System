
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

const LS_KEY = 'madara_cart_v1'

export const CartProvider = ({ children }) => {

  // ✅ LocalStorage persist
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  // ✅ Auto save to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADD TO CART
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const addToCart = (product, qty = 1) => {
    if (!product) return
    const code = product.productCode || product.code || product.id
    if (!code) return

    const unitPrice = Number(
      product.sellingPrice ?? product.price ?? 0
    )
    const addQty = Math.max(1, Number(qty || 1))

    setCartItems(prev => {
      const idx = prev.findIndex(i => i.productCode === code)

      if (idx !== -1) {
        // ✅ Already exists - qty increase
        const next = [...prev]
        const current = next[idx]
        const maxQty = current.stockQty != null
          ? Number(current.stockQty)
          : 999
        const newQty = Math.min((current.qty || 1) + addQty, maxQty)
        next[idx] = { ...current, qty: newQty }
        return next
      }

      // ✅ New item add
      const maxQty = product.stockQty != null
        ? Number(product.stockQty)
        : 999
      return [
        ...prev,
        {
          ...product,
          productCode: code,
          price: unitPrice,
          qty:   Math.min(addQty, maxQty || 999),
        },
      ]
    })
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REMOVE FROM CART
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const removeFromCart = (code) => {
    setCartItems(prev => prev.filter(i => i.productCode !== code))
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INCREASE QTY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const increaseQty = (code) => {
    setCartItems(prev =>
      prev.map(i => {
        if (i.productCode !== code) return i
        const maxQty = i.stockQty != null ? Number(i.stockQty) : 999
        return { ...i, qty: Math.min((i.qty || 1) + 1, maxQty) }
      })
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DECREASE QTY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const decreaseQty = (code) => {
    setCartItems(prev =>
      prev.map(i => {
        if (i.productCode !== code) return i
        return { ...i, qty: Math.max((i.qty || 1) - 1, 1) }
      })
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UPDATE QTY (direct input)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const updateQuantity = (code, qty) => {
    setCartItems(prev =>
      prev.map(i => {
        if (i.productCode !== code) return i
        const maxQty = i.stockQty != null ? Number(i.stockQty) : 999
        const newQty = Math.max(1, Math.min(Number(qty || 1), maxQty))
        return { ...i, qty: newQty }
      })
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEAR CART
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem(LS_KEY)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPUTED VALUES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + Number(i.qty || 1), 0),
    [cartItems]
  )

  const totalPrice = useMemo(
    () => cartItems.reduce(
      (sum, i) => sum + Number(i.price ?? i.sellingPrice ?? 0) * Number(i.qty || 1),
      0
    ),
    [cartItems]
  )

  // ✅ Aliases (backward compatible)
  const cartCount    = totalItems
  const cartSubtotal = totalPrice

  return (
    <CartContext.Provider value={{
      // ✅ Data
      cartItems,

      // ✅ Actions
      addToCart,
      removeFromCart,
      increaseQty,
      decreaseQty,
      updateQuantity,
      clearCart,

      // ✅ Computed - original names
      totalItems,
      totalPrice,

      // ✅ Aliases
      cartCount,
      cartSubtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}