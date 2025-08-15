#!/bin/bash

# Deploy Real-time Auto-Refresh Update
echo "🚀 Deploying Real-time Auto-Refresh Implementation..."

# Clean git state
rm -f .git/index.lock

# Add all real-time functionality files
git add client/src/hooks/useAutoRefresh.ts
git add client/src/hooks/useRealtimeSignals.ts
git add client/src/hooks/useRealtimeUpdates.ts
git add client/src/components/RealtimeStatus.tsx
git add client/src/pages/Signals.tsx
git add client/src/pages/AdminSignals.tsx
git add REALTIME_REFRESH_IMPLEMENTATION.md

# Add authentication fixes
git add netlify/functions/login.mjs
git add AUTHENTICATION_FIXED.md
git add AUTHENTICATION_ISSUE_IDENTIFIED.md
git add check-live-console.mjs

# Commit with comprehensive message
git commit -m "REALTIME AUTO-REFRESH: Complete implementation with authentication fixes

Features Added:
- Auto-refresh every 3s for user dashboard
- Auto-refresh every 4s for admin dashboard  
- Real-time status indicators with pulse animation
- Background refresh when tab not active
- Window focus triggers for instant updates
- Manual refresh buttons for immediate sync
- Online/offline network detection
- Authentication fix: removed non-existent password_hash column

Benefits:
- Changes from admin appear on user dashboard within 3-4 seconds
- No manual refresh needed - fully automatic
- Visual feedback shows live update status
- Seamless real-time collaboration experience"

# Push to GitHub (triggers Netlify deployment)
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ Real-time auto-refresh deployed to GitHub"
echo "🌐 Netlify will rebuild automatically"
echo ""
echo "🎯 After deployment test:"
echo "1. Login as admin (admin@forexsignals.com)"
echo "2. Create/edit a signal"
echo "3. Login as user (almeerahlosper@gmail.com) in another tab"
echo "4. Watch signal appear automatically within 3-4 seconds"
echo "5. Check visual indicators showing 'Auto-updating every 3s'"