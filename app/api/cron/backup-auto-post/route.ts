import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { utcToIst } from "@/lib/ist-utils"

export async function POST(request: NextRequest) {
  try {
    // Check authorization header
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      console.log("[Backup Cron] Unauthorized request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[Backup Cron] Backup cron job triggered")
    const { db } = await connectToDatabase()

    // Process overdue posts (more than 5 minutes overdue)
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    console.log(`[Backup Cron] Processing overdue posts from ${utcToIst(oneHourAgo).toISOString()} IST to ${utcToIst(fiveMinutesAgo).toISOString()} IST`)

    const overduePosts = await db
      .collection("scheduled_posts")
      .find({
        scheduledFor: {
          $gte: oneHourAgo,
          $lte: fiveMinutesAgo,
        },
        status: "pending",
      })
      .toArray()

    console.log(`[Backup Cron] Found ${overduePosts.length} overdue posts to process`)

    const results = []

    for (const post of overduePosts) {
      try {
        // Check if user has enough credits
        const user = await db.collection("users").findOne({ _id: new ObjectId(post.userId) })
        if (!user) {
          await markPostAsFailed(post._id, "User not found", db)
          results.push({
            postId: post._id,
            status: "failed",
            error: "User not found"
          })
          continue
        }

        const currentCredits = user.credits || 0
        const monthlyCredits = user.monthlyCredits || 0
        const totalAvailableCredits = currentCredits + monthlyCredits

        if (totalAvailableCredits < 1) {
          await markPostAsFailed(post._id, "Insufficient credits", db)
          results.push({
            postId: post._id,
            status: "failed",
            error: "Insufficient credits"
          })
          continue
        }

        // Get user's LinkedIn credentials
        const userData = await db.collection("users").findOne({ _id: new ObjectId(post.userId) })
        if (!userData?.linkedinId || !userData?.linkedinAccessToken) {
          await markPostAsFailed(post._id, "LinkedIn account not connected", db)
          results.push({
            postId: post._id,
            status: "failed",
            error: "LinkedIn account not connected"
          })
          continue
        }

        // Post to LinkedIn
        const result = await postToLinkedInDirectly({
          content: post.content,
          images: post.images || [],
          userId: post.userId.toString(),
          userEmail: post.userEmail,
          linkedinId: userData.linkedinId,
          linkedinAccessToken: userData.linkedinAccessToken
        })

        if (result.success) {
          // Deduct credits
          await deductCredits(post.userId, db)

          // Update post status
          await db.collection("scheduled_posts").updateOne(
            { _id: post._id },
            {
              $set: {
                status: "posted",
                postedAt: new Date(),
                linkedInPostId: result.postId,
                updatedAt: new Date(),
                recoveryMethod: "backup_cron"
              },
            },
          )

          console.log(`[Backup Cron] Successfully recovered post ${post._id}`)
          results.push({ 
            postId: post._id, 
            status: "success",
            linkedInPostId: result.postId,
            recoveryMethod: "backup_cron"
          })
        } else {
          await markPostAsFailed(post._id, result.message, db, result.error)
          results.push({ 
            postId: post._id, 
            status: "failed", 
            error: result.message,
            errorCode: result.error 
          })
        }
      } catch (error) {
        await markPostAsFailed(post._id, error instanceof Error ? error.message : "Unknown error", db)
        console.error(`[Backup Cron] Error processing post ${post._id}:`, error)
        results.push({
          postId: post._id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log(`[Backup Cron] Completed processing ${overduePosts.length} overdue posts. Results:`, results)

    return NextResponse.json({
      message: `Backup cron processed ${overduePosts.length} overdue posts`,
      processedAt: new Date().toISOString(),
      results,
      recoveryMethod: "backup_cron"
    })
  } catch (error) {
    console.error("Backup cron job error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * Helper function to mark post as failed
 */
async function markPostAsFailed(postId: ObjectId, errorMessage: string, db: any, errorCode?: string) {
  await db.collection("scheduled_posts").updateOne(
    { _id: postId },
    {
      $set: {
        status: "failed",
        failedAt: new Date(),
        errorMessage,
        errorCode,
        updatedAt: new Date(),
      },
    },
  )
}

/**
 * Post directly to LinkedIn without requiring user session
 */
async function postToLinkedInDirectly(postData: {
  content: string
  images?: string[]
  userId: string
  userEmail: string
  linkedinId: string
  linkedinAccessToken: string
}): Promise<{ success: boolean; postId?: string; message: string; error?: string }> {
  try {
    // Handle images if provided
    let mediaAssets = []
    if (postData.images && postData.images.length > 0) {
      for (const imageUrl of postData.images) {
        try {
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            console.warn(`Failed to download image: ${imageUrl}`)
            continue
          }
          
          const imageBuffer = await imageResponse.arrayBuffer()
          
          const assetResponse = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${postData.linkedinAccessToken}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify({
              registerUploadRequest: {
                recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                owner: `urn:li:person:${postData.linkedinId}`,
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
            console.warn(`Failed to register image upload: ${await assetResponse.text()}`)
            continue
          }

          const assetData = await assetResponse.json()
          const uploadUrl = assetData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl
          const asset = assetData.value.asset

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: imageBuffer,
          })

          if (uploadResponse.ok) {
            mediaAssets.push(asset)
          }
        } catch (error) {
          console.warn(`Failed to process image: ${imageUrl}`, error)
        }
      }
    }

    // Create the LinkedIn post
    const postPayload: any = {
      author: `urn:li:person:${postData.linkedinId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: postData.content,
          },
          shareMediaCategory: mediaAssets.length > 0 ? "IMAGE" : "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }

    if (mediaAssets.length > 0) {
      postPayload.specificContent["com.linkedin.ugc.ShareContent"].media = mediaAssets.map(asset => ({
        status: "READY",
        description: {
          text: "Image",
        },
        media: asset,
        title: {
          text: "Image",
        },
      }))
    }

    const postResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${postData.linkedinAccessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postPayload),
    })

    if (!postResponse.ok) {
      const errorText = await postResponse.text()
      console.error("LinkedIn API error:", errorText)
      return {
        success: false,
        message: `LinkedIn API error: ${postResponse.status}`,
        error: "LINKEDIN_API_ERROR"
      }
    }

    const postResult = await postResponse.json()
    return {
      success: true,
      postId: postResult.id,
      message: "Post published successfully"
    }

  } catch (error) {
    console.error("Error posting to LinkedIn:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: "POSTING_ERROR"
    }
  }
}

/**
 * Helper function to deduct credits
 */
async function deductCredits(userId: any, db: any) {
  const users = db.collection("users")
  const creditTransactions = db.collection("credit_transactions")

  let userIdQuery: any
  try {
    userIdQuery = new ObjectId(userId)
  } catch (error) {
    userIdQuery = userId
  }

  const user = await users.findOne({ _id: userIdQuery })
  if (!user) return

  const currentCredits = user.credits || 0
  const monthlyCredits = user.monthlyCredits || 0
  const totalAvailableCredits = currentCredits + monthlyCredits

  const deductionFromMonthly = Math.min(monthlyCredits, 1)
  const deductionFromAdditional = 1 - deductionFromMonthly

  const updateData: any = {
    $set: { updatedAt: new Date() },
  }

  if (deductionFromMonthly > 0) {
    updateData.$inc = { monthlyCredits: -deductionFromMonthly }
  }

  if (deductionFromAdditional > 0) {
    if (updateData.$inc) {
      updateData.$inc.credits = -deductionFromAdditional
    } else {
      updateData.$inc = { credits: -deductionFromAdditional }
    }
  }

  await users.updateOne({ _id: userIdQuery }, updateData)

  await creditTransactions.insertOne({
    userId: userIdQuery,
    actionType: "text_with_post",
    credits: -1,
    description: "Scheduled LinkedIn post (backup cron)",
    timestamp: new Date(),
    remainingCredits: totalAvailableCredits - 1
  })
}

export async function GET(request: NextRequest) {
  return POST(request)
}
