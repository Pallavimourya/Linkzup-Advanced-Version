import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const { db } = await connectToDatabase()
  const coupon = await db.collection("coupons").findOne({ code: params.code.toUpperCase() })
  return NextResponse.json({ coupon })
}

export async function PUT(req: NextRequest, { params }: { params: { code: string } }) {
  console.log("PUT request received for coupon:", params.code)
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    console.log("Unauthorized access attempt")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  
  try {
    const payload = await req.json()
    console.log("Payload received:", payload)
    const { db } = await connectToDatabase()
    
    // Debug: List all coupons in database
    const allCoupons = await db.collection("coupons").find({}).toArray()
    console.log("All coupons in database:", allCoupons.map(c => ({ code: c.code, active: c.active })))
    
    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    }
    
    // Handle each field
    if (payload.code !== undefined) {
      updateData.code = String(payload.code).toUpperCase()
    }
    if (payload.type !== undefined) {
      updateData.type = payload.type
    }
    if (payload.value !== undefined) {
      updateData.value = Number(payload.value)
    }
    if (payload.maxRedemptions !== undefined) {
      updateData.maxRedemptions = Number(payload.maxRedemptions)
    }
    if (payload.expiresAt !== undefined) {
      updateData.expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null
    }
    if (payload.active !== undefined) {
      updateData.active = Boolean(payload.active)
    }
    if (payload.visible !== undefined) {
      updateData.visible = Boolean(payload.visible)
    }
    
    // If code is being changed, check for duplicates
    if (payload.code && payload.code.toUpperCase() !== params.code.toUpperCase()) {
      const existingCoupon = await db.collection("coupons").findOne({ 
        code: payload.code.toUpperCase() 
      })
      if (existingCoupon) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
      }
    }
    
    console.log("Update data:", updateData)
    
    // First check if coupon exists
    const existingCoupon = await db.collection("coupons").findOne({ 
      code: params.code.toUpperCase() 
    })
    console.log("Existing coupon found:", existingCoupon)
    
    if (!existingCoupon) {
      console.log("Coupon not found in database:", params.code)
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }
    
    // Update the coupon
    const result = await db.collection("coupons").updateOne(
      { code: params.code.toUpperCase() },
      { $set: updateData }
    )
    
    console.log("Update result:", result)
    
    if (result.matchedCount === 0) {
      console.log("Coupon not found:", params.code)
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }
    
    console.log("Update successful")
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  
  try {
    const { db } = await connectToDatabase()
    const result = await db.collection("coupons").deleteOne({ code: params.code.toUpperCase() })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
