import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()

  const { db } = await connectToDatabase()
  const users = db.collection("users")
  const subscriptions = db.collection("subscriptions")
  const payments = db.collection("payments")

  const filter: any = {}
  if (q) {
    filter.$or = [{ email: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }]
  }

  const allUsers = await users
    .find(filter, {
      projection: {
        email: 1,
        name: 1,
        role: 1,
        isAdmin: 1,
        credits: 1,
        isTrialActive: 1,
        plan: 1,
        accountStatus: 1,
        subscriptionStatus: 1,
        city: 1,
        mobile: 1,
        createdAt: 1,
        updatedAt: 1,
        trialStartDate: 1,
        trialEndDate: 1,
        lastLoginDate: 1,
        totalLogins: 1,
        profileCompleted: 1,
        emailVerified: 1,
        mobileVerified: 1,
      },
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray()

  console.log(`Found ${allUsers.length} users, sorted by createdAt descending`)

  // Get subscription and payment data for detailed information
  const allSubscriptions = await subscriptions.find({}).toArray()
  const allPayments = await payments.find({}).toArray()
  
  // Create maps for purchase information
  const hasEverPurchasedMap = new Map()
  const lastPurchaseInfoMap = new Map()
  
  // Check subscription history
  allSubscriptions.forEach(sub => {
    hasEverPurchasedMap.set(sub.userId.toString(), true)
    
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

  // Enrich users with detailed information
  const enrichedUsers = allUsers.map(user => {
    const hasEverPurchased = hasEverPurchasedMap.get(user._id.toString()) || false
    const lastPurchaseInfo = lastPurchaseInfoMap.get(user._id.toString())
    
    // Calculate trial information
    // Handle cases where createdAt might be missing or invalid
    let joinDate = user.createdAt
    if (!joinDate || isNaN(new Date(joinDate).getTime())) {
      // Fallback to trialStartDate or updatedAt if createdAt is invalid
      joinDate = user.trialStartDate || user.updatedAt || new Date()
    }
    
    const trialStartDate = user.trialStartDate || joinDate
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
      ...user,
      hasEverPurchased: hasEverPurchased,
      lastPurchaseDate: lastPurchaseInfo?.date || null,
      lastPurchasePlan: lastPurchaseInfo?.planType || null,
      lastPurchaseType: lastPurchaseInfo?.type || null,
      joinDate: joinDate,
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate,
      trialStatus: trialStatus,
      trialDaysRemaining: trialDaysRemaining,
      trialDaysUsed: trialDaysUsed,
      // Ensure these fields have proper default values
      totalLogins: user.totalLogins || 0,
      profileCompleted: user.profileCompleted || false,
      emailVerified: user.emailVerified || false,
      mobileVerified: user.mobileVerified || false,
      lastLoginDate: user.lastLoginDate || null,
    }
  })

  // Log first few users to verify sorting
  console.log("First 3 users (should be newest first):")
  enrichedUsers.slice(0, 3).forEach((user: any, index) => {
    console.log(`${index + 1}. ${user.email} - createdAt: ${user.createdAt} - joinDate: ${user.joinDate}`)
  })

  return NextResponse.json({ users: enrichedUsers })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { id, updates } = body as { id: string; updates: Record<string, any> }
  if (!id || !updates) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const allowed = ["accountStatus", "subscriptionStatus", "plan", "credits", "isTrialActive", "role", "isAdmin"]
  const $set: any = { updatedAt: new Date() }
  for (const k of allowed) {
    if (k in updates) $set[k] = updates[k]
  }

  const { db } = await connectToDatabase()
  const users = db.collection("users")

  await users.updateOne({ _id: new ObjectId(id) }, { $set })
  const updated = await users.findOne({ _id: new ObjectId(id) }, { projection: { email: 1 } })
  return NextResponse.json({ ok: true, user: updated })
}
