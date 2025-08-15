#!/bin/bash

echo "🚀 DEPLOYING NETLIFY SIGNALS FIX..."

# Build and deploy to Netlify
echo "📦 Building for Netlify deployment..."
npm run build

echo "🌐 Deploying to Netlify..."
npx netlify deploy --prod --dir=dist

echo "✅ NETLIFY SIGNALS FIX DEPLOYED!"
echo "🔧 Fixed: Environment variable usage in signals.mjs"
echo "📍 Admin signals management should now work on live site"