import { NextResponse } from 'next/server'
import { cartOperations } from '../../../lib/cartOperations'
import { fallbackProductOperations } from '../../../lib/fallbackProducts'
import connectDB from '../../../lib/connectDB'
import Product from '../../../models/Product'
import mongoose from 'mongoose'

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const cartItems = cartOperations.getCart(userEmail)
    
    // Populate cart items with product details
    const populatedCart = []
    for (const item of cartItems) {
      const product = await getProductById(item.productId)
      if (product) {
        populatedCart.push({
          ...item,
          product
        })
      }
    }

    return NextResponse.json(populatedCart)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { productId, quantity = 1, userEmail } = body

    if (!productId || !userEmail) {
      return NextResponse.json({ error: 'Product ID and user email are required' }, { status: 400 })
    }

    // Check if product exists
    const product = await getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is in stock
    if (!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity < quantity)) {
      return NextResponse.json({ error: 'Product is out of stock or insufficient quantity' }, { status: 400 })
    }

    const cart = cartOperations.addToCart(userEmail, productId, quantity)
    
    return NextResponse.json({ 
      message: 'Product added to cart successfully', 
      cart,
      cartCount: cartOperations.getCartCount(userEmail)
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { productId, quantity, userEmail } = body

    if (!productId || quantity === undefined || !userEmail) {
      return NextResponse.json({ error: 'Product ID, quantity, and user email are required' }, { status: 400 })
    }

    // Check if product exists
    const product = await getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check stock if increasing quantity
    if (quantity > 0 && (!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity < quantity))) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    const cart = cartOperations.updateCartItem(userEmail, productId, quantity)
    
    return NextResponse.json({ 
      message: 'Cart updated successfully', 
      cart,
      cartCount: cartOperations.getCartCount(userEmail)
    })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userEmail = searchParams.get('userEmail')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    if (productId) {
      const cart = cartOperations.removeFromCart(userEmail, productId)
      return NextResponse.json({ 
        message: 'Product removed from cart', 
        cart,
        cartCount: cartOperations.getCartCount(userEmail)
      })
    } else {
      const cart = cartOperations.clearCart(userEmail)
      return NextResponse.json({ 
        message: 'Cart cleared', 
        cart,
        cartCount: 0
      })
    }
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
