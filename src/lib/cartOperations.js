// In-memory cart storage (you can later replace with database)
const carts = new Map()

export const cartOperations = {
  // Get user's cart
  getCart: (userEmail) => {
    return carts.get(userEmail) || []
  },

  // Add item to cart
  addToCart: (userEmail, productId, quantity = 1) => {
    const userCart = carts.get(userEmail) || []
    const existingItemIndex = userCart.findIndex(item => item.productId === productId)

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      userCart[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      userCart.push({
        productId,
        quantity,
        addedAt: new Date()
      })
    }

    carts.set(userEmail, userCart)
    return userCart
  },

  // Update cart item quantity
  updateCartItem: (userEmail, productId, quantity) => {
    const userCart = carts.get(userEmail) || []
    const itemIndex = userCart.findIndex(item => item.productId === productId)

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        userCart.splice(itemIndex, 1)
      } else {
        userCart[itemIndex].quantity = quantity
      }
    }

    carts.set(userEmail, userCart)
    return userCart
  },

  // Remove item from cart
  removeFromCart: (userEmail, productId) => {
    const userCart = carts.get(userEmail) || []
    const filteredCart = userCart.filter(item => item.productId !== productId)
    carts.set(userEmail, filteredCart)
    return filteredCart
  },

  // Clear entire cart
  clearCart: (userEmail) => {
    carts.set(userEmail, [])
    return []
  },

  // Get cart item count
  getCartCount: (userEmail) => {
    const userCart = carts.get(userEmail) || []
    return userCart.reduce((total, item) => total + item.quantity, 0)
  },

  // Get cart total
  getCartTotal: (userEmail, getProductById) => {
    const userCart = carts.get(userEmail) || []
    return userCart.reduce((total, item) => {
      const product = getProductById(item.productId)
      if (product) {
        return total + (product.price * item.quantity)
      }
      return total
    }, 0)
  }
}

export default cartOperations
