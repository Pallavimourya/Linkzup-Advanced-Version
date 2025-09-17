import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { prompt, tone, language, wordCount, targetAudience, mainGoal } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get user session for authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Generate LinkedIn posts using the centralized AI service with personal story integration
    const response = await aiService.generateContent(
      "linkedin-post",
      prompt,
      "openai",
      {
        tone: tone || "professional",
        language: language || "english",
        wordCount: wordCount || 150,
        targetAudience: targetAudience || "LinkedIn professionals",
        mainGoal: mainGoal || "engagement",
        includeHashtags: true,
        includeEmojis: true,
        callToAction: true
      },
      session.user.id,
      session.user.email
    )

    return NextResponse.json({ 
      success: true,
      posts: response.content,
      model: response.metadata.model,
      tokensUsed: response.metadata.tokensUsed,
      cost: response.metadata.cost
    })
  } catch (error) {
    console.error("Error in generate-linkedin-posts API:", error)
    return NextResponse.json({ error: "Failed to generate LinkedIn posts" }, { status: 500 })
  }
}
