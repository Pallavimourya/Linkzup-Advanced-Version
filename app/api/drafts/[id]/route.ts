import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid draft ID" }, { status: 400 })
    }

    const db = await connectDB()
    
    // Delete the draft and ensure it belongs to the current user
    const result = await db.collection("drafts").deleteOne({
      _id: new ObjectId(id),
      userEmail: session.user.email
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Draft deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting draft:", error)
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { title, content, format, niche } = await request.json()

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid draft ID" }, { status: 400 })
    }

    const db = await connectDB()
    
    // Update the draft and ensure it belongs to the current user
    const result = await db.collection("drafts").updateOne(
      {
        _id: new ObjectId(id),
        userEmail: session.user.email
      },
      {
        $set: {
          title,
          content,
          format,
          niche,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Draft updated successfully"
    })
  } catch (error) {
    console.error("Error updating draft:", error)
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
  }
}
