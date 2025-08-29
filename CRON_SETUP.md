# Cron Job Setup for LinkzUp

This document explains how to set up the automated posting system and trial management for LinkzUp using cron-job.org.

## Overview

LinkzUp uses cron jobs to:
1. Automatically post scheduled content to LinkedIn
2. Manage trial period expiration
3. Reset monthly credits for subscription users

The cron jobs run at different intervals to handle these automated tasks.

## Endpoint Configuration

### Auto-Posting Cron Job
**URL:**
\`\`\`
https://www.linkzup.in/api/cron/auto-post
\`\`\`

**Method:** POST

**Headers:**
\`\`\`
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/json
\`\`\`

**Schedule:** Every 5 minutes
\`\`\`
*/5 * * * *
\`\`\`

### Trial Expiration Cron Job
**URL:**
\`\`\`
https://www.linkzup.in/api/cron/trial-expiration
\`\`\`

**Method:** POST

**Headers:**
\`\`\`
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/json
\`\`\`

**Schedule:** Daily at 12:00 AM
\`\`\`
0 0 * * *
\`\`\`

### Monthly Credit Reset Cron Job
**URL:**
\`\`\`
https://www.linkzup.in/api/cron/monthly-credit-reset
\`\`\`

**Method:** POST

**Headers:**
\`\`\`
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/json
\`\`\`

**Schedule:** Monthly on the 1st at 12:00 AM
\`\`\`
0 0 1 * *
\`\`\`

## Environment Variables

Make sure to set the following environment variables:

\`\`\`env
# Cron job secret for authentication
CRON_SECRET=your-secure-random-secret-here

# LinkedIn API credentials
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# MongoDB connection
MONGODB_URI=your-mongodb-connection-string
\`\`\`

## Setup Instructions

### 1. Generate a Secure Secret
Generate a secure random string for the `CRON_SECRET`:
\`\`\`bash
# Using openssl
openssl rand -base64 32

# Or using node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

### 2. Configure cron-job.org

You need to set up three separate cron jobs:

#### Auto-Posting Cron Job
1. Go to [cron-job.org](https://cron-job.org)
2. Create an account or sign in
3. Click "Create cronjob"
4. Configure the job:

   **URL:**
   \`\`\`
   https://www.linkzup.in/api/cron/auto-post
   \`\`\`

   **Method:** POST

   **Headers:**
   \`\`\`
   Authorization: Bearer YOUR_CRON_SECRET
   Content-Type: application/json
   \`\`\`

   **Schedule:** Every 5 minutes
   \`\`\`
   */5 * * * *
   \`\`\`

   **Retry on failure:** Yes (recommended)
   **Max retries:** 3

#### Trial Expiration Cron Job
1. Create another cron job
2. Configure:

   **URL:**
   \`\`\`
   https://www.linkzup.in/api/cron/trial-expiration
   \`\`\`

   **Method:** POST

   **Headers:**
   \`\`\`
   Authorization: Bearer YOUR_CRON_SECRET
   Content-Type: application/json
   \`\`\`

   **Schedule:** Daily at 12:00 AM
   \`\`\`
   0 0 * * *
   \`\`\`

   **Retry on failure:** Yes
   **Max retries:** 3

#### Monthly Credit Reset Cron Job
1. Create another cron job
2. Configure:

   **URL:**
   \`\`\`
   https://www.linkzup.in/api/cron/monthly-credit-reset
   \`\`\`

   **Method:** POST

   **Headers:**
   \`\`\`
   Authorization: Bearer YOUR_CRON_SECRET
   Content-Type: application/json
   \`\`\`

   **Schedule:** Monthly on the 1st at 12:00 AM
   \`\`\`
   0 0 1 * *
   \`\`\`

   **Retry on failure:** Yes
   **Max retries:** 3

### 3. Test the Setup

You can test the cron job manually by making a GET request:
\`\`\`
https://www.linkzup.in/api/cron/auto-post?secret=YOUR_CRON_SECRET
\`\`\`

**Note:** The GET endpoint should be disabled in production for security reasons.

## How It Works

### Auto-Posting System
1. **Scheduled Posts Storage**: When users schedule posts, they are stored in the `scheduled_posts` collection with status "pending"

2. **Cron Job Execution**: Every 5 minutes, the auto-post cron job:
   - Checks for posts scheduled within the last 5 minutes
   - Attempts to post each one to LinkedIn
   - Updates the post status to "posted" or "failed"

3. **Error Handling**: Failed posts are marked with error details and can be retried

### Trial Management System
1. **Trial Tracking**: New users get 10 credits and a 2-day trial period
2. **Daily Expiration Check**: The trial expiration cron job runs daily to:
   - Check all users with active trials
   - Expire trials that have passed the 2-day limit
   - Update user status to reflect trial expiration
3. **Automatic Status Updates**: Trial status is checked on each credit deduction

### Monthly Credit Reset
1. **Subscription Tracking**: Users with subscription plans have monthly credit limits
2. **Monthly Reset**: The monthly reset cron job runs on the 1st of each month to:
   - Reset monthly credits for all subscription users
   - Update the reset date for tracking

## Database Schema

### scheduled_posts Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId,
  userEmail: String,
  content: String,
  images: Array<String>,
  scheduledFor: Date,
  status: String, // "pending", "posted", "failed"
  createdAt: Date,
  updatedAt: Date,
  postedAt: Date, // Set when successfully posted
  failedAt: Date, // Set when failed
  errorMessage: String, // Error details if failed
  errorCode: String, // Error code if failed
  linkedInPostId: String // LinkedIn post ID if successful
}
\`\`\`

## Monitoring

### Check Cron Job Status
Monitor the cron job through cron-job.org dashboard or by checking your application logs.

### View Scheduled Posts
Query the database to see scheduled posts:
\`\`\`javascript
// All pending posts
db.scheduled_posts.find({ status: "pending" })

// Failed posts
db.scheduled_posts.find({ status: "failed" })

// Posts scheduled for today
db.scheduled_posts.find({
  scheduledFor: {
    $gte: new Date(new Date().setHours(0,0,0,0)),
    $lt: new Date(new Date().setHours(23,59,59,999))
  }
})
\`\`\`

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check that `CRON_SECRET` matches between environment and cron-job.org
   - Verify the secret is being sent in the `x-cron-secret` header

2. **500 Internal Server Error**
   - Check application logs for detailed error messages
   - Verify MongoDB connection is working
   - Ensure LinkedIn API credentials are valid

3. **Posts Not Being Published**
   - Check if users have sufficient credits
   - Verify LinkedIn accounts are properly connected
   - Check if posts are within the 5-minute window

### Logs
Monitor your application logs for cron job execution:
\`\`\`
[INFO] Cron job executed - Processed X scheduled posts
[ERROR] Failed to post scheduled post: {postId} - {error}
\`\`\`

## Security Considerations

1. **Keep CRON_SECRET Secure**: Never commit the secret to version control
2. **Use HTTPS**: Always use HTTPS for the cron job URL
3. **Disable GET Endpoint**: In production, consider disabling the GET endpoint
4. **Rate Limiting**: Consider implementing rate limiting on the endpoint
5. **Monitoring**: Set up alerts for cron job failures

## Alternative Setup

If you prefer not to use cron-job.org, you can:

1. **Use a VPS**: Set up a cron job on your server
2. **Use AWS Lambda**: Create a scheduled Lambda function
3. **Use Google Cloud Functions**: Set up a scheduled function
4. **Use a dedicated service**: Services like EasyCron, Cronitor, etc.

## Support

For issues with the cron job setup, check:
1. Application logs
2. cron-job.org dashboard
3. MongoDB connection
4. LinkedIn API credentials
5. Environment variables

Contact support at support@linkzup.in for additional help.
