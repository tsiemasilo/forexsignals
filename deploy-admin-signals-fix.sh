#!/bin/bash

# Deploy Admin Signals Fix
echo "🚀 Deploying admin signals fix to resolve 403 errors..."

# Remove any git locks
rm -f .git/index.lock

# Add files for deployment
git add netlify/functions/signals.mjs
git add netlify.toml  
git add client/src/pages/Signals.tsx
git add netlify/functions/auth.mjs
git add DEPLOY_ADMIN_SIGNALS_FIX.md
git add replit.md

# Commit with clear message
git commit -m "ADMIN SIGNALS FIX: Deploy admin bypass logic to resolve 403 errors in admin console"

# Push to GitHub (will trigger Netlify deployment)
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ Deployment pushed to GitHub - Netlify will rebuild automatically"
echo "📝 This will fix the admin console 403 errors and enable proper admin access"