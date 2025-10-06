# Google Drive Integration Setup Guide

## Overview
This guide will help you set up Google Drive integration for the image search module, allowing users to access their Google Drive images directly from the application.

## Prerequisites
- Google Cloud Console project with OAuth 2.0 credentials already configured
- Google Drive API enabled
- Existing Google OAuth setup (uses same credentials)

## Step 1: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Drive API"
5. Click on it and press "Enable"

## Step 2: Update OAuth 2.0 Scopes

1. Go to "APIs & Services" > "Credentials"
2. Click on your OAuth 2.0 Client ID
3. In the "Authorized redirect URIs" section, add:
   ```
   https://www.linkzup.in/api/google-drive/callback
   http://localhost:3000/api/google-drive/callback
   ```
4. Save the changes

## Step 3: Environment Variables

The Google Drive integration uses the same credentials as your existing Google OAuth setup:

```env
# These should already be configured
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://www.linkzup.in
```

## Step 4: Required Scopes

The integration requests the following scopes:
- `https://www.googleapis.com/auth/drive.readonly` - Read access to Google Drive files
- `https://www.googleapis.com/auth/userinfo.profile` - User profile information
- `https://www.googleapis.com/auth/userinfo.email` - User email information

## Step 5: Database Schema Updates

The integration stores Google Drive tokens in the user document:

```javascript
{
  googleAccessToken: "string",      // Access token for API calls
  googleRefreshToken: "string",     // Refresh token for token renewal
  googleDriveConnected: true,       // Connection status
  googleDriveConnectedAt: "Date"    // Connection timestamp
}
```

## Step 6: API Endpoints

### Authentication
- `GET /api/google-drive/auth?action=check` - Check connection status
- `GET /api/google-drive/auth?action=connect` - Get authorization URL
- `POST /api/google-drive/auth` - Disconnect from Google Drive

### File Operations
- `GET /api/google-drive?action=search&query=term` - Search images by name
- `GET /api/google-drive?action=list` - List all images
- `GET /api/google-drive/callback` - OAuth callback handler

## Step 7: Frontend Integration

The ImageManager component now includes a "Google Drive" tab with:
- Connection status display
- Connect/Disconnect buttons
- Search functionality
- Image grid with thumbnails
- Load more pagination
- Copy URL and view in Drive options

## Step 8: Testing

1. **Test Connection Flow:**
   - Open the Image Manager
   - Go to Google Drive tab
   - Click "Connect Google Drive"
   - Complete OAuth flow in popup window
   - Verify connection status updates

2. **Test Image Search:**
   - Search for images by name
   - Verify results display correctly
   - Test "Load More" functionality
   - Test image selection

3. **Test Disconnection:**
   - Click "Disconnect" button
   - Verify tokens are removed from database
   - Verify UI updates to show connection prompt

## Security Considerations

1. **Token Storage:** Access and refresh tokens are stored securely in MongoDB
2. **Read-Only Access:** Only requests read-only access to Google Drive
3. **Token Refresh:** Automatically handles token refresh using Google APIs client
4. **User Isolation:** Each user can only access their own Google Drive files

## Troubleshooting

### Common Issues

1. **"Google Drive not connected" error:**
   - Verify user has completed OAuth flow
   - Check if tokens are stored in database
   - Ensure Google Drive API is enabled

2. **"Failed to access Google Drive" error:**
   - Check if access token is valid
   - Verify refresh token is available
   - Check Google Cloud Console quotas

3. **No images found:**
   - Verify user has images in their Google Drive
   - Check if images are in supported formats
   - Ensure user has granted proper permissions

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Check server logs for authentication errors
4. Test with a fresh Google account

## Features

### Current Features
- ✅ Connect/Disconnect Google Drive
- ✅ Search images by filename
- ✅ Browse all images
- ✅ Pagination with "Load More"
- ✅ Image thumbnails and previews
- ✅ Copy image URLs
- ✅ Open images in Google Drive
- ✅ Secure token management

### Future Enhancements
- 🔄 Folder browsing
- 🔄 Image metadata display
- 🔄 Bulk image operations
- 🔄 Recent images section
- 🔄 Favorites/bookmarks

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure Google Drive API is enabled in your project
4. Check that redirect URIs are properly configured
