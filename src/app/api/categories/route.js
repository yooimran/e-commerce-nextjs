import { NextResponse } from 'next/server'
import connectDB from '../../../lib/connectDB'
import Product from '../../../models/Product'
import { fallbackProductOperations } from '../../../lib/fallbackProducts'

export async function GET() {
  try {
    // Try to connect to MongoDB
    const isConnected = await connectDB()
    
    if (!isConnected) {
      console.log('Using fallback categories (MongoDB not available)')
      const products = fallbackProductOperations.getAllProducts()
      const categories = [...new Set(products.map(p => p.category))]
      return NextResponse.json(categories)
    }

    // Use MongoDB to get unique categories
    const categories = await Product.distinct('category')
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    
    // Fallback to in-memory products
    const products = fallbackProductOperations.getAllProducts()
    const categories = [...new Set(products.map(p => p.category))]
    return NextResponse.json(categories)
  }
}
