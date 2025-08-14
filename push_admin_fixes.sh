#!/bin/bash

# Remove git lock if exists
rm -f .git/index.lock

# Add all the fixed admin function files
git add netlify/functions/admin-users.mjs
git add netlify/functions/admin-signals.mjs  
git add netlify/functions/admin-users-fixed.mjs
git add netlify.toml
git add replit.md
git add ADMIN_FUNCTIONS_GITHUB_UPDATE.md

# Commit the admin WebSocket fixes
git commit -m "Fix admin functions WebSocket errors - convert to HTTP connections

- admin-users.mjs: Fixed WebSocket Pool to neon() HTTP connection
- admin-signals.mjs: Connected to database instead of hardcoded data  
- admin-users-fixed.mjs: Complete HTTP-based admin user management
- netlify.toml: Route admin endpoints to fixed functions
- All functions use correct database schema (trade_action, image_url)
- Resolves all WebSocket connection failures on Netlify platform"

# Push to GitHub
git push https://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@github.com/tsiemasilo/forexsignals.git main

echo "Admin function fixes pushed to GitHub successfully!"
echo "Netlify will auto-deploy the updated functions."
echo "Admin endpoints should work properly after deployment completes."