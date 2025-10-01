import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (using the same method as other admin APIs)
    if (!(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const bulkMessages = db.collection("bulk_messages")

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get bulk messages with pagination
    const messages = await bulkMessages
      .find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    // Get total count
    const totalCount = await bulkMessages.countDocuments({})

    // Get admin user details for each message
    const adminIds = [...new Set(messages.map(msg => msg.adminId))]
    const adminUsers = await users.find({ 
      _id: { $in: adminIds } 
    }).toArray()
    
    const adminMap = new Map()
    adminUsers.forEach(admin => {
      adminMap.set(admin._id.toString(), admin)
    })

    // Enrich messages with admin details
    const enrichedMessages = messages.map(message => ({
      _id: message._id,
      subject: message.subject,
      content: message.content,
      type: message.type,
      userType: message.userType,
      totalRecipients: message.totalRecipients,
      sentCount: message.sentCount,
      failedCount: message.failedCount,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      results: message.results || [],
      admin: adminMap.get(message.adminId) ? {
        name: adminMap.get(message.adminId).name,
        email: adminMap.get(message.adminId).email
      } : null
    }))

    return NextResponse.json({
      success: true,
      messages: enrichedMessages,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error("Error fetching bulk message history:", error)
    return NextResponse.json({ error: "Failed to fetch message history" }, { status: 500 })
  }
}
