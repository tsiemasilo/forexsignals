#!/bin/bash

# Deploy Authentication Fix
echo "🔐 Deploying Authentication Fix..."

# Clean git state
rm -f .git/index.lock

# Add fixed authentication files
git add netlify/functions/login.mjs
git add AUTHENTICATION_FIXED.md
git add AUTHENTICATION_ISSUE_IDENTIFIED.md
git add check-live-console.mjs

# Commit changes
git commit -m "AUTH FIX: Resolved login 500 errors - removed non-existent password_hash column, subscription blocking will now work"

# Push to GitHub (triggers Netlify deployment)
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ Authentication fix deployed"
echo "🧪 After deployment:"
echo "1. Login as almeerahlosper@gmail.com / password123"
echo "2. Visit https://watchlistfx.netlify.app/"
echo "3. Should see 'Upgrade Your Plan' instead of signals"
echo "4. Check console for subscription validation logs"