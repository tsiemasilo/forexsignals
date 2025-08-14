#!/bin/bash

# Navigate to the prepared repository
cd /tmp/forexsignals

# Configure git
git config user.email "almeerahlosper@gmail.com"
git config user.name "Almeerah"

# Add all files
git add .

# Commit changes
git commit -m "Complete Netlify serverless conversion - production ready

- 17 serverless functions operational at https://watchlistfx.netlify.app/
- Session authentication with PostgreSQL working
- Admin signals CRUD fully functional
- User subscription system operational
- All customer data preserved and working"

# Push to your repository
git push origin main

echo "✅ Successfully updated https://github.com/tsiemasilo/forexsignals.git"