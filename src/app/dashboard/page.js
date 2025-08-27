"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Dashboard() {
  const { currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch products
      const productsResponse = await fetch('/api/products')
      if (!productsResponse.ok) {
        toast.error('Failed to load products data')
        return
      }
      
      const allProducts = await productsResponse.json()
      // Filter products by current user
      const userProducts = allProducts.filter(product => 
        product.createdBy === currentUser.email || product.userId === currentUser.email
      )
      
      // Fetch orders
      const ordersResponse = await fetch(`/api/orders?userEmail=${encodeURIComponent(currentUser.email)}`)
      let userOrders = []
      if (ordersResponse.ok) {
        userOrders = await ordersResponse.json()
      }
      
      // Calculate dashboard stats
      const totalProducts = userProducts.length
      const totalOrders = userOrders.length
      const totalSpent = userOrders.reduce((sum, order) => 
        sum + (order.total || 0), 0
      )
      
      setDashboardData({
        stats: {
          totalProducts,
          totalSpent,
          totalOrders
        },
        products: userProducts,
        orders: userOrders
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    // Check if user is authenticated with Firebase
    if (authLoading) return // Still loading Firebase auth

    if (!currentUser) {
      router.push("/login")
      return
    }
    
    if (currentUser) {
      fetchDashboardData()
    }
  }, [currentUser, authLoading, router, fetchDashboardData])

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: currentUser.email
        })
      })

      if (response.ok) {
        toast.success('Product deleted successfully!')
        fetchDashboardData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Failed to load dashboard</h2>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {currentUser?.displayName || currentUser?.email}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-bold text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {dashboardData.stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-bold text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {dashboardData.stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Products ({dashboardData.products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order History ({dashboardData.orders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/dashboard/add-product"
                  className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Add Product</p>
                    <p className="text-sm text-gray-600">List a new product</p>
                  </div>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Browse Products</p>
                    <p className="text-sm text-gray-600">Explore marketplace</p>
                  </div>
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m4.5-6h6m-6 0v6" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">View Cart</p>
                    <p className="text-sm text-gray-600">Check your cart</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {dashboardData.products.length === 0 && dashboardData.orders.length === 0 ? (
                <p className="text-gray-600">No recent activity. Start by adding your first product!</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.products.slice(0, 3).map((product) => (
                    <div key={product._id || product.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <p className="text-gray-600">
                        Listed product: <span className="font-medium">{product.name || product.title}</span>
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {dashboardData.orders.slice(0, 3).map((order) => (
                    <div key={order._id || order.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <p className="text-gray-600">
                        Placed order: <span className="font-medium">${order.total.toFixed(2)}</span>
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">My Products</h2>
                <Link
                  href="/dashboard/add-product"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  Add Product
                </Link>
              </div>
            </div>
            
            {dashboardData.products.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">You haven&apos;t listed any products yet.</p>
                <Link
                  href="/dashboard/add-product"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {dashboardData.products.map((product) => (
                  <div key={product._id || product.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.imageUrl}
                          alt={product.title || product.name || 'Product image'}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/products/${product._id || product.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {product.name}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1">{product.category}</p>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
                        <p className="text-xl font-bold text-blue-600 mt-2">${product.price}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Listed on {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/edit-product/${product._id || product.id}`}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteProduct(product._id || product.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
            </div>
            
            {dashboardData.orders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
                <Link
                  href="/products"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {dashboardData.orders.map((order) => (
                  <div key={order._id || order.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Status: {order.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">${order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.productName} x {item.quantity}</span>
                          <span>${item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
