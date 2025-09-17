import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { topic, tone, slideCount, style } = await request.json()

    if (!topic || !tone || !slideCount) {
      return NextResponse.json({ 
        error: "Topic, tone, and slideCount are required" 
      }, { status: 400 })
    }

    // Get user session for authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Generate carousel content using AI service
    const response = await aiService.generateContent(
      "carousel",
      topic,
      "openai",
      {
        tone,
        wordCount: slideCount * 50, // Adjust word count based on slide count
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: false,
        includeEmojis: false,
        callToAction: true,
        humanLike: false,
        ambiguity: 30,
        randomness: 20,
        personalTouch: false,
        storytelling: false,
        emotionalDepth: 40,
        conversationalStyle: false,
      },
      session.user.id,
      session.user.email
    )

    return NextResponse.json({ 
      success: true,
      content: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost
    })

  } catch (error) {
    console.error("Error in generate-carousel API:", error)
    return NextResponse.json({ 
      error: "Failed to generate carousel content" 
    }, { status: 500 })
  }
}
