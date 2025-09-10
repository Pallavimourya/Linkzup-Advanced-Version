import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const subscriptions = db.collection("subscriptions")

    // Get user's active subscription
    const subscription = await subscriptions.findOne({
      userId: new ObjectId(session.user.id),
      status: { $in: ["active", "cancelled"] },
    })

    return NextResponse.json({
      subscription: subscription || null,
    })
  } catch (error) {
    console.error("Get subscription error:", error)
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
  }
}
