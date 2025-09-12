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

    // Add credits to user and mark coupon as used if applied
    const updateData: any = {
      $inc: {
        credits: order.credits,
        totalCreditsEver: order.credits,
      },
      $set: { updatedAt: new Date() },
    }

    // Mark coupon as used if applied
    if (order.coupon?.code) {
      updateData.$set.hasUsedCoupon = true
    }

    await users.updateOne(
      { _id: order.userId },
      updateData,
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

    // If coupon applied, increment its uses (webhook also handles this, but this is the primary handler)
    if (order.coupon?.code) {
      await db
        .collection("coupons")
        .updateOne({ code: order.coupon.code }, { $inc: { uses: 1 }, $set: { updatedAt: new Date() } })
    }

    // Create notifications for successful payment
    const notifications = db.collection("notifications")
    
    // Payment success notification
    await notifications.insertOne({
      userId: order.userId,
      type: "payment_success",
      title: "✅ Payment successful",
      message: `Your credits have been successfully added. You now have ${order.credits} new credits.`,
      isRead: false,
      createdAt: new Date(),
      metadata: {
        credits: order.credits,
        planType: order.planType,
        amount: order.amount,
        coupon: order.coupon
      }
    })

    // Coupon applied notification
    if (order.coupon?.code) {
      await notifications.insertOne({
        userId: order.userId,
        type: "coupon_applied",
        title: "🎉 Coupon applied successfully",
        message: `Coupon ${order.coupon.code} applied successfully, discount added to your plan.`,
        isRead: false,
        createdAt: new Date(),
        metadata: {
          couponCode: order.coupon.code,
          couponType: order.coupon.type,
          discountValue: order.coupon.value,
          originalAmount: order.amount,
          finalAmount: order.coupon.type === "percent" ? 
            Math.max(0, Math.round(order.amount * (1 - order.coupon.value / 100))) : 
            Math.max(0, order.amount - order.coupon.value)
        }
      })
    }

    // Send invoice email automatically
    try {
      const { sendInvoiceEmail } = await import("@/lib/email-utils")
      const user = await users.findOne({ _id: order.userId })
      
      if (user?.email) {
        const invoice = {
          invoiceNumber: `INV-${razorpay_payment_id.slice(-8).toUpperCase()}`,
          invoiceDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          customer: {
            name: user.name,
            email: user.email,
            address: user.address || "Not provided"
          },
          items: [
            {
              description: `${order.planType} Plan`,
              quantity: 1,
              unitPrice: order.amount,
              total: order.amount
            }
          ],
          subtotal: order.amount,
          discount: order.coupon ? 
            (order.coupon.type === "percent" ? 
              Math.round(order.amount * order.coupon.value / 100) : 
              order.coupon.value) : 0,
          total: order.amount,
          payment: {
            method: "Razorpay",
            transactionId: razorpay_payment_id,
            orderId: razorpay_order_id,
            status: "completed",
            paidAt: new Date().toISOString()
          },
          coupon: order.coupon
        }

        await sendInvoiceEmail({
          to: user.email,
          invoice
        })
      }
    } catch (emailError) {
      console.error("Failed to send invoice email:", emailError)
      // Don't fail the payment if email fails
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
