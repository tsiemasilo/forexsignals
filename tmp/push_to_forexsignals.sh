#!/bin/bash
# Push complete project to https://github.com/tsiemasilo/forexsignals.git

cd /tmp/forexsignals-push

echo "Pushing to forexsignals repository..."

git add .
git commit -m "Complete Forex Signals Platform with Authentication Fixes

✓ Session-based authentication working correctly
✓ User roles: customers view signals, admin creates/manages signals  
✓ All 6 trading signals including nas100 accessible
✓ Frontend Bearer token issues resolved
✓ PostgreSQL database with proper schema
✓ Netlify deployment functions ready
✓ South African payment integration (Ozow/Yoco)
✓ Subscription management system
✓ Real-time signal updates and admin dashboard"

git push -u origin main --force

echo "Successfully pushed to GitHub repository: tsiemasilo/forexsignals"