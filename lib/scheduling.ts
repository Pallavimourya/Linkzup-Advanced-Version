import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface ScheduledPost {
  _id?: ObjectId
  userId: string | ObjectId
  userEmail: string
  content: string
  images?: string[]
  scheduledFor: Date
  status: "pending" | "posted" | "failed" | "paused" | "cancelled"
  platform: "linkedin" | "twitter" | "facebook"
  type: "text" | "carousel" | "image" | "article"
  createdAt: Date
  updatedAt: Date
  postedAt?: Date
  failedAt?: Date
  errorMessage?: string
  linkedInPostId?: string
  cronJobId?: string
  retryCount?: number
  maxRetries?: number
  tags?: string[]
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
  scheduledAt?: Date
  lastChecked?: Date
  redundancyEnabled?: boolean
  backupScheduleTime?: Date
}

export interface SchedulePostRequest {
  userId: string
  userEmail: string
  content: string
  images?: string[]
  scheduledFor: Date
  platform: "linkedin" | "twitter" | "facebook"
  type: "text" | "carousel" | "image" | "article"
  tags?: string[]
}

export interface UpdateScheduledPostRequest {
  content?: string
  images?: string[]
  scheduledFor?: Date
  status?: "pending" | "posted" | "failed" | "paused" | "cancelled"
  tags?: string[]
}

/**
 * Schedule a new post with external cron job and redundancy
 */
