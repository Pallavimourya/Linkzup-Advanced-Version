import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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
 * Note: Credit deduction should be handled by the calling API route
 */
export async function postToLinkedIn(postData: LinkedInPostData): Promise<PostResult> {
  try {
    // Get user session to access LinkedIn credentials
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return {
        success: false,
        message: "User session not found. Please sign in again.",
        error: "NO_SESSION"
      }
    }

    // Fetch user data directly from database to get latest LinkedIn credentials
    const { MongoClient, ObjectId } = await import("mongodb")
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    let userData
    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")
      
      userData = await users.findOne({ _id: new ObjectId(session.user.id) })
      
      if (!userData?.linkedinId || !userData?.linkedinAccessToken) {
        return {
          success: false,
          message: "LinkedIn account not connected. Please connect your LinkedIn account first.",
          error: "LINKEDIN_NOT_CONNECTED"
        }
      }
    } catch (error) {
      console.error("Database error fetching user data:", error)
      return {
        success: false,
        message: "Failed to fetch user data. Please try again.",
        error: "DATABASE_ERROR"
      }
    } finally {
      await client.close()
    }

    // Handle images if provided
    let mediaAssets = []
    if (postData.images && postData.images.length > 0) {
      // For LinkedIn, we need to upload images first and get asset URNs
      for (const imageUrl of postData.images) {
        try {
          // Download the image
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            console.warn(`Failed to download image: ${imageUrl}`)
            continue
          }
          
          const imageBuffer = await imageResponse.arrayBuffer()
          
          // Upload to LinkedIn's asset API
          const assetResponse = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userData.linkedinAccessToken}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify({
              registerUploadRequest: {
                recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                owner: `urn:li:person:${userData.linkedinId}`,
                serviceRelationships: [
                  {
                    relationshipType: "OWNER",
                    identifier: "urn:li:userGeneratedContent",
                  },
                ],
              },
            }),
          })

          if (!assetResponse.ok) {
            console.warn(`Failed to register upload for image: ${imageUrl}`)
            continue
          }

          const assetData = await assetResponse.json()
          const uploadUrl = assetData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl
          const asset = assetData.value.asset

          // Upload the image
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userData.linkedinAccessToken}`,
              "Content-Type": "application/octet-stream",
            },
            body: imageBuffer,
          })

          if (uploadResponse.ok) {
            mediaAssets.push({
              status: "READY",
              description: {
                text: "Generated content image",
              },
              media: asset,
              title: {
                text: "AI Generated Post",
              },
            })
          }
        } catch (error) {
          console.error(`Error uploading image ${imageUrl}:`, error)
        }
      }
    }

    // Prepare LinkedIn API request
    const linkedinRequestBody = {
      author: `urn:li:person:${userData.linkedinId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: postData.content,
          },
          shareMediaCategory: mediaAssets.length > 0 ? "IMAGE" : "NONE",
          ...(mediaAssets.length > 0 && {
            media: mediaAssets,
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
        Authorization: `Bearer ${userData.linkedinAccessToken}`,
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
      console.error("Request body:", JSON.stringify(linkedinRequestBody, null, 2))
      
      return {
        success: false,
        message: `Failed to post to LinkedIn: ${linkedinResponse.statusText}. Please check your LinkedIn connection and try again.`,
        error: "LINKEDIN_API_ERROR"
      }
    }

    const result = await linkedinResponse.json()
    
    console.log("LinkedIn post successful:", {
      postId: result.id,
      userId: postData.userId,
      contentLength: postData.content.length,
      hasImages: postData.images && postData.images.length > 0
    })

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
 * Note: Credit deduction should be handled by the calling API route
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
