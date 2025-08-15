#!/bin/bash

echo "🚀 Deploying Individual Signal Support Fix to Production..."
echo "⏰ Started at: $(date)"

# GitHub token check
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN environment variable not set"
    exit 1
fi

# Set up GitHub credentials
REMOTE_URL="https://tsiemasilo:$GITHUB_TOKEN@github.com/tsiemasilo/forexsignals.git"

echo "📝 Preparing deployment files..."

# Add all updated files
git add .

# Commit with detailed message
git commit -m "INDIVIDUAL SIGNAL ENDPOINT FIX: Complete signal details page support

✅ Fixed Netlify signals.mjs to handle both:
   - GET /api/signals (all signals)  
   - GET /api/signals/:id (individual signal)

✅ Enhanced SignalDetails.tsx with proper TypeScript typing:
   - Added Signal interface with optional properties
   - Fixed all property access with optional chaining
   - Type-safe image URL array handling

✅ Production-ready individual signal support:
   - Proper path parsing for signal ID extraction
   - Database query optimization for single signals
   - Enhanced error handling and logging
   - Safe JSON parsing for image URLs

✅ Signal details page now fully functional:
   - Displays individual signal content
   - Shows trading analysis and charts
   - Proper date formatting with fallbacks
   - Image gallery with click-to-enlarge

🎯 Ready for immediate production deployment"

# Push to GitHub
echo "📤 Pushing to GitHub repository..."
git push "$REMOTE_URL" main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Production deployment will auto-update on Netlify"
    echo "🔗 Live site: https://watchlistfx.netlify.app"
    echo ""
    echo "🧪 Test individual signal access:"
    echo "   - Navigate to any signal from the dashboard"
    echo "   - Click 'View Details' to see individual signal page"
    echo "   - URL format: /signal/:id (e.g., /signal/1)"
    echo ""
    echo "⏰ Completed at: $(date)"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi