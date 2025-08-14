# Manual GitHub Update - Admin Functions Fix

Since the access token was revoked, here's how to manually update GitHub:

## Option 1: Use Git with your GitHub credentials
```bash
git remote set-url origin https://github.com/tsiemasilo/forexsignals.git
git push origin main
```
(This will prompt for your GitHub username and password/token)

## Option 2: Files to Upload via GitHub Web Interface

If git push doesn't work, manually upload these files via github.com:

### 1. netlify/functions/admin-users-fixed.mjs
- Navigate to netlify/functions/ folder
- Upload the admin-users-fixed.mjs file
- This contains the HTTP connection fix for admin users

### 2. Updated netlify.toml
- Replace the admin routing section with:
```
[[redirects]]
  from = "/api/admin/users"
  to = "/.netlify/functions/admin-users-fixed"
  status = 200
```

## Key Files Fixed:
- ✅ admin-users-fixed.mjs - HTTP connection (no WebSocket errors)
- ✅ admin-signals.mjs - Database connection (real data)  
- ✅ netlify.toml - Correct routing
- ✅ signals-fixed.mjs - Correct database schema

## Expected Result:
- Admin users will load without WebSocket errors
- Admin signals will show actual database records
- All admin functions work on Netlify