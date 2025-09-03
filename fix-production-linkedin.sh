#!/bin/bash

echo "🔧 Configuring LinkedIn OAuth for Production..."

# Backup current .env file
cp .env .env.backup.production.$(date +%Y%m%d_%H%M%S)

# Update NEXTAUTH_URL for production
sed -i '' 's|NEXTAUTH_URL=http://localhost:3000|NEXTAUTH_URL=https://linkzup-advanced-version.vercel.app|g' .env

# Add or update LINKEDIN_REDIRECT_URI
if grep -q "LINKEDIN_REDIRECT_URI" .env; then
    sed -i '' 's|LINKEDIN_REDIRECT_URI=.*|LINKEDIN_REDIRECT_URI=https://linkzup-advanced-version.vercel.app/api/linkedin/callback|g' .env
else
    echo "LINKEDIN_REDIRECT_URI=https://linkzup-advanced-version.vercel.app/api/linkedin/callback" >> .env
fi

echo "✅ Environment variables updated for production"
echo "📝 NEXTAUTH_URL changed to: https://linkzup-advanced-version.vercel.app"
echo "📝 LINKEDIN_REDIRECT_URI set to: https://linkzup-advanced-version.vercel.app/api/linkedin/callback"
echo "💾 Backup created as .env.backup.production.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "🔍 Current LinkedIn configuration:"
grep -E "NEXTAUTH_URL|LINKEDIN" .env

echo ""
echo "🚨 IMPORTANT: You need to update your LinkedIn app settings!"
echo ""
echo "📋 LinkedIn App Configuration Required:"
echo "1. Go to: https://www.linkedin.com/developers/"
echo "2. Find your app and click on it"
echo "3. Go to 'Auth' tab"
echo "4. In 'OAuth 2.0 settings', ADD this redirect URL:"
echo "   https://linkzup-advanced-version.vercel.app/api/linkedin/callback"
echo "5. Click 'Update' to save changes"
echo ""
echo "🚀 After updating LinkedIn app settings:"
echo "1. Deploy to Vercel: git push (if using auto-deploy)"
echo "2. Or manually deploy: vercel --prod"
echo "3. Test LinkedIn sign-in at: https://linkzup-advanced-version.vercel.app/auth/signin"
