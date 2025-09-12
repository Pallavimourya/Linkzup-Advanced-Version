import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-utils"

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Check for critical issues
    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    // Count overdue posts
    const overduePosts = await db.collection("scheduled_posts").countDocuments({
      status: "pending",
      scheduledFor: { $lte: tenMinutesAgo }
    })
    
    // Count failed posts in last hour
    const recentFailures = await db.collection("scheduled_posts").countDocuments({
      status: "failed",
      failedAt: { $gte: oneHourAgo }
    })
    
    // Count stuck posts (pending for more than 1 hour)
    const stuckPosts = await db.collection("scheduled_posts").countDocuments({
      status: "pending",
      scheduledFor: { $lte: oneHourAgo }
    })
    
    const alerts = []
    
    // Critical alerts
    if (overduePosts > 5) {
      alerts.push({
        type: "critical",
        message: `${overduePosts} posts are overdue`,
        action: "immediate_attention_required"
      })
    }
    
    if (recentFailures > 10) {
      alerts.push({
        type: "critical", 
        message: `${recentFailures} posts failed in the last hour`,
        action: "check_linkedin_api_status"
      })
    }
    
    if (stuckPosts > 0) {
      alerts.push({
        type: "warning",
        message: `${stuckPosts} posts are stuck (pending for >1 hour)`,
        action: "manual_intervention_required"
      })
    }
    
    // Send email alerts for critical issues
    if (alerts.some(alert => alert.type === "critical")) {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL || "admin@linkzup.com",
          subject: "🚨 Critical Alert: Scheduled Posts System Issues",
          html: `
            <h2>Critical Issues Detected in Scheduled Posts System</h2>
            <ul>
              ${alerts.map(alert => `<li><strong>${alert.type.toUpperCase()}:</strong> ${alert.message}</li>`).join('')}
            </ul>
            <p><strong>Timestamp:</strong> ${now.toISOString()}</p>
            <p><strong>Action Required:</strong> Please check the system immediately</p>
          `
        })
        console.log("[Monitor] Critical alert email sent")
      } catch (emailError) {
        console.error("[Monitor] Failed to send alert email:", emailError)
      }
    }
    
    // Log monitoring results
    console.log(`[Monitor] Overdue: ${overduePosts}, Recent failures: ${recentFailures}, Stuck: ${stuckPosts}`)
    
    return NextResponse.json({
      status: "monitored",
      timestamp: now.toISOString(),
      metrics: {
        overduePosts,
        recentFailures,
        stuckPosts
      },
      alerts,
      emailSent: alerts.some(alert => alert.type === "critical")
    })
    
  } catch (error) {
    console.error("Monitoring error:", error)
    return NextResponse.json(
      {
        error: "Monitoring failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
