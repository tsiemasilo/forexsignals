#!/bin/bash

# Clean manual push with access token
echo "Manual push of admin fixes..."

# Add only the essential files
git add netlify/functions/admin-users-fixed.mjs
git add netlify.toml
git add CLEAN_DEPLOYMENT.md
git add CLEAN_PUSH.md

# Commit with clean message
git commit -m "Fix admin WebSocket errors with HTTP connections"

# Push with token authentication
git push https://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@github.com/tsiemasilo/forexsignals.git main

echo "Admin fixes deployed!"