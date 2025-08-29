import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { deductCredits } from "@/lib/credit-utils"

export interface LinkedInPostData {
  content: string
  images?: string[]
  scheduledFor?: Date
  userId: string
  userEmail: string
}

export interface PostResult {
  success: boolean
  postId?: string
  message: string
  error?: string
}

/**
 * Unified function to handle direct LinkedIn posting
 * Used by all "Post" buttons throughout the application
 */
export async function postToLinkedIn(postData: LinkedInPostData): Promise<PostResult> {
  try {
    // Check and deduct credits
    const creditResult = await deductCredits("text_with_post", "LinkedIn post")
    if (!creditResult) {
      return {
        success: false,
        message: "Insufficient credits",
        error: "INSUFFICIENT_CREDITS"
      }
    }

    // Get user session to access LinkedIn credentials
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.linkedinId || !session?.user?.accessToken) {
      return {
        success: false,
        message: "LinkedIn account not connected. Please connect your LinkedIn account first.",
        error: "LINKEDIN_NOT_CONNECTED"
      }
    }

    // Prepare LinkedIn API request
    const linkedinRequestBody = {
      author: `urn:li:person:${session.user.linkedinId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: postData.content,
          },
          shareMediaCategory: postData.images?.length ? "IMAGE" : "NONE",
          ...(postData.images?.length && {
            media: postData.images.map((image: string) => ({
              status: "READY",
              description: {
                text: "Generated content image",
              },
              media: image,
              title: {
                text: "AI Generated Post",
              },
            })),
          }),
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }

    // Make LinkedIn API call
    const linkedinResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(linkedinRequestBody),
    })

    if (!linkedinResponse.ok) {
      // Note: Credit refund would need to be handled differently
      // For now, we'll just log the failure
      
      const errorText = await linkedinResponse.text()
      console.error("LinkedIn API error:", linkedinResponse.status, errorText)
      
      return {
        success: false,
        message: `Failed to post to LinkedIn: ${linkedinResponse.statusText}`,
        error: "LINKEDIN_API_ERROR"
      }
    }

    const result = await linkedinResponse.json()

    return {
      success: true,
      postId: result.id,
      message: "Posted to LinkedIn successfully",
    }
  } catch (error) {
    console.error("Error posting to LinkedIn:", error)
    
    // Note: Credit refund would need to be handled differently
    // For now, we'll just log the error
    
    return {
      success: false,
      message: "Failed to post to LinkedIn. Please try again.",
      error: "UNKNOWN_ERROR"
    }
  }
}

/**
 * Unified function to handle scheduled LinkedIn posting
 * Used by all scheduling buttons and cron job
 */
export async function scheduleLinkedInPost(postData: LinkedInPostData): Promise<PostResult> {
  try {
    if (!postData.scheduledFor) {
      return {
        success: false,
        message: "Scheduled date is required",
        error: "MISSING_SCHEDULE_DATE"
      }
    }

    // Check and deduct credits
    const creditResult = await deductCredits("auto_post", "Scheduled LinkedIn post")
    if (!creditResult) {
      return {
        success: false,
        message: "Insufficient credits",
        error: "INSUFFICIENT_CREDITS"
      }
    }

    // Store scheduled post in database
    const { MongoClient, ObjectId } = await import("mongodb")
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    try {
      await client.connect()
      const db = client.db()
      
      const scheduledPost = {
        userId: new ObjectId(postData.userId),
        userEmail: postData.userEmail,
        content: postData.content,
        images: postData.images || [],
        scheduledFor: postData.scheduledFor,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("scheduled_posts").insertOne(scheduledPost)

      if (!result.insertedId) {
        // Note: Credit refund would need to be handled differently
        return {
          success: false,
          message: "Failed to schedule post",
          error: "DATABASE_ERROR"
        }
      }

      // Set up cron job for scheduled posting
      // Note: This endpoint should be configured in cron-job.org
      const cronEndpoint = `https://www.linkzup.in/api/cron/auto-post?secret=${process.env.CRON_SECRET}`
      
      // For now, we'll just store the post and let the existing cron job handle it
      // In a production environment, you might want to set up individual cron jobs for each post

      return {
        success: true,
        postId: result.insertedId.toString(),
        message: `Post scheduled for ${postData.scheduledFor.toLocaleString()}`,
      }
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error scheduling LinkedIn post:", error)
    
    // Note: Credit refund would need to be handled differently
    
    return {
      success: false,
      message: "Failed to schedule post. Please try again.",
      error: "UNKNOWN_ERROR"
    }
  }
}

/**
 * Helper function to validate LinkedIn connection
 */
export async function validateLinkedInConnection(userId: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions) as any
    return !!(session?.user?.linkedinId && session?.user?.accessToken)
  } catch (error) {
    console.error("Error validating LinkedIn connection:", error)
    return false
  }
}

/**
 * Helper function to get LinkedIn user info
 */
export async function getLinkedInUserInfo(): Promise<{ linkedinId?: string; isConnected: boolean }> {
  try {
    const session = await getServerSession(authOptions) as any
    return {
      linkedinId: session?.user?.linkedinId,
      isConnected: !!(session?.user?.linkedinId && session?.user?.accessToken)
    }
  } catch (error) {
    console.error("Error getting LinkedIn user info:", error)
    return { isConnected: false }
  }
}
