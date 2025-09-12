import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Check database connection
    await db.admin().ping()
    
    // Get current pending posts count
    const pendingPosts = await db.collection("scheduled_posts").countDocuments({
      status: "pending",
      scheduledFor: { $lte: new Date() }
    })
    
    // Get overdue posts (more than 10 minutes past scheduled time)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const overduePosts = await db.collection("scheduled_posts").countDocuments({
      status: "pending",
      scheduledFor: { $lte: tenMinutesAgo }
    })
    
    // Get failed posts from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const failedPosts = await db.collection("scheduled_posts").countDocuments({
      status: "failed",
      failedAt: { $gte: oneDayAgo }
    })
    
    // Get successful posts from last 24 hours
    const successfulPosts = await db.collection("scheduled_posts").countDocuments({
      status: "posted",
      postedAt: { $gte: oneDayAgo }
    })
    
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      metrics: {
        pendingPosts,
        overduePosts,
        failedPosts24h: failedPosts,
        successfulPosts24h: successfulPosts
      },
      alerts: []
    }
    
    // Add alerts for critical issues
    if (overduePosts > 0) {
      healthStatus.alerts.push({
        type: "warning",
        message: `${overduePosts} posts are overdue`,
        severity: "high"
      })
    }
    
    if (failedPosts > 10) {
      healthStatus.alerts.push({
        type: "error",
        message: `${failedPosts} posts failed in last 24 hours`,
        severity: "critical"
      })
    }
    
    if (overduePosts > 5) {
      healthStatus.status = "degraded"
    }
    
    if (overduePosts > 10 || failedPosts > 20) {
      healthStatus.status = "unhealthy"
    }
    
    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
