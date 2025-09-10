import { type NextRequest, NextResponse } from "next/server"
// @ts-ignore
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { answers, customization } = await request.json()

    const db = await connectDB()
    
    // Save or update personal story answers
    const result = await db.collection("personalStoryAnswers").updateOne(
      { userEmail: session.user.email },
      {
        $set: {
          answers,
          customization,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userEmail: session.user.email,
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: "Personal story answers saved successfully",
      savedAt: new Date()
    })
  } catch (error) {
    console.error("Error saving personal story answers:", error)
    return NextResponse.json({ error: "Failed to save answers" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    
    // Retrieve personal story answers
    const savedAnswers = await db.collection("personalStoryAnswers").findOne({
      userEmail: session.user.email
    })

    if (!savedAnswers) {
      return NextResponse.json({
        answers: null,
        customization: null,
        message: "No saved answers found"
      })
    }

    return NextResponse.json({
      answers: savedAnswers.answers,
      customization: savedAnswers.customization,
      savedAt: savedAnswers.updatedAt,
      message: "Saved answers retrieved successfully"
    })
  } catch (error) {
    console.error("Error retrieving personal story answers:", error)
    return NextResponse.json({ error: "Failed to retrieve answers" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    
    // Delete personal story answers
    const result = await db.collection("personalStoryAnswers").deleteOne({
      userEmail: session.user.email
    })

    return NextResponse.json({
      success: true,
      message: "Personal story answers deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting personal story answers:", error)
    return NextResponse.json({ error: "Failed to delete answers" }, { status: 500 })
  }
}
