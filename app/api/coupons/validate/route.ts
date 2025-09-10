import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = (searchParams.get("code") || "").toUpperCase()
  const amount = Number(searchParams.get("amount") || 0)

  if (!code) return NextResponse.json({ valid: false, reason: "missing_code" }, { status: 400 })

  const { db } = await connectToDatabase()
  const coupon = await db.collection("coupons").findOne({ code })

  if (!coupon || !coupon.active) return NextResponse.json({ valid: false, reason: "invalid" }, { status: 404 })
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return NextResponse.json({ valid: false, reason: "expired" }, { status: 400 })
  if (coupon.maxRedemptions && coupon.uses >= coupon.maxRedemptions)
    return NextResponse.json({ valid: false, reason: "maxed" }, { status: 400 })

  let discountedAmount = amount
  if (coupon.type === "percent") discountedAmount = Math.max(0, Math.round(amount * (1 - coupon.value / 100)))
  else discountedAmount = Math.max(0, amount - coupon.value)

  return NextResponse.json({ valid: true, discountedAmount, coupon })
}
