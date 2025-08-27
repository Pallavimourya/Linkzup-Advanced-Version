import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, amount } = await request.json()

    await client.connect()
    const users = client.db().collection("users")

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
  } finally {
    await client.close()
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await client.connect()
    const users = client.db().collection("users")

    const user = await users.findOne({ _id: new ObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if trial is still active
    const trialStartDate = new Date(user.trialStartDate)
    const trialEndDate = new Date(trialStartDate.getTime() + user.trialPeriodDays * 24 * 60 * 60 * 1000)
    const isTrialActive = new Date() < trialEndDate

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

    return NextResponse.json({
      credits: user.credits || 0,
      isTrialActive: isTrialActive,
      trialEndDate: trialEndDate.toISOString(),
      totalCreditsEver: user.totalCreditsEver || 0,
    })
  } catch (error) {
    console.error("Get credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
