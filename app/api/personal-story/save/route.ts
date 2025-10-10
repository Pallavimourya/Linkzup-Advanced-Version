import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { story } = await request.json()
    const userEmail = session.user.email

    if (!story || !story.content) {
      return NextResponse.json({ error: "Story content is required" }, { status: 400 })
    }

    const db = await connectDB()
    
    // Save or update the user's personal story (replace previous one)
    const result = await db.collection("personalStories").updateOne(
      { userEmail },
      {
        $set: {
          userEmail,
          title: story.title || "My Professional Journey",
          content: story.content,
          tone: story.tone || "professional",
          wordCount: story.wordCount || 400,
          createdAt: new Date(),
          updatedAt: new Date(),
          variation: story.variation || 1,
          relatedTopics: story.relatedTopics || []
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: "Personal story saved successfully",
      storyId: result.upsertedId || "updated",
      savedAt: new Date()
    })
  } catch (error) {
    console.error("Error saving personal story:", error)
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const db = await connectDB()
    
    // Get the user's saved personal story
    const story = await db.collection("personalStories").findOne({ userEmail })

    if (!story) {
      return NextResponse.json({ 
        success: false, 
        message: "No personal story found" 
      })
    }

    return NextResponse.json({
      success: true,
      story: {
        id: story._id,
        title: story.title,
        content: story.content,
        tone: story.tone,
        wordCount: story.wordCount,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        variation: story.variation,
        relatedTopics: story.relatedTopics
      }
    })
  } catch (error) {
    console.error("Error fetching personal story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}
