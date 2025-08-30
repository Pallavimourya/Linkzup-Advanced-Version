import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { actionType } = await request.json()

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Get current month's usage
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Update usage for the current month
    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $inc: {
          [`usage.${currentMonth}.${actionType}`]: 1,
          [`usage.${currentMonth}.total`]: 1,
        },
        $set: { updatedAt: new Date() },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Usage updated successfully",
    })
  } catch (error) {
    console.error("Usage update error:", error)
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get current month's usage
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentUsage = user.usage?.[currentMonth] || {
      textOnly: 0,
      textWithPost: 0,
      textWithImage: 0,
      textImagePost: 0,
      imageOnly: 0,
      autoPost: 0,
      total: 0
    }

    return NextResponse.json({
      usage: currentUsage,
      currentMonth,
    })
  } catch (error) {
    console.error("Usage fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 })
  }
}
