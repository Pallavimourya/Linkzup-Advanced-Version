import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { postToLinkedIn, LinkedInPostData } from "@/lib/linkedin-posting"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, images } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Prepare post data
    const postData: LinkedInPostData = {
      content,
      images: images || [],
      userId: session.user.id,
      userEmail: session.user.email,
    }

    // Use unified posting function
    const result = await postToLinkedIn(postData)

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
    console.error("Error posting to LinkedIn:", error)
    return NextResponse.json({ error: "Failed to post to LinkedIn" }, { status: 500 })
  }
}
