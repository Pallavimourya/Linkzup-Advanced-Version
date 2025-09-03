#!/bin/bash

echo "🔧 Fixing LinkedIn OAuth Configuration for Development..."

# Backup current .env file
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update NEXTAUTH_URL for development
sed -i '' 's|NEXTAUTH_URL=https://linkzup-advanced-version.vercel.app|NEXTAUTH_URL=http://localhost:3000|g' .env

# Remove empty LINKEDIN_REDIRECT_URI line if it exists
sed -i '' '/^LINKEDIN_REDIRECT_URI=$/d' .env

echo "✅ Environment variables updated for development"
echo "📝 NEXTAUTH_URL changed to: http://localhost:3000"
echo "💾 Backup created as .env.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "🔍 Current LinkedIn configuration:"
grep -E "NEXTAUTH_URL|LINKEDIN" .env

echo ""
echo "🚀 Please restart your development server:"
echo "   pnpm dev"
echo ""
echo "🌐 Then test LinkedIn sign-in at:"
echo "   http://localhost:3000/auth/signin"
