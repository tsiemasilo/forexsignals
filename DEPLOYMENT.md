# Watchlist Fx - Netlify Deployment Guide

## Quick Setup Instructions

### 1. Push to GitHub Repository
Since Git operations are restricted in Replit, you'll need to manually push this code to your GitHub repository:

1. Download this entire project as a ZIP file from Replit
2. Extract it to your local machine
3. Navigate to the project directory in your terminal
4. Run these commands:

```bash
git init
git add .
git commit -m "Initial commit: Watchlist Fx trading signals platform"
git remote add origin https://github.com/tsiemasilo/forexsignals.git
git push -u origin main
```

### 2. Deploy to Netlify

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and select your `forexsignals` repository
4. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
   - **Node version**: `20`

### 3. Environment Variables

Add these environment variables in Netlify dashboard (Site settings → Environment variables):

**Required:**
- `DATABASE_URL` - Your PostgreSQL database connection string
- `OZOW_SITE_CODE` - Your Ozow payment gateway site code
- `OZOW_PRIVATE_KEY` - Your Ozow private key

**Optional (if using additional features):**
- `GITHUB_TOKEN` - For any GitHub integrations

### 4. Database Setup

This project uses PostgreSQL. You can use:
- **Neon** (recommended): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app

Get your connection string and add it as `DATABASE_URL` in Netlify.

### 5. Post-Deployment

After successful deployment:
1. The site will be available at your Netlify URL (e.g., `https://watchlist-fx-123456.netlify.app`)
2. Test the login/signup functionality
3. Test payment integration with Ozow
4. Verify signal creation and viewing works properly

## Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and schemas
- `netlify/` - Netlify Functions configuration
- `netlify.toml` - Netlify deployment configuration

## Features

✅ **Complete Trading Signals Platform:**
- User authentication with trial accounts
- Admin dashboard for signal management
- Multiple image upload support for charts
- Ozow payment integration (South African market)
- Responsive mobile-first design
- PostgreSQL database with session management

✅ **Recent Updates:**
- Brand updated to "Watchlist Fx"
- Multiple image support for trading signals
- Enhanced SignalDetails page without risk disclaimer
- Fixed date display issues
- Improved admin interface for signal management

## Support

If you encounter any issues during deployment, check:
1. Netlify build logs for error details
2. Environment variables are correctly set
3. Database connection is working
4. Domain DNS settings (if using custom domain)

The application is fully configured for production deployment with proper error handling and security measures.