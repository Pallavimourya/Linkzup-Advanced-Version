import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { CREDIT_ACTIONS, canPerformAction } from "@/lib/credit-utils"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { actionType, description } = await request.json()

    // Validate action type
    if (!CREDIT_ACTIONS[actionType]) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 })
    }

    const action = CREDIT_ACTIONS[actionType]
    const requiredCredits = action.credits

    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const creditTransactions = db.collection("credit_transactions")

    // Get current user data
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check trial status
    let isTrialActive = false
    if (user.trialStartDate && user.trialPeriodDays) {
      const trialStartDate = new Date(user.trialStartDate)
      const trialEndDate = new Date(trialStartDate.getTime() + user.trialPeriodDays * 24 * 60 * 60 * 1000)
      isTrialActive = new Date() < trialEndDate
    }

    const currentCredits = user.credits || 0
    const monthlyCredits = user.monthlyCredits || 0
    const totalAvailableCredits = currentCredits + monthlyCredits

    // Check if user can perform the action
    const { canPerform } = canPerformAction(totalAvailableCredits, actionType)
    
    if (!canPerform) {
      // If trial is active but no credits, show trial message
      if (isTrialActive && totalAvailableCredits === 0) {
        return NextResponse.json({ 
          error: "Trial credits exhausted. Please purchase credits to continue.",
          isTrialActive: true,
          trialExpired: false,
          requiredCredits,
          currentCredits,
          monthlyCredits,
          totalAvailableCredits,
          canPerform: false
        }, { status: 402 })
      }
      
      // If trial expired and no credits, show payment required message
      if (!isTrialActive && totalAvailableCredits === 0) {
        return NextResponse.json({ 
          error: "Trial period expired. Please purchase credits to continue using the service.",
          isTrialActive: false,
          trialExpired: true,
          requiredCredits,
          currentCredits,
          monthlyCredits,
          totalAvailableCredits,
          canPerform: false
        }, { status: 402 })
      }
      
      // Regular insufficient credits message
      return NextResponse.json({ 
        error: "Insufficient credits",
        requiredCredits,
        currentCredits,
        monthlyCredits,
        totalAvailableCredits,
        canPerform: false
      }, { status: 402 })
    }

    // Deduct credits - use monthly credits first, then additional credits
    let deductionFromMonthly = 0
    let deductionFromAdditional = 0

    if (monthlyCredits >= requiredCredits) {
      // Use monthly credits only
      deductionFromMonthly = requiredCredits
    } else {
      // Use all monthly credits and remaining from additional credits
      deductionFromMonthly = monthlyCredits
      deductionFromAdditional = requiredCredits - monthlyCredits
    }

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

    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      updateData
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 })
    }

    // Record the transaction
    await creditTransactions.insertOne({
      userId: new ObjectId(session.user.id),
      actionType,
      credits: -requiredCredits,
      description: description || action.description,
      timestamp: new Date(),
      remainingCredits: currentCredits - requiredCredits
    })

    // Update usage statistics
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $inc: {
          [`usage.${currentMonth}.${actionType}`]: 1,
          [`usage.${currentMonth}.total`]: 1,
        },
      }
    )

    // Get updated user data
    const updatedUser = await users.findOne({ _id: new ObjectId(session.user.id) })

    return NextResponse.json({
      success: true,
      message: `Credits deducted successfully for ${action.description}`,
      deductedCredits: requiredCredits,
      remainingCredits: updatedUser?.credits || 0,
      actionType,
      description: action.description
    })
  } catch (error) {
    console.error("Credit deduction error:", error)
    return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 })
  }
}
