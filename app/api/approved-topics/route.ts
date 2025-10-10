import { NextRequest, NextResponse } from "next/server"
// @ts-ignore
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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
        _id: topic._id,
        id: topic._id, // Also include id for compatibility
        title: topic.topicText,
        source: topic.source || "personal_story",
        approvedAt: topic.approvedAt,
        createdAt: topic.createdAt
      })),
      ...storyTopics.map(topic => ({
        _id: topic._id,
        id: topic._id, // Also include id for compatibility
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topicId } = await request.json()
    const userEmail = session.user.email

    if (!topicId) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 })
    }

    const db = await connectDB()
    
    console.log("Attempting to delete topic with ID:", topicId, "User:", userEmail)
    
    // Try to convert topicId to ObjectId, but also try as string if conversion fails
    let objectId
    let useObjectId = true
    
    try {
      objectId = new ObjectId(topicId)
    } catch (error) {
      console.log("ObjectId conversion failed, trying as string:", topicId)
      useObjectId = false
    }
    
    // Delete from approvedTopics collection
    const approvedQuery = useObjectId 
      ? { _id: objectId, userEmail }
      : { _id: topicId, userEmail }
    
    const approvedResult = await db.collection("approvedTopics").deleteOne(approvedQuery)

    // Also delete from storyTopics collection if it exists there
    const storyQuery = useObjectId 
      ? { _id: objectId, userEmail }
      : { _id: topicId, userEmail }
    
    const storyResult = await db.collection("storyTopics").deleteOne(storyQuery)
    
    console.log("Delete results - approvedTopics:", approvedResult.deletedCount, "storyTopics:", storyResult.deletedCount)

    if (approvedResult.deletedCount === 0 && storyResult.deletedCount === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
      deletedCount: approvedResult.deletedCount + storyResult.deletedCount
    })

  } catch (error) {
    console.error("Error deleting approved topic:", error)
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    )
  }
}