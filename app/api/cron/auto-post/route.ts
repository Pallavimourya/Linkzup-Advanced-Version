import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { postToLinkedIn, LinkedInPostData } from "@/lib/linkedin-posting"

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get("x-cron-secret")
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Find scheduled posts that are due
    const scheduledPosts = await db
      .collection("scheduled_posts")
      .find({
        scheduledFor: {
          $gte: fiveMinutesAgo,
          $lte: now,
        },
        status: "pending",
      })
      .toArray()

    const results = []

    for (const post of scheduledPosts) {
      try {
        // Prepare post data for unified function
        const postData: LinkedInPostData = {
          content: post.content,
          images: post.images || [],
          userId: post.userId.toString(),
          userEmail: post.userEmail,
        }

        // Use unified posting function
        const result = await postToLinkedIn(postData)

        if (result.success) {
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

          results.push({ 
            postId: post._id, 
            status: "success",
            linkedInPostId: result.postId 
          })
        } else {
          // Update post status to failed
          await db.collection("scheduled_posts").updateOne(
            { _id: post._id },
            {
              $set: {
                status: "failed",
                failedAt: new Date(),
                errorMessage: result.message,
                errorCode: result.error,
                updatedAt: new Date(),
              },
            },
          )
          
          results.push({ 
            postId: post._id, 
            status: "failed", 
            error: result.message,
            errorCode: result.error 
          })
        }
      } catch (error) {
        // Update post status to failed due to exception
        await db.collection("scheduled_posts").updateOne(
          { _id: post._id },
          {
            $set: {
              status: "failed",
              failedAt: new Date(),
              errorMessage: error instanceof Error ? error.message : "Unknown error",
              updatedAt: new Date(),
            },
          },
        )
        
        results.push({
          postId: post._id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${scheduledPosts.length} scheduled posts`,
      processedAt: now.toISOString(),
      results,
    })
  } catch (error) {
    console.error("Cron job error:", error)
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
 * GET endpoint for testing the cron job manually
 * This should be disabled in production
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.nextUrl.searchParams.get("secret")
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Call the POST method to process scheduled posts
    const response = await POST(request)
    return response
  } catch (error) {
    console.error("Manual cron job trigger error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
