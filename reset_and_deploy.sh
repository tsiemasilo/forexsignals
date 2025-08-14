#!/bin/bash

echo "Resetting git history and deploying clean..."

# Remove git locks
rm -f .git/config.lock
rm -f .git/index.lock

# Reset to a commit before all the token issues (go back further)
git reset --hard HEAD~15

# Add only the essential admin function files
git add netlify/functions/admin-users-fixed.mjs
git add netlify.toml
git add FINAL_DEPLOYMENT.md

# Create a completely clean commit
git commit -m "Admin WebSocket fix with HTTP connections"

# Force push to overwrite the problematic history
git push https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/tsiemasilo/forexsignals.git main --force

echo "Clean deployment completed!"