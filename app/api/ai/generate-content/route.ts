import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { topic, format, niche } = await request.json()

    if (!topic || !format || !niche) {
      return NextResponse.json({ error: "Topic, format, and niche are required" }, { status: 400 })
    }

    // Get user session for authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Map format to content type
    const contentTypeMap: { [key: string]: any } = {
      "linkedin-post": "linkedin-post",
      "article": "article",
      "story": "story",
      "list": "list",
      "quote": "quote",
      "tips": "tips",
      "insights": "insights"
    }

    const contentType = contentTypeMap[format] || "linkedin-post"

    // Generate content using the centralized AI service with personal story integration
    const response = await aiService.generateContent(
      contentType,
      topic,
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        niche: niche,
        includeHashtags: true,
        includeEmojis: true,
        callToAction: true,
        wordCount: 200
      },
      session.user.id,
      session.user.email
    )

    return NextResponse.json({ 
      success: true,
      content: response.content,
      model: response.metadata.model,
      tokensUsed: response.metadata.tokensUsed,
      cost: response.metadata.cost
    })
  } catch (error) {
    console.error("Error in generate-content API:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
