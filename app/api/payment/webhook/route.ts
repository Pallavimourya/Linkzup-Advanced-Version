import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import crypto from "crypto"
import { connectToDatabase } from "@/lib/mongodb"

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id

      const { db } = await connectToDatabase()
      const orders = db.collection("orders")
      const users = db.collection("users")

      // Find the order
      const order = await orders.findOne({ orderId })
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Update order status
      await orders.updateOne(
        { orderId },
        {
          $set: {
            status: "completed",
            paymentId: payment.id,
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

      // Create payment record
      const payments = db.collection("payments")
      await payments.insertOne({
        userId: order.userId,
        orderId: order.orderId,
        paymentId: payment.id,
        planType: order.planType,
        credits: order.credits,
        amount: order.amount,
        status: "completed",
        createdAt: new Date(),
        coupon: order.coupon || null,
      })

      // Increment coupon usage if applied
      if (order.coupon?.code) {
        await db
          .collection("coupons")
          .updateOne({ code: order.coupon.code }, { $inc: { uses: 1 }, $set: { updatedAt: new Date() } })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
