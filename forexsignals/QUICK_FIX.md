# 🚨 IMMEDIATE FIX FOR 502 ERROR

## The Problem
Your login is failing with 502 error because `NETLIFY_DATABASE_URL` is not set in your Netlify dashboard.

## The Solution (Takes 2 Minutes)

### Step 1: Set Environment Variable
1. Go to: https://app.netlify.com/
2. Click your site "watchlistfx"  
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable**
5. Set:
   - **Key:** `NETLIFY_DATABASE_URL`
   - **Value:** `postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2: Redeploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait 2-3 minutes for deployment

### Step 3: Test
Visit: https://watchlistfx.netlify.app/.netlify/functions/test

This should show:
```json
{
  "message": "Netlify function is working",
  "environment": {
    "hasNetlifyDb": true,
    "hasRegularDb": false,
    "nodeVersion": "v20.x.x",
    "timestamp": "2025-08-14T..."
  }
}
```

If `hasNetlifyDb` is `true`, your login will work.

## Why This Happens
- Netlify functions need environment variables to be explicitly set
- Without the database URL, the session store can't initialize
- This causes the entire authentication system to fail with 502

## Alternative Quick Fix
You can also set `DATABASE_URL` instead of `NETLIFY_DATABASE_URL` (same value) - the code checks for both.