#!/bin/bash

# GitHub Update Commands - Trial Logic Fix
# Run these commands to push the trial access fixes to GitHub

echo "🔧 Starting GitHub update for trial logic fixes..."

# Navigate to project directory
cd /home/runner/workspace

# Add all changes
git add -A

# Commit with descriptive message
git commit -m "Fix: Complete trial access logic overhaul

- Fixed admin dropdown trial creation to set proper 7-day future end dates
- Enhanced updateUserSubscriptionStatus method for correct trial handling  
- Improved backend subscription validation to distinguish active trials from expired
- Eliminated conflicting subscription access checks blocking valid trials
- Optimized real-time refresh cycles to prevent loading interference
- Trial users now see signals immediately instead of upgrade prompts

All trial functionality working correctly - admin can create trials that work instantly"

# Push to GitHub using personal access token
git push https://tsiemasilo:${PERSONAL_ACCESS_TOKEN_FOREX}@github.com/tsiemasilo/forexsignals.git main

echo "✅ GitHub update completed!"
echo "🎯 Trial access fixes are now live on GitHub"