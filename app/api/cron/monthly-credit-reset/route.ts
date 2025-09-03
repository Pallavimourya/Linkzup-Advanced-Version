import { type NextRequest, NextResponse } from "next/server"
import { PLAN_LIMITS } from "@/lib/credit-utils"
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

    // Get all users with active plans
    const usersWithPlans = await users.find({
      plan: { $in: ['basic', 'popular', 'professional'] }
    }).toArray()

    let resetCount = 0
    const now = new Date()

    for (const user of usersWithPlans) {
      const userPlan = user.plan
      const planLimits = PLAN_LIMITS[userPlan]
      
      if (!planLimits) continue

      const monthlyCredits = planLimits.textWithPost // Base monthly credits

      // Check if it's time to reset (monthly)
      const lastResetDate = user.monthlyCreditsResetDate ? new Date(user.monthlyCreditsResetDate) : null
      const shouldReset = !lastResetDate || 
        (now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear())

      if (shouldReset) {
        await users.updateOne(
          { _id: user._id },
          {
            $set: {
              monthlyCredits: monthlyCredits,
              monthlyCreditsResetDate: now,
              updatedAt: now,
            },
          }
        )
        resetCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Monthly credits reset for ${resetCount} users`,
      resetCount,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Monthly credit reset cron error:", error)
    return NextResponse.json({ error: "Failed to reset monthly credits" }, { status: 500 })
  }
}
