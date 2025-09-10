# 🚀 LinkedIn OAuth Deployment Configuration Guide

## 🚨 Critical Issues Fixed

### 1. **NextAuth vs Custom OAuth Conflict**
- **Problem**: Both NextAuth LinkedIn provider AND custom implementation were running
- **Solution**: Removed NextAuth LinkedIn provider to avoid conflicts
- **Result**: Clean, single OAuth flow

### 2. **Redirect URI Handling**
- **Problem**: Inconsistent URL construction between development and production
- **Solution**: Proper environment-based redirect URI logic
- **Result**: Works in both localhost and production

### 3. **Environment Variable Management**
- **Problem**: Mixed URL handling logic
- **Solution**: Clear priority: `LINKEDIN_REDIRECT_URI` > `NEXTAUTH_URL` construction
- **Result**: Predictable behavior across environments

## ✅ **Required Environment Variables**

### **Vercel Environment Variables**
Set these in your Vercel dashboard:

\`\`\`bash
# Core Configuration
NEXTAUTH_URL=https://www.linkzup.in
NEXTAUTH_SECRET=your-secure-secret-here

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=https://www.linkzup.in/api/linkedin/callback

# Database
MONGODB_URI=your-mongodb-connection-string

# Other Services
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
\`\`\`

## 🔧 **LinkedIn App Configuration**

### **Step 1: Add Both Redirect URIs**
In your LinkedIn Developers Console, add **BOTH** URLs:

1. **Production**: `https://www.linkzup.in/api/linkedin/callback`
2. **Development**: `http://localhost:3000/api/linkedin/callback`

### **Step 2: Verify OAuth Scopes**
Ensure these scopes are enabled:
- ✅ `openid`
- ✅ `profile` 
- ✅ `email`
- ✅ `w_member_social`
- ✅ `r_events`

### **Step 3: App Status**
- Make sure your app is **Active** (not in development mode)
- Verify **LinkedIn+ API** is enabled
- Check app permissions are approved

## 🧪 **Testing Steps**

### **Test 1: Configuration Verification**
\`\`\`bash
# Test production configuration
curl https://www.linkzup.in/api/test-linkedin-config

# Test localhost configuration  
curl http://localhost:3000/api/test-linkedin-config
\`\`\`

### **Test 2: LinkedIn OAuth Flow**
1. **Production**: Visit `https://www.linkzup.in/auth/signin`
2. **Development**: Visit `http://localhost:3000/auth/signin`
3. Click "Continue with LinkedIn"
4. Complete OAuth flow
5. Verify successful redirect

### **Test 3: LinkedIn Connection**
1. Go to dashboard
2. Click "Connect LinkedIn" 
3. Complete OAuth flow
4. Verify connection status

## 🔍 **Debugging Information**

### **Check Current Configuration**
The `/api/test-linkedin-config` endpoint shows:
- Environment variables status
- Redirect URI being used
- Production vs development mode
- LinkedIn app configuration status

### **Common Error Messages**
- **"redirect_uri does not match"**: LinkedIn app missing redirect URI
- **"Invalid client_id"**: Wrong LinkedIn credentials
- **"Unauthorized"**: LinkedIn app not approved or API disabled

## 🚀 **Deployment Checklist**

- [ ] **Environment Variables**: All set in Vercel
- [ ] **LinkedIn App**: Both redirect URIs added
- [ ] **OAuth Scopes**: All required scopes enabled
- [ ] **App Status**: Active and approved
- [ ] **Deployment**: Latest code deployed to Vercel
- [ ] **Testing**: OAuth flow works in production

## 🔄 **Environment Switching**

### **For Development**
\`\`\`bash
# Use localhost URLs
NEXTAUTH_URL=http://localhost:3000
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/linkedin/callback
\`\`\`

### **For Production**
\`\`\`bash
# Use production URLs  
NEXTAUTH_URL=https://www.linkzup.in
LINKEDIN_REDIRECT_URI=https://www.linkzup.in/api/linkedin/callback
\`\`\`

## 📋 **File Changes Made**

### **Modified Files**
1. **`lib/auth.ts`**: Removed LinkedIn provider to avoid conflicts
2. **`app/api/linkedin/connect/route.ts`**: Improved redirect URI logic
3. **`app/api/linkedin/callback/route.ts`**: Consistent URL handling

### **New Files**
1. **`deployment-config.md`**: This comprehensive guide
2. **`fix-linkedin-redirect.sh`**: Automated fix script

## 🆘 **Troubleshooting**

### **Still Getting Errors?**
1. **Clear browser cache** and cookies
2. **Test in incognito mode**
3. **Check Vercel function logs**
4. **Verify LinkedIn app settings**
5. **Wait for LinkedIn changes to propagate** (can take 5-10 minutes)

### **Need Help?**
1. Check the test endpoint: `/api/test-linkedin-config`
2. Review Vercel deployment logs
3. Verify all environment variables
4. Test with the fix script: `./fix-linkedin-redirect.sh`

## 🎯 **Expected Result**

After following this guide:
- ✅ LinkedIn OAuth works in both environments
- ✅ No more redirect URI mismatch errors
- ✅ Consistent user authentication flow
- ✅ Proper production deployment
- ✅ Clean, maintainable codebase

---

**Last Updated**: $(date)
**Status**: ✅ Ready for deployment
