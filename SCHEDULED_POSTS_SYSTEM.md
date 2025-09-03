# Scheduled Posts Management System

## Overview

The Scheduled Posts Management System is a comprehensive solution for scheduling and managing social media posts across multiple platforms with external cron job integration. The system provides full CRUD operations, advanced filtering, real-time status tracking, and automatic retry mechanisms.

## Features

### Core Functionality
- **Multi-platform Support**: LinkedIn, Twitter, Facebook
- **Post Types**: Text, Carousel, Image, Article
- **Advanced Scheduling**: Date and time selection with timezone support
- **Status Management**: Pending, Posted, Failed, Paused, Cancelled
- **Retry Mechanism**: Automatic retry with configurable attempts
- **Tagging System**: Organize posts with custom tags
- **Real-time Updates**: Live status tracking and notifications

### External Cron Job Integration
- **Individual Cron Jobs**: Each scheduled post gets its own cron job
- **Automatic Management**: Cron jobs are created, updated, and deleted automatically
- **Error Handling**: Failed posts are retried with exponential backoff
- **Resource Cleanup**: Expired cron jobs are automatically removed

### User Interface
- **List View**: Comprehensive post management with filtering
- **Calendar View**: Visual scheduling interface
- **Statistics Dashboard**: Real-time metrics and analytics
- **Advanced Filtering**: Search by content, tags, status, platform, type
- **Bulk Operations**: Select and manage multiple posts

## Architecture

### Database Schema

