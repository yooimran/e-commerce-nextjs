# MongoDB Setup Guide for E-commerce Application

## Prerequisites
1. MongoDB Atlas account (free tier available)
2. Vercel account for deployment

## Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project
4. Build a database (Choose FREE M0 Sandbox)
5. Choose a cloud provider and region
6. Create cluster

## Step 2: Configure Database Access

1. **Database Access**: Create a database user
   - Username: `ecommerce-user` (or your choice)
   - Password: Generate a secure password
   - Database User Privileges: Read and write to any database

2. **Network Access**: Add IP addresses
   - Add `0.0.0.0/0` for all IPs (for development/deployment)
   - Or add your specific IP address

## Step 3: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string

It should look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 4: Update Environment Variables

### Local Development (.env.local)
```bash
MONGODB_URI=mongodb+srv://ecommerce-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
```

### Vercel Deployment
Add the same MONGODB_URI environment variable to your Vercel project:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add:
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://ecommerce-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority`
   - Environment: Production, Preview, Development

## Step 5: Database Collections

The application will automatically create these collections:
- `products` - Store all product information
- `orders` - Store order information (if implemented)
- `users` - Store user preferences (if implemented)

## Step 6: Testing Connection

1. Start your development server: `npm run dev`
2. Try adding a product through the dashboard
3. Check MongoDB Atlas Data Browser to see the data

## Sample Product Document Structure

```json
{
  "_id": "ObjectId",
  "title": "Wireless Bluetooth Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 99.99,
  "originalPrice": 149.99,
  "category": "Electronics",
  "brand": "TechBrand",
  "imageUrl": "https://example.com/headphones.jpg",
  "inStock": true,
  "stockQuantity": 50,
  "tags": ["wireless", "bluetooth", "headphones", "audio"],
  "rating": 0,
  "reviews": 0,
  "featured": false,
  "createdBy": "user@example.com",
  "createdAt": "2025-08-27T...",
  "updatedAt": "2025-08-27T..."
}
```

## Security Best Practices

1. **Never commit your connection string** to version control
2. **Use environment variables** for all sensitive data
3. **Create specific database users** with minimal required permissions
4. **Regularly rotate passwords**
5. **Monitor database access** through MongoDB Atlas

## Troubleshooting

### Common Issues:

1. **Connection timeout**: Check network access settings in MongoDB Atlas
2. **Authentication failed**: Verify username/password in connection string
3. **Database not found**: MongoDB will create the database on first write operation
4. **Local vs Production**: Ensure environment variables are set in both environments

### Debug Connection:
```javascript
// Add this to your API route for debugging
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
```

## Next Steps

1. Set up your MongoDB Atlas cluster
2. Update your `.env.local` file with the connection string
3. Add the environment variable to Vercel
4. Test by adding a product
5. Deploy to Vercel

Your e-commerce application is now connected to MongoDB and ready for production use!
