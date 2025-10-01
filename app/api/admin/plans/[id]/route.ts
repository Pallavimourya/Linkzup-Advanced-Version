import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    const { id } = await params
    const payload = await req.json()
    const { db } = await connectToDatabase()
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }
    
    const allowed = ["name", "type", "interval", "price", "credits", "features", "popular", "recommended", "isActive"]
    const $set: any = { updatedAt: new Date() }
    for (const k of allowed) if (k in payload) $set[k] = payload[k]
    
    const result = await db.collection("plans").updateOne(
      { _id: new ObjectId(id) }, 
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    const { id } = await params
    const { db } = await connectToDatabase()
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }
    
    // First, get the plan to check its type
    const plan = await db.collection("plans").findOne({ _id: new ObjectId(id) })
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    
    // Check if this is the last plan of its type
    const plansOfSameType = await db.collection("plans").countDocuments({ type: plan.type })
    if (plansOfSameType <= 1) {
      return NextResponse.json({ 
        error: `Cannot delete the last ${plan.type === 'subscription' ? 'subscription' : 'credit'} plan. At least one ${plan.type === 'subscription' ? 'subscription' : 'credit'} plan must remain.` 
      }, { status: 400 })
    }
    
    const result = await db.collection("plans").deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
