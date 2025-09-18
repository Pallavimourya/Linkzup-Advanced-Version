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

    const userEmail = session.user.email
    const { topics } = await request.json()

    if (!topics || !Array.isArray(topics)) {
      return NextResponse.json({ error: "Invalid topics data" }, { status: 400 })
    }

    const db = await connectDB()
    
    // Store or update personalized topics for the user
    await db.collection("personalizedTopics").updateOne(
      { userEmail },
      { 
        $set: { 
          topics,
          userEmail,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ 
      success: true,
      message: "Personalized topics stored successfully",
      topicsCount: topics.length
    })

  } catch (error) {
    console.error("Error storing personalized topics:", error)
    return NextResponse.json(
      { error: "Failed to store personalized topics" },
      { status: 500 }
    )
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
    
    // Get stored personalized topics for the user
    const storedData = await db.collection("personalizedTopics").findOne({ userEmail })

    if (!storedData) {
      return NextResponse.json({ 
        hasStoredTopics: false,
        message: "No stored personalized topics found" 
      })
    }

    return NextResponse.json({
      hasStoredTopics: true,
      topics: storedData.topics,
      createdAt: storedData.createdAt,
      updatedAt: storedData.updatedAt
    })

  } catch (error) {
    console.error("Error retrieving personalized topics:", error)
    return NextResponse.json(
      { error: "Failed to retrieve personalized topics" },
      { status: 500 }
    )
  }
}
