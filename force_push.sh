#!/bin/bash
git add netlify/functions/admin-users-fixed.mjs
git add netlify.toml
git add CLEAN_DEPLOYMENT.md
git commit -m "Admin functions HTTP connection fix"
git push origin main --force