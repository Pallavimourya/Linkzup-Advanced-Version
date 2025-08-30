# LinkedIn Sign-In & Connectivity Fix Guide

## ✅ Issues Fixed

1. **NEXTAUTH_URL Configuration**: Changed from production URL to localhost for development
2. **Environment Variables**: Cleaned up empty variables
3. **Callback URL**: Now correctly points to localhost

## 🔧 Current Configuration Status

Your LinkedIn OAuth is now configured for **development**:
- **NEXTAUTH_URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3000/api/linkedin/callback`
- **LinkedIn Client ID**: ✅ Configured
- **LinkedIn Client Secret**: ✅ Configured

## 📋 Required LinkedIn App Configuration

### Step 1: Update LinkedIn App Redirect URLs

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Find your app and click on it
3. Go to "Auth" tab
4. In "OAuth 2.0 settings", **ADD** this redirect URL:
   ```
   http://localhost:3000/api/linkedin/callback
   ```
5. Click "Update" to save changes

### Step 2: Verify OAuth Scopes

Make sure your LinkedIn app has these scopes enabled:
- ✅ `openid`
- ✅ `profile`
- ✅ `email`
- ✅ `w_member_social`

## 🧪 Testing the Fix

### Test 1: Configuration Status
```bash
curl http://localhost:3000/api/test-linkedin
```

### Test 2: LinkedIn Sign-In
1. Open: http://localhost:3000/auth/signin
2. Click "Sign in with LinkedIn"
3. Complete the OAuth flow
4. You should be redirected to the dashboard

### Test 3: LinkedIn Connection (for existing users)
1. Go to: http://localhost:3000/dashboard
2. Click "Connect LinkedIn" in the header
3. Complete the OAuth flow
4. Check if LinkedIn shows as connected

## 🚨 Common Issues & Solutions

### Issue: "redirect_uri does not match the registered value"
**Solution**: Add `http://localhost:3000/api/linkedin/callback` to your LinkedIn app's redirect URLs

### Issue: "Invalid client_id"
**Solution**: Verify your LinkedIn Client ID in the `.env` file matches your LinkedIn app

### Issue: "Unauthorized" error
**Solution**: Make sure you're signed in before trying to connect LinkedIn

### Issue: No popup appears
**Solution**: 
1. Disable popup blockers
2. Check browser console for errors
3. Try incognito mode

## 🔄 For Production Deployment

When deploying to production, you'll need to:

1. **Update NEXTAUTH_URL** in Vercel environment variables:
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

2. **Add production redirect URL** to LinkedIn app:
   ```
   https://your-domain.vercel.app/api/linkedin/callback
   ```

3. **Update environment variables** in Vercel dashboard

## 📱 Testing Steps

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Test LinkedIn sign-in**:
   - Go to: http://localhost:3000/auth/signin
   - Click "Sign in with LinkedIn"
   - Complete the OAuth flow

3. **Test LinkedIn connection**:
   - Go to: http://localhost:3000/dashboard
   - Click "Connect LinkedIn" in the header
   - Complete the OAuth flow

4. **Test LinkedIn posting**:
   - Create a post in the dashboard
   - Click "Post to LinkedIn"
   - Verify the post appears on LinkedIn

## 🆘 If Issues Persist

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed requests
3. **Check server logs** for backend errors
4. **Verify LinkedIn app settings** match exactly
5. **Test with different browser** or incognito mode

## 📞 Support

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Verify all LinkedIn app settings match the configuration
3. Ensure your LinkedIn app is approved and active
4. Check if there are any rate limits or restrictions on your LinkedIn app

---

**Last Updated**: $(date)
**Status**: ✅ Ready for testing
