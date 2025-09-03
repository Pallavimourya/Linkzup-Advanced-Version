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

    const { action, amount } = await request.json()

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    if (action === "deduct") {
      // Deduct credits
      const result = await users.updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $inc: { credits: -amount },
          $set: { updatedAt: new Date() },
        },
      )

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Failed to deduct credits" }, { status: 400 })
      }
    } else if (action === "add") {
      // Add credits (after payment)
      const result = await users.updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $inc: {
            credits: amount,
            totalCreditsEver: amount,
          },
          $set: { updatedAt: new Date() },
        },
      )

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Failed to add credits" }, { status: 400 })
      }
    }

    // Get updated user data
    const updatedUser = await users.findOne({ _id: new ObjectId(session.user.id) })

    return NextResponse.json({
      credits: updatedUser?.credits || 0,
      message: `Credits ${action}ed successfully`,
    })
  } catch (error) {
    console.error("Credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    // Check if trial is still active
    let isTrialActive = false
    let trialEndDate = null
    
    if (user.trialStartDate && user.trialPeriodDays) {
      const trialStartDate = new Date(user.trialStartDate)
      
      // Check if the trial start date is valid
      if (!isNaN(trialStartDate.getTime())) {
        const trialEndDateObj = new Date(trialStartDate.getTime() + user.trialPeriodDays * 24 * 60 * 60 * 1000)
        isTrialActive = new Date() < trialEndDateObj
        trialEndDate = trialEndDateObj.toISOString()
      }
    }

    // Update trial status if expired
    if (user.isTrialActive && !isTrialActive) {
      await users.updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $set: {
            isTrialActive: false,
            updatedAt: new Date(),
          },
        },
      )
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
      credits: user.credits || 0,
      monthlyCredits: user.monthlyCredits || 0,
      monthlyCreditsResetDate: user.monthlyCreditsResetDate,
      isTrialActive: isTrialActive,
      trialEndDate: trialEndDate,
      totalCreditsEver: user.totalCreditsEver || 0,
      plan: user.plan || 'free',
      usage: currentUsage,
    })
  } catch (error) {
    console.error("Get credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
