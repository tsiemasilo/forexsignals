#!/bin/bash

echo "Deploying admin function fixes to GitHub..."

# Add the essential admin fix files
git add netlify/functions/admin-users-fixed.mjs
git add netlify.toml  
git add TOKEN_CLEANUP_COMPLETE.md

# Commit with clean message
git commit -m "Fix admin WebSocket errors with HTTP database connections"

# Push using environment token
git push https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/tsiemasilo/forexsignals.git main

echo "Admin fixes deployed successfully!"