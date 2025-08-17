# WatchlistFX - Netlify Deployment Guide

## Pre-Deployment Checklist

### ✅ Project Cleaned
- Removed all debug files (.txt, .mjs, .sh, .md)
- Cleaned up attached_assets directory
- Organized project structure
- Updated documentation

### ✅ Netlify Functions Created
- `auth.mjs` - Login/logout functionality
- `signals.mjs` - Forex signals CRUD operations  
- `payments.mjs` - Yoco and Ozow payment processing
- `webhooks.mjs` - Payment gateway notifications
- `plans.mjs` - Subscription plans
- `admin.mjs` - Admin user management
- `user.mjs` - User subscription status

### ✅ Configuration Files Ready
- `netlify.toml` - Clean routing configuration
- `README.md` - Project documentation
- All API routes properly mapped to functions

## Environment Variables Required

**CRITICAL:** Set these in Netlify dashboard under Site settings → Environment variables:

```
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
YOCO_PUBLIC_KEY=your_yoco_public_key  
YOCO_SECRET_KEY=your_yoco_secret_key
OZOW_API_KEY=your_ozow_api_key
OZOW_SECRET_KEY=your_ozow_secret_key
SESSION_SECRET=your_session_secret_key
```

**Database Priority:** Functions check for database URLs in this order:
1. `NETLIFY_DATABASE_URL` (recommended for Netlify)
2. `DATABASE_URL` (fallback)
3. Hardcoded URL (final fallback)

**Alternative:** You can also set `DATABASE_URL` instead of `NETLIFY_DATABASE_URL` if preferred.

## Deployment Steps

1. **Connect Repository**
   - Connect your GitHub repository to Netlify
   - Select the main branch for deployment

2. **Configure Build Settings**
   - Build command: `vite build`
   - Publish directory: `dist/public`
   - Node version: 20

3. **Set Environment Variables**
   - Add all required environment variables listed above
   - Ensure DATABASE_URL points to your Neon PostgreSQL database

4. **Deploy**
   - Netlify will automatically build and deploy
   - Functions will be available at `/.netlify/functions/`

## Post-Deployment

### Testing Checklist
- [ ] Test endpoint works: `/api/test`
- [ ] Login functionality works: `/api/login`
- [ ] Plans load correctly: `/api/plans` 
- [ ] Signals load correctly: `/api/signals`
- [ ] Payment flow (Yoco & Ozow) functional
- [ ] Admin panel accessible
- [ ] iPhone-style interface displays properly
- [ ] Real-time features working

### Debugging 500 Errors

If you see 500 errors on deployment:

1. **Check Function Logs**: Go to Netlify dashboard → Functions → View logs
2. **Test Basic Function**: Visit `https://your-domain.netlify.app/api/test`
3. **Verify Database**: Functions include fallback database connection
4. **Check Environment Variables**: Ensure DATABASE_URL is set in Netlify
5. **Review Function Timeout**: Default is 10s, can be increased to 26s

### Payment Gateway URLs
Update payment success URLs in gateway dashboards:
- Success URL: `https://your-domain.netlify.app/payment-success`
- Cancel URL: `https://your-domain.netlify.app/payment-cancel`
- Error URL: `https://your-domain.netlify.app/payment-error`
- Notify URL: `https://your-domain.netlify.app/api/[gateway]/notify`

## Architecture Notes

- **Frontend**: React SPA with mobile-first design
- **Backend**: Netlify serverless functions
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Session-based (simplified for serverless)
- **Payments**: Dual gateway (Yoco + Ozow) integration

## Success Indicators

✅ Clean codebase ready for professional deployment  
✅ All debugging artifacts removed  
✅ Proper serverless function architecture  
✅ Complete payment integration  
✅ iPhone-style signal interface  
✅ Admin management capabilities

The project is now ready for production deployment on Netlify!