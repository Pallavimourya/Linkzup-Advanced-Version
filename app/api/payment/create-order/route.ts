import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Razorpay from "razorpay"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

// Lazy initialization to avoid build-time errors
let razorpay: Razorpay | null = null

function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required")
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpay
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planType, credits, amount, couponCode } = await request.json()

    // Validate the request
    if (!planType || !credits || typeof amount !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Optional: validate coupon and compute discounted amount
    let finalAmount = amount
    let appliedCoupon: null | { code: string; type: "percent" | "fixed"; value: number } = null

    if (couponCode && String(couponCode).trim().length > 0) {
      const { db } = await connectToDatabase()
      const coupons = db.collection("coupons")
      const code = String(couponCode).toUpperCase()
      const coupon = await coupons.findOne({ code })

      const now = new Date()
      const isActive = !!coupon?.active
      const notExpired = !coupon?.expiresAt || new Date(coupon.expiresAt) >= now
      const notMaxed = !coupon?.maxRedemptions || (coupon?.uses || 0) < coupon.maxRedemptions

      if (coupon && isActive && notExpired && notMaxed) {
        if (coupon.type === "percent") {
          finalAmount = Math.max(0, Math.round(amount * (1 - (coupon.value || 0) / 100)))
        } else {
          finalAmount = Math.max(0, amount - (coupon.value || 0))
        }
        appliedCoupon = { code: coupon.code, type: coupon.type, value: coupon.value }
      }
    }

    // Create Razorpay order with discounted amount (in paise)
    const order = await getRazorpay().orders.create({
      amount: finalAmount * 100, // paise
      currency: "INR",
      receipt: `order_${Date.now()}`.slice(0, 40), // under 40 chars
      notes: {
        userId: session.user.id,
        planType,
        credits: credits.toString(),
        coupon: appliedCoupon ? appliedCoupon.code : "",
      },
    })

    // Store order details in database
    const { db } = await connectToDatabase()
    const orders = db.collection("orders")

    await orders.insertOne({
      orderId: order.id,
      userId: new ObjectId(session.user.id),
      planType,
      credits,
      amount: finalAmount, // store final amount (₹)
      status: "pending",
      coupon: appliedCoupon, // store coupon info for webhook/verify
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount, // paise
      currency: order.currency,
    })
  } catch (error) {
    console.error("Payment order creation error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
