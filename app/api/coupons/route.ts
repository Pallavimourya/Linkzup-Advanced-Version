import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()
  
  // Only fetch coupons that are visible to users
  const coupons = await db.collection("coupons").find({ 
    visible: { $ne: false }, // visible is true or undefined (default visible)
    active: true 
  }).sort({ createdAt: -1 }).toArray()
  
  return NextResponse.json({ coupons })
}
