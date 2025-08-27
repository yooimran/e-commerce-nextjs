// Enhanced e-commerce data store
// Using global variables to ensure data persistence across API calls
if (!global.productsData) {
  global.productsData = []
}

if (!global.cartsData) {
  global.cartsData = {}
}

if (!global.ordersData) {
  global.ordersData = []
}

// Product functions
export function getAllProducts() {
  return global.productsData
}

export function getProductById(id) {
  return global.productsData.find(p => p.id === id)
}

export function getProductsByUser(userId) {
  return global.productsData.filter(p => p.userId === userId)
}

export function addProduct(productData, userId) {
  const newProduct = {
    id: Date.now().toString(),
    name: productData.name,
    description: productData.description,
    price: parseFloat(productData.price),
    category: productData.category,
    imageUrl: productData.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop",
    userId: userId,
    createdAt: new Date().toISOString()
  }
  
  global.productsData.push(newProduct)
  return newProduct
}

export function updateProduct(id, productData, userId) {
  const index = global.productsData.findIndex(p => p.id === id && p.userId === userId)
  if (index !== -1) {
    global.productsData[index] = {
      ...global.productsData[index],
      ...productData,
      price: parseFloat(productData.price)
    }
    return global.productsData[index]
  }
  return null
}

export function deleteProduct(id, userId) {
  const index = global.productsData.findIndex(p => p.id === id && p.userId === userId)
  if (index !== -1) {
    const deletedProduct = global.productsData.splice(index, 1)[0]
    return deletedProduct
  }
  return null
}

export function searchProducts(query) {
  const lowercaseQuery = query.toLowerCase()
  return global.productsData.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery) ||
    p.category.toLowerCase().includes(lowercaseQuery)
  )
}

export function filterProducts(filters) {
  let filtered = global.productsData
  
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase())
  }
  
  if (filters.minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice))
  }
  
  if (filters.maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice))
  }
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
    }
  }
  
  return filtered
}

export function getCategories() {
  const categories = [...new Set(global.productsData.map(p => p.category))]
  return categories
}

// Clear all data function (for development/testing)
export function clearAllData() {
  global.productsData = []
  global.cartsData = {}
  global.ordersData = []
  return {
    productsCleared: true,
    cartsCleared: true,
    ordersCleared: true
  }
}

// Cart functions
export function getCart(userId) {
  return global.cartsData[userId] || []
}

export function addToCart(userId, productId, quantity = 1) {
  if (!global.cartsData[userId]) {
    global.cartsData[userId] = []
  }
  
  const existingItem = global.cartsData[userId].find(item => item.productId === productId)
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    global.cartsData[userId].push({ productId, quantity })
  }
  
  return global.cartsData[userId]
}

export function updateCartItem(userId, productId, quantity) {
  if (!global.cartsData[userId]) return []
  
  const item = global.cartsData[userId].find(item => item.productId === productId)
  if (item) {
    if (quantity <= 0) {
      global.cartsData[userId] = global.cartsData[userId].filter(item => item.productId !== productId)
    } else {
      item.quantity = quantity
    }
  }
  
  return global.cartsData[userId]
}

export function removeFromCart(userId, productId) {
  if (!global.cartsData[userId]) return []
  
  global.cartsData[userId] = global.cartsData[userId].filter(item => item.productId !== productId)
  return global.cartsData[userId]
}

export function clearCart(userId) {
  global.cartsData[userId] = []
  return []
}

// Order functions
export function createOrder(orderData) {
  const order = {
    id: Date.now().toString(),
    ...orderData,
    createdAt: new Date().toISOString(),
    status: 'completed'
  }
  
  global.ordersData.push(order)
  return order
}

export function getUserOrders(userId) {
  return global.ordersData.filter(order => order.userId === userId)
}
