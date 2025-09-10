import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by the scheduler
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const notifications = db.collection("notifications")

    const now = new Date()
    let expiredCount = 0

    // Find all users with active trials that have expired
    const usersWithActiveTrials = await users.find({
      isTrialActive: true,
      trialStartDate: { $exists: true },
      trialPeriodDays: { $exists: true }
    }).toArray()

    for (const user of usersWithActiveTrials) {
      const trialStartDate = new Date(user.trialStartDate)
      const trialEndDate = new Date(trialStartDate.getTime() + user.trialPeriodDays * 24 * 60 * 60 * 1000)
      
      // Check if trial has expired
      if (now > trialEndDate) {
        // Set trial as inactive and reset credits to 0
        await users.updateOne(
          { _id: user._id },
          {
            $set: {
              isTrialActive: false,
              credits: 0, // Reset credits to 0 when trial expires
              updatedAt: now,
            },
          }
        )

        // Create trial expired notification
        await notifications.insertOne({
          userId: user._id,
          type: "trial_expired",
          title: "⏰ Your free trial has expired",
          message: "Your 2-day free trial has ended. Purchase credits to continue using all features.",
          isRead: false,
          createdAt: now,
          metadata: {
            trialEndDate: trialEndDate,
            expiredAt: now,
            creditsReset: true
          }
        })

        expiredCount++
        console.log(`Trial expired for user: ${user.email} (${user.name})`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Trial expired for ${expiredCount} users`,
      expiredCount,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Trial expiration cron error:", error)
    return NextResponse.json({ error: "Failed to expire trials" }, { status: 500 })
  }
}
