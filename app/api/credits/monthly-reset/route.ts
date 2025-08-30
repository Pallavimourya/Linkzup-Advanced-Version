import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { PLAN_LIMITS } from "@/lib/credit-utils"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Get current user data
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userPlan = user.plan || 'free'
    const planLimits = PLAN_LIMITS[userPlan]

    if (!planLimits) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Calculate monthly credits based on plan
    const monthlyCredits = planLimits.textWithPost // Using textWithPost as base monthly credits

    // Reset monthly credits
    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          monthlyCredits: monthlyCredits,
          monthlyCreditsResetDate: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to reset monthly credits" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Monthly credits reset successfully",
      monthlyCredits,
      plan: userPlan,
    })
  } catch (error) {
    console.error("Monthly credit reset error:", error)
    return NextResponse.json({ error: "Failed to reset monthly credits" }, { status: 500 })
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

    const userPlan = user.plan || 'free'
    const planLimits = PLAN_LIMITS[userPlan]
    const monthlyCredits = planLimits ? planLimits.textWithPost : 0

    return NextResponse.json({
      monthlyCredits: user.monthlyCredits || monthlyCredits,
      monthlyCreditsResetDate: user.monthlyCreditsResetDate,
      plan: userPlan,
      totalCredits: user.credits || 0,
    })
  } catch (error) {
    console.error("Get monthly credits error:", error)
    return NextResponse.json({ error: "Failed to get monthly credits" }, { status: 500 })
  }
}
