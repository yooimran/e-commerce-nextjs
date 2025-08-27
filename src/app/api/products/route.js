import { NextResponse } from 'next/server'
import connectDB from '../../../lib/connectDB'
import Product from '../../../models/Product'
import { fallbackProductOperations } from '../../../lib/fallbackProducts'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy')

    // Try to connect to MongoDB
    const isConnected = await connectDB()
    
    if (!isConnected) {
      console.log('Using fallback products (MongoDB not available)')
      const products = fallbackProductOperations.getAllProducts({
        search,
        category,
        minPrice,
        maxPrice,
        sortBy
      })
      return NextResponse.json(products)
    }

    // Build query object for MongoDB
    let query = {}

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ]
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' }
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Build sort object
    let sort = {}
    switch (sortBy) {
      case 'price-low':
        sort.price = 1
        break
      case 'price-high':
        sort.price = -1
        break
      case 'name':
        sort.title = 1
        break
      case 'newest':
        sort.createdAt = -1
        break
      case 'oldest':
        sort.createdAt = 1
        break
      default:
        sort.createdAt = -1
    }

    const products = await Product.find(query).sort(sort).lean()
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Fallback to in-memory products
    console.log('Using fallback products due to error')
    const products = fallbackProductOperations.getAllProducts({
      search: request.nextUrl.searchParams.get('search'),
      category: request.nextUrl.searchParams.get('category'),
      minPrice: request.nextUrl.searchParams.get('minPrice'),
      maxPrice: request.nextUrl.searchParams.get('maxPrice'),
      sortBy: request.nextUrl.searchParams.get('sortBy')
    })
    
    return NextResponse.json(products)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      price, 
      originalPrice,
      category, 
      brand,
      imageUrl, 
      inStock,
      stockQuantity,
      tags,
      featured,
      userEmail 
    } = body

    if (!title || !description || !price || !category || !imageUrl || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, price, category, imageUrl, userEmail' 
      }, { status: 400 })
    }

    // Try to connect to MongoDB
    const isConnected = await connectDB()
    
    if (!isConnected) {
      console.log('Using fallback products (MongoDB not available)')
      const newProduct = fallbackProductOperations.addProduct({
        title,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        category,
        brand,
        imageUrl,
        inStock: inStock !== undefined ? inStock : true,
        stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
        tags: tags || [],
        featured: featured || false
      }, userEmail)
      
      return NextResponse.json(newProduct, { status: 201 })
    }

    // Use MongoDB
    const newProduct = new Product({
      title,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      brand,
      imageUrl,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      tags: tags || [],
      featured: featured || false,
      createdBy: userEmail
    })

    const savedProduct = await newProduct.save()
    
    return NextResponse.json(savedProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    // Fallback to in-memory products
    try {
      const body = await request.json()
      const newProduct = fallbackProductOperations.addProduct({
        title: body.title,
        description: body.description,
        price: Number(body.price),
        originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
        category: body.category,
        brand: body.brand,
        imageUrl: body.imageUrl,
        inStock: body.inStock !== undefined ? body.inStock : true,
        stockQuantity: body.stockQuantity ? Number(body.stockQuantity) : 0,
        tags: body.tags || [],
        featured: body.featured || false
      }, body.userEmail)
      
      return NextResponse.json(newProduct, { status: 201 })
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
  }
}
