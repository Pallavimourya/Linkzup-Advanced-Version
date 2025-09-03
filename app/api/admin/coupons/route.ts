import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()
  const coupons = await db.collection("coupons").find({}).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const payload = await req.json()
  const coupon = {
    code: String(payload.code || "").toUpperCase(),
    type: payload.type === "fixed" ? "fixed" : "percent", // default percent
    value: Number(payload.value) || 0,
    maxRedemptions: Number(payload.maxRedemptions) || 0,
    expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    active: payload.active !== false,
    uses: 0,
    updatedAt: new Date(),
  }
  const { db } = await connectToDatabase()
  await db
    .collection("coupons")
    .updateOne(
      { code: coupon.code }, 
      { 
        $set: coupon, 
        $setOnInsert: { createdAt: new Date() } 
      }, 
      { upsert: true }
    )
  return NextResponse.json({ ok: true })
}
