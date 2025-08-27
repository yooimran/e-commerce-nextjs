"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Cart() {
  const { currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCart = useCallback(async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/cart?userEmail=${encodeURIComponent(currentUser.email)}`)
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login")
      return
    }

    if (currentUser) {
      fetchCart()
    }
  }, [currentUser, authLoading, router, fetchCart])

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, 
          quantity,
          userEmail: currentUser.email 
        }),
      })

      if (response.ok) {
        fetchCart() // Refresh cart
      } else {
        toast.error('Failed to update cart')
      }
    } catch (error) {
      toast.error('Failed to update cart')
    }
  }

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`/api/cart?productId=${productId}&userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Item removed from cart')
        fetchCart() // Refresh cart
      } else {
        toast.error('Failed to remove item')
      }
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      const response = await fetch(`/api/cart?userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Cart cleared')
        setCartItems([])
      } else {
        toast.error('Failed to clear cart')
      }
    } catch (error) {
      toast.error('Failed to clear cart')
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Shopping Cart
          </h1>
          <p className="text-gray-600 text-lg">
            {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-12 max-w-md mx-auto">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">Start shopping to add items to your cart and discover amazing products!</p>
              <Link 
                href="/products" 
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100">
                <div className="px-8 py-6 border-b border-purple-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Cart Items
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200 hover:bg-red-50 px-3 py-2 rounded-xl"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-purple-100">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="p-8 hover:bg-purple-50/50 transition-colors duration-200">
                      <div className="flex items-start space-x-6">
                        <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl overflow-hidden shadow-lg">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.title || item.product.name || 'Product image'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.product._id || item.product.id}`}
                            className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors duration-200 block mb-2"
                          >
                            {item.product.title || item.product.name}
                          </Link>
                          <p className="text-purple-600 font-medium text-sm mb-3 bg-purple-100 px-3 py-1 rounded-full inline-block">
                            {item.product.category}
                          </p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            ${item.product.price}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center bg-white border-2 border-purple-200 rounded-2xl shadow-sm overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-4 py-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-3 border-x-2 border-purple-200 font-bold text-gray-900 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-4 py-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-right">
                        <span className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-xl">
                          Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-8 sticky top-24">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-bold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className="text-gray-900 font-bold">
                      {calculateTotal() >= 100 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        '$9.99'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Tax</span>
                    <span className="text-gray-900 font-bold">${(calculateTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-purple-200 pt-4 mt-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        ${(calculateTotal() + (calculateTotal() >= 100 ? 0 : 9.99) + (calculateTotal() * 0.08)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-4 px-6 rounded-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-4"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/products"
                  className="block w-full border-2 border-purple-200 text-purple-600 text-center py-3 px-6 rounded-2xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                >
                  Continue Shopping
                </Link>

                {calculateTotal() < 100 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4.5M20 7v10l-8 4.5M4 7l8 4.5M4 7v10l8 4.5" />
                      </svg>
                      <p className="text-sm font-bold text-blue-700">Free Shipping Available!</p>
                    </div>
                    <p className="text-sm text-blue-600">
                      Add <span className="font-bold">${(100 - calculateTotal()).toFixed(2)}</span> more for free shipping!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
