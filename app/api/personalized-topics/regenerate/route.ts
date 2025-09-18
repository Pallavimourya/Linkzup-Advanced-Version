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

    // Delete existing personalized topics to force regeneration
    try {
      const db = await connectDB()
      await db.collection("personalizedTopics").deleteOne({ userEmail })
      
      return NextResponse.json({
        success: true,
        message: "Personalized topics will be regenerated on next fetch"
      })
    } catch (error) {
      console.error("Error deleting personalized topics:", error)
      return NextResponse.json(
        { error: "Failed to trigger topic regeneration" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Error in regenerate endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}