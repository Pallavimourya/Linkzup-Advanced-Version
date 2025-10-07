import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topicIds, action } = await request.json()
    const userEmail = session.user.email

    if (!topicIds || !Array.isArray(topicIds)) {
      return NextResponse.json({ error: "Invalid topic IDs" }, { status: 400 })
    }

    if (!["approve", "discard"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const db = await connectDB()
    
    // Update topic status
    const result = await db.collection("storyTopics").updateMany(
      { 
        _id: { $in: topicIds.map((id: string) => new ObjectId(id)) },
        userEmail 
      },
      { 
        $set: { 
          status: action === "approve" ? "Approved" : "Discarded",
          updatedAt: new Date()
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No topics found or updated" }, { status: 404 })
    }

    // If approving, also add to approved topics collection for topic generator
    if (action === "approve") {
      const approvedTopics = await db.collection("storyTopics")
        .find({ 
          _id: { $in: topicIds.map((id: string) => new ObjectId(id)) },
          userEmail 
        })
        .toArray()

      const approvedTopicDocuments = approvedTopics.map(topic => ({
        userEmail,
        topicText: topic.topicText,
        source: "personal_story",
        storyId: topic.storyId,
        approvedAt: new Date(),
        createdAt: new Date()
      }))

      await db.collection("approvedTopics").insertMany(approvedTopicDocuments)
    }

    return NextResponse.json({
      success: true,
      message: `${action === "approve" ? "Approved" : "Discarded"} ${result.modifiedCount} topic(s)`,
      modifiedCount: result.modifiedCount
    })

  } catch (error) {
    console.error("Error updating topic status:", error)
    return NextResponse.json(
      { error: "Failed to update topic status" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "Pending Review"

    const db = await connectDB()
    const topics = await db.collection("storyTopics")
      .find({ userEmail, status })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      topics
    })

  } catch (error) {
    console.error("Error fetching topics by status:", error)
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    )
  }
}
