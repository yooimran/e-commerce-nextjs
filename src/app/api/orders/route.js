import { NextResponse } from 'next/server'
import { createOrder, getUserOrders, clearCart, getCart, getProductById } from '../../../lib/products'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const orders = getUserOrders(userEmail)
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { shippingAddress, paymentMethod, userEmail } = body

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: 'Shipping address and payment method are required' }, { status: 400 })
    }

    // Get cart items
    const cartItems = getCart(userEmail)
    
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate total and prepare order items
    let total = 0
    const orderItems = cartItems.map(item => {
      const product = getProductById(item.productId)
      const itemTotal = product.price * item.quantity
      total += itemTotal
      
      return {
        productId: item.productId,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        total: itemTotal
      }
    })

    // Create order
    const order = createOrder({
      userId: userEmail,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod
    })

    // Clear cart after successful order
    clearCart(userEmail)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
