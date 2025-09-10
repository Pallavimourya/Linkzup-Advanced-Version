import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()
  const all = await db.collection("plans").find({ isActive: true }).sort({ price: 1 }).toArray()

  const subscriptionPlans = all.filter((p: any) => p.type === "subscription")
  const creditPlans = all.filter((p: any) => p.type === "credit_pack")

  return NextResponse.json({ subscriptionPlans, creditPlans })
}
