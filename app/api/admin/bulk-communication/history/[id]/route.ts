import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (using the same method as other admin APIs)
    if (!(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Await params before using
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const bulkMessages = db.collection("bulk_messages")
    const notifications = db.collection("notifications")

    // First, check if the bulk message exists
    const bulkMessage = await bulkMessages.findOne({ _id: new ObjectId(id) })
    if (!bulkMessage) {
      return NextResponse.json({ error: "Bulk message not found" }, { status: 404 })
    }

    // Delete the bulk message
    const deleteResult = await bulkMessages.deleteOne({ _id: new ObjectId(id) })
    
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete bulk message" }, { status: 500 })
    }

    // Also delete related notifications (optional - you might want to keep them for audit purposes)
    // Uncomment the following lines if you want to delete related notifications too
    /*
    const notificationResult = await notifications.deleteMany({
      "metadata.bulkMessageId": new ObjectId(id)
    })
    console.log(`Deleted ${notificationResult.deletedCount} related notifications`)
    */

    return NextResponse.json({
      success: true,
      message: "Bulk message deleted successfully",
      deletedMessageId: id
    })

  } catch (error) {
    console.error("Error deleting bulk message:", error)
    return NextResponse.json({ error: "Failed to delete bulk message" }, { status: 500 })
  }
}