\`\`\`javascript
// scheduled_posts collection
{
  _id: ObjectId,
  userId: ObjectId,
  userEmail: string,
  content: string,
  images: string[],
  scheduledFor: Date,
  status: "pending" | "posted" | "failed" | "paused" | "cancelled",
  platform: "linkedin" | "twitter" | "facebook",
  type: "text" | "carousel" | "image" | "article",
  createdAt: Date,
  updatedAt: Date,
  postedAt: Date,
  failedAt: Date,
  errorMessage: string,
  linkedInPostId: string,
  cronJobId: string,
  retryCount: number,
  maxRetries: number,
  tags: string[],
  engagement: {
    likes: number,
    comments: number,
    shares: number
  }
}
\`\`\`

### API Endpoints

#### `/api/scheduled-posts`

**POST** - Schedule a new post
\`\`\`javascript
{
  content: string,
  images?: string[],
  scheduledFor: Date,
  platform: "linkedin" | "twitter" | "facebook",
  type: "text" | "carousel" | "image" | "article",
  tags?: string[]
}
\`\`\`

**GET** - Fetch scheduled posts with filters
\`\`\`javascript
// Query parameters
?status=pending&platform=linkedin&type=text&search=keyword&limit=50&offset=0
?action=stats // Get statistics
\`\`\`

**PUT** - Update scheduled post
\`\`\`javascript
{
  postId: string,
  content?: string,
  images?: string[],
  scheduledFor?: Date,
  status?: string,
  tags?: string[],
  action?: "toggle-status" | "retry"
}
\`\`\`

**DELETE** - Delete scheduled post
\`\`\`javascript
?postId=string
\`\`\`

#### `/api/cron/external-auto-post`

**POST** - Process scheduled posts (called by external cron jobs)
\`\`\`javascript
// Headers
Authorization: Bearer <CRON_SECRET>
x-post-id: string (optional)
x-user-id: string (optional)
\`\`\`

## External Cron Job Setup

### Using cron-job.org

1. **API Key Setup**
   \`\`\`bash
   CRON_JOB_API_KEY=your_cron_job_api_key
   CRON_SECRET=your_cron_secret
   \`\`\`

2. **Automatic Registration**
   - When a post is scheduled, a cron job is automatically created
   - The cron job calls `/api/cron/external-auto-post` at the scheduled time
   - Individual cron jobs are created for each post
   - All times are handled in IST (Asia/Kolkata) timezone

3. **Cron Job Management**
   \`\`\`javascript
   // Register new cron job
   await registerExternalCronJob({
     postId: "post_id",
     scheduledFor: new Date(),
     userId: "user_id"
   })

   // Update existing cron job
   await updateExternalCronJob(cronJobId, newScheduledFor)

   // Delete cron job
   await deleteExternalCronJob(cronJobId)

   // Pause/Resume cron job
   await pauseExternalCronJob(cronJobId)
   await resumeExternalCronJob(cronJobId)
   \`\`\`

### Alternative Cron Services

The system can be adapted to work with other cron services:

- **Vercel Cron Jobs**
- **AWS EventBridge**
- **Google Cloud Scheduler**
- **Custom cron server**

## Usage Examples

### Scheduling a Post

\`\`\`javascript
import { useScheduledPosts } from "@/hooks/use-scheduled-posts"

const { schedulePost } = useScheduledPosts()

const result = await schedulePost({
  content: "Exciting news about our new product!",
  images: ["image1.jpg", "image2.jpg"],
  scheduledFor: new Date("2024-01-15T10:00:00Z"),
  platform: "linkedin",
  type: "carousel",
  tags: ["product", "launch", "excited"]
})
\`\`\`

### Using the Schedule Button Component

\`\`\`javascript
import { ScheduleButton } from "@/components/schedule-button"

<ScheduleButton
  content="Your post content here"
  images={["image1.jpg"]}
  defaultPlatform="linkedin"
  defaultType="text"
  onSuccess={() => console.log("Post scheduled!")}
/>
\`\`\`

### Using the Schedule Modal

\`\`\`javascript
import { SchedulePostModal } from "@/components/schedule-post-modal"

<SchedulePostModal
  content="Your post content here"
  images={["image1.jpg"]}
  trigger={<Button>Schedule Post</Button>}
  onSuccess={() => console.log("Post scheduled!")}
/>
\`\`\`

### Managing Scheduled Posts

\`\`\`javascript
import { useScheduledPosts } from "@/hooks/use-scheduled-posts"

const {
  posts,
  stats,
  loading,
  fetchPosts,
  updatePost,
  deletePost,
  togglePostStatus,
  retryPost
} = useScheduledPosts()

// Fetch posts with filters
await fetchPosts({
  status: "pending",
  platform: "linkedin",
  search: "product"
})

// Update a post
await updatePost(postId, {
  content: "Updated content",
  scheduledFor: new Date("2024-01-16T10:00:00Z")
})

// Toggle post status
await togglePostStatus(postId, "paused")

// Retry failed post
await retryPost(postId)
\`\`\`

## Environment Variables

\`\`\`bash
# Required
CRON_JOB_API_KEY=your_cron_job_api_key
CRON_SECRET=your_cron_secret
NEXT_PUBLIC_APP_URL=https://your-app.com

# External Cron Job Configuration
EXTERNAL_CRON_URL=https://linkzup.in/api/cron/external-auto-post
DEFAULT_TIMEZONE=Asia/Kolkata

# Optional (for fallback cron jobs)
MONGODB_URI=your_mongodb_uri
\`\`\`

## Error Handling

### Retry Mechanism
- Failed posts are automatically retried up to 3 times
- Retry attempts are tracked in the database
- Exponential backoff between retries
- Manual retry option for failed posts

### Error Types
- **INSUFFICIENT_CREDITS**: User doesn't have enough credits
- **LINKEDIN_NOT_CONNECTED**: LinkedIn account not connected
- **SCHEDULE_DATE_PAST**: Scheduled date is in the past
- **DATABASE_ERROR**: Database operation failed
- **CRON_JOB_ERROR**: External cron job creation failed

### Error Recovery
- Automatic credit refund on scheduling failures
- Cron job cleanup on post deletion
- Status updates on all operations
- Detailed error messages for debugging

## Monitoring and Analytics

### Statistics Dashboard
- Total scheduled posts
- Pending posts count
- Posted posts count
- Today's scheduled posts
- Status breakdown by platform

### Performance Metrics
- Post success rate
- Average posting time
- Retry frequency
- Platform-specific metrics

### Logging
- All operations are logged with timestamps
- Error details are captured for debugging
- User actions are tracked for analytics

## Security Considerations

### Authentication
- All API endpoints require valid session
- User can only access their own posts
- Admin endpoints have additional authorization

### Data Protection
- Sensitive data is encrypted
- API keys are stored securely
- Rate limiting on API endpoints

### Cron Job Security
- Secret-based authentication for cron jobs
- Individual post IDs in headers
- User ID validation for each request

## Troubleshooting

### Common Issues

1. **Cron Jobs Not Executing**
   - Check CRON_JOB_API_KEY configuration
   - Verify cron-job.org account status
   - Check network connectivity

2. **Posts Not Being Posted**
   - Verify LinkedIn connection
   - Check credit balance
   - Review error messages in database

3. **Scheduling Failures**
   - Ensure scheduled date is in the future
   - Check required fields are provided
   - Verify user authentication

### Debug Mode

Enable debug logging:
\`\`\`javascript
// In development
console.log("Scheduling post:", postData)
console.log("Cron job result:", cronJobResult)
\`\`\`

## Future Enhancements

### Planned Features
- **Bulk Scheduling**: Schedule multiple posts at once
- **Template System**: Reusable post templates
- **Analytics Integration**: Detailed engagement metrics
- **Multi-language Support**: Internationalization
- **Advanced Scheduling**: Recurring posts, optimal timing

### Performance Optimizations
- **Caching**: Redis for frequently accessed data
- **Queue System**: Background job processing
- **Database Indexing**: Optimized queries
- **CDN Integration**: Fast image delivery

## Support

For technical support or questions about the scheduling system:

1. Check the error logs in the database
2. Verify environment variable configuration
3. Test cron job connectivity
4. Review API response codes
5. Contact the development team

## Contributing

To contribute to the scheduling system:

1. Follow the existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Test with external cron services
5. Submit pull requests with detailed descriptions
