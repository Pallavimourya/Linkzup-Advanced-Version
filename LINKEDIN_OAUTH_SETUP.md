# LinkedIn OAuth Setup Guide for Vercel Deployment

## Current Configuration Status ✅

Your LinkedIn OAuth configuration needs to be updated for the production deployment at:
- ✅ Production URL: `https://www.linkzup.in`
- ✅ LinkedIn Callback URL: `https://www.linkzup.in/api/linkedin/callback`

**Important**: The callback URL is `/api/linkedin/callback` (not `/api/auth/linkedin/callback`)

## Required LinkedIn App Configuration

### 1. Authorized Redirect URLs
Add these URLs to your LinkedIn app:

**For Development:**
\`\`\`
http://localhost:3000/api/linkedin/callback
\`\`\`

**For Production (Vercel):**
\`\`\`
https://www.linkzup.in/api/linkedin/callback
\`\`\`

### 2. OAuth 2.0 Scopes
Make sure your LinkedIn app has these scopes enabled:
- `openid`
- `profile`
- `email`
- `w_member_social`

## How to Fix LinkedIn Sign-In Issues

### Step 1: Update LinkedIn App Settings
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Find your app and click on it
3. Go to "Auth" tab
4. In "OAuth 2.0 settings", add the redirect URL:
   \`\`\`
   https://linkzup-advanced-version.vercel.app/api/linkedin/callback
   \`\`\`
5. Click "Update" to save changes

### Step 2: Verify Environment Variables in Vercel
Make sure these are set in your Vercel environment variables:
\`\`\`
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
NEXTAUTH_URL=https://www.linkzup.in
NEXTAUTH_SECRET=your-nextauth-secret
\`\`\`

### Step 3: Test the Configuration
1. Visit: `https://www.linkzup.in/api/test-linkedin`
2. Check the configuration status
3. Try connecting with LinkedIn
4. Check for any error messages

## Common Issues and Solutions

### Issue: "redirect_uri does not match the registered value"
**Solution**: Add the exact redirect URI to LinkedIn app:
\`\`\`
https://linkzup-advanced-version.vercel.app/api/linkedin/callback
\`\`\`

### Issue: "Invalid client_id"
**Solution**: Verify your LinkedIn Client ID and Secret are correct in Vercel

### Issue: "Unauthorized" error
**Solution**: Check if the LinkedIn+ API is enabled in your project

### Issue: No popup appears
**Solution**: Check browser console for errors and ensure popup blockers are disabled

## Debugging Steps

1. **Check Browser Console**: Open Developer Tools and look for errors
2. **Check Network Tab**: Look for failed requests to LinkedIn OAuth endpoints
3. **Check Server Logs**: Look for NextAuth debug messages
4. **Test API Endpoint**: Visit `/api/test-linkedin` to verify configuration

## Current Implementation

The LinkedIn sign-in is implemented using:
- NextAuth.js with LinkedIn Provider
- Custom profile mapping for LinkedIn users
- Proper JWT and session callbacks
- Error handling and debugging

## Quick Fix for Current Issue

The error you're seeing is because the redirect URI `https://www.linkzup.in/api/linkedin/callback` is not configured in your LinkedIn app. To fix this:

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Find your app and click on it
3. Go to "Auth" tab
4. In "OAuth 2.0 settings", add this redirect URL:
   \`\`\`
   https://linkzup-advanced-version.vercel.app/api/linkedin/callback
   \`\`\`
5. Click "Update"
6. Wait a few minutes for the changes to propagate
7. Try connecting with LinkedIn again

## Production Deployment Checklist

- [ ] LinkedIn app redirect URI configured
- [ ] Environment variables set in Vercel
- [ ] NEXTAUTH_URL set to production URL
- [ ] LinkedIn OAuth scopes enabled
- [ ] Test the connection flow

## Next Steps

If the issue persists after following these steps:
1. Check the browser console for specific error messages
2. Verify the LinkedIn app configuration matches exactly
3. Test with a different browser or incognito mode
4. Check if there are any CORS or CSP issues

This should resolve the LinkedIn OAuth callback error you're experiencing.
