import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()

  // User Statistics
  const usersTotal = await db.collection("users").countDocuments({})
  const usersTrial = await db.collection("users").countDocuments({ isTrialActive: true })
  const usersActive = await db.collection("users").countDocuments({ accountStatus: { $in: [null, "active"] } })
  const usersAdmin = await db.collection("users").countDocuments({ isAdmin: true })
  
  // Recent user registrations (last 7 days)
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const newUsers7Days = await db.collection("users").countDocuments({ 
    createdAt: { $gte: last7Days } 
  })

  // Revenue Statistics
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const payments = db.collection("payments")
  const revenueMonthAgg = await payments
    .aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
    .toArray()
  const revenue30Agg = await payments
    .aggregate([{ $match: { createdAt: { $gte: last30 } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
    .toArray()
  const revenueLastMonthAgg = await payments
    .aggregate([{ $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
    .toArray()

  // Subscription Statistics
  const subs = db.collection("subscriptions")
  const subActive = await subs.countDocuments({ status: "active" })
  const subCancelled = await subs.countDocuments({ status: "cancelled" })
  const subTrial = await subs.countDocuments({ status: "trial" })

  // Coupon Statistics
  const couponsActive = await db.collection("coupons").countDocuments({ active: true })
  const couponsTotal = await db.collection("coupons").countDocuments({})

  // Content & Activity Statistics
  const scheduledPosts = db.collection("scheduled_posts")
  const postsPending = await scheduledPosts.countDocuments({ status: "pending" })
  const postsPosted = await scheduledPosts.countDocuments({ status: "posted" })
  const postsFailed = await scheduledPosts.countDocuments({ status: "failed" })
  const postsToday = await scheduledPosts.countDocuments({
    scheduledFor: {
      $gte: new Date(new Date().setHours(0,0,0,0)),
      $lt: new Date(new Date().setHours(23,59,59,999))
    }
  })

  // Draft Statistics
  const draftsTotal = await db.collection("drafts").countDocuments({})

  // Credit Statistics
  const usersWithCredits = await db.collection("users").countDocuments({ credits: { $gt: 0 } })
  const usersNoCredits = await db.collection("users").countDocuments({ credits: { $lte: 0 } })

  // Recent Activity (last 24 hours)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentPayments = await payments.countDocuments({ createdAt: { $gte: last24Hours } })
  const recentPosts = await scheduledPosts.countDocuments({ createdAt: { $gte: last24Hours } })
  const recentUsers = await db.collection("users").countDocuments({ createdAt: { $gte: last24Hours } })

  // Plan Statistics
  const plans = db.collection("plans")
  const activePlans = await plans.countDocuments({ isActive: true })
  const subscriptionPlans = await plans.countDocuments({ type: "subscription", isActive: true })
  const creditPlans = await plans.countDocuments({ type: "credit_pack", isActive: true })

  // Calculate growth percentages
  const currentMonthRevenue = revenueMonthAgg[0]?.sum || 0
  const lastMonthRevenue = revenueLastMonthAgg[0]?.sum || 0
  const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0

  return NextResponse.json({
    users: { 
      total: usersTotal, 
      trial: usersTrial, 
      active: usersActive, 
      admin: usersAdmin,
      newThisWeek: newUsers7Days,
      withCredits: usersWithCredits,
      noCredits: usersNoCredits
    },
    subscriptions: { 
      active: subActive, 
      cancelled: subCancelled, 
      trial: subTrial 
    },
    revenue: { 
      currentMonth: currentMonthRevenue, 
      last30Days: revenue30Agg[0]?.sum || 0,
      lastMonth: lastMonthRevenue,
      growth: revenueGrowth
    },
    coupons: { 
      active: couponsActive, 
      total: couponsTotal 
    },
    content: {
      postsPending,
      postsPosted,
      postsFailed,
      postsToday,
      draftsTotal
    },
    activity: {
      recentPayments,
      recentPosts,
      recentUsers
    },
    plans: {
      total: activePlans,
      subscription: subscriptionPlans,
      credit: creditPlans
    }
  })
}
