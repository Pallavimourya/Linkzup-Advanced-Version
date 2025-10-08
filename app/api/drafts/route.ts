import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const drafts = await db
      .collection("drafts")
      .find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error("Error fetching drafts:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log("No session or email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, format, niche, source } = await request.json()
    console.log("Draft data received:", { title, content: content?.substring(0, 100) + "...", format, niche, source, userEmail: session.user.email })

    const db = await connectDB()
    const draft = {
      title,
      content,
      format,
      niche,
      source: source || "ai-generated",
      userEmail: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Inserting draft:", draft)
    const result = await db.collection("drafts").insertOne(draft)
    console.log("Draft inserted successfully:", result.insertedId)

    return NextResponse.json({
      success: true,
      draftId: result.insertedId,
      message: "Draft saved successfully",
    })
  } catch (error) {
    console.error("Error saving draft:", error)
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 })
  }
}
