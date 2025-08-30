import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { scheduleLinkedInPost, LinkedInPostData } from "@/lib/linkedin-posting"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, images, scheduledFor } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!scheduledFor) {
      return NextResponse.json({ error: "Scheduled date is required" }, { status: 400 })
    }

    // Validate scheduled date
    const scheduledDate = new Date(scheduledFor)
    const now = new Date()
    
    if (scheduledDate <= now) {
      return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 })
    }

    // First, check and deduct credits (0.5 credit for scheduling)
    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const creditTransactions = db.collection("credit_transactions")

    // Get current user data
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has enough credits (0.5 credit for scheduling)
    const currentCredits = user.credits || 0
    const monthlyCredits = user.monthlyCredits || 0
    const totalAvailableCredits = currentCredits + monthlyCredits

    if (totalAvailableCredits < 0.5) {
      return NextResponse.json({ 
        error: "Insufficient credits. You need 0.5 credits to schedule a LinkedIn post.",
        errorCode: "INSUFFICIENT_CREDITS"
      }, { status: 400 })
    }

    // Deduct credits (0.5 credit for scheduling)
    const deductionFromMonthly = Math.min(monthlyCredits, 0.5)
    const deductionFromAdditional = 0.5 - deductionFromMonthly

    const updateData: any = {
      $set: { updatedAt: new Date() },
    }

    if (deductionFromMonthly > 0) {
      updateData.$inc = { monthlyCredits: -deductionFromMonthly }
    }

    if (deductionFromAdditional > 0) {
      if (updateData.$inc) {
        updateData.$inc.credits = -deductionFromAdditional
      } else {
        updateData.$inc = { credits: -deductionFromAdditional }
      }
    }

    const creditResult = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      updateData
    )

    if (creditResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 })
    }

    // Record the credit transaction
    await creditTransactions.insertOne({
      userId: new ObjectId(session.user.id),
      actionType: "auto_post",
      credits: -0.5,
      description: "Scheduled LinkedIn post",
      timestamp: new Date(),
      remainingCredits: totalAvailableCredits - 0.5
    })

    // Prepare post data
    const postData: LinkedInPostData = {
      content,
      images: images || [],
      scheduledFor: scheduledDate,
      userId: session.user.id,
      userEmail: session.user.email,
    }

    // Use unified scheduling function
    const result = await scheduleLinkedInPost(postData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        postId: result.postId,
        message: result.message,
      })
    } else {
      // If scheduling failed, refund the credits
      const refundData: any = {
        $set: { updatedAt: new Date() },
      }

      if (deductionFromMonthly > 0) {
        refundData.$inc = { monthlyCredits: deductionFromMonthly }
      }

      if (deductionFromAdditional > 0) {
        if (refundData.$inc) {
          refundData.$inc.credits = deductionFromAdditional
        } else {
          refundData.$inc = { credits: deductionFromAdditional }
        }
      }

      await users.updateOne(
        { _id: new ObjectId(session.user.id) },
        refundData
      )

      // Record the refund transaction
      await creditTransactions.insertOne({
        userId: new ObjectId(session.user.id),
        actionType: "credit_refund",
        credits: 0.5,
        description: "LinkedIn scheduling failed - credit refund",
        timestamp: new Date(),
        remainingCredits: totalAvailableCredits
      })

      return NextResponse.json({ 
        error: result.message,
        errorCode: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error scheduling LinkedIn post:", error)
    return NextResponse.json({ error: "Failed to schedule post" }, { status: 500 })
  }
}
