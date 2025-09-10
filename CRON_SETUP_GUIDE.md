# 🚀 Cron Job Setup Guide

## 📋 Your Configuration

### Environment Variables
Add these to your `.env.local` file:

\`\`\`bash
# Cron Job Configuration for External Cron Jobs
CRON_JOB_API_KEY=csJyabrUEFJrcO+kMzd6z3FWbqxBReLSv49gw6sdVY4=
CRON_SECRET=DdtJyHUa9UqykItg8yKrxj7a+xIRD99iIGjEwJ/+z0Y=
NEXT_PUBLIC_APP_URL=https://linkzup.in

# External Cron Job URL (for cron-job.org)
EXTERNAL_CRON_URL=https://linkzup.in/api/cron/external-auto-post

# Timezone Configuration
DEFAULT_TIMEZONE=Asia/Kolkata
\`\`\`

## ⚙️ Cron-job.org Configuration

### Basic Settings
- **Title:** `Linkzup.in`
- **URL:** `https://linkzup.in/api/cron/external-auto-post`
- **Enable job:** ✅ Checked
- **Save responses in job history:** ✅ Checked

### Execution Schedule
- **Time zone:** `Asia/Kolkata` (IMPORTANT: NOT UTC!)
- **Schedule:** Set to run every 5 minutes for testing, or customize as needed

### Headers
- **Key:** `Authorization`
- **Value:** `Bearer DdtJyHUa9UqykItg8yKrxj7a+xIRD99iIGjEwJ/+z0Y=`

### Request Method
- **Request method:** `1` (POST)

### Advanced Settings
- **Timeout:** `30 seconds`
- **Treat redirects with HTTP 3xx status code as success:** ✅ Checked

## 🧪 Testing Your Setup

### 1. Test the Endpoint
Run this curl command to test your endpoint:

\`\`\`bash
curl -X POST "https://linkzup.in/api/cron/external-auto-post" \
  -H "Authorization: Bearer DdtJyHUa9UqykItg8yKrxj7a+xIRD99iIGjEwJ/+z0Y=" \
  -H "Content-Type: application/json"
\`\`\`

### 2. Test in Your App
1. Start your application
2. Go to any page with a "Schedule Post" button
3. Schedule a test post for a few minutes in the future
4. Check the scheduled posts page to see your post
5. Wait for the scheduled time and verify the post is published

## 📝 Step-by-Step Setup

### Step 1: Deploy Your Code
Make sure your latest code with the external cron endpoint is deployed to Vercel.

### Step 2: Add Environment Variables
Add the environment variables above to your `.env.local` file and redeploy.

### Step 3: Configure cron-job.org
1. Go to [cron-job.org](https://cron-job.org)
2. Create a new job with the settings above
3. Make sure timezone is set to `Asia/Kolkata`
4. Test the job manually first

### Step 4: Test the System
1. Schedule a test post in your app
2. Check that it appears in the scheduled posts page
3. Wait for the scheduled time
4. Verify the post is published to LinkedIn

## 🔧 Troubleshooting

### Common Issues

1. **405 Method Not Allowed**
   - Make sure the endpoint is deployed
   - Check that the URL is correct
   - Verify the request method is POST

2. **401 Unauthorized**
   - Check that the Authorization header is correct
   - Verify the CRON_SECRET matches

3. **Posts Not Being Scheduled**
   - Check that the external cron job is enabled
   - Verify the timezone is set to Asia/Kolkata
   - Check the cron job execution logs

4. **Posts Not Being Published**
   - Verify LinkedIn connection
   - Check credit balance
   - Review error messages in the scheduled posts page

### Debug Commands

\`\`\`bash
# Test the endpoint
curl -X POST "https://linkzup.in/api/cron/external-auto-post" \
  -H "Authorization: Bearer DdtJyHUa9UqykItg8yKrxj7a+xIRD99iIGjEwJ/+z0Y=" \
  -H "Content-Type: application/json" \
  -v

# Check environment variables
echo $CRON_SECRET
echo $NEXT_PUBLIC_APP_URL
\`\`\`

## 📊 Monitoring

### Check Cron Job Status
1. Go to cron-job.org dashboard
2. Check execution history
3. Look for any error messages

### Check App Logs
1. Go to Vercel dashboard
2. Check function logs
3. Look for cron job execution logs

### Check Scheduled Posts
1. Go to your app's scheduled posts page
2. Check post status
3. Look for error messages

## 🎯 Success Indicators

✅ **Setup Complete When:**
- Environment variables are set
- Cron job is configured in cron-job.org
- Test endpoint returns 200 status
- Scheduled posts appear in the app
- Posts are published at the scheduled time

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all configuration settings
3. Test the endpoint manually
4. Check the cron job execution logs
5. Review the scheduled posts page for errors
