import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[Auto-Recovery] Starting auto-recovery process...")
    
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.linkzup.in'
    const results = []

    // 1. Check system health
    try {
      const healthResponse = await fetch(`${APP_URL}/api/health/scheduled-posts`)
      if (healthResponse.ok) {
        const health = await healthResponse.json()
        results.push({
          step: "health_check",
          status: "success",
          data: health
        })
        
        // 2. Run backup cron if there are overdue posts
        if (health.metrics.overduePosts > 0) {
          console.log(`[Auto-Recovery] Found ${health.metrics.overduePosts} overdue posts, running backup cron...`)
          
          const backupResponse = await fetch(`${APP_URL}/api/cron/backup-auto-post`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CRON_SECRET}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (backupResponse.ok) {
            const backupResult = await backupResponse.json()
            results.push({
              step: "backup_cron",
              status: "success",
              data: backupResult
            })
          } else {
            results.push({
              step: "backup_cron",
              status: "failed",
              error: `HTTP ${backupResponse.status}`
            })
          }
        }
        
        // 3. Run monitoring check
        const monitorResponse = await fetch(`${APP_URL}/api/monitor/scheduled-posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (monitorResponse.ok) {
          const monitorResult = await monitorResponse.json()
          results.push({
            step: "monitoring",
            status: "success",
            data: monitorResult
          })
        } else {
          results.push({
            step: "monitoring",
            status: "failed",
            error: `HTTP ${monitorResponse.status}`
          })
        }
        
      } else {
        results.push({
          step: "health_check",
          status: "failed",
          error: `HTTP ${healthResponse.status}`
        })
      }
    } catch (error) {
      results.push({
        step: "health_check",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    const successCount = results.filter(r => r.status === "success").length
    const totalSteps = results.length
    
    console.log(`[Auto-Recovery] Completed ${successCount}/${totalSteps} steps successfully`)

    return NextResponse.json({
      message: `Auto-recovery completed: ${successCount}/${totalSteps} steps successful`,
      timestamp: new Date().toISOString(),
      results,
      success: successCount === totalSteps
    })
    
  } catch (error) {
    console.error("[Auto-Recovery] Error:", error)
    return NextResponse.json(
      {
        error: "Auto-recovery failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
