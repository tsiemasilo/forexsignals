#!/bin/bash

echo "🚀 Deploying Subscription Access Fix to Netlify..."

# The issue: Live Netlify site showing signals to inactive users
# The fix: Deploy updated netlify functions with strict access control

# Add updated functions
git add netlify/functions/signals.mjs
git add netlify/functions/user-subscription-status.mjs

# Commit subscription fix
git commit -m "SUBSCRIPTION ACCESS FIX: Block inactive users from viewing signals

Critical Fix:
- Inactive users on live site were still seeing signals
- Added strict subscription validation to signals.mjs
- Only active subscribers and admins can view signals
- Returns 403 error for inactive/expired users
- Ensures proper upgrade prompt display"

# Push to trigger Netlify deployment
git push origin main

echo "✅ Subscription fix deployed - inactive users will now be blocked"
echo "🔄 Netlify rebuilding automatically"
echo ""
echo "📋 After deployment:"
echo "1. Inactive users will see upgrade prompt"
echo "2. Only active subscribers see signals"
echo "3. Admin access remains unrestricted"