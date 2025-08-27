"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Products() {
  const { currentUser, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  })

  // Update filters when URL search params change (e.g., from navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== filters.search) {
      setFilters(prev => ({
        ...prev,
        search: urlSearch
      }))
    }
  }, [searchParams, filters.search])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (filters.search) params.append('search', filters.search)
        if (filters.category !== 'all') params.append('category', filters.category)
        if (filters.minPrice) params.append('minPrice', filters.minPrice)
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
        if (filters.sortBy) params.append('sortBy', filters.sortBy)

        const response = await fetch(`/api/products?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchProducts()
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [filters, categories.length])

  const addToCart = async (productId) => {
    // Debug logging
    console.log('Add to cart clicked. Auth loading:', authLoading, 'Current user:', currentUser)
    
    // Check if still loading authentication state
    if (authLoading) {
      toast.error('Please wait, checking authentication...')
      return
    }

    if (!currentUser) {
      toast.error('Please login to add items to cart')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, 
          quantity: 1,
          userEmail: currentUser.email 
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Added to cart!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error('Failed to add to cart')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {filters.search ? `Search results for "${filters.search}"` : 'All Products'}
          </h1>
          <p className="text-gray-600 text-lg">Browse our complete collection of amazing products</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-purple-100 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Filter Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            <div className="xl:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="1000"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                onClick={clearFilters}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <p className="text-purple-600 font-medium">Loading amazing products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {filters.search || filters.category !== 'all' || filters.minPrice || filters.maxPrice 
                ? "No products match your current filters. Try adjusting your search criteria."
                : "No products are available at the moment."}
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-700 font-medium text-lg">
                Showing <span className="font-bold text-purple-600">{products.length}</span> products
                {filters.search && <span> for &ldquo;<span className="font-bold text-purple-600">{filters.search}</span>&rdquo;</span>}
              </p>
              {(filters.search || filters.category !== 'all' || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-800 font-bold bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <div key={product._id || product.id} className="group relative bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 aspect-square flex flex-col">
                  {/* Product Image */}
                  <div className="relative flex-1 overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.title || product.name || 'Product image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized={true}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
                      }}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.featured && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          <span className="hidden sm:inline">⭐ Featured</span>
                          <span className="sm:hidden">⭐</span>
                        </span>
                      )}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          <span className="hidden sm:inline">🔥 Sale</span>
                          <span className="sm:hidden">🔥</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <span className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                        <span className="hidden sm:inline">{product.category}</span>
                        <span className="sm:hidden">{product.category.slice(0, 3)}</span>
                      </span>
                    </div>

                    {/* Hover Overlay - Hidden on mobile, visible on desktop */}
                    <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="grid grid-cols-2 gap-2">
                          <Link 
                            href={`/products/${product._id || product.id}`}
                            className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold text-center hover:bg-white transition-all duration-200 shadow-lg"
                          >
                            👁️ View
                          </Link>
                          <button
                            onClick={() => addToCart(product._id || product.id)}
                            disabled={!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg"
                          >
                            {!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0) ? '❌' : '🛒'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Action Buttons */}
                    <div className="md:hidden absolute top-2 right-2 flex flex-col gap-2">
                      <Link 
                        href={`/products/${product._id || product.id}`}
                        className="bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-lg text-xs font-semibold hover:bg-white transition-all duration-200 shadow-md"
                      >
                        👁️
                      </Link>
                      <button
                        onClick={() => addToCart(product._id || product.id)}
                        disabled={!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md"
                      >
                        {!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0) ? '❌' : '🛒'}
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-2 sm:p-3 md:p-4 bg-white">
                    <div className="mb-1 sm:mb-2">
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors duration-300">
                        {product.title || product.name}
                      </h3>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className="flex items-center space-x-1">
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <>
                            <span className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                              ${product.price}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              ${product.originalPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="bg-red-100 text-red-800 px-1 sm:px-1.5 py-0.5 rounded text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    {product.stockQuantity !== undefined && (
                      <div className="flex items-center justify-center">
                        {product.inStock && product.stockQuantity > 0 ? (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full mr-1"></span>
                            <span className="hidden sm:inline">In Stock</span>
                            <span className="sm:hidden">✓</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full mr-1"></span>
                            <span className="hidden sm:inline">Out</span>
                            <span className="sm:hidden">✗</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-8 max-w-md mx-auto">
            <p className="text-gray-700 font-medium mb-6 text-lg">
              Found <span className="font-bold text-purple-600">{products.length}</span> amazing products
            </p>
            {currentUser && (
              <Link 
                href="/dashboard/add-product" 
                className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ✨ Add Your Product
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
