import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const payments = db.collection("payments")
    const users = db.collection("users")

    // Get payment details
    const payment = await payments.findOne({ 
      paymentId,
      userId: new ObjectId(session.user.id)
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Get user details
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${payment.paymentId.slice(-8).toUpperCase()}`,
      invoiceDate: payment.createdAt,
      dueDate: payment.createdAt, // Same as invoice date for immediate payments
      customer: {
        name: user.name,
        email: user.email,
        address: user.address || "Not provided"
      },
      items: [
        {
          description: `${payment.planType} Plan`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount
        }
      ],
      subtotal: payment.amount,
      discount: payment.coupon ? 
        (payment.coupon.type === "percent" ? 
          Math.round(payment.amount * payment.coupon.value / 100) : 
          payment.coupon.value) : 0,
      total: payment.amount,
      payment: {
        method: "Razorpay",
        transactionId: payment.paymentId,
        orderId: payment.orderId,
        status: payment.status,
        paidAt: payment.createdAt
      },
      coupon: payment.coupon
    }

    return NextResponse.json({ invoice })

  } catch (error) {
    console.error("Invoice generation error:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentId, email } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const payments = db.collection("payments")
    const users = db.collection("users")

    // Get payment details
    const payment = await payments.findOne({ 
      paymentId,
      userId: new ObjectId(session.user.id)
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Get user details
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${payment.paymentId.slice(-8).toUpperCase()}`,
      invoiceDate: payment.createdAt,
      dueDate: payment.createdAt,
      customer: {
        name: user.name,
        email: email || user.email,
        address: user.address || "Not provided"
      },
      items: [
        {
          description: `${payment.planType} Plan`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount
        }
      ],
      subtotal: payment.amount,
      discount: payment.coupon ? 
        (payment.coupon.type === "percent" ? 
          Math.round(payment.amount * payment.coupon.value / 100) : 
          payment.coupon.value) : 0,
      total: payment.amount,
      payment: {
        method: "Razorpay",
        transactionId: payment.paymentId,
        orderId: payment.orderId,
        status: payment.status,
        paidAt: payment.createdAt
      },
      coupon: payment.coupon
    }

    // Send invoice email
    try {
      const { sendInvoiceEmail } = await import("@/lib/email-utils")
      await sendInvoiceEmail({
        to: email || user.email,
        invoice
      })
    } catch (emailError) {
      console.error("Failed to send invoice email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: "Invoice sent successfully",
      invoice 
    })

  } catch (error) {
    console.error("Invoice email error:", error)
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 })
  }
}
