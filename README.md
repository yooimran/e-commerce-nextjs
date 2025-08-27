# Next.js 15 E-Commerce Application

A full-featured e-commerce application built with Next.js 15 (App Router), NextAuth.js, and Tailwind CSS.

## Features

### Core Pages
- **Landing Page (/)**: Hero section, product highlights, navbar, and footer
- **Login Page (/login)**: Authentication with NextAuth.js (Google + Credentials)
- **Products Page (/products)**: Browse all products with details
- **Product Details (/products/[id])**: Individual product information
- **Add Product (/dashboard/add-product)**: Protected page for adding new products

### Authentication
- NextAuth.js integration with Google OAuth and Credentials provider
- Protected routes with middleware
- Session management

### Technologies
- Next.js 15 (App Router)
- NextAuth.js for authentication
- Tailwind CSS for styling
- React Hot Toast for notifications
- API Routes for backend functionality

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd e-commerce
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

For testing purposes, you can use these credentials:
- **Email**: demo@example.com
- **Password**: password

## API Endpoints

### Products API
- `GET /api/products` - Fetch all products
- `POST /api/products` - Create a new product (requires authentication)
- `GET /api/products/[id]` - Fetch specific product by ID

### Authentication API
- `/api/auth/[...nextauth]` - NextAuth.js authentication endpoints

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── products/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── SessionProvider.js
│   ├── dashboard/
│   │   └── add-product/
│   ├── login/
│   ├── products/
│   │   └── [id]/
│   ├── globals.css
│   ├── layout.js
│   ├── not-found.js
│   └── page.js
├── middleware.js
└── .env.local
```

## Features in Detail

### Authentication Flow
1. Users can sign in using Google OAuth or credentials
2. Protected routes automatically redirect to login page
3. Successful login redirects to products page
4. Session management with NextAuth.js

### Product Management
- View all products in a responsive grid layout
- Detailed product pages with full descriptions
- Add new products (authenticated users only)
- Real-time toast notifications for actions

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation and layouts
- Optimized for all screen sizes

## Development

### Adding New Features
1. Create new pages in the `src/app` directory
2. Add API routes in `src/app/api`
3. Use middleware for route protection
4. Follow the existing component structure

### Styling
- Uses Tailwind CSS for styling
- Custom utilities in `globals.css`
- Consistent color scheme and spacing

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start
```

3. Update environment variables for production:
   - Set proper `NEXTAUTH_URL`
   - Use strong `NEXTAUTH_SECRET`
   - Configure production OAuth credentials

## License

This project is for educational purposes and demonstration of Next.js 15 features.
