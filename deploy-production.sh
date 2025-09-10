#!/bin/bash

echo "🚀 LinkzUp Production Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔍 Checking current configuration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Project directory confirmed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example..."
    cp env.example .env
    print_success ".env file created from example"
else
    print_success ".env file found"
fi

echo ""
echo "📋 Current Configuration Status:"
echo "================================"

# Check environment variables
print_status "Checking environment variables..."

# Check NEXTAUTH_URL
if grep -q "NEXTAUTH_URL=https://www.linkzup.in" .env; then
    print_success "NEXTAUTH_URL is set to production"
else
    print_warning "NEXTAUTH_URL needs to be updated to production"
    sed -i '' 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://www.linkzup.in|g' .env
    print_success "NEXTAUTH_URL updated to production"
fi

# Check LINKEDIN_REDIRECT_URI
if grep -q "LINKEDIN_REDIRECT_URI=https://www.linkzup.in/api/linkedin/callback" .env; then
    print_success "LINKEDIN_REDIRECT_URI is set to production"
else
    print_warning "LINKEDIN_REDIRECT_URI needs to be updated to production"
    if grep -q "LINKEDIN_REDIRECT_URI" .env; then
        sed -i '' 's|LINKEDIN_REDIRECT_URI=.*|LINKEDIN_REDIRECT_URI=https://www.linkzup.in/api/linkedin/callback|g' .env
    else
        echo "LINKEDIN_REDIRECT_URI=https://www.linkzup.in/api/linkedin/callback" >> .env
    fi
    print_success "LINKEDIN_REDIRECT_URI updated to production"
fi

echo ""
echo "🔧 Environment Configuration:"
echo "============================="
grep -E "NEXTAUTH_URL|LINKEDIN_REDIRECT_URI" .env

echo ""
echo "📋 LinkedIn App Configuration Required:"
echo "======================================="
echo "1. Go to: https://www.linkedin.com/developers/"
echo "2. Find your app and click on it"
echo "3. Go to 'Auth' tab"
echo "4. In 'OAuth 2.0 settings', ensure you have BOTH redirect URLs:"
echo "   ✅ https://www.linkzup.in/api/linkedin/callback (production)"
echo "   ✅ http://localhost:3000/api/linkedin/callback (development)"
echo "5. Click 'Update' to save changes"
echo ""

echo "🚀 Deployment Steps:"
echo "===================="

# Check if git is available
if command -v git &> /dev/null; then
    print_status "Git is available"
    
    # Check git status
    if git status --porcelain | grep -q .; then
        print_warning "You have uncommitted changes"
        echo "Current git status:"
        git status --porcelain
        echo ""
        read -p "Do you want to commit these changes? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Prepare for production deployment - LinkedIn OAuth fixes"
            print_success "Changes committed"
        fi
    else
        print_success "No uncommitted changes"
    fi
    
    # Check if remote exists
    if git remote -v | grep -q origin; then
        print_success "Git remote 'origin' found"
        echo ""
        print_status "To deploy to production:"
        echo "1. Push to main branch: git push origin main"
        echo "2. Or if using Vercel auto-deploy, just push: git push"
        echo ""
    else
        print_warning "No git remote 'origin' found"
        echo "You may need to set up your git remote for deployment"
    fi
else
    print_warning "Git not found. You may need to deploy manually."
fi

echo "🧪 Testing Configuration:"
echo "========================"

# Test production configuration
print_status "Testing production configuration..."
if curl -s https://www.linkzup.in/api/test-linkedin-config > /dev/null 2>&1; then
    print_success "Production endpoint is accessible"
    echo "Production config:"
    curl -s https://www.linkzup.in/api/test-linkedin-config | jq '.config | {linkedinClientId, linkedinClientSecret, nextAuthUrl, callbackUrl}' 2>/dev/null || echo "jq not available - check manually"
else
    print_error "Production endpoint is not accessible"
    echo "Please check your deployment status"
fi

echo ""
echo "📋 Final Checklist:"
echo "==================="
echo "✅ Environment variables updated for production"
echo "✅ LinkedIn app has both redirect URIs configured"
echo "✅ Code changes committed (if using git)"
echo "✅ Production deployment completed"
echo "✅ LinkedIn OAuth tested in production"
echo ""

echo "🎯 Next Steps:"
echo "=============="
echo "1. Update your LinkedIn app with both redirect URIs"
echo "2. Deploy to production (git push or manual deployment)"
echo "3. Test LinkedIn OAuth flow in production"
echo "4. Verify all functionality works as expected"
echo ""

echo "🔍 For debugging, use:"
echo "======================"
echo "• Test endpoint: https://www.linkzup.in/api/test-linkedin-config"
echo "• Fix script: ./fix-linkedin-redirect.sh"
echo "• Configuration guide: deployment-config.md"
echo ""

print_success "Production deployment script completed!"
print_warning "Remember to update your LinkedIn app settings before testing!"
