#!/bin/bash

echo "🔧 LinkedIn OAuth Redirect URI Fix Script"
echo "========================================"
echo ""

echo "📋 Current Configuration:"
echo "   - NEXTAUTH_URL: ${NEXTAUTH_URL:-'Not set'}"
echo "   - LINKEDIN_REDIRECT_URI: ${LINKEDIN_REDIRECT_URI:-'Not set'}"
echo ""

echo "🚨 CRITICAL ISSUE DETECTED:"
echo "   The error 'redirect_uri does not match the registered value' means"
echo "   your LinkedIn app is not configured with the correct callback URL."
echo ""

echo "✅ SOLUTION:"
echo "   1. Go to LinkedIn Developers Console: https://www.linkedin.com/developers/"
echo "   2. Select your app"
echo "   3. Go to 'Auth' tab"
echo "   4. Add this exact redirect URI:"
echo "      https://www.linkzup.in/api/linkedin/callback"
echo "   5. Save changes"
echo "   6. Try signing in again"
echo ""

echo "🔍 To verify your current configuration, run:"
echo "   curl https://www.linkzup.in/api/test-linkedin-config"
echo ""

echo "📝 Environment Variables to set in Vercel:"
echo "   NEXTAUTH_URL=https://www.linkzup.in"
echo "   LINKEDIN_REDIRECT_URI=https://www.linkzup.in/api/linkedin/callback"
echo "   LINKEDIN_CLIENT_ID=your_client_id"
echo "   LINKEDIN_CLIENT_SECRET=your_client_secret"
echo ""

echo "⚠️  IMPORTANT:"
echo "   - The redirect URI in LinkedIn app MUST match exactly"
echo "   - No trailing slashes"
echo "   - Use https:// not http://"
echo "   - Case sensitive"
echo ""

echo "🎯 Quick Test:"
echo "   After making changes, test the LinkedIn sign-in flow again."
echo "   The error should be resolved."
