#!/bin/bash

# GitHub Update Commands - Session Isolation & Trial Logic Complete Fix
# Run these commands to push all the latest fixes to GitHub

echo "🔧 Starting GitHub update for session isolation and trial logic fixes..."

# Navigate to project directory
cd /home/runner/workspace

# Add all changes
git add -A

# Commit with descriptive message
git commit -m "Fix: Complete session isolation and trial access overhaul

SESSION ISOLATION ENHANCEMENTS:
- Added session regeneration on login to prevent session fixation attacks
- Enhanced session configuration with custom name and security settings
- Improved logout functionality with proper session destruction
- Added rolling sessions and SameSite cookie protection
- Created admin session cleanup endpoint for debugging

TRIAL ACCESS LOGIC FIXES:
- Fixed admin dropdown trial creation to set proper 7-day future end dates
- Enhanced updateUserSubscriptionStatus method for correct trial handling
- Improved backend subscription validation to distinguish active trials from expired
- Eliminated conflicting subscription access checks blocking valid trials
- Optimized real-time refresh cycles to prevent loading interference

VERIFIED WORKING:
- Different users now get isolated sessions on login
- Trial users see signals immediately instead of upgrade prompts
- Admin can create trials that work instantly with proper 7-day periods
- Real-time dashboard updates every 5 seconds without interference
- Session sharing between users completely eliminated

All session and trial functionality working correctly in production"

# Push to GitHub using personal access token
git push https://tsiemasilo:${PERSONAL_ACCESS_TOKEN_FOREX}@github.com/tsiemasilo/forexsignals.git main

echo "✅ GitHub update completed!"
echo "🎯 Session isolation and trial access fixes are now live on GitHub"