import { NextResponse } from 'next/server'
import { getProductById, updateProduct, deleteProduct } from '../../../../lib/products'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const product = getProductById(id)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, category, imageUrl, userEmail } = body

    if (!name || !description || !price || !category || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updatedProduct = updateProduct(id, { name, description, price, category, imageUrl }, userEmail)
    
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
    }
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
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

    const deletedProduct = deleteProduct(id, userEmail)
    
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
