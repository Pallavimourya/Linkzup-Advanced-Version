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
    const payments = db.collection("payments")

    // Get user's payment history, sorted by most recent first
    const userPayments = await payments
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({
      payments: userPayments,
    })
  } catch (error) {
    console.error("Payment history error:", error)
    return NextResponse.json({ error: "Failed to fetch payment history" }, { status: 500 })
  }
}
