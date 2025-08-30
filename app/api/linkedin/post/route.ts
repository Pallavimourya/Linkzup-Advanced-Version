import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { postToLinkedIn, LinkedInPostData } from "@/lib/linkedin-posting"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, images } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // First, check and deduct credits
    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const creditTransactions = db.collection("credit_transactions")

    // Get current user data
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has enough credits (1 credit for LinkedIn posting)
    const currentCredits = user.credits || 0
    const monthlyCredits = user.monthlyCredits || 0
    const totalAvailableCredits = currentCredits + monthlyCredits

    if (totalAvailableCredits < 1) {
      return NextResponse.json({ 
        error: "Insufficient credits. You need 1 credit to post to LinkedIn.",
        errorCode: "INSUFFICIENT_CREDITS"
      }, { status: 400 })
    }

    // Deduct credits (1 credit for LinkedIn posting)
    const deductionFromMonthly = Math.min(monthlyCredits, 1)
    const deductionFromAdditional = 1 - deductionFromMonthly

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
      actionType: "text_with_post",
      credits: -1,
      description: "LinkedIn post",
      timestamp: new Date(),
      remainingCredits: totalAvailableCredits - 1
    })

    // Prepare post data
    const postData: LinkedInPostData = {
      content,
      images: images || [],
      userId: session.user.id,
      userEmail: session.user.email,
    }

    // Use unified posting function
    const result = await postToLinkedIn(postData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        postId: result.postId,
        message: result.message,
      })
    } else {
      // If posting failed, refund the credits
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
        credits: 1,
        description: "LinkedIn post failed - credit refund",
        timestamp: new Date(),
        remainingCredits: totalAvailableCredits
      })

      return NextResponse.json({ 
        error: result.message,
        errorCode: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error posting to LinkedIn:", error)
    return NextResponse.json({ error: "Failed to post to LinkedIn" }, { status: 500 })
  }
}
