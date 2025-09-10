import { type NextRequest, NextResponse } from "next/server"
import { generateLinkedInPosts } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { prompt, tone, language, wordCount, targetAudience, mainGoal } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const posts = await generateLinkedInPosts({
      prompt,
      tone,
      language,
      wordCount,
      targetAudience,
      mainGoal,
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error in generate-linkedin-posts API:", error)
    return NextResponse.json({ error: "Failed to generate LinkedIn posts" }, { status: 500 })
  }
}
