import { NextResponse } from 'next/server'
import connectDB from '../../../../lib/connectDB'
import Product from '../../../../models/Product'
import mongoose from 'mongoose'
import { fallbackProductOperations } from '../../../../lib/fallbackProducts'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    // Try to connect to MongoDB
    const isConnected = await connectDB()
    
    if (!isConnected) {
      console.log('Using fallback products (MongoDB not available)')
      const product = fallbackProductOperations.getProductById(id)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json(product)
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    
    const product = await Product.findById(id).lean()
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    
    // Fallback
    const { id } = await params
    const product = fallbackProductOperations.getProductById(id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
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
      const updatedProduct = fallbackProductOperations.updateProduct(id, {
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
      
      if (!updatedProduct) {
        return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
      }
      
      return NextResponse.json(updatedProduct)
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Check if the product exists and user has permission
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.createdBy !== userEmail) {
      return NextResponse.json({ error: 'Unauthorized to edit this product' }, { status: 403 })
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true, runValidators: true }
    ).lean()
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Try to connect to MongoDB
    const isConnected = await connectDB()
    
    if (!isConnected) {
      console.log('Using fallback products (MongoDB not available)')
      const deletedProduct = fallbackProductOperations.deleteProduct(id, userEmail)
      
      if (!deletedProduct) {
        return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
      }
      
      return NextResponse.json({ message: 'Product deleted successfully' })
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Check if the product exists and user has permission
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.createdBy !== userEmail) {
      return NextResponse.json({ error: 'Unauthorized to delete this product' }, { status: 403 })
    }

    await Product.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
