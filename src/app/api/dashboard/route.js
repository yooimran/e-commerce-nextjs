import { NextResponse } from 'next/server'
import { getProductsByUser, getUserOrders } from '../../../lib/products'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const userProducts = getProductsByUser(userEmail)
    const userOrders = getUserOrders(userEmail)

    return NextResponse.json({
      user: {
        email: userEmail
      },
      products: userProducts,
      orders: userOrders,
      stats: {
        totalProducts: userProducts.length,
        totalOrders: userOrders.length,
        totalRevenue: userOrders.reduce((sum, order) => sum + order.total, 0)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
