"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Our E-Commerce Store
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Quality, convenience, and satisfaction guaranteed.
          </p>
          <div className="space-x-4">
            <Link 
              href="/products" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
            <Link 
              href="/signup" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section className="py-16 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {featuredProducts.length > 0 
                ? "Check out our most popular items that customers love"
                : "Be the first to add products to our marketplace!"
              }
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gray-200">
                      <Image
                        src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized={true}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">
                        ${product.price.toFixed(2)}
                      </p>
                      <Link 
                        href={`/products/${product.id}`}
                        className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link 
                  href="/products" 
                  className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  View All Products
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Products Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  This marketplace is ready for you! Be the first to add products and start selling.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/signup"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sign Up to Sell
                  </Link>
                  <div>
                    <Link
                      href="/products"
                      className="text-blue-600 hover:text-blue-800 font-medium"
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

      <Footer />
    </div>
  )
}
