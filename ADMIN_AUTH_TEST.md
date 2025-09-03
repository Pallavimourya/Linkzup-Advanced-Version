# Admin Authentication Test Guide

## 🧪 Manual Test Steps

### Prerequisites
1. Make sure the development server is running: `npm run dev`
2. Ensure MongoDB is running and connected
3. Clear browser cookies/session if testing multiple times

### Test Steps

#### 1. Test Admin Login Redirect
1. Open browser and go to: `http://localhost:3000/auth/signin`
2. Enter admin credentials:
   - **Email**: `admin@linkzup.com`
   - **Password**: `admin4321`
3. Click "Sign In"
4. **Expected Result**: Should redirect to `http://localhost:3000/admin`
5. **Actual Result**: [Fill this in after testing]

#### 2. Test Admin Dashboard Access
1. After successful login, verify you're on the admin dashboard
2. Check that the admin sidebar shows:
   - Overview
   - Users
   - Plans
   - Coupons
   - Analytics
   - Settings
3. **Expected Result**: Admin dashboard loads with all navigation options
4. **Actual Result**: [Fill this in after testing]

#### 3. Test Regular User Login (Control Test)
1. Go to: `http://localhost:3000/auth/signin`
2. Enter regular user credentials (any non-admin user)
3. Click "Sign In"
4. **Expected Result**: Should redirect to `http://localhost:3000/dashboard`
5. **Actual Result**: [Fill this in after testing]

#### 4. Test Direct Admin Access (Unauthenticated)
1. Open a new incognito/private window
2. Go directly to: `http://localhost:3000/admin`
3. **Expected Result**: Should redirect to sign-in page
4. **Actual Result**: [Fill this in after testing]

#### 5. Test Admin Accessing User Dashboard
1. Log in as admin
2. Try to manually navigate to: `http://localhost:3000/dashboard`
3. **Expected Result**: Should redirect back to `/admin`
4. **Actual Result**: [Fill this in after testing]

## 🔧 Troubleshooting

### If Admin Login Fails:
1. Check MongoDB connection
2. Verify admin credentials in `lib/auth.ts`
3. Check browser console for errors
4. Verify NextAuth configuration

### If Redirect Doesn't Work:
1. Check middleware configuration
2. Verify session handling
3. Check for JavaScript errors in browser console

### If Admin Dashboard Doesn't Load:
1. Check if admin layout is properly configured
2. Verify admin API endpoints
3. Check for TypeScript compilation errors

## 📝 Test Results

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Admin Login Redirect | `/admin` | | |
| Admin Dashboard Access | ✅ Loads | | |
| Regular User Login | `/dashboard` | | |
| Unauthenticated Admin Access | `/auth/signin` | | |
| Admin → User Dashboard Redirect | `/admin` | | |

## 🎯 Success Criteria

✅ Admin credentials redirect to `/admin`  
✅ Regular user credentials redirect to `/dashboard`  
✅ Unauthenticated users can't access admin panel  
✅ Admin users can't access user dashboard  
✅ Admin dashboard loads with proper navigation  
✅ No console errors during authentication flow
