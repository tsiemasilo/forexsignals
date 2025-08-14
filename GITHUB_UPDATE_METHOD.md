# GitHub Update Method - Clean Token Removal

## The Problem
GitHub's push protection blocks commits containing personal access tokens, even if they're in documentation files.

## The Solution Method

When GitHub blocks pushes due to token detection:

1. **Reset commit history** to remove problematic commits:
   ```bash
   cd /tmp/forexsignals
   git reset --hard HEAD~2
   ```

2. **Copy only essential files** (no documentation with tokens):
   ```bash
   cp -r /home/runner/workspace/netlify .
   cp /home/runner/workspace/build-netlify.js .
   cp /home/runner/workspace/replit.md .
   ```

3. **Create clean commit** without sensitive information:
   ```bash
   git add netlify/ build-netlify.js replit.md
   git commit -m "Add Netlify serverless functions - production ready"
   git push origin main
   ```

## Key Points

- Remove documentation files that contain tokens before committing
- Use `git reset --hard HEAD~X` to remove commits with sensitive data
- Only commit essential project files (netlify functions, build scripts, core docs)
- Always clean sensitive information from replit.md before including it

## Repository Information
- **Repository**: https://github.com/tsiemasilo/forexsignals.git
- **Token**: [Stored securely in replit.md user preferences]

This method successfully bypasses GitHub's push protection while maintaining clean commit history.