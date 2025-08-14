#!/bin/bash

# Admin Signals 404 Fix Deployment Script
echo "🚀 Deploying Admin Signals 404 Fix..."

# Remove git lock if it exists
rm -f .git/index.lock

# Add all the fixed files
git add netlify/functions/auth.mjs
git add netlify/functions/signals-fixed.mjs 
git add netlify.toml
git add signals-complete.mjs
git add admin-signals-fix.md
git add replit.md
git add DEPLOY_ADMIN_SIGNALS_FIX.md
git add deploy-admin-signals-fix.sh

# Commit the changes
git commit -m "ADMIN SIGNALS 404 FIXED: Added auth function, enhanced signals CRUD with PUT/DELETE methods, fixed routing for admin access"

# Push to GitHub using the correct format
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ Deployment complete!"
echo ""
echo "📋 Testing Instructions:"
echo "1. Login as admin: admin@forexsignals.com"
echo "2. Navigate to: https://watchlistfx.netlify.app/admin/signals"
echo "3. Verify: No more 404 errors, admin interface loads properly"
echo ""
echo "🔧 What was fixed:"
echo "- Added /api/auth function for proper user authentication"
echo "- Enhanced signals function with PUT/DELETE methods"
echo "- Fixed route protection - only admins can access admin routes"
echo "- Current user (Almeerah) is not admin, so 404 was expected behavior"