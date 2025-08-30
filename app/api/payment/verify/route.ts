import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Razorpay from "razorpay"
import crypto from "crypto"
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    if (razorpay_signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const orders = db.collection("orders")
    const users = db.collection("users")

    // Find the order
    const order = await orders.findOne({ orderId: razorpay_order_id })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if payment is already processed
    if (order.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        credits: order.credits,
      })
    }

    // Update order status
    await orders.updateOne(
      { orderId: razorpay_order_id },
      {
        $set: {
          status: "completed",
          paymentId: razorpay_payment_id,
          updatedAt: new Date(),
        },
      },
    )

    // Add credits to user
    await users.updateOne(
      { _id: order.userId },
      {
        $inc: {
          credits: order.credits,
          totalCreditsEver: order.credits,
        },
        $set: { updatedAt: new Date() },
      },
    )

    // Create payment record (store coupon info for auditability)
    const payments = db.collection("payments")
    await payments.insertOne({
      userId: order.userId,
      orderId: order.orderId,
      paymentId: razorpay_payment_id,
      planType: order.planType,
      credits: order.credits,
      amount: order.amount,
      status: "completed",
      createdAt: new Date(),
      coupon: order.coupon || null,
    })

    // If coupon applied, increment its uses (defensive, webhook also handles this)
    if (order.coupon?.code) {
      await db
        .collection("coupons")
        .updateOne({ code: order.coupon.code }, { $inc: { uses: 1 }, $set: { updatedAt: new Date() } })
    }

    // Get updated user data
    const updatedUser = await users.findOne({ _id: order.userId })

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      credits: order.credits,
      totalCredits: updatedUser?.credits || 0,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
