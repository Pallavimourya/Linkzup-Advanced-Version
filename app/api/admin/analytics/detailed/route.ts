import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()

  // Get date ranges for different periods
  const now = new Date()
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  // User Growth Trends (last 30 days)
  const userGrowthData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))
    
    const newUsers = await db.collection("users").countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
    
    userGrowthData.push({
      date: startOfDay.toISOString().split('T')[0],
      users: newUsers
    })
  }

  // Revenue Trends (last 30 days)
  const revenueData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))
    
    const dailyRevenue = await db.collection("payments").aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: "completed"
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray()
    
    revenueData.push({
      date: startOfDay.toISOString().split('T')[0],
      revenue: dailyRevenue[0]?.total || 0
    })
  }

  // Top Performing Plans
  const topPlans = await db.collection("subscriptions").aggregate([
    { $group: { _id: "$planType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]).toArray()

  // User Activity by Hour (last 7 days)
  const hourlyActivity = []
  for (let hour = 0; hour < 24; hour++) {
    const startTime = new Date(last7Days)
    startTime.setHours(hour, 0, 0, 0)
    const endTime = new Date(last7Days)
    endTime.setHours(hour, 59, 59, 999)
    
    const activity = await db.collection("users").countDocuments({
      updatedAt: { $gte: startTime, $lte: endTime }
    })
    
    hourlyActivity.push({
      hour: hour,
      activity: activity
    })
  }

  // Content Performance
  const contentStats = await db.collection("scheduled_posts").aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]).toArray()

  // Credit Usage Trends
  const creditUsage = await db.collection("credit_transactions").aggregate([
    {
      $match: {
        timestamp: { $gte: last30Days }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
        },
        totalCredits: { $sum: { $abs: "$credits" } }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray()

  // Geographic Distribution (if available)
  const userLocations = await db.collection("users").aggregate([
    {
      $group: {
        _id: "$location",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray()

  // Subscription Conversion Rate
  const totalUsers = await db.collection("users").countDocuments({})
  const activeSubscriptions = await db.collection("subscriptions").countDocuments({ status: "active" })
  const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers * 100).toFixed(2) : 0

  // Average Revenue Per User (ARPU)
  const totalRevenue = await db.collection("payments").aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]).toArray()
  
  const arpu = totalUsers > 0 ? (totalRevenue[0]?.total || 0) / totalUsers : 0

  // Churn Rate (users who cancelled in last 30 days)
  const cancelledSubscriptions = await db.collection("subscriptions").countDocuments({
    status: "cancelled",
    updatedAt: { $gte: last30Days }
  })
  
  const churnRate = activeSubscriptions > 0 ? (cancelledSubscriptions / activeSubscriptions * 100).toFixed(2) : 0

  // Recent Activity Summary
  const recentActivity = {
    newUsers24h: await db.collection("users").countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }),
    newPayments24h: await db.collection("payments").countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }),
    newPosts24h: await db.collection("scheduled_posts").countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
  }

  return NextResponse.json({
    userGrowth: userGrowthData,
    revenueTrends: revenueData,
    topPlans: topPlans,
    hourlyActivity: hourlyActivity,
    contentStats: contentStats,
    creditUsage: creditUsage,
    userLocations: userLocations,
    metrics: {
      conversionRate: parseFloat(conversionRate),
      arpu: Math.round(arpu),
      churnRate: parseFloat(churnRate)
    },
    recentActivity
  })
}
