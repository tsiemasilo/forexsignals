#!/bin/bash

echo "Simple GitHub deployment..."

# Clean up any locks
rm -f .git/config.lock
rm -f .git/index.lock

# Add files
git add netlify/functions/admin-users-fixed.mjs
git add netlify.toml  
git add TOKEN_CLEANUP_COMPLETE.md
git add deploy_admin_fixes.sh

# Commit
git commit -m "Fix admin WebSocket errors with HTTP database connections"

# Push directly with token in URL
git push https://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@github.com/tsiemasilo/forexsignals.git main

echo "Deployment complete!"