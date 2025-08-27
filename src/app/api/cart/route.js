import { NextResponse } from 'next/server'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, getProductById } from '../../../lib/products'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const cartItems = getCart(userEmail)
    
    // Populate cart items with product details
    const populatedCart = cartItems.map(item => {
      const product = getProductById(item.productId)
      return {
        ...item,
        product
      }
    }).filter(item => item.product) // Remove items with deleted products

    return NextResponse.json(populatedCart)
  } catch (error) {
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

    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const cart = addToCart(userEmail, productId, quantity)
    
    return NextResponse.json({ message: 'Product added to cart', cart }, { status: 201 })
  } catch (error) {
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

    const cart = updateCartItem(userEmail, productId, quantity)
    
    return NextResponse.json({ message: 'Cart updated', cart })
  } catch (error) {
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
      const cart = removeFromCart(userEmail, productId)
      return NextResponse.json({ message: 'Product removed from cart', cart })
    } else {
      const cart = clearCart(userEmail)
      return NextResponse.json({ message: 'Cart cleared', cart })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
