# GitHub Push Commands

Run these commands in the shell to push your Netlify updates to GitHub:

```bash
# Remove any existing clones
rm -rf /tmp/forexsignals

# Clone your repository
git clone https://YOUR_GITHUB_TOKEN_HERE@github.com/tsiemasilo/forexsignals.git /tmp/forexsignals

# Navigate to repository
cd /tmp/forexsignals

# Configure git
git config user.email "almeerahlosper@gmail.com"
git config user.name "Almeerah"

# Copy Netlify files from workspace
cp -r /home/runner/workspace/netlify .
cp /home/runner/workspace/*.md .
cp /home/runner/workspace/build-netlify.js .

# Add all files
git add .

# Commit changes
git commit -m "Complete Netlify serverless conversion - production ready"

# Push to GitHub
git push origin main
```

These commands will update https://github.com/tsiemasilo/forexsignals.git with all 17 serverless functions and documentation.