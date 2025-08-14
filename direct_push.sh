#!/bin/bash

echo "Direct push without password prompt..."

# Set git credential helper to skip prompts
git config credential.helper '!f() { echo "username=token"; echo "password=$GITHUB_PERSONAL_ACCESS_TOKEN"; }; f'

# Add files
git add netlify/functions/admin-subscription.mjs netlify.toml deploy_admin_subscription_fix.sh

# Commit
git commit -m "Fix admin subscription 500 errors with HTTP connection"

# Push directly
git push origin main

echo "Push completed!"