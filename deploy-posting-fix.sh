#!/bin/bash

echo "🚀 Deploying LinkedIn Posting Fix..."
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Changes detected, committing..."
    git add .
    git commit -m "Fix LinkedIn posting deployment conflict - remove NextAuth provider"
else
    echo "✅ No changes to commit"
fi

# Push to main branch
echo "🚀 Pushing to main branch..."
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "🔍 Next steps:"
echo "1. Wait for Vercel to deploy (usually 2-3 minutes)"
echo "2. Test configuration: https://www.linkzup.in/api/test-posting-config"
echo "3. Test LinkedIn OAuth: https://www.linkzup.in/auth/signin"
echo "4. Test posting functionality"
echo ""
echo "📋 If you encounter issues:"
echo "- Check Vercel deployment logs"
echo "- Verify environment variables in Vercel dashboard"
echo "- Test the configuration endpoint"
echo ""
echo "🎯 The fix removes the NextAuth LinkedIn provider conflict"
echo "   that was breaking production posting."
