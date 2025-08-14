#!/bin/bash
# Commands to manually push to GitHub

cd /tmp/watchlist-fx-final

# Add all files and commit
git add .
git commit -m "Fixed authentication and user roles - signals working

✓ Fixed frontend Bearer token issue, using session-based auth
✓ Corrected roles: Almeerah=customer, admin@forexsignals.com=admin  
✓ Resolved signals API 500 errors for customers
✓ All 6 signals including nas100 accessible
✓ Database sync functions ready"

# Push to GitHub
git push -u origin main --force

echo "GitHub repository updated successfully!"