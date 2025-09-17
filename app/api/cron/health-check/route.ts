import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    console.log(`[${requestId}] [Health Check] Starting health check`)
    
    const { db } = await connectToDatabase()
    
    // Check database connection
    const dbPing = await db.admin().ping()
    console.log(`[${requestId}] [Health Check] Database ping:`, dbPing)
    
    // Check for overdue posts
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const overduePosts = await db.collection("scheduled_posts").countDocuments({
      status: "pending",
      scheduledFor: {
        $gte: fifteenMinutesAgo,
        $lte: fiveMinutesAgo,
      }
    })
    
    const stuckPosts = await db.collection("scheduled_posts").countDocuments({
      status: "pending",
      scheduledFor: {
        $lte: fifteenMinutesAgo,
      },
      retryCount: { $lt: 3 }
    })
    
    const failedPosts = await db.collection("scheduled_posts").countDocuments({
      status: "failed",
      failedAt: {
        $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    })
    
    const totalPendingPosts = await db.collection("scheduled_posts").countDocuments({
      status: "pending"
    })
    
    const executionTime = Date.now() - startTime
    
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      requestId: requestId,
      executionTimeMs: executionTime,
      database: {
        connected: true,
        ping: dbPing
      },
      posts: {
        totalPending: totalPendingPosts,
        overdue: overduePosts,
        stuck: stuckPosts,
        failedLast24h: failedPosts
      },
      alerts: []
    }
    
    // Add alerts based on conditions
    if (overduePosts > 5) {
      healthStatus.alerts.push({
        type: "warning",
        message: `${overduePosts} posts are overdue (5-15 minutes)`,
        severity: "medium"
      })
    }
    
    if (stuckPosts > 0) {
      healthStatus.alerts.push({
        type: "critical",
        message: `${stuckPosts} posts are stuck (>15 minutes overdue)`,
        severity: "high"
      })
    }
    
    if (failedPosts > 20) {
      healthStatus.alerts.push({
        type: "warning",
        message: `${failedPosts} posts failed in the last 24 hours`,
        severity: "medium"
      })
    }
    
    if (healthStatus.alerts.length > 0) {
      healthStatus.status = healthStatus.alerts.some(alert => alert.severity === "high") ? "critical" : "warning"
    }
    
    console.log(`[${requestId}] [Health Check] Health status:`, healthStatus)
    
    return NextResponse.json(healthStatus)
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error(`[${requestId}] [Health Check] Error:`, error)
    
    const errorResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      requestId: requestId,
      executionTimeMs: executionTime,
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        connected: false
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Same as GET for health check
  return GET(request)
}
