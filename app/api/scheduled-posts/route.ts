import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { 
  schedulePost, 
  getScheduledPosts, 
  updateScheduledPost, 
  deleteScheduledPost,
  toggleScheduledPostStatus,
  retryFailedPost,
  getScheduledPostsStats,
  type SchedulePostRequest,
  type UpdateScheduledPostRequest
} from "@/lib/scheduling"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, images, scheduledFor, platform, type, tags } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!scheduledFor) {
      return NextResponse.json({ error: "Scheduled date is required" }, { status: 400 })
    }

    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: "Post type is required" }, { status: 400 })
    }

    // Validate scheduled date
    const scheduledDate = new Date(scheduledFor)
    const now = new Date()
    
    if (scheduledDate <= now) {
      return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 })
    }

    const postData: SchedulePostRequest = {
      userId: session.user.id,
      userEmail: session.user.email,
      content,
      images: images || [],
      scheduledFor: scheduledDate,
      platform,
      type,
      tags: tags || [],
    }

    const result = await schedulePost(postData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        postId: result.postId,
        cronJobId: result.cronJobId,
        message: `Post scheduled for ${scheduledDate.toLocaleString()}`,
      })
    } else {
      return NextResponse.json({ 
        error: result.error,
        message: "Failed to schedule post" 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error scheduling post:", error)
    return NextResponse.json({ error: "Failed to schedule post" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "stats") {
      // Get statistics
      const result = await getScheduledPostsStats(session.user.id)
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          stats: result.stats,
        })
      } else {
        return NextResponse.json({ 
          error: result.error,
          message: "Failed to get statistics" 
        }, { status: 400 })
      }
    }

    // Get scheduled posts with filters
    const status = searchParams.get("status")
    const date = searchParams.get("date")
    const search = searchParams.get("search")
    const platform = searchParams.get("platform")
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const filters = {
      status: status || undefined,
      date: date ? new Date(date) : undefined,
      search: search || undefined,
      platform: platform || undefined,
      type: type || undefined,
      limit,
      offset,
    }

    const result = await getScheduledPosts(session.user.id, filters)

    if (result.success) {
      return NextResponse.json({
        success: true,
        posts: result.posts,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      })
    } else {
      return NextResponse.json({ 
        error: result.error,
        message: "Failed to fetch scheduled posts" 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching scheduled posts:", error)
    return NextResponse.json({ error: "Failed to fetch scheduled posts" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { postId, action, ...updates } = body

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    let result

    if (action === "toggle-status") {
      const { status } = updates
      if (!status || !["paused", "pending"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      result = await toggleScheduledPostStatus(postId, status)
    } else if (action === "retry") {
      result = await retryFailedPost(postId)
    } else {
      // Regular update
      const updateData: UpdateScheduledPostRequest = {}
      
      if (updates.content !== undefined) updateData.content = updates.content
      if (updates.images !== undefined) updateData.images = updates.images
      if (updates.scheduledFor !== undefined) {
        const scheduledDate = new Date(updates.scheduledFor)
        const now = new Date()
        
        if (scheduledDate <= now) {
          return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 })
        }
        updateData.scheduledFor = scheduledDate
      }
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.tags !== undefined) updateData.tags = updates.tags

      result = await updateScheduledPost(postId, updateData)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Post updated successfully",
        modifiedCount: result.modifiedCount,
      })
    } else {
      return NextResponse.json({ 
        error: result.error,
        message: "Failed to update post" 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating scheduled post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const result = await deleteScheduledPost(postId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Post deleted successfully",
        deletedCount: result.deletedCount,
      })
    } else {
      return NextResponse.json({ 
        error: result.error,
        message: "Failed to delete post" 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error deleting scheduled post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
