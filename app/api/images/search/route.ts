import { type NextRequest, NextResponse } from "next/server"
import { searchImages } from "@/lib/image-search"

export async function POST(request: NextRequest) {
  try {
    const { query, count } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const images = await searchImages(query, count || 12)

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error in image search API:", error)
    return NextResponse.json({ error: "Failed to search images" }, { status: 500 })
  }
}
