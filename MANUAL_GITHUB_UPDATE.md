# Manual GitHub Update Instructions

Since the git repository has lock files preventing automated updates, here are the manual steps to update your GitHub repository:

## Option 1: Direct Upload via GitHub Web Interface

1. **Go to your repository:** https://github.com/tsiemasilo/forexsignals
2. **Upload these key files directly through GitHub's web interface:**
   - `netlify/functions/emergency-login.mjs`
   - `netlify/functions/login-redirect.mjs`
   - `netlify/functions/signals.mjs`
   - `netlify/functions/signals-public.mjs` 
   - `netlify/functions/admin-users.mjs`
   - `netlify/functions/admin-user-subscription.mjs`
   - `netlify/functions/create-sessions-table.mjs`
   - `netlify.toml`
   - `replit.md`

## Option 2: Terminal Commands (run from /home/runner/workspace)

```bash
# Clean git locks (if any exist)
rm -f .git/index.lock .git/config.lock 2>/dev/null

# Initialize fresh git state
git init
git remote add origin https://github.com/tsiemasilo/forexsignals.git
git branch -M main

# Stage and commit all changes
git add .
git commit -m "Update Netlify functions with database fixes"

# Push to GitHub (may require authentication)
git push -u origin main --force
```

## Option 3: Create New Repository

If git issues persist:
1. Create a fresh clone: `git clone https://github.com/tsiemasilo/forexsignals.git fresh-repo`
2. Copy all current files to the fresh clone
3. Commit and push from there

## Key Changes Being Updated

- **Database Connection Fixes:** All functions now use HTTP pooling instead of WebSocket
- **Login Routing:** Added proper GET/POST method handling for /api/login
- **Authentication:** Emergency login creates persistent database sessions
- **Documentation:** Updated replit.md with latest deployment status

The live Netlify deployment at https://watchlistfx.netlify.app/ should already have these fixes active.