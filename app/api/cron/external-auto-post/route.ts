import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { utcToIst } from "@/lib/ist-utils"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `cron-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Log request details for debugging
    const userAgent = request.headers.get("user-agent") || "unknown"
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    console.log(`[${requestId}] [External Cron] Request received from: ${userAgent}`)
    console.log(`[${requestId}] [External Cron] Auth header present: ${!!authHeader}`)
    console.log(`[${requestId}] [External Cron] Auth header matches: ${authHeader === expectedAuth}`)
    
    // Check authorization header for cron-job.org
    if (!authHeader || authHeader !== expectedAuth) {
      console.log(`[${requestId}] Unauthorized cron request - invalid authorization header`)
      console.log(`[${requestId}] [External Cron] Expected: ${expectedAuth}`)
      console.log(`[${requestId}] [External Cron] Received: ${authHeader}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Process all due posts (this is the main purpose of the external cron)
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000) // Extended recovery window

    console.log(`[${requestId}] [External Cron] Processing posts due between ${utcToIst(fiveMinutesAgo).toISOString()} IST and ${utcToIst(now).toISOString()} IST`)

    // First, process normally scheduled posts
    let postsToProcess = await db
      .collection("scheduled_posts")
      .find({
        scheduledFor: {
          $gte: fiveMinutesAgo,
          $lte: now,
        },
        status: "pending",
      })
      .toArray()

    // Auto-recovery: Also process overdue posts (up to 30 minutes overdue for maximum reliability)
    const overduePosts = await db
      .collection("scheduled_posts")
      .find({
        scheduledFor: {
          $gte: thirtyMinutesAgo,
          $lt: fiveMinutesAgo,
        },
        status: "pending",
      })
      .toArray()

    // Also check for stuck posts that might have been missed
    const stuckPosts = await db
      .collection("scheduled_posts")
      .find({
        scheduledFor: {
          $lte: thirtyMinutesAgo,
        },
        status: "pending",
        retryCount: { $lt: 3 }, // Only retry posts that haven't exceeded max retries
      })
      .toArray()

    if (overduePosts.length > 0) {
      console.log(`[${requestId}] [External Cron] Auto-recovery: Found ${overduePosts.length} overdue posts`)
      postsToProcess = [...postsToProcess, ...overduePosts]
    }

    if (stuckPosts.length > 0) {
      console.log(`[${requestId}] [External Cron] Recovery: Found ${stuckPosts.length} stuck posts`)
      postsToProcess = [...postsToProcess, ...stuckPosts]
    }

    console.log(`[${requestId}] [External Cron] Found ${postsToProcess.length} posts to process`)

    const results = []

    for (const post of postsToProcess) {
      try {
        // Check if post is still due and not already processed
        const now = new Date()
        if (post.scheduledFor > now) {
          results.push({
            postId: post._id,
            status: "skipped",
            reason: "Post not yet due"
          })
          continue
        }

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

        // Get user's LinkedIn credentials from database
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

        // Post directly to LinkedIn using user's stored credentials with enhanced timeout and retry
        console.log(`[${requestId}] [External Cron] Attempting to post ${post._id} to LinkedIn`)
        
        const result = await Promise.race([
          postToLinkedInDirectly({
            content: post.content,
            images: post.images || [],
            userId: post.userId.toString(),
            userEmail: post.userEmail,
            linkedinId: userData.linkedinId,
            linkedinAccessToken: userData.linkedinAccessToken
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('LinkedIn API timeout after 45 seconds')), 45000)
          )
        ]) as { success: boolean; postId?: string; message: string; error?: string }

        if (result.success) {
          // Deduct credits
          await deductCredits(post.userId, db)

          // Update post status to posted
          await db.collection("scheduled_posts").updateOne(
            { _id: post._id },
            {
              $set: {
                status: "posted",
                postedAt: new Date(),
                linkedInPostId: result.postId,
                updatedAt: new Date(),
              },
            },
          )

          console.log(`[${requestId}] [External Cron] Successfully posted post ${post._id} to LinkedIn`)
          results.push({ 
            postId: post._id, 
            status: "success",
            linkedInPostId: result.postId 
          })
        } else {
          // Check if we should retry
          const retryCount = post.retryCount || 0
          const maxRetries = post.maxRetries || 3

          if (retryCount < maxRetries) {
            // Retry the post
            await db.collection("scheduled_posts").updateOne(
              { _id: post._id },
              {
                $set: {
                  retryCount: retryCount + 1,
                  updatedAt: new Date(),
                },
              },
            )

            console.log(`[${requestId}] [External Cron] Retrying post ${post._id}, attempt ${retryCount + 1}/${maxRetries}`)
            results.push({
              postId: post._id,
              status: "retry",
              retryCount: retryCount + 1,
              error: result.message
            })
          } else {
            // Mark as failed after max retries
            await markPostAsFailed(post._id, result.message, db, result.error)
            
            console.log(`[${requestId}] [External Cron] Post ${post._id} failed after ${maxRetries} retries`)
            results.push({ 
              postId: post._id, 
              status: "failed", 
              error: result.message,
              errorCode: result.error 
            })
          }
        }
      } catch (error) {
        // Mark as failed due to exception
        await markPostAsFailed(post._id, error instanceof Error ? error.message : "Unknown error", db)
        
        console.error(`[${requestId}] [External Cron] Error processing post ${post._id}:`, error)
        results.push({
          postId: post._id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const executionTime = Date.now() - startTime
    console.log(`[${requestId}] [External Cron] Completed processing ${postsToProcess.length} posts in ${executionTime}ms. Results:`, results)

    const response = {
      message: `Processed ${postsToProcess.length} scheduled posts`,
      processedAt: new Date().toISOString(),
      results,
      userAgent: userAgent,
      success: true,
      executionTimeMs: executionTime,
      requestId: requestId,
      recoveryStats: {
        overduePosts: overduePosts.length,
        stuckPosts: stuckPosts.length,
        totalRecovered: overduePosts.length + stuckPosts.length
      }
    }

    console.log(`[${requestId}] [External Cron] Returning response:`, JSON.stringify(response, null, 2))
    return NextResponse.json(response)
  } catch (error) {
    const requestId = `cron-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.error(`[${requestId}] External cron job error:`, error)
    console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : "No stack trace")
    
    const errorResponse = {
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || "unknown",
      requestId: requestId
    }
    
    console.error(`[${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2))
    
    return NextResponse.json(errorResponse, { status: 500 })
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
 * Used by cron jobs and other background processes
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

          // Upload the image
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

  // Handle both string and ObjectId userId formats for backward compatibility
  let userIdQuery: any
  try {
    // Try to convert to ObjectId first
    userIdQuery = new ObjectId(userId)
  } catch (error) {
    // If conversion fails, use string as fallback
    userIdQuery = userId
  }

  const user = await users.findOne({ _id: userIdQuery })
  if (!user) return

  const currentCredits = user.credits || 0
  const monthlyCredits = user.monthlyCredits || 0
  const totalAvailableCredits = currentCredits + monthlyCredits

  // Deduct credits (1 credit for LinkedIn posting)
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

  // Record the credit transaction
  await creditTransactions.insertOne({
    userId: userIdQuery,
    actionType: "text_with_post",
    credits: -1,
    description: "Scheduled LinkedIn post",
    timestamp: new Date(),
    remainingCredits: totalAvailableCredits - 1
  })
}

/**
 * GET endpoint for testing the external cron job manually
 * This should be disabled in production
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Call the POST method to process scheduled posts
    const response = await POST(request)
    return response
  } catch (error) {
    console.error("Manual external cron job trigger error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
