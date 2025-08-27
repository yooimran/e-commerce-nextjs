"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { useAuth } from "../../../contexts/AuthContext"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function AddProduct() {
  const { currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: ""
  })
  const [imageError, setImageError] = useState(false)

  // Redirect to login if not authenticated with Firebase
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login")
    }
  }, [currentUser, authLoading, router])

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Reset image error when URL changes
    if (name === "imageUrl") {
      setImageError(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userEmail: currentUser.email
        }),
      })

      if (response.ok) {
        const newProduct = await response.json()
        toast.success(`Product added successfully! ID: ${newProduct.id}`)
        setFormData({ name: "", description: "", price: "", category: "", imageUrl: "" })
        
        // Redirect to products list to see the new product
        setTimeout(() => {
          router.push("/products")
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to add product")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Add New Product</h1>
          <p className="text-gray-600">Fill in the details below to add a new product to the catalog.</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports & Outdoors">Sports & Outdoors</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Toys & Games">Toys & Games</option>
                <option value="Books">Books</option>
                <option value="Automotive">Automotive</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Accessories">Accessories</option>
                <option value="Art & Crafts">Art & Crafts</option>
                <option value="Music">Music</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Product Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a direct URL to an image. If left empty, a default image will be used.
              </p>
              
              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                  <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onLoad={() => setImageError(false)}
                      onError={() => setImageError(true)}
                      style={{ display: imageError ? 'none' : 'block' }}
                    />
                    {imageError && (
                      <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center text-gray-500 text-xs p-2">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-center">Could not load image</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Image URL Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Image URL Tips:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Paste any direct image URL (jpg, png, gif, webp)</li>
                <li>• Free sources: Unsplash.com, Pexels.com, Pixabay.com</li>
                <li>• Right-click any image → &quot;Copy image address&quot;</li>
                <li>• Make sure URL ends with image extension</li>
                <li>• Both HTTP and HTTPS URLs are supported</li>
              </ul>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-blue-600">
                  <strong>Examples:</strong>
                </p>
                <p className="text-xs text-blue-600 font-mono bg-white px-1 rounded">
                  https://images.unsplash.com/photo-1234567890/image.jpg
                </p>
                <p className="text-xs text-blue-600 font-mono bg-white px-1 rounded">
                  https://example.com/product-image.png
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This is a protected page. Only authenticated users can access this feature.
                Products are stored in memory and will be reset when the server restarts.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
