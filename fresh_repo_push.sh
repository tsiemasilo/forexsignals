#!/bin/bash

echo "Creating fresh repository push..."

# Remove all git tracking
rm -rf .git

# Initialize fresh git repository
git init

# Configure git user
git config user.email "admin@forexsignals.com"
git config user.name "Forex Signals Admin"

# Add all current files (clean state)
git add .

# Create initial commit
git commit -m "Initial clean deployment with admin HTTP fixes"

# Add remote
git remote add origin https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/tsiemasilo/forexsignals.git

# Push as new main branch
git push -u origin main --force

echo "Fresh repository deployed!"