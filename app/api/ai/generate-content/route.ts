import { type NextRequest, NextResponse } from "next/server"
import { generateContent } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { topic, format, niche } = await request.json()

    if (!topic || !format || !niche) {
      return NextResponse.json({ error: "Topic, format, and niche are required" }, { status: 400 })
    }

    const content = await generateContent(topic, format, niche)

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error in generate-content API:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
