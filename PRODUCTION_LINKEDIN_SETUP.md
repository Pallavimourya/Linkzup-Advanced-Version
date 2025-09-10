# Production LinkedIn OAuth Setup Guide

## ✅ Current Configuration

Your LinkedIn OAuth is now configured for **production**:
- **NEXTAUTH_URL**: `https://linkzup-advanced-version.vercel.app`
- **LINKEDIN_REDIRECT_URI**: `https://linkzup-advanced-version.vercel.app/api/linkedin/callback`
- **LinkedIn Client ID**: ✅ Configured
- **LinkedIn Client Secret**: ✅ Configured

## 🚨 CRITICAL: LinkedIn App Configuration Required

### Step 1: Update LinkedIn App Redirect URLs

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Find your app and click on it
3. Go to "Auth" tab
4. In "OAuth 2.0 settings", **ADD** this redirect URL:
   \`\`\`
   https://linkzup-advanced-version.vercel.app/api/linkedin/callback
   \`\`\`
5. Click "Update" to save changes

### Step 2: Verify OAuth Scopes

Make sure your LinkedIn app has these scopes enabled:
- ✅ `openid`
- ✅ `profile`
- ✅ `email`
- ✅ `w_member_social`

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

You have several options to deploy:

**Option A: Git Push (if auto-deploy is enabled)**
\`\`\`bash
git add .
git commit -m "Configure LinkedIn OAuth for production"
git push origin main
\`\`\`

**Option B: Manual Vercel Deploy**
\`\`\`bash
vercel --prod
\`\`\`

### Step 2: Verify Environment Variables in Vercel

Make sure these environment variables are set in your Vercel dashboard:

\`\`\`
NEXTAUTH_URL=https://linkzup-advanced-version.vercel.app
LINKEDIN_REDIRECT_URI=https://linkzup-advanced-version.vercel.app/api/linkedin/callback
LINKEDIN_CLIENT_ID=778o02fugomgrp
LINKEDIN_CLIENT_SECRET=WPL_AP1.3oByOZLCy2XOKFYO.k/ldRw==
NEXTAUTH_SECRET=your-nextauth-secret
MONGODB_URI=your-mongodb-connection-string
\`\`\`

## 🧪 Testing Production LinkedIn OAuth

### Test 1: Configuration Status
\`\`\`bash
node test-production-linkedin.js
\`\`\`

### Test 2: LinkedIn Sign-In
1. Open: https://linkzup-advanced-version.vercel.app/auth/signin
2. Click "Sign in with LinkedIn"
3. Complete the OAuth flow
4. You should be redirected to the dashboard

### Test 3: LinkedIn Connection
1. Go to: https://linkzup-advanced-version.vercel.app/dashboard
2. Click "Connect LinkedIn" in the header
3. Complete the OAuth flow
4. Check if LinkedIn shows as connected

## 🔗 Production URLs

- **Main App**: https://linkzup-advanced-version.vercel.app
- **Sign-In**: https://linkzup-advanced-version.vercel.app/auth/signin
- **Dashboard**: https://linkzup-advanced-version.vercel.app/dashboard
- **LinkedIn Callback**: https://linkzup-advanced-version.vercel.app/api/linkedin/callback

## 🚨 Common Production Issues & Solutions

### Issue: "redirect_uri does not match the registered value"
**Solution**: 
1. Make sure you've added `https://linkzup-advanced-version.vercel.app/api/linkedin/callback` to your LinkedIn app
2. Wait a few minutes for LinkedIn to propagate the changes
3. Clear browser cache and try again

### Issue: "Invalid client_id"
**Solution**: 
1. Verify your LinkedIn Client ID in Vercel environment variables
2. Make sure the app is approved and active in LinkedIn Developers

### Issue: "Unauthorized" error
**Solution**: 
1. Check if your LinkedIn app is approved
2. Verify all environment variables are set in Vercel
3. Make sure the app is not in development mode

### Issue: Production vs Development Confusion
**Solution**: 
- **Development**: Use `http://localhost:3000`
- **Production**: Use `https://linkzup-advanced-version.vercel.app`

## 📋 Deployment Checklist

- [ ] LinkedIn app has production redirect URL configured
- [ ] Environment variables set in Vercel
- [ ] App deployed to Vercel
- [ ] LinkedIn OAuth scopes enabled
- [ ] Test LinkedIn sign-in flow
- [ ] Test LinkedIn connection flow
- [ ] Test LinkedIn posting functionality

## 🔄 Switching Between Development and Production

### For Development:
\`\`\`bash
./fix-linkedin-env.sh
\`\`\`

### For Production:
\`\`\`bash
./fix-production-linkedin.sh
\`\`\`

## 🆘 Troubleshooting

1. **Check Vercel Logs**: Go to Vercel dashboard → Functions → View logs
2. **Check Browser Console**: Look for JavaScript errors
3. **Check Network Tab**: Look for failed requests
4. **Verify LinkedIn App**: Make sure app is approved and active
5. **Test with Different Browser**: Try incognito mode

## 📞 Support

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Verify all LinkedIn app settings match exactly
3. Ensure your LinkedIn app is approved and active
4. Check Vercel deployment logs for backend errors

---

**Last Updated**: $(date)
**Status**: ✅ Ready for production deployment
