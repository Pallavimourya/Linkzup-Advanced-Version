import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    const payload = await req.json()
    const { db } = await connectToDatabase()
    
    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }
    
    const allowed = ["name", "type", "interval", "price", "credits", "features", "popular", "recommended", "isActive"]
    const $set: any = { updatedAt: new Date() }
    for (const k of allowed) if (k in payload) $set[k] = payload[k]
    
    const result = await db.collection("plans").updateOne(
      { _id: new ObjectId(params.id) }, 
      { $set }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    const { db } = await connectToDatabase()
    
    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }
    
    // Check if this is the last plan
    const totalPlans = await db.collection("plans").countDocuments()
    if (totalPlans <= 1) {
      return NextResponse.json({ error: "Cannot delete the last plan. At least one plan must remain." }, { status: 400 })
    }
    
    const result = await db.collection("plans").deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
