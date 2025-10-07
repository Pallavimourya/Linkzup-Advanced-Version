import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const db = await connectDB()
    
    // Get approved topics from story system
    const approvedTopics = await db.collection("approvedTopics")
      .find({ userEmail })
      .sort({ approvedAt: -1 })
      .toArray()

    // Get approved story topics
    const storyTopics = await db.collection("storyTopics")
      .find({ userEmail, status: "Approved" })
      .sort({ updatedAt: -1 })
      .toArray()

    // Combine and format topics
    const allApprovedTopics = [
      ...approvedTopics.map(topic => ({
        id: topic._id,
        title: topic.topicText,
        source: topic.source || "personal_story",
        approvedAt: topic.approvedAt,
        createdAt: topic.createdAt
      })),
      ...storyTopics.map(topic => ({
        id: topic._id,
        title: topic.topicText,
        source: "personal_story",
        approvedAt: topic.updatedAt,
        createdAt: topic.createdAt
      }))
    ]

    // Remove duplicates based on title
    const uniqueTopics = allApprovedTopics.filter((topic, index, self) => 
      index === self.findIndex(t => t.title.toLowerCase() === topic.title.toLowerCase())
    )

    return NextResponse.json({
      success: true,
      approvedTopics: uniqueTopics
    })

  } catch (error) {
    console.error("Error fetching approved topics:", error)
    return NextResponse.json(
      { error: "Failed to fetch approved topics" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topics, storyId } = await request.json()
    const userEmail = session.user.email

    if (!topics || !Array.isArray(topics)) {
      return NextResponse.json({ error: "Invalid topics data" }, { status: 400 })
    }

    const db = await connectDB()
    
    // Insert approved topics
    const topicDocuments = topics.map((topic: string) => ({
      userEmail,
      topicText: topic,
      source: "manual_approval",
      storyId: storyId || null,
      approvedAt: new Date(),
      createdAt: new Date()
    }))

    await db.collection("approvedTopics").insertMany(topicDocuments)

    return NextResponse.json({
      success: true,
      message: "Topics approved successfully",
      approvedCount: topics.length
    })

  } catch (error) {
    console.error("Error approving topics:", error)
    return NextResponse.json(
      { error: "Failed to approve topics" },
      { status: 500 }
    )
  }
}