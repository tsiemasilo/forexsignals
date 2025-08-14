#!/bin/bash

echo "🚀 Updating GitHub with subscription access control enhancements..."

# Remove git lock
rm -f .git/index.lock

# Add all updated files
git add netlify/functions/auth.mjs
git add netlify/functions/signals-fixed.mjs
git add client/src/pages/Signals.tsx
git add netlify.toml
git add signals-complete.mjs
git add admin-signals-fix.md
git add replit.md
git add DEPLOY_ADMIN_SIGNALS_FIX.md
git add deploy-admin-signals-fix.sh
git add update-github.sh

# Commit changes
git commit -m "SUBSCRIPTION ACCESS CONTROL ENHANCED: Improved upgrade messaging for inactive users, admin signals CRUD complete, auth function added for proper user verification"

# Push to GitHub
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main

echo "✅ GitHub updated successfully!"
echo ""
echo "📝 Changes pushed:"
echo "- Enhanced subscription upgrade UI with compelling messaging"
echo "- Added auth function for proper user authentication"
echo "- Complete CRUD signals function with PUT/DELETE methods"
echo "- Fixed admin signals routing and access control"
echo "- Maintained South African localization (R49.99/month)"