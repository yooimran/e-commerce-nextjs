import { NextResponse } from 'next/server'

// Utility API to reset all data (for development/testing)
export async function POST() {
  try {
    // Clear all global data
    global.productsData = []
    global.cartsData = {}
    global.ordersData = []
    
    return NextResponse.json({ 
      message: 'All data cleared successfully',
      productsCount: global.productsData.length,
      cartsCount: Object.keys(global.cartsData).length,
      ordersCount: global.ordersData.length
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    productsCount: global.productsData?.length || 0,
    cartsCount: Object.keys(global.cartsData || {}).length,
    ordersCount: global.ordersData?.length || 0,
    products: global.productsData || [],
    message: 'Current data status'
  })
}
