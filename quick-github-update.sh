#!/bin/bash

# Quick GitHub Update Script
# Run this from /home/runner/workspace

echo "🚀 Quick GitHub Update for Watchlist Fx"
echo "======================================"

# Clean any git locks
echo "🧹 Cleaning git locks..."
rm -f .git/index.lock .git/config.lock 2>/dev/null

# Check if remote exists, add if needed
echo "🔗 Setting up GitHub remote..."
git remote -v | grep origin || git remote add origin https://github.com/tsiemasilo/forexsignals.git

# Stage all changes
echo "📁 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Update Netlify functions with database connection fixes

- Fixed WebSocket errors by switching to HTTP pooling
- Added login-redirect function for proper routing
- Updated emergency-login to handle GET and POST requests  
- All authentication and database issues resolved
- Live deployment: https://watchlistfx.netlify.app/"

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo "✅ GitHub update completed!"
echo "🌐 Repository: https://github.com/tsiemasilo/forexsignals"
echo "🚀 Live site: https://watchlistfx.netlify.app/"