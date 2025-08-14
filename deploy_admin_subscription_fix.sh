#!/bin/bash

echo "Deploying admin subscription fix..."

# Add the missing admin subscription function
git add netlify/functions/admin-subscription.mjs
git add netlify.toml

# Commit
git commit -m "Fix admin subscription 500 errors with HTTP connection"

# Push 
git push https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/tsiemasilo/forexsignals.git main

echo "Admin subscription fix deployed!"