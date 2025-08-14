#!/bin/bash

echo "Deploying admin function fixes to GitHub..."

# Configure git to use token authentication
git config --global credential.helper store
echo "https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com" > ~/.git-credentials

# Set remote with token
git remote set-url origin https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/tsiemasilo/forexsignals.git

# Add the essential admin fix files
git add netlify/functions/admin-users-fixed.mjs
git add netlify.toml  
git add TOKEN_CLEANUP_COMPLETE.md
git add deploy_admin_fixes.sh

# Commit with clean message
git commit -m "Fix admin WebSocket errors with HTTP database connections"

# Push without password prompt
git push origin main

echo "Admin fixes deployed successfully!"