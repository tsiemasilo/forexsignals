#!/bin/bash

# Deploy Enhanced Frontend Debugging to Netlify
echo "🚀 Deploying Enhanced Frontend Debugging..."

# Check if git token is available
if [ -z "$PERSONAL_ACCESS_TOKEN_FOREX" ]; then
    echo "❌ Error: GitHub token not found"
    exit 1
fi

# Clean git state
rm -f .git/index.lock

# Add files with debugging enhancements
git add client/src/pages/AdminSignals.tsx
git add netlify/functions/signals.mjs  
git add signals-complete.mjs

# Commit changes
git commit -m "FRONTEND DEBUG: Enhanced debugging for live admin signal publishing - API working, frontend issue isolated"

# Push to GitHub (triggers Netlify deployment)
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ Deployment initiated - Netlify will rebuild with enhanced debugging"
echo "🔍 After deployment, try publishing a signal and check browser console for detailed logs"