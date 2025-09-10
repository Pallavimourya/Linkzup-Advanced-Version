# External Cron Setup Guide

This guide explains how to set up the external cron system for automatic posting of scheduled content.

## Overview

The external cron system uses [cron-job.org](https://cron-job.org) to automatically trigger the posting of scheduled content at the specified times. Instead of creating individual cron jobs for each post, we use a single cron job that runs every minute to check for and process all due posts.

## How It Works

1. **User schedules a post** → Post is saved to database with `status: "pending"`
2. **External cron runs every minute** → Checks for posts due in the last 5 minutes
3. **Posts are processed** → Content is posted to LinkedIn and status updated
4. **Credits are deducted** → User's credit balance is reduced accordingly

## Setup Steps

### 1. Environment Variables

Make sure these environment variables are set in your `.env.local`:

\`\`\`bash
# Cron authentication
CRON_SECRET=your-super-secret-cron-key-here

# App URL (for cron-job.org)
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app

# LinkedIn API credentials (already set)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
\`\`\`

### 2. cron-job.org Configuration

1. Go to [cron-job.org](https://cron-job.org) and create an account
2. Click "Create cronjob"
3. Configure as follows:

\`\`\`
Title: Linkzup.in
URL: https://linkzup.in/api/cron/external-auto-post
Method: POST
Headers: 
  Authorization: Bearer your-super-secret-cron-key-here
  Content-Type: application/json
Schedule: Every minute (* * * * *)
Timezone: Asia/Kolkata (IST)
Enabled: Yes
\`\`\`

### 3. Test the Setup

Run the test script to verify everything is working:

\`\`\`bash
node scripts/test-external-cron.js
\`\`\`

Expected output:
\`\`\`
🧪 Testing External Cron System...

✅ External cron executed successfully!
📊 Processed 0 posts
⏰ Processed at: 2024-01-15T10:30:00.000Z

ℹ️  No posts were due for processing

🎯 External cron system is working correctly!
💡 Make sure to set up cron-job.org to call this endpoint every minute:
   URL: https://linkzup.in/api/cron/external-auto-post
   Method: POST
   Headers: Authorization: Bearer your-super-secret-cron-key-here
\`\`\`

## API Endpoints

### External Cron Endpoint

**POST** `/api/cron/external-auto-post`

This endpoint is called by cron-job.org every minute to process scheduled posts.

**Headers:**
- `Authorization: Bearer {CRON_SECRET}` (required)
- `Content-Type: application/json`

**Response:**
\`\`\`json
{
  "message": "Processed 2 scheduled posts",
  "processedAt": "2024-01-15T10:30:00.000Z",
  "results": [
    {
      "postId": "post-id-1",
      "status": "success",
      "linkedInPostId": "linkedin-post-id"
    },
    {
      "postId": "post-id-2",
      "status": "failed",
      "error": "Insufficient credits"
    }
  ]
}
\`\`\`

## How Posts Are Processed

### 1. Finding Due Posts

The cron job looks for posts that are due within the last 5 minutes:

\`\`\`javascript
const now = new Date()
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

const postsToProcess = await db
  .collection("scheduled_posts")
  .find({
    scheduledFor: {
      $gte: fiveMinutesAgo,
      $lte: now,
    },
    status: "pending",
  })
  .toArray()
\`\`\`

### 2. Processing Each Post

For each due post:

1. **Validate timing** - Ensure post is actually due
2. **Check credits** - Verify user has sufficient credits
3. **Get LinkedIn credentials** - Retrieve user's access token
4. **Post to LinkedIn** - Use LinkedIn API to publish content
5. **Update status** - Mark as posted, failed, or retry
6. **Deduct credits** - Reduce user's credit balance

### 3. Error Handling

- **Retry logic** - Failed posts are retried up to 3 times
- **Credit validation** - Posts fail if user lacks credits
- **LinkedIn connection** - Posts fail if LinkedIn account not connected
- **Logging** - All actions are logged for debugging

## Monitoring and Debugging

### 1. Check Cron Job Status

In cron-job.org dashboard:
- Monitor execution logs
- Check response times
- Verify success/failure rates

### 2. Database Monitoring

Check the `scheduled_posts` collection:

\`\`\`javascript
// Check pending posts
db.scheduled_posts.find({ status: "pending" })

// Check failed posts
db.scheduled_posts.find({ status: "failed" })

// Check posted posts
db.scheduled_posts.find({ status: "posted" })
\`\`\`

### 3. Application Logs

Look for these log messages:
- `[External Cron] Processing posts due between...`
- `[External Cron] Found X posts to process`
- `[External Cron] Successfully posted post X to LinkedIn`
- `[External Cron] Post X failed after X retries`

## Troubleshooting

### Common Issues

1. **Posts not being processed**
   - Check if cron-job.org is calling the endpoint
   - Verify CRON_SECRET is correct
   - Check database for posts with `status: "pending"`

2. **Posts failing to post**
   - Check user's credit balance
   - Verify LinkedIn account connection
   - Check LinkedIn API response in logs

3. **Cron job not running**
   - Verify cron-job.org configuration
   - Check if endpoint is accessible
   - Test manually with the test script

### Manual Testing

Test the endpoint manually:

\`\`\`bash
curl -X POST "https://your-app-domain.vercel.app/api/cron/external-auto-post" \
  -H "Authorization: Bearer your-super-secret-cron-key-here" \
  -H "Content-Type: application/json"
\`\`\`

## Security Considerations

1. **CRON_SECRET** - Use a strong, unique secret key
2. **Rate limiting** - Consider adding rate limiting to prevent abuse
3. **IP whitelisting** - Optionally restrict to cron-job.org IPs
4. **Monitoring** - Log all cron job executions for security

## Performance Optimization

1. **Batch processing** - Process multiple posts in one cron run
2. **Database indexing** - Index `scheduledFor` and `status` fields
3. **Connection pooling** - Reuse database connections
4. **Async processing** - Process posts concurrently when possible

## Next Steps

1. Set up cron-job.org with the configuration above
2. Test with the provided test script
3. Schedule a test post in your application
4. Monitor the cron job execution
5. Verify posts are being published to LinkedIn

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs for error messages
3. Test the endpoint manually
4. Verify cron-job.org configuration
5. Check database for post statuses
