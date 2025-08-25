#!/bin/bash

# Netlify Deployment Script
# This script handles the deployment process to Netlify

set -e

echo "🚀 Starting Netlify deployment..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if we're in the right directory
if [ ! -f "nuxt.config.ts" ]; then
    echo "❌ Error: Not in the project root directory"
    exit 1
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d ".output/public" ]; then
    echo "❌ Build failed - .output/public directory not found"
    exit 1
fi

# Deploy to Netlify
echo "📤 Deploying to Netlify..."
netlify deploy --prod --dir=.output/public

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is now live on Netlify!"
