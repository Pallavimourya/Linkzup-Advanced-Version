import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const approvedTopics = await db.collection("approved_topics").find({
      userEmail: session.user.email
    }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ approvedTopics })
  } catch (error) {
    console.error("Error fetching approved topics:", error)
    return NextResponse.json({ error: "Failed to fetch approved topics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topics, storyId } = await request.json()

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "Invalid topics data" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Save approved topics
    const approvedTopics = topics.map((topic: string) => ({
      title: topic,
      userEmail: session.user.email,
      storyId: storyId || null,
      createdAt: new Date(),
      status: "approved"
    }))

    const result = await db.collection("approved_topics").insertMany(approvedTopics)

    return NextResponse.json({ 
      success: true, 
      approvedTopics: approvedTopics.map((topic, index) => ({
        ...topic,
        id: result.insertedIds[index]
      }))
    })
  } catch (error) {
    console.error("Error saving approved topics:", error)
    return NextResponse.json({ error: "Failed to save approved topics" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topicId } = await request.json()

    if (!topicId) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("approved_topics").deleteOne({
      _id: topicId,
      userEmail: session.user.email
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting approved topic:", error)
    return NextResponse.json({ error: "Failed to delete approved topic" }, { status: 500 })
  }
}
