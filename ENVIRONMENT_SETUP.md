# 🔧 Environment Setup for Netlify Deployment

## Critical Issue: 502 Bad Gateway Error

Your login is failing because the required environment variables are not configured in Netlify.

## 🚨 IMMEDIATE ACTION REQUIRED

### Step 1: Set Environment Variables in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com/
2. Click on your site "watchlistfx"
3. Go to **Site settings** → **Environment variables**
4. Add these variables:

```
Variable Name: NETLIFY_DATABASE_URL
Value: postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

```
Variable Name: OZOW_SITE_CODE
Value: [Your Ozow site code from dashboard]
```

```
Variable Name: OZOW_PRIVATE_KEY
Value: [Your Ozow private key from dashboard]
```

### Step 2: Redeploy the Site

After setting the environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

## 🔍 Why This Fixes the Issue

- The 502 error occurs because the Netlify function can't connect to the database
- Without `NETLIFY_DATABASE_URL`, the session store fails to initialize
- This breaks the entire authentication system

## ✅ Expected Result

After setting the environment variables and redeploying:
- Login should work without 502 errors
- Users can access their accounts
- Payment system will function properly

## 🔧 Alternative Quick Test

If you want to test immediately, you can also:
1. Set `DATABASE_URL` instead of `NETLIFY_DATABASE_URL` (same value)
2. This will work as the code checks for both variables