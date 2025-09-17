import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { niche, count } = await request.json()

    if (!niche) {
      return NextResponse.json({ error: "Niche is required" }, { status: 400 })
    }

    // Get user session for authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Generate topics using the centralized AI service with personal story integration
    const response = await aiService.generateContent(
      "topics",
      niche,
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        niche: niche,
        includeHashtags: false,
        includeEmojis: false,
        callToAction: false,
        wordCount: 50
      },
      session.user.id,
      session.user.email
    )

    return NextResponse.json({ 
      success: true,
      topics: response.content,
      model: response.metadata.model,
      tokensUsed: response.metadata.tokensUsed,
      cost: response.metadata.cost
    })
  } catch (error) {
    console.error("Error in generate-topics API:", error)
    return NextResponse.json({ error: "Failed to generate topics" }, { status: 500 })
  }
}
