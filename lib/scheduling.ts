import { connectToDatabase } from "@/lib/mongodb"

export interface ScheduledPost {
  _id?: string
  userId: string
  content: string
  scheduledFor: Date
  status: "pending" | "posted" | "failed" | "paused"
  platform: "linkedin" | "twitter" | "facebook"
  type: "text" | "carousel" | "image"
  createdAt: Date
  lastModified: Date
  postedAt?: Date
  failedAt?: Date
  errorMessage?: string
  linkedInPostId?: string
}

export async function schedulePost(postData: Omit<ScheduledPost, "_id" | "createdAt" | "lastModified">) {
  try {
    const { db } = await connectToDatabase()

    const scheduledPost: ScheduledPost = {
      ...postData,
      createdAt: new Date(),
      lastModified: new Date(),
    }

    const result = await db.collection("scheduled_posts").insertOne(scheduledPost)

    await registerCronJob(scheduledPost.scheduledFor)

    return { success: true, postId: result.insertedId }
  } catch (error) {
    console.error("Error scheduling post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getScheduledPosts(
  userId: string,
  filters?: {
    status?: string
    date?: Date
    search?: string
  },
) {
  try {
    const { db } = await connectToDatabase()

    const query: any = { userId }

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
      query.content = { $regex: filters.search, $options: "i" }
    }

    const posts = await db.collection("scheduled_posts").find(query).sort({ scheduledFor: 1 }).toArray()

    return { success: true, posts }
  } catch (error) {
    console.error("Error fetching scheduled posts:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateScheduledPost(postId: string, updates: Partial<ScheduledPost>) {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("scheduled_posts").updateOne(
      { _id: postId },
      {
        $set: {
          ...updates,
          lastModified: new Date(),
        },
      },
    )

    return { success: true, modifiedCount: result.modifiedCount }
  } catch (error) {
    console.error("Error updating scheduled post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteScheduledPost(postId: string) {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("scheduled_posts").deleteOne({ _id: postId })

    return { success: true, deletedCount: result.deletedCount }
  } catch (error) {
    console.error("Error deleting scheduled post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function registerCronJob(scheduledTime: Date) {
  try {
    const cronJobResponse = await fetch("https://api.cron-job.org/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/auto-post`,
          enabled: true,
          saveResponses: true,
          schedule: {
            timezone: "UTC",
            expiresAt: Math.floor(scheduledTime.getTime() / 1000) + 300, // 5 minutes after scheduled time
            hours: [scheduledTime.getUTCHours()],
            mdays: [scheduledTime.getUTCDate()],
            minutes: [scheduledTime.getUTCMinutes()],
            months: [scheduledTime.getUTCMonth() + 1],
            wdays: [-1], // Any day of week
          },
          requestMethod: 1, // POST
          headers: {
            "x-cron-secret": process.env.CRON_SECRET,
          },
        },
      }),
    })

    if (!cronJobResponse.ok) {
      console.error("Failed to register cron job:", await cronJobResponse.text())
    }
  } catch (error) {
    console.error("Error registering cron job:", error)
  }
}
