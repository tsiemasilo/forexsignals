#!/bin/bash

# Deploy Enhanced Subscription Access Debugging
echo "🔍 Deploying Subscription Access Control Debugging..."

# Clean git state
rm -f .git/index.lock

# Add enhanced debugging files
git add netlify/functions/signals.mjs
git add client/src/pages/Signals.tsx
git add test-subscription-access.mjs
git add SUBSCRIPTION_DEBUG_STATUS.md

# Commit changes
git commit -m "SUBSCRIPTION DEBUG: Enhanced logging for expired user access control - Almeerah user expired, should show upgrade prompt"

# Push to GitHub (triggers Netlify deployment)
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ Subscription debugging deployed"
echo "🧪 Test Steps:"
echo "1. Login as almeerahlosper@gmail.com"
echo "2. Visit https://watchlistfx.netlify.app/"
echo "3. Check console for subscription validation logs"
echo "4. Verify upgrade prompt appears instead of signals"