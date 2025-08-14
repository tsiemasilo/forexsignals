# Netlify Environment Variables Setup

## Required Environment Variables

Set these in your Netlify dashboard under **Site settings → Environment variables**:

### Database Configuration
```
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Payment Gateway (Ozow)
```
OZOW_SITE_CODE=your_ozow_site_code_here
OZOW_PRIVATE_KEY=your_ozow_private_key_here
```

## Database Connection Logic

The application now supports both environments:
- **Replit Development**: Uses `DATABASE_URL`
- **Netlify Production**: Uses `NETLIFY_DATABASE_URL`

## Quick Deployment Steps

1. **Set Environment Variables** in Netlify dashboard
2. **Trigger New Deployment** 
3. **Verify Connection** - check build logs for successful database connection

## Database Status

Your new Neon database contains:
- ✅ 3 Real Users (including admin and customers)
- ✅ 3 Subscription Plans (Basic R49.99, Premium R99.99, VIP R179.99)
- ✅ 4 Trading Signals (all authentic signals from previous database)
- ✅ 1 Active Subscription (Almeerah - Premium trial, 13 days remaining)

The application will automatically connect to the correct database based on the environment.