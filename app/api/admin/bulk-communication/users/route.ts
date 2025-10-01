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

    // Get all users with their subscription status
    const allUsers = await users.find({}).toArray()
    
    // Get active subscriptions
    const activeSubscriptions = await subscriptions.find({ 
      status: "active" 
    }).toArray()
    
    // Create a map of user IDs to subscription status
    const subscriptionMap = new Map()
    activeSubscriptions.forEach(sub => {
      subscriptionMap.set(sub.userId.toString(), sub)
    })

    // Enrich users with subscription status
    const enrichedUsers = allUsers.map(user => {
      const subscription = subscriptionMap.get(user._id.toString())
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        credits: user.credits || 0,
        plan: user.plan,
        role: user.role || "user",
        isTrialActive: user.isTrialActive || false,
        isAdmin: user.isAdmin || false,
        accountStatus: user.accountStatus || "active",
        subscriptionStatus: subscription ? "active" : "inactive",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

    // Calculate stats
    const stats = {
      total: enrichedUsers.length,
      trial: enrichedUsers.filter(u => u.isTrialActive).length,
      active: enrichedUsers.filter(u => 
        !u.isTrialActive && !u.isAdmin && u.accountStatus !== "suspended" && u.subscriptionStatus === "active"
      ).length,
      pending: enrichedUsers.filter(u => 
        !u.isTrialActive && !u.isAdmin && u.subscriptionStatus !== "active"
      ).length,
      admin: enrichedUsers.filter(u => u.isAdmin).length
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
