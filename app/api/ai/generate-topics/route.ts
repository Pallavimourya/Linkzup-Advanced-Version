import { type NextRequest, NextResponse } from "next/server"
import { generateTopics } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { niche, count } = await request.json()

    if (!niche) {
      return NextResponse.json({ error: "Niche is required" }, { status: 400 })
    }

    const topics = await generateTopics(niche, count || 5)

    return NextResponse.json({ topics })
  } catch (error) {
    console.error("Error in generate-topics API:", error)
    return NextResponse.json({ error: "Failed to generate topics" }, { status: 500 })
  }
}
