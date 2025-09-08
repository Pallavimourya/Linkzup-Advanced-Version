import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const { db } = await connectToDatabase()
    const notifications = db.collection("notifications")

    // Build query
    const query: any = { userId: new ObjectId(session.user.id) }
    if (unreadOnly) {
      query.isRead = false
    }

    // Get notifications
    const userNotifications = await notifications
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    // Get unread count
    const unreadCount = await notifications.countDocuments({
      userId: new ObjectId(session.user.id),
      isRead: false
    })

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
      hasMore: userNotifications.length === limit
    })

  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId, action } = await request.json()

    if (!notificationId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const notifications = db.collection("notifications")

    if (action === "mark_read") {
      await notifications.updateOne(
        { 
          _id: new ObjectId(notificationId),
          userId: new ObjectId(session.user.id)
        },
        { $set: { isRead: true, readAt: new Date() } }
      )
    } else if (action === "mark_all_read") {
      await notifications.updateMany(
        { userId: new ObjectId(session.user.id) },
        { $set: { isRead: true, readAt: new Date() } }
      )
    } else if (action === "delete") {
      await notifications.deleteOne({
        _id: new ObjectId(notificationId),
        userId: new ObjectId(session.user.id)
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