export async function schedulePost(postData: SchedulePostRequest) {
  try {
    const { db } = await connectToDatabase()

    const scheduledPost: ScheduledPost = {
      ...postData,
      userId: new ObjectId(postData.userId), // Convert string userId to ObjectId
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      // Add redundancy markers
      scheduledAt: new Date(),
      lastChecked: new Date(),
      redundancyEnabled: true,
    }

    const result = await db.collection("scheduled_posts").insertOne(scheduledPost)

    if (!result.insertedId) {
      return { success: false, error: "Failed to create scheduled post" }
    }

    // Register external cron job (primary)
    const cronJobResult = await registerExternalCronJob({
      postId: result.insertedId.toString(),
      scheduledFor: postData.scheduledFor,
      userId: postData.userId,
    })

    // Set up backup monitoring (secondary)
    const backupSchedule = new Date(postData.scheduledFor.getTime() + 5 * 60 * 1000) // 5 minutes after
    await db.collection("scheduled_posts").updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          cronJobId: cronJobResult.cronJobId,
          backupScheduleTime: backupSchedule,
          updatedAt: new Date() 
        } 
      }
    )

    // Log successful scheduling
    console.log(`[Scheduling] Post ${result.insertedId} scheduled for ${postData.scheduledFor.toISOString()} with backup at ${backupSchedule.toISOString()}`)

    return { 
      success: true, 
      postId: result.insertedId.toString(),
      cronJobId: cronJobResult.cronJobId,
      backupScheduleTime: backupSchedule.toISOString()
    }
  } catch (error) {
    console.error("Error scheduling post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Get scheduled posts with advanced filtering
 */
export async function getScheduledPosts(
  userId: string,
  filters?: {
    status?: string
    date?: Date
    search?: string
    platform?: string
    type?: string
    limit?: number
    offset?: number
  },
) {
  try {
    const { db } = await connectToDatabase()

    // Handle both string and ObjectId userId formats for backward compatibility
    let userIdQuery: any
    try {
      // Try to convert to ObjectId first
      userIdQuery = new ObjectId(userId)
    } catch (error) {
      // If conversion fails, use string as fallback
      userIdQuery = userId
    }

    const query: any = { userId: userIdQuery }

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filters.date)
      endOfDay.setHours(23, 59, 59, 999)

      query.scheduledFor = {
        $gte: startOfDay,
        $lte: endOfDay,
      }
    }

    if (filters?.search) {
      query.$or = [
        { content: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } }
      ]
    }

    if (filters?.platform) {
      query.platform = filters.platform
    }

    if (filters?.type) {
      query.type = filters.type
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const posts = await db.collection("scheduled_posts")
      .find(query)
      .sort({ scheduledFor: 1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const totalCount = await db.collection("scheduled_posts").countDocuments(query)

    return { 
      success: true, 
      posts,
      totalCount,
      hasMore: totalCount > offset + posts.length
    }
  } catch (error) {
    console.error("Error fetching scheduled posts:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Update scheduled post
 */
export async function updateScheduledPost(postId: string, updates: UpdateScheduledPostRequest) {
  try {
    const { db } = await connectToDatabase()

    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    }

    // If scheduledFor is being updated, we need to update the cron job
    if (updates.scheduledFor) {
      const post = await db.collection("scheduled_posts").findOne({ _id: new ObjectId(postId) })
      if (post?.cronJobId) {
        await updateExternalCronJob(post.cronJobId, updates.scheduledFor)
      }
    }

    const result = await db.collection("scheduled_posts").updateOne(
      { _id: new ObjectId(postId) },
      { $set: updateData }
    )

    return { success: true, modifiedCount: result.modifiedCount }
  } catch (error) {
    console.error("Error updating scheduled post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Delete scheduled post (no cron job management needed)
 */
export async function deleteScheduledPost(postId: string) {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("scheduled_posts").deleteOne({ _id: new ObjectId(postId) })

    return { success: true, deletedCount: result.deletedCount }
  } catch (error) {
    console.error("Error deleting scheduled post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Pause or resume scheduled post (no cron job management needed)
 */
export async function toggleScheduledPostStatus(postId: string, status: "paused" | "pending") {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("scheduled_posts").updateOne(
      { _id: new ObjectId(postId) },
      { 
        $set: { 
          status,
          updatedAt: new Date() 
        } 
      }
    )

    return { success: true, modifiedCount: result.modifiedCount }
  } catch (error) {
    console.error("Error toggling scheduled post status:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Retry failed post
 */
export async function retryFailedPost(postId: string) {
  try {
    const { db } = await connectToDatabase()

    const post = await db.collection("scheduled_posts").findOne({ _id: new ObjectId(postId) })
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    if (post.status !== "failed") {
      return { success: false, error: "Only failed posts can be retried" }
    }

    if (post.retryCount && post.retryCount >= (post.maxRetries || 3)) {
      return { success: false, error: "Maximum retry attempts reached" }
    }

    // Reset post for retry
    const updateData = {
      status: "pending" as const,
      retryCount: (post.retryCount || 0) + 1,
      updatedAt: new Date(),
      errorMessage: undefined,
      failedAt: undefined,
    }

    await db.collection("scheduled_posts").updateOne(
      { _id: new ObjectId(postId) },
      { $set: updateData }
    )

    // Create new cron job for retry
    const cronJobResult = await registerExternalCronJob({
      postId: postId,
      scheduledFor: post.scheduledFor,
      userId: post.userId,
    })

    if (cronJobResult.success) {
      await db.collection("scheduled_posts").updateOne(
        { _id: new ObjectId(postId) },
        { $set: { cronJobId: cronJobResult.cronJobId, updatedAt: new Date() } }
      )
    }

    return { success: true }
  } catch (error) {
    console.error("Error retrying failed post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Get scheduled posts statistics
 */
export async function getScheduledPostsStats(userId: string) {
  try {
    const { db } = await connectToDatabase()

    // Handle both string and ObjectId userId formats for backward compatibility
    let userIdQuery: any
    try {
      // Try to convert to ObjectId first
      userIdQuery = new ObjectId(userId)
    } catch (error) {
      // If conversion fails, use string as fallback
      userIdQuery = userId
    }

    const pipeline = [
      { $match: { userId: userIdQuery } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]

    const statusStats = await db.collection("scheduled_posts").aggregate(pipeline).toArray()

    const totalPosts = await db.collection("scheduled_posts").countDocuments({ userId: userIdQuery })
    const pendingPosts = await db.collection("scheduled_posts").countDocuments({ 
      userId: userIdQuery, 
      status: "pending" 
    })
    const postedPosts = await db.collection("scheduled_posts").countDocuments({ 
      userId: userIdQuery, 
      status: "posted" 
    })

    // Get posts scheduled for today
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    const todayPosts = await db.collection("scheduled_posts").countDocuments({
      userId: userIdQuery,
      scheduledFor: { $gte: startOfDay, $lte: endOfDay }
    })

    return {
      success: true,
      stats: {
        total: totalPosts,
        pending: pendingPosts,
        posted: postedPosts,
        today: todayPosts,
        statusBreakdown: statusStats
      }
    }
  } catch (error) {
    console.error("Error getting scheduled posts stats:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// External Cron Job Management Functions

interface CronJobData {
  postId: string
  scheduledFor: Date
  userId: string
}

/**
 * Register external cron job using cron-job.org API
 */
async function registerExternalCronJob(data: CronJobData) {
  try {
    if (!process.env.CRON_JOB_API_KEY) {
      console.warn("CRON_JOB_API_KEY not configured, skipping external cron job registration")
      return { success: true, cronJobId: null }
    }

    // The scheduledFor date is already in the correct timezone (IST)
    // We need to use it as-is for the cron job scheduling
    const scheduledTime = new Date(data.scheduledFor)

    const response = await fetch("https://api.cron-job.org/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/external-auto-post`,
          enabled: true,
          saveResponses: true,
          schedule: {
            timezone: "Asia/Kolkata", // IST timezone
            expiresAt: Math.floor(scheduledTime.getTime() / 1000) + 300, // 5 minutes after scheduled time
            hours: [scheduledTime.getHours()],
            mdays: [scheduledTime.getDate()],
            minutes: [scheduledTime.getMinutes()],
            months: [scheduledTime.getMonth() + 1],
            wdays: [-1], // Any day of week
          },
          requestMethod: 1, // POST
          headers: {
            "Authorization": `Bearer ${process.env.CRON_SECRET}`,
            "x-post-id": data.postId,
            "x-user-id": data.userId,
          },
        },
      }),
    })

    if (!response.ok) {
      console.error("Failed to register cron job:", await response.text())
      return { success: false, cronJobId: null }
    }

    const result = await response.json()
    return { success: true, cronJobId: result.jobId }
  } catch (error) {
    console.error("Error registering external cron job:", error)
    return { success: false, cronJobId: null }
  }
}

/**
 * Update external cron job
 */
async function updateExternalCronJob(cronJobId: string, newScheduledFor: Date) {
  try {
    if (!process.env.CRON_JOB_API_KEY) {
      return { success: true }
    }

    // The newScheduledFor date is already in the correct timezone (IST)
    // We need to use it as-is for the cron job scheduling
    const scheduledTime = new Date(newScheduledFor)

    const response = await fetch(`https://api.cron-job.org/jobs/${cronJobId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schedule: {
          timezone: "Asia/Kolkata", // IST timezone
          expiresAt: Math.floor(scheduledTime.getTime() / 1000) + 300,
          hours: [scheduledTime.getHours()],
          mdays: [scheduledTime.getDate()],
          minutes: [scheduledTime.getMinutes()],
          months: [scheduledTime.getMonth() + 1],
          wdays: [-1],
        },
      }),
    })

    return { success: response.ok }
  } catch (error) {
    console.error("Error updating external cron job:", error)
    return { success: false }
  }
}

/**
 * Delete external cron job
 */
async function deleteExternalCronJob(cronJobId: string) {
  try {
    if (!process.env.CRON_JOB_API_KEY) {
      return { success: true }
    }

    const response = await fetch(`https://api.cron-job.org/jobs/${cronJobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
      },
    })

    return { success: response.ok }
  } catch (error) {
    console.error("Error deleting external cron job:", error)
    return { success: false }
  }
}

/**
 * Pause external cron job
 */
async function pauseExternalCronJob(cronJobId: string) {
  try {
    if (!process.env.CRON_JOB_API_KEY) {
      return { success: true }
    }

    const response = await fetch(`https://api.cron-job.org/jobs/${cronJobId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enabled: false,
      }),
    })

    return { success: response.ok }
  } catch (error) {
    console.error("Error pausing external cron job:", error)
    return { success: false }
  }
}

/**
 * Resume external cron job
 */
async function resumeExternalCronJob(cronJobId: string) {
  try {
    if (!process.env.CRON_JOB_API_KEY) {
      return { success: true }
    }

    const response = await fetch(`https://api.cron-job.org/jobs/${cronJobId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enabled: true,
      }),
    })

    return { success: response.ok }
  } catch (error) {
    console.error("Error resuming external cron job:", error)
    return { success: false }
  }
}
