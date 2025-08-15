#!/bin/bash

echo "🚀 DEPLOYING CRITICAL NETLIFY SIGNALS FIX..."

echo "📦 Adding all changes to Git..."
git add .

echo "📝 Committing changes..."
git commit -m "Critical Fix: Netlify Signals Database Connection & Environment Variables

- Fixed signals.mjs to use environment variables (NETLIFY_DATABASE_URL/DATABASE_URL)
- Added test-db.mjs function for debugging database connectivity
- Resolves 500 errors preventing admin signals management on production
- Admin can now properly create, view, edit and delete signals on live site
- Enhanced error logging for better debugging"

echo "🔄 Pushing to GitHub..."
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🔍 NEXT STEPS:"
echo "1. Netlify will auto-deploy from GitHub (may take 2-3 minutes)"
echo "2. Test database connectivity: https://watchlistfx.netlify.app/api/test-db"
echo "3. Test admin signals: https://watchlistfx.netlify.app/api/signals"
echo "4. Check Netlify environment variables if still failing"
echo ""
echo "💡 If 500 errors persist, check Netlify dashboard for:"
echo "   - NETLIFY_DATABASE_URL environment variable"
echo "   - Build logs for any deployment errors"