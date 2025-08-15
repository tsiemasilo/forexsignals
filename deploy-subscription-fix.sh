#!/bin/bash

echo "🚀 Deploying Subscription Access Fix to Netlify..."

# The issue: Live Netlify site showing signals to inactive users
# The fix: Deploy updated netlify functions with strict access control

# Add updated functions and trial fix
git add netlify/functions/signals.mjs
git add netlify/functions/user-subscription-status.mjs
git add client/src/pages/Signals.tsx
git add FREE_TRIAL_LOGIC_FIX.md

# Commit subscription fix
git commit -m "FREE TRIAL ACCESS FIX: Proper trial period handling

Critical Fixes:
1. TRIAL LOGIC: Users with active trial days see signals, not upgrade prompt
2. SUBSCRIPTION BLOCKING: Only expired/inactive users see upgrade prompt  
3. ENHANCED FRONTEND: Added subscription status check before showing upgrade
4. PROPER BEHAVIOR: Trial users access signals until days reach 0

Frontend Changes:
- Enhanced Signals.tsx with subscription status validation
- Added trial access debug logging
- Fixed immediate upgrade prompt for fresh trial users

Expected Result:
- Free trial: 7 days of signal access, then upgrade prompt
- Active subscription: Signal access until expiry
- Inactive users: Immediate upgrade prompt"

# Push to trigger Netlify deployment
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ Subscription fix deployed - inactive users will now be blocked"
echo "🔄 Netlify rebuilding automatically"
echo ""
echo "📋 After deployment:"
echo "1. Free trial users see signals during their 7-day trial"
echo "2. Upgrade prompt only shows when trial expires (0 days left)"
echo "3. Inactive/expired users see upgrade prompt immediately"
echo "4. Active subscribers see signals normally"
echo "5. Admin access remains unrestricted"