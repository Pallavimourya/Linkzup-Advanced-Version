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

    const { planType, credits, amount, couponCode } = await request.json()

    // Validate the request
    if (!planType || !credits || typeof amount !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const subscriptions = db.collection("subscriptions")
    const notifications = db.collection("notifications")

    // Get current user data
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has already used a coupon
    if (couponCode && user.hasUsedCoupon) {
      return NextResponse.json({ 
        error: "You have already used a coupon code. Only one coupon per account is allowed." 
      }, { status: 400 })
    }

    // Calculate final amount with coupon discount
    let finalAmount = amount
    let appliedCoupon: null | { code: string; type: "percent" | "fixed"; value: number } = null

    if (couponCode && String(couponCode).trim().length > 0) {
      const coupons = db.collection("coupons")
      const code = String(couponCode).toUpperCase()
      const coupon = await coupons.findOne({ code })

      const now = new Date()
      const isActive = !!coupon?.active
      const notExpired = !coupon?.expiresAt || new Date(coupon.expiresAt) >= now
      const notMaxed = !coupon?.maxRedemptions || (coupon?.uses || 0) < coupon.maxRedemptions

      if (coupon && isActive && notExpired && notMaxed) {
        if (coupon.type === "percent") {
          finalAmount = Math.max(0, Math.round(amount * (1 - (coupon.value || 0) / 100)))
        } else {
          finalAmount = Math.max(0, amount - (coupon.value || 0))
        }
        appliedCoupon = { code: coupon.code, type: coupon.type, value: coupon.value }
      } else {
        return NextResponse.json({ 
          error: "Invalid or expired coupon code" 
        }, { status: 400 })
      }
    }

    // Calculate credit rollover from previous plan
    let rolloverCredits = 0
    let rolloverMessage = ""

    // Check if user has an existing subscription that's expiring
    const existingSubscription = await subscriptions.findOne({
      userId: new ObjectId(session.user.id),
      status: "active"
    })

    if (existingSubscription) {
      // Check if the existing subscription has unused monthly credits
      const currentDate = new Date()
      const subscriptionEndDate = new Date(existingSubscription.endDate)
      
      // If subscription is expiring soon (within 7 days) or has expired
      if (subscriptionEndDate <= new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        // Calculate unused monthly credits
        const monthlyCreditsUsed = existingSubscription.monthlyCreditsUsed || 0
        const totalMonthlyCredits = existingSubscription.credits || 0
        rolloverCredits = Math.max(0, totalMonthlyCredits - monthlyCreditsUsed)
        
        if (rolloverCredits > 0) {
          rolloverMessage = `Your unused ${rolloverCredits} credits from the previous plan have been carried forward.`
        }
      }
    }

    // Calculate total credits (new plan + rollover)
    const totalCredits = credits + rolloverCredits

    // Create new subscription
    const subscriptionStartDate = new Date()
    const subscriptionEndDate = new Date(subscriptionStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const newSubscription = {
      userId: new ObjectId(session.user.id),
      planType,
      status: "active",
      startDate: subscriptionStartDate,
      endDate: subscriptionEndDate,
      nextBillingDate: subscriptionEndDate,
      amount: finalAmount,
      credits: totalCredits, // Include rollover credits
      monthlyCreditsUsed: 0,
      coupon: appliedCoupon,
      rolloverCredits: rolloverCredits,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Update or create subscription
    await subscriptions.updateOne(
      { userId: new ObjectId(session.user.id) },
      { $set: newSubscription },
      { upsert: true }
    )

    // Update user credits and mark coupon as used
    const updateData: any = {
      $inc: {
        credits: totalCredits,
        totalCreditsEver: totalCredits,
      },
      $set: { 
        updatedAt: new Date(),
        isTrialActive: false, // End trial when subscription starts
      },
    }

    if (appliedCoupon?.code) {
      updateData.$set.hasUsedCoupon = true
    }

    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      updateData,
    )

    // Create notifications
    await notifications.insertOne({
      userId: new ObjectId(session.user.id),
      type: "subscription_activated",
      title: "💳 Subscription activated",
      message: `Your ${planType} subscription plan is active with ${totalCredits} credits. ${rolloverMessage}`,
      isRead: false,
      createdAt: new Date(),
      metadata: {
        planType,
        credits: totalCredits,
        rolloverCredits,
        amount: finalAmount,
        coupon: appliedCoupon
      }
    })

    if (rolloverCredits > 0) {
      await notifications.insertOne({
        userId: new ObjectId(session.user.id),
        type: "credits_carried_forward",
        title: "🔄 Credits carried forward",
        message: `Your unused ${rolloverCredits} credits have been added to your new plan.`,
        isRead: false,
        createdAt: new Date(),
        metadata: {
          rolloverCredits,
          newPlanCredits: credits,
          totalCredits
        }
      })
    }

    if (appliedCoupon?.code) {
      await notifications.insertOne({
        userId: new ObjectId(session.user.id),
        type: "coupon_applied",
        title: "🎉 Coupon applied successfully",
        message: `Coupon ${appliedCoupon.code} applied successfully, discount added to your plan.`,
        isRead: false,
        createdAt: new Date(),
        metadata: {
          couponCode: appliedCoupon.code,
          couponType: appliedCoupon.type,
          discountValue: appliedCoupon.value,
          originalAmount: amount,
          finalAmount: finalAmount
        }
      })

      // Increment coupon usage
      await db.collection("coupons").updateOne(
        { code: appliedCoupon.code }, 
        { $inc: { uses: 1 }, $set: { updatedAt: new Date() } }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      subscription: newSubscription,
      rolloverCredits,
      totalCredits,
      appliedCoupon
    })

  } catch (error) {
    console.error("Subscription purchase error:", error)
    return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 })
  }
}
