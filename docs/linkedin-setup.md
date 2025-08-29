# LinkedIn OAuth Setup Guide

## Overview
This guide will help you configure LinkedIn OAuth integration for the Linkzup application.

## Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in the required information:
   - App name: `Linkzup` (or your preferred name)
   - LinkedIn Page: Select your company page
   - App Logo: Upload your app logo

## Step 2: Configure OAuth Settings

### Redirect URLs
Add the following redirect URLs to your LinkedIn app:

**For Development:**
\`\`\`
http://localhost:3000/api/linkedin/callback
\`\`\`

**For Production:**
\`\`\`
https://yourdomain.com/api/linkedin/callback
\`\`\`

**Important:** Replace `yourdomain.com` with your actual domain name.

### OAuth 2.0 Scopes
Make sure your app has the following scopes enabled:
- `openid`
- `profile`
- `email`
- `w_member_social`

## Step 3: Get Credentials

1. In your LinkedIn app dashboard, go to "Auth" tab
2. Copy the **Client ID** and **Client Secret**
3. Add these to your `.env` file:

\`\`\`env
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
\`\`\`

## Step 4: Environment Variables

Make sure your `.env` file has all required variables:

\`\`\`env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# MongoDB
MONGODB_URI=your_mongodb_connection_string
\`\`\`

## Step 5: Test Configuration

1. Start your development server: `pnpm dev`
2. Open browser console (F12)
3. Click "LinkedIn Not Connected" in the header
4. Check console logs for:
   - LinkedIn Client ID status
   - Redirect URI being used
   - Any error messages

## Common Issues & Solutions

### "redirect_uri does not match the registered value"
**Cause:** The redirect URI in your code doesn't match what's configured in LinkedIn app.

**Solution:**
1. Check your `NEXTAUTH_URL` environment variable
2. Ensure it matches your actual domain
3. Add the exact redirect URI to LinkedIn app settings

### "Invalid client_id"
**Cause:** LinkedIn Client ID is not configured or incorrect.

**Solution:**
1. Verify `LINKEDIN_CLIENT_ID` in your `.env` file
2. Check that the Client ID matches your LinkedIn app

### "Unauthorized" error
**Cause:** User session is not valid or missing.

**Solution:**
1. Make sure user is logged in
2. Check session configuration
3. Verify NextAuth setup

## Debugging

### Check Current Configuration
Visit `/api/test-linkedin` to see your current configuration:
- Session status
- Environment variables
- LinkedIn connection status

### Console Logs
The application logs detailed information to help debug issues:
- LinkedIn connect API calls
- Redirect URI being used
- OAuth flow status
- Error messages

## Production Deployment

When deploying to production:

1. **Update NEXTAUTH_URL** to your production domain
2. **Add production redirect URI** to LinkedIn app settings
3. **Set NEXTAUTH_SECRET** to a secure random string
4. **Configure environment variables** in your hosting platform

### Example Production .env
\`\`\`env
NEXTAUTH_URL=https://yourdomain.com
LINKEDIN_CLIENT_ID=your_production_client_id
LINKEDIN_CLIENT_SECRET=your_production_client_secret
NEXTAUTH_SECRET=your_secure_secret_here
MONGODB_URI=your_production_mongodb_uri
\`\`\`

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Regularly rotate LinkedIn app credentials
- Monitor OAuth usage and errors

## Support

If you continue to have issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure LinkedIn app configuration matches your setup
4. Test with the `/api/test-linkedin` endpoint
