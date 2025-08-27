import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get("x-cron-secret")
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

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
        const linkedInResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author: `urn:li:person:${post.userId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text: post.content,
                },
                shareMediaCategory: "NONE",
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          }),
        })

        if (linkedInResponse.ok) {
          await db.collection("scheduled_posts").updateOne(
            { _id: post._id },
            {
              $set: {
                status: "posted",
                postedAt: new Date(),
                linkedInPostId: (await linkedInResponse.json()).id,
              },
            },
          )

          await db.collection("users").updateOne({ _id: post.userId }, { $inc: { credits: -0.5 } })

          results.push({ postId: post._id, status: "success" })
        } else {
          await db.collection("scheduled_posts").updateOne(
            { _id: post._id },
            {
              $set: {
                status: "failed",
                failedAt: new Date(),
                errorMessage: `LinkedIn API error: ${linkedInResponse.status}`,
              },
            },
          )
          results.push({ postId: post._id, status: "failed", error: linkedInResponse.statusText })
        }
      } catch (error) {
        await db.collection("scheduled_posts").updateOne(
          { _id: post._id },
          {
            $set: {
              status: "failed",
              failedAt: new Date(),
              errorMessage: error instanceof Error ? error.message : "Unknown error",
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
