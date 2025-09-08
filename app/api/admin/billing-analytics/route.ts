import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()

  // Get date ranges
  const now = new Date()
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // Trial Conversion Analytics
  const totalUsers = await db.collection("users").countDocuments({})
  const trialUsers = await db.collection("users").countDocuments({ isTrialActive: true })
  const usersWithSubscriptions = await db.collection("subscriptions").countDocuments({ status: "active" })
  const conversionRate = totalUsers > 0 ? (usersWithSubscriptions / totalUsers * 100) : 0

  // Revenue Analytics
  const payments = db.collection("payments")
  const currentMonthRevenue = await payments.aggregate([
    { $match: { createdAt: { $gte: currentMonth }, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]).toArray()

  const lastMonthRevenue = await payments.aggregate([
    { $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd }, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]).toArray()

  const last30DaysRevenue = await payments.aggregate([
    { $match: { createdAt: { $gte: last30Days }, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]).toArray()

  // Plan Performance Analytics
  const planPerformance = await payments.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$planType", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } }
  ]).toArray()

  // Coupon Analytics
  const couponUsage = await payments.aggregate([
    { $match: { status: "completed", coupon: { $exists: true, $ne: null } } },
    { $group: { _id: "$coupon.code", count: { $sum: 1 }, totalDiscount: { $sum: { $subtract: ["$amount", "$amount"] } } } },
    { $sort: { count: -1 } }
  ]).toArray()

  const totalCouponRedemptions = await payments.countDocuments({ 
    status: "completed", 
    coupon: { $exists: true, $ne: null } 
  })

  // Credit Usage Analytics
  const creditTransactions = db.collection("credit_transactions")
  const totalCreditsUsed = await creditTransactions.aggregate([
    { $match: { credits: { $lt: 0 } } },
    { $group: { _id: null, total: { $sum: { $abs: "$credits" } } } }
  ]).toArray()

  const averageCreditsPerUser = await db.collection("users").aggregate([
    { $group: { _id: null, avgCredits: { $avg: "$totalCreditsEver" } } }
  ]).toArray()

  // User Lifecycle Analytics
  const userLifecycle = await db.collection("users").aggregate([
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "userId",
        as: "subscriptions"
      }
    },
    {
      $group: {
        _id: {
          hasSubscription: { $gt: [{ $size: "$subscriptions" }, 0] },
          isTrialActive: "$isTrialActive"
        },
        count: { $sum: 1 }
      }
    }
  ]).toArray()

  // Recent Activity
  const recentPayments = await payments.find({ status: "completed" })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  const recentTrialConversions = await db.collection("users").find({
    isTrialActive: false,
    totalCreditsEver: { $gt: 10 }, // More than trial credits
    updatedAt: { $gte: last7Days }
  })
  .sort({ updatedAt: -1 })
  .limit(10)
  .toArray()

  // Credit Rollover Analytics
  const subscriptionsWithRollover = await db.collection("subscriptions").countDocuments({
    rolloverCredits: { $gt: 0 }
  })

  const totalRolloverCredits = await db.collection("subscriptions").aggregate([
    { $match: { rolloverCredits: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$rolloverCredits" } } }
  ]).toArray()

  // Fraud Protection Analytics
  const usersWithMultipleTrials = await db.collection("users").countDocuments({
    deviceFingerprint: { $exists: true, $ne: null },
    totalCreditsEver: { $lte: 10 } // Only trial credits
  })

  return NextResponse.json({
    conversion: {
      totalUsers,
      trialUsers,
      usersWithSubscriptions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      trialToPaidConversion: trialUsers > 0 ? parseFloat((usersWithSubscriptions / (totalUsers - trialUsers) * 100).toFixed(2)) : 0
    },
    revenue: {
      currentMonth: currentMonthRevenue[0]?.total || 0,
      lastMonth: lastMonthRevenue[0]?.total || 0,
      last30Days: last30DaysRevenue[0]?.total || 0,
      growth: lastMonthRevenue[0]?.total > 0 ? 
        ((currentMonthRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100 : 0
    },
    plans: {
      performance: planPerformance,
      mostPopular: planPerformance[0] || null
    },
    coupons: {
      usage: couponUsage,
      totalRedemptions: totalCouponRedemptions,
      averageDiscount: couponUsage.length > 0 ? 
        couponUsage.reduce((sum, coupon) => sum + coupon.totalDiscount, 0) / couponUsage.length : 0
    },
    credits: {
      totalUsed: totalCreditsUsed[0]?.total || 0,
      averagePerUser: averageCreditsPerUser[0]?.avgCredits || 0,
      rollover: {
        subscriptionsWithRollover,
        totalRolloverCredits: totalRolloverCredits[0]?.total || 0
      }
    },
    lifecycle: userLifecycle,
    activity: {
      recentPayments,
      recentTrialConversions
    },
    fraud: {
      usersWithMultipleTrials,
      riskLevel: usersWithMultipleTrials > 10 ? "High" : usersWithMultipleTrials > 5 ? "Medium" : "Low"
    }
  })
}
