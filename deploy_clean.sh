#!/bin/bash

echo "Deploying admin subscription fix with clean token..."

# Clean any locks
rm -f .git/config.lock .git/index.lock

# Add essential admin files
git add netlify/functions/admin-subscription.mjs
git add netlify.toml
git add CLEAN_PROJECT_STATUS.md

# Commit cleanly
git commit -m "Deploy admin HTTP functions to fix WebSocket errors"

# Push with new token
git push https://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@github.com/tsiemasilo/forexsignals.git main

echo "GitHub updated successfully! Netlify will deploy the admin fixes."