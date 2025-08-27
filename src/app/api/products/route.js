import { NextResponse } from 'next/server'
import { getAllProducts, addProduct, searchProducts, filterProducts } from '../../../lib/products'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy')

    let products = getAllProducts()

    // Apply search
    if (search) {
      products = searchProducts(search)
    }

    // Apply filters
    if (category || minPrice || maxPrice || sortBy) {
      products = filterProducts({
        category,
        minPrice,
        maxPrice,
        sortBy
      })
    }

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, price, category, imageUrl, userEmail } = body

    if (!name || !description || !price || !category || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newProduct = addProduct({ name, description, price, category, imageUrl }, userEmail)
    
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
