import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { scheduleLinkedInPost, LinkedInPostData } from "@/lib/linkedin-posting"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, images, scheduledFor } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!scheduledFor) {
      return NextResponse.json({ error: "Scheduled date is required" }, { status: 400 })
    }

    // Validate scheduled date
    const scheduledDate = new Date(scheduledFor)
    const now = new Date()
    
    if (scheduledDate <= now) {
      return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 })
    }

    // Prepare post data
    const postData: LinkedInPostData = {
      content,
      images: images || [],
      scheduledFor: scheduledDate,
      userId: session.user.id,
      userEmail: session.user.email,
    }

    // Use unified scheduling function
    const result = await scheduleLinkedInPost(postData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        postId: result.postId,
        message: result.message,
      })
    } else {
      return NextResponse.json({ 
        error: result.message,
        errorCode: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error scheduling LinkedIn post:", error)
    return NextResponse.json({ error: "Failed to schedule post" }, { status: 500 })
  }
}
