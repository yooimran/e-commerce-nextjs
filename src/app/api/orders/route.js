import { NextResponse } from 'next/server'
import { cartOperations } from '../../../lib/cartOperations'
import { fallbackProductOperations } from '../../../lib/fallbackProducts'
import connectDB from '../../../lib/connectDB'
import Product from '../../../models/Product'
import mongoose from 'mongoose'

// In-memory orders storage (you can later replace with database)
const orders = new Map()
let orderCounter = 1

// Helper function to get product by ID (MongoDB or fallback)
async function getProductById(productId) {
  try {
    const isConnected = await connectDB()
    
    if (!isConnected) {
      return fallbackProductOperations.getProductById(productId)
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return fallbackProductOperations.getProductById(productId)
    }

    const product = await Product.findById(productId).lean()
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return fallbackProductOperations.getProductById(productId)
  }
}

// Orders operations
const ordersOperations = {
  createOrder: (orderData) => {
    const orderId = `order_${orderCounter++}_${Date.now()}`
    const order = {
      id: orderId,
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const userOrders = orders.get(orderData.userId) || []
    userOrders.push(order)
    orders.set(orderData.userId, userOrders)
    
    return order
  },
  
  getUserOrders: (userEmail) => {
    return orders.get(userEmail) || []
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const userOrders = ordersOperations.getUserOrders(userEmail)
    return NextResponse.json(userOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { shippingAddress, paymentMethod, userEmail } = body

    console.log('Order request body:', body)

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: 'Shipping address and payment method are required' }, { status: 400 })
    }

    // Validate shipping address fields
    const requiredFields = ['fullName', 'address', 'city', 'postalCode']
    const missingFields = requiredFields.filter(field => !shippingAddress[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required shipping fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Get cart items
    const cartItems = cartOperations.getCart(userEmail)
    
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    console.log('Cart items:', cartItems)

    // Calculate total and prepare order items
    let total = 0
    const orderItems = []
    
    for (const item of cartItems) {
      const product = await getProductById(item.productId)
      
      if (!product) {
        return NextResponse.json({ 
          error: `Product not found: ${item.productId}` 
        }, { status: 400 })
      }
      
      // Check stock
      if (!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity < item.quantity)) {
        return NextResponse.json({ 
          error: `Insufficient stock for product: ${product.title || product.name}` 
        }, { status: 400 })
      }
      
      const itemTotal = product.price * item.quantity
      total += itemTotal
      
      orderItems.push({
        productId: item.productId,
        productName: product.title || product.name,
        productPrice: product.price,
        productImage: product.imageUrl,
        quantity: item.quantity,
        total: itemTotal
      })
    }

    console.log('Order items:', orderItems)
    console.log('Total:', total)

    // Create order
    const order = ordersOperations.createOrder({
      userId: userEmail,
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      shippingAddress,
      paymentMethod
    })

    // Clear cart after successful order
    cartOperations.clearCart(userEmail)

    console.log('Order created:', order)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
