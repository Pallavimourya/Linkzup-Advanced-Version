import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { deductCredits } from "@/lib/credit-utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, images } = await request.json()

    // Check and deduct credits
    const creditResult = await deductCredits(session.user.email, 1)
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 400 })
    }

    // LinkedIn API integration
    const linkedinResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${session.user.linkedinId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: images?.length > 0 ? "IMAGE" : "NONE",
            ...(images?.length > 0 && {
              media: images.map((image: string) => ({
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
      }),
    })

    if (!linkedinResponse.ok) {
      // Refund credits on failure
      await deductCredits(session.user.email, -1)
      throw new Error("Failed to post to LinkedIn")
    }

    const result = await linkedinResponse.json()

    return NextResponse.json({
      success: true,
      postId: result.id,
      message: "Posted to LinkedIn successfully",
    })
  } catch (error) {
    console.error("Error posting to LinkedIn:", error)
    return NextResponse.json({ error: "Failed to post to LinkedIn" }, { status: 500 })
  }
}
