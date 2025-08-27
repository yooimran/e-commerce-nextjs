// Fallback in-memory products for when MongoDB is not available
const fallbackProducts = [
  {
    _id: "1",
    title: "Wireless Bluetooth Headphones",
    description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    price: 99.99,
    originalPrice: 149.99,
    category: "Electronics",
    brand: "TechAudio",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    inStock: true,
    stockQuantity: 50,
    tags: ["wireless", "bluetooth", "headphones"],
    rating: 4.5,
    reviews: 128,
    featured: true,
    createdBy: "admin@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "2", 
    title: "Smart Fitness Watch",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.",
    price: 199.99,
    originalPrice: 249.99,
    category: "Electronics",
    brand: "FitTech",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    inStock: true,
    stockQuantity: 30,
    tags: ["fitness", "smartwatch", "health"],
    rating: 4.3,
    reviews: 89,
    featured: false,
    createdBy: "admin@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "3",
    title: "Ergonomic Office Chair",
    description: "Comfortable ergonomic office chair with lumbar support and adjustable height.",
    price: 299.99,
    category: "Furniture",
    brand: "ComfortSeating",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
    inStock: true,
    stockQuantity: 15,
    tags: ["office", "chair", "ergonomic"],
    rating: 4.7,
    reviews: 45,
    featured: false,
    createdBy: "admin@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

let products = [...fallbackProducts]
let nextId = 4

export const fallbackProductOperations = {
  // Get all products
  getAllProducts: (filters = {}) => {
    let result = [...products]
    
    // Apply search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(product => 
        product.category.toLowerCase().includes(filters.category.toLowerCase())
      )
    }
    
    // Apply price range
    if (filters.minPrice) {
      result = result.filter(product => product.price >= Number(filters.minPrice))
    }
    if (filters.maxPrice) {
      result = result.filter(product => product.price <= Number(filters.maxPrice))
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }
    
    return result
  },

  // Get product by ID
  getProductById: (id) => {
    return products.find(product => product._id === id)
  },

  // Add new product
  addProduct: (productData, userEmail) => {
    const newProduct = {
      _id: String(nextId++),
      ...productData,
      createdBy: userEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    products.push(newProduct)
    return newProduct
  },

  // Update product
  updateProduct: (id, productData, userEmail) => {
    const index = products.findIndex(product => product._id === id)
    if (index === -1) return null
    
    const existingProduct = products[index]
    if (existingProduct.createdBy !== userEmail) return null
    
    products[index] = {
      ...existingProduct,
      ...productData,
      updatedAt: new Date()
    }
    return products[index]
  },

  // Delete product
  deleteProduct: (id, userEmail) => {
    const index = products.findIndex(product => product._id === id)
    if (index === -1) return null
    
    const existingProduct = products[index]
    if (existingProduct.createdBy !== userEmail) return null
    
    return products.splice(index, 1)[0]
  },

  // Get products by user
  getProductsByUser: (userEmail) => {
    return products.filter(product => product.createdBy === userEmail)
  }
}

export default fallbackProductOperations
