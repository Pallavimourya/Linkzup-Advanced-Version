import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getScheduledPosts, updateScheduledPost, deleteScheduledPost } from "@/lib/scheduling"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const date = searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined
    const search = searchParams.get("search") || undefined

    const result = await getScheduledPosts(session.user.email, { status, date, search })

    if (result.success) {
      return NextResponse.json({ posts: result.posts })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching scheduled posts:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, ...updates } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const result = await updateScheduledPost(postId, updates)

    if (result.success) {
      return NextResponse.json({ message: "Post updated successfully" })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating scheduled post:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const result = await deleteScheduledPost(postId)

    if (result.success) {
      return NextResponse.json({ message: "Post deleted successfully" })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting scheduled post:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
