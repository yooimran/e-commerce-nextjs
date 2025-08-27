"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import Link from "next/link"
import Image from "next/image"
import { notFound, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function ProductDetails({ params }) {
  const { currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/products/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
          fetchRelatedProducts(data.category, id)
        } else {
          notFound()
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params])

  const fetchRelatedProducts = async (category, currentId) => {
    try {
      const response = await fetch(`/api/products?category=${category}`)
      if (response.ok) {
        const data = await response.json()
        const filtered = data.filter(p => p.id !== currentId).slice(0, 4)
        setRelatedProducts(filtered)
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const addToCart = async () => {
    if (authLoading) {
      toast.error('Please wait, checking authentication...')
      return
    }

    if (!currentUser) {
      toast.error('Please login to add items to cart')
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: product.id, 
          quantity,
          userEmail: currentUser.email 
        }),
      })

      if (response.ok) {
        toast.success(`Added ${quantity} item(s) to cart!`)
        setQuantity(1)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to add to cart')
      }
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  const deleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Product deleted successfully!')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const isOwner = currentUser && product && currentUser.email === product.userId

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/products" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
              }}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
                {isOwner && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/edit-product/${product.id}`}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={deleteProduct}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-4xl font-bold text-blue-600 mb-6">
                ${product.price}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {!isOwner && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={addToCart}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Free shipping on orders over $100</li>
                <li>• 30-day return policy</li>
                <li>• 1-year manufacturer warranty</li>
                <li>• Secure payment processing</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-500">
                Listed on {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-xl font-bold text-blue-600 mb-3">
                      ${relatedProduct.price}
                    </p>
                    <Link 
                      href={`/products/${relatedProduct.id}`}
                      className="block w-full bg-gray-600 text-white text-center py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
            <p className="text-gray-600 text-sm">Get your order delivered within 2-3 business days.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
            <p className="text-gray-600 text-sm">All products come with our quality assurance guarantee.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Need help? Our customer support is available around the clock.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
