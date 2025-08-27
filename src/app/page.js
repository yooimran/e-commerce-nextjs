"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        // Show first 3 products as featured, or empty array if no products
        // data is an array directly, not an object with products property
        setFeaturedProducts(Array.isArray(data) ? data.slice(0, 3) : [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 leading-tight">
            Welcome to Our
            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              E-Commerce Store
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed text-blue-100 px-4">
            Discover amazing products at unbeatable prices. Quality, convenience, and satisfaction guaranteed.
          </p>
          
          {/* Hero Search Bar */}
          <div className="max-w-3xl mx-auto mb-8 md:mb-12 px-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for amazing products..."
                className="w-full px-6 md:px-8 py-4 md:py-6 pl-12 md:pl-16 text-gray-900 rounded-2xl md:rounded-3xl text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-white/50 shadow-2xl backdrop-blur-sm bg-white/95"
              />
              <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center">
                <svg className="h-6 w-6 md:h-8 md:w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-1 md:right-2 my-1 md:my-2 flex items-center"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base">
                  <span className="hidden md:inline">🔍 Search</span>
                  <span className="md:hidden">🔍</span>
                </div>
              </button>
            </form>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4">
            <Link 
              href="/products" 
              className="w-full sm:w-auto bg-white text-purple-600 px-8 md:px-10 py-3 md:py-4 rounded-2xl font-black text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              🛍️ Shop Now
            </Link>
            <Link 
              href="/signup" 
              className="w-full sm:w-auto border-3 border-white text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-black text-base md:text-lg hover:bg-white hover:text-purple-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              ✨ Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section className="py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Featured Products
            </h2>
            <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed">
              {featuredProducts.length > 0 
                ? "Check out our most popular items that customers absolutely love ❤️"
                : "Be the first to add products to our amazing marketplace! 🚀"
              }
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
                <p className="text-purple-600 font-bold text-lg">Loading amazing products...</p>
              </div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {featuredProducts.map((product) => (
                  <div key={product._id || product.id} className="group relative bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100">
                    {/* Product Image */}
                    <div className="relative h-36 sm:h-48 md:h-56 overflow-hidden">
                      <Image
                        src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"}
                        alt={product.title || product.name || 'Featured product'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={true}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
                        }}
                      />
                      
                      {/* Featured Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold shadow-lg">
                          <span className="hidden sm:inline">⭐ Featured</span>
                          <span className="sm:hidden">⭐</span>
                        </span>
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                          <span className="hidden sm:inline">{product.category}</span>
                          <span className="sm:hidden">{product.category.slice(0, 3)}</span>
                        </span>
                      </div>

                      {/* Sale Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            <span className="hidden sm:inline">🔥 Sale</span>
                            <span className="sm:hidden">🔥</span>
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay - Hidden on mobile for better performance */}
                      <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <Link 
                            href={`/products/${product._id || product.id}`}
                            className="block w-full bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl text-sm font-bold text-center hover:bg-white transition-all duration-200 shadow-lg"
                          >
                            🔍 View Details
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 md:p-4 lg:p-5">
                      <div className="mb-2">
                        <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 line-clamp-1 md:line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors duration-300">
                          {product.title || product.name}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-1 md:line-clamp-2 leading-relaxed hidden sm:block">
                        {product.description}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1 md:space-x-2">
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                              <span className="text-lg md:text-xl lg:text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-sm md:text-base text-gray-400 line-through hidden sm:inline">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg md:text-xl lg:text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="bg-red-100 text-red-800 px-1 md:px-2 py-1 rounded text-xs font-bold">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Mobile View Button */}
                      <div className="md:hidden">
                        <Link 
                          href={`/products/${product._id || product.id}`}
                          className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 rounded-lg text-xs font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Link 
                  href="/products" 
                  className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 text-white px-12 py-4 rounded-2xl font-black text-lg hover:from-gray-900 hover:to-black transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  🛍️ View All Products
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-lg mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-12">
                <div className="mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Products Yet 🚀
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  This marketplace is ready for you! Be the first to add products and start your selling journey.
                </p>
                <div className="space-y-4">
                  <Link
                    href="/signup"
                    className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    ✨ Sign Up to Sell
                  </Link>
                  <div>
                    <Link
                      href="/products"
                      className="text-purple-600 hover:text-purple-800 font-bold text-lg bg-purple-50 hover:bg-purple-100 px-6 py-3 rounded-xl transition-all duration-200 inline-block"
                    >
                      Browse All Products →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto">
              Experience shopping like never before with our premium features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Get your products delivered quickly and safely to your doorstep</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Guarantee</h3>
              <p className="text-gray-600">100% authentic products with money-back guarantee</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
