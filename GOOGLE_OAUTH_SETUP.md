# Google OAuth Setup Guide

## Current Configuration Status ✅

Your Google OAuth configuration appears to be properly set up with:
- ✅ Google Client ID: `287378755045-3ukumvlh967fjbdbr4bcggdnecq0dml1.apps.googleusercontent.com`
- ✅ Google Client Secret: Configured
- ✅ NextAuth URL: `http://localhost:3000`
- ✅ NextAuth Secret: Configured

## Required Google Console Configuration

### 1. Authorized JavaScript Origins
Add these URLs to your Google OAuth 2.0 Client:
```
http://localhost:3000
https://your-production-domain.com (when deploying)
```

### 2. Authorized Redirect URIs
Add these URLs to your Google OAuth 2.0 Client:
```
http://localhost:3000/api/auth/callback/google
https://your-production-domain.com/api/auth/callback/google (when deploying)
```

## How to Fix Google Sign-In Issues

### Step 1: Verify Google Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID
4. Click "Edit" and verify the redirect URIs include:
   - `http://localhost:3000/api/auth/callback/google`

### Step 2: Enable Google+ API (if needed)
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Enable it if not already enabled

### Step 3: Test the Configuration
1. Visit `http://localhost:3000/api/test-google-auth` to verify environment variables
2. Open browser console and try Google sign-in
3. Check for any error messages in the console

### Step 4: Common Issues and Solutions

#### Issue: "redirect_uri_mismatch"
**Solution**: Add the exact redirect URI to Google Console:
```
http://localhost:3000/api/auth/callback/google
```

#### Issue: "invalid_client"
**Solution**: Verify your Client ID and Client Secret are correct

#### Issue: "access_denied"
**Solution**: Check if the Google+ API is enabled in your project

#### Issue: No popup appears
**Solution**: Check browser console for errors and ensure popup blockers are disabled

## Debugging Steps

1. **Check Browser Console**: Open Developer Tools and look for errors
2. **Check Network Tab**: Look for failed requests to Google OAuth endpoints
3. **Check Server Logs**: Look for NextAuth debug messages
4. **Test API Endpoint**: Visit `/api/test-google-auth` to verify configuration

## Current Implementation

The Google sign-in is implemented using:
- NextAuth.js with Google Provider
- Custom profile mapping for Google users
- Proper JWT and session callbacks
- Error handling and debugging

## Next Steps

If the issue persists after following these steps:
1. Check the browser console for specific error messages
2. Verify the Google Console configuration matches exactly
3. Test with a different browser or incognito mode
4. Check if there are any CORS or CSP issues
