import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connections[0].readyState) {
      console.log('MongoDB already connected')
      return true
    }

    // Check if MongoDB URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    console.log('Connecting to MongoDB...')
    
    const { connection } = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'ecommerce',
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })

    console.log(`MongoDB Connected: ${connection.host}`)
    return true
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message)
    
    // More specific error messages
    if (error.message.includes('IP')) {
      console.error('IP WHITELIST ERROR: Please add your IP address to MongoDB Atlas Network Access')
      console.error('1. Go to MongoDB Atlas Dashboard')
      console.error('2. Click Network Access')
      console.error('3. Add IP Address -> Allow Access from Anywhere (0.0.0.0/0)')
    }
    
    return false
  }
}

export default connectDB
