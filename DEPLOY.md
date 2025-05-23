
# Deploying to Netlify

This document provides step-by-step instructions for deploying this B&D Apartments Finance Tracker application to Netlify.

## Prerequisites

1. Your project code is in a GitHub repository
2. You have a Netlify account (sign up at [netlify.com](https://netlify.com) if needed)

## Deployment Steps

### 1. Connect to Netlify

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Select "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the repository containing this project

### 2. Configure Build Settings

The included `netlify.toml` file should automatically configure your build settings, but verify they match:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18 (or your preferred version)

### 3. Set Environment Variables

1. Go to Site settings > Environment variables
2. Add the following required environment variables:

   **Supabase Configuration:**
   - VITE_SUPABASE_URL: `https://ywtzpsycgasomyvznwpp.supabase.co`
   - VITE_SUPABASE_ANON_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dHpwc3ljZ2Fzb215dnpud3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzExNTMsImV4cCI6MjA2MzQ0NzE1M30.-xBPsgl2kC_z526UXkKQetyqckbO5_WPctS5PGyuQRs`

   **Firebase Configuration (if used):**
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
   - VITE_FIREBASE_MEASUREMENT_ID

### 4. Deploy Your Site

1. Click "Deploy site"
2. Netlify will build your application and deploy it
3. Once deployed, Netlify will provide a URL where your site is accessible

### 5. Set Up Continuous Deployment

Continuous deployment is enabled by default. Whenever you push changes to your connected GitHub repository, Netlify will automatically rebuild and deploy your site.

### 6. Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to connect your domain

### 7. Post-Deployment Verification

1. Test all routes in your application
2. Verify authentication works properly
3. Test any API integrations or data functionality

## Troubleshooting

If you encounter issues with the client-side routing (404 errors when refreshing on routes), check that:

1. The `_redirects` file exists in the `public` directory
2. The `netlify.toml` file has the correct redirects configuration

For authentication issues, verify that your environment variables are set correctly in Netlify.
