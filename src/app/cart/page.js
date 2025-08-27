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
      const response = await fetch('/api/cart', {
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item(s) in your cart`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart!</p>
            <Link 
              href="/products" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.product.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-gray-600 text-sm mt-1">{item.product.category}</p>
                          <p className="text-xl font-bold text-blue-600 mt-2">
                            ${item.product.price}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-right">
                        <span className="text-lg font-semibold text-gray-900">
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
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {calculateTotal() >= 100 ? 'Free' : '$9.99'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${(calculateTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">
                        ${(calculateTotal() + (calculateTotal() >= 100 ? 0 : 9.99) + (calculateTotal() * 0.08)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/products"
                  className="block w-full border border-gray-300 text-gray-700 text-center py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>

                {calculateTotal() < 100 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Add ${(100 - calculateTotal()).toFixed(2)} more for free shipping!
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
