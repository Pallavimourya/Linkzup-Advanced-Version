import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { schedulePost } from "@/lib/scheduling"
import { deductCredits } from "@/lib/credit-utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession() as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, scheduledFor, platform, type } = await request.json()

    if (!content || !scheduledFor || !platform) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const creditResult = await deductCredits("auto_post", "Scheduled post")
    if (!creditResult) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    const result = await schedulePost({
      userId: session.user.email,
      content,
      scheduledFor: new Date(scheduledFor),
      status: "pending",
      platform,
      type: type || "text",
    })

    if (result.success) {
      return NextResponse.json({
        message: "Post scheduled successfully",
        postId: result.postId,
      })
    } else {
      // Note: Credit refund would need to be handled differently
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error scheduling post:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
