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

    const { db } = await connectToDatabase()
    const subscriptions = db.collection("subscriptions")

    // Find and update the cancelled subscription
    const result = await subscriptions.updateOne(
      {
        userId: new ObjectId(session.user.id),
        status: "cancelled",
      },
      {
        $set: {
          status: "active",
          reactivatedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "No cancelled subscription found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Subscription reactivated successfully",
    })
  } catch (error) {
    console.error("Reactivate subscription error:", error)
    return NextResponse.json({ error: "Failed to reactivate subscription" }, { status: 500 })
  }
}
