# Firebase Setup Instructions

This project now supports Firebase Authentication with Google sign-in/sign-up alongside NextAuth.

## Setup Steps:

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "my-ecommerce-app")
4. Follow the setup wizard

### 2. Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Google" as a sign-in provider
5. Add your domain (localhost:3000 for development)

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a name
5. Copy the Firebase configuration object

### 4. Update Environment Variables
Replace the values in `.env.local` with your actual Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
```

### 5. Configure Google OAuth (for both Firebase and NextAuth)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client IDs for:
   - Web application (for NextAuth)
   - Your Firebase app
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (NextAuth)
   - Your Firebase auth domain (Firebase)

### 6. Update NextAuth Google Configuration
Update your `.env.local` with Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Features Included:

### Authentication Options:
- ✅ **Email/Password Signup** (Firebase)
- ✅ **Google Sign-in/Sign-up** (Firebase)
- ✅ **NextAuth Google** (existing)
- ✅ **NextAuth Credentials** (existing - demo@example.com/password)

### UI Components:
- ✅ **Signup Page** (`/signup`) with email/password and Google options
- ✅ **Updated Login Page** with signup link
- ✅ **Updated Navbar** with signup button when logged out
- ✅ **Dual Authentication Support** (Firebase + NextAuth)

### How It Works:
1. **New Users**: Can sign up with email/password or Google via Firebase
2. **Existing Users**: Can continue using NextAuth (demo credentials still work)
3. **Google Users**: Can use either Firebase or NextAuth Google sign-in
4. **Hybrid Support**: The app detects which auth system is being used

## Testing:

### Test Firebase Auth:
1. Go to `/signup`
2. Create account with email/password
3. Or click "Sign up with Google"

### Test Existing NextAuth:
1. Go to `/login`
2. Use demo credentials: `demo@example.com` / `password`
3. Or use "Sign in with Google" (NextAuth)

## Production Deployment:

1. Update Firebase authorized domains with your production domain
2. Update Google OAuth redirect URIs with production URLs
3. Update `NEXTAUTH_URL` in environment variables
4. Ensure all environment variables are set in your hosting platform

## Security Notes:

- All Firebase config values with `NEXT_PUBLIC_` prefix are safe to expose
- Keep Google Client Secret secure and never expose it in frontend code
- Firebase automatically handles secure authentication flows
- NextAuth handles server-side authentication securely
