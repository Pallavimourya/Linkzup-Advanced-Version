import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (using the same method as other admin APIs)
    if (!(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const subscriptions = db.collection("subscriptions")
    const payments = db.collection("payments")

    // Get all users with their subscription status
    const allUsers = await users.find({}).toArray()
    
    // Get active subscriptions
    const activeSubscriptions = await subscriptions.find({ 
      status: "active" 
    }).toArray()
    
    // Get all subscription history (any status)
    const allSubscriptions = await subscriptions.find({}).toArray()
    
    // Get all payment history
    const allPayments = await payments.find({}).toArray()
    
    // Create a map of user IDs to subscription status
    const subscriptionMap = new Map()
    activeSubscriptions.forEach(sub => {
      subscriptionMap.set(sub.userId.toString(), sub)
    })
    
    // Create a map of user IDs who have ever purchased a plan
    const hasEverPurchasedMap = new Map()
    const lastPurchaseInfoMap = new Map()
    
    // Check subscription history
    allSubscriptions.forEach(sub => {
      hasEverPurchasedMap.set(sub.userId.toString(), true)
      
      // Track the most recent purchase info
      const userId = sub.userId.toString()
      const currentInfo = lastPurchaseInfoMap.get(userId)
      const purchaseDate = new Date(sub.createdAt)
      
      if (!currentInfo || purchaseDate > new Date(currentInfo.date)) {
        lastPurchaseInfoMap.set(userId, {
          date: sub.createdAt,
          planType: sub.planType,
          type: 'subscription'
        })
      }
    })
    
    // Check payment history
    allPayments.forEach(payment => {
      hasEverPurchasedMap.set(payment.userId.toString(), true)
      
      // Track the most recent purchase info
      const userId = payment.userId.toString()
      const currentInfo = lastPurchaseInfoMap.get(userId)
      const purchaseDate = new Date(payment.createdAt)
      
      if (!currentInfo || purchaseDate > new Date(currentInfo.date)) {
        lastPurchaseInfoMap.set(userId, {
          date: payment.createdAt,
          planType: payment.planType,
          type: 'payment'
        })
      }
    })

    // Enrich users with subscription status and detailed information
    const enrichedUsers = allUsers.map(user => {
      const subscription = subscriptionMap.get(user._id.toString())
      const hasEverPurchased = hasEverPurchasedMap.get(user._id.toString()) || false
      const lastPurchaseInfo = lastPurchaseInfoMap.get(user._id.toString())
      
      // Calculate trial information
      const joinDate = user.createdAt
      const trialStartDate = user.trialStartDate || user.createdAt
      const trialEndDate = user.trialEndDate
      const isTrialActive = user.isTrialActive || false
      
      // Calculate trial duration and status
      let trialStatus = "not_started"
      let trialDaysRemaining = 0
      let trialDaysUsed = 0
      
      if (trialStartDate) {
        const now = new Date()
        const startDate = new Date(trialStartDate)
        const endDate = trialEndDate ? new Date(trialEndDate) : new Date(startDate.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days default
        
        if (isTrialActive) {
          trialStatus = "active"
          trialDaysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
          trialDaysUsed = Math.min(14, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)))
        } else if (now > endDate) {
          trialStatus = "expired"
          trialDaysUsed = 14
        } else {
          trialStatus = "ended"
          trialDaysUsed = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
        }
      }
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        credits: user.credits || 0,
        plan: user.plan,
        role: user.role || "user",
        isTrialActive: isTrialActive,
        isAdmin: user.isAdmin || false,
        accountStatus: user.accountStatus || "active",
        subscriptionStatus: subscription ? "active" : "inactive",
        hasEverPurchased: hasEverPurchased,
        lastPurchaseDate: lastPurchaseInfo?.date || null,
        lastPurchasePlan: lastPurchaseInfo?.planType || null,
        lastPurchaseType: lastPurchaseInfo?.type || null,
        
        // Detailed user information
        joinDate: joinDate,
        trialStartDate: trialStartDate,
        trialEndDate: trialEndDate,
        trialStatus: trialStatus,
        trialDaysRemaining: trialDaysRemaining,
        trialDaysUsed: trialDaysUsed,
        lastLoginDate: user.lastLoginDate || null,
        totalLogins: user.totalLogins || 0,
        profileCompleted: user.profileCompleted || false,
        emailVerified: user.emailVerified || false,
        mobileVerified: user.mobileVerified || false,
        
        // Timestamps
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

    // Calculate comprehensive stats for all user categories
    const stats = {
      total: enrichedUsers.length,
      
      // Trial Users
      trialActive: enrichedUsers.filter(u => u.isTrialActive && !u.isAdmin).length,
      
      // Trial Ended Users (no purchase)
      trialEndedNoPurchase: enrichedUsers.filter(u => 
        !u.isTrialActive && !u.isAdmin && !u.hasEverPurchased
      ).length,
      
      // Trial Ended Users with Credits (no purchase)
      trialEndedWithCredits: enrichedUsers.filter(u => 
        !u.isTrialActive && !u.isAdmin && !u.hasEverPurchased && (u.credits || 0) > 0
      ).length,
      
      // Trial Ended Users with 0 Credits (no purchase)
      trialEndedZeroCredits: enrichedUsers.filter(u => 
        !u.isTrialActive && !u.isAdmin && !u.hasEverPurchased && (u.credits || 0) === 0
      ).length,
      
      // Users who purchased plans (any status)
      purchasedPlans: enrichedUsers.filter(u => 
        !u.isAdmin && u.accountStatus !== "suspended" && u.hasEverPurchased
      ).length,
      
      // Active Subscribers (currently paying)
      activeSubscribers: enrichedUsers.filter(u => 
        !u.isAdmin && u.accountStatus !== "suspended" && u.subscriptionStatus === "active"
      ).length,
      
      // Expired Subscribers (purchased before but subscription expired)
      expiredSubscribers: enrichedUsers.filter(u => 
        !u.isAdmin && u.accountStatus !== "suspended" && u.hasEverPurchased && u.subscriptionStatus !== "active"
      ).length,
      
      // One-time purchasers (credit packs only)
      oneTimePurchasers: enrichedUsers.filter(u => 
        !u.isAdmin && u.accountStatus !== "suspended" && u.hasEverPurchased && u.lastPurchaseType === "payment"
      ).length,
      
      // Suspended Users
      suspendedUsers: enrichedUsers.filter(u => u.accountStatus === "suspended").length,
      
      // Admin Users
      adminUsers: enrichedUsers.filter(u => u.isAdmin).length
    }

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      stats
    })

  } catch (error) {
    console.error("Error fetching users for bulk communication:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
