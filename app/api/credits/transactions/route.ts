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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()
    const creditTransactions = db.collection("credit_transactions")

    // Get user's credit transactions, sorted by most recent first
    const transactions = await creditTransactions
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const totalCount = await creditTransactions.countDocuments({
      userId: new ObjectId(session.user.id)
    })

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Credit transactions error:", error)
    return NextResponse.json({ error: "Failed to fetch credit transactions" }, { status: 500 })
  }
}
