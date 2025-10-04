import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Find users with missing activity information
    const usersWithMissingInfo = await users.find({
      $or: [
        { totalLogins: { $exists: false } },
        { totalLogins: null },
        { profileCompleted: { $exists: false } },
        { profileCompleted: null },
        { emailVerified: { $exists: false } },
        { emailVerified: null },
        { mobileVerified: { $exists: false } },
        { mobileVerified: null },
      ]
    }).toArray()

    console.log(`Found ${usersWithMissingInfo.length} users with missing activity information`)

    let fixedCount = 0
    const results = []

    for (const user of usersWithMissingInfo) {
      const updates: any = {
        updatedAt: new Date()
      }

      // Set default values for missing fields
      if (user.totalLogins === undefined || user.totalLogins === null) {
        updates.totalLogins = 0
      }
      if (user.profileCompleted === undefined || user.profileCompleted === null) {
        updates.profileCompleted = false
      }
      if (user.emailVerified === undefined || user.emailVerified === null) {
        updates.emailVerified = false
      }
      if (user.mobileVerified === undefined || user.mobileVerified === null) {
        updates.mobileVerified = false
      }

      // Update the user
      await users.updateOne(
        { _id: user._id },
        { $set: updates }
      )

      fixedCount++
      results.push({
        userId: user._id,
        email: user.email,
        name: user.name,
        updates: updates
      })

      console.log(`Fixed user ${user.email} with updates:`, updates)
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} users with missing activity information`,
      totalFound: usersWithMissingInfo.length,
      fixedCount,
      results
    })

  } catch (error) {
    console.error("Error fixing user activity information:", error)
    return NextResponse.json({ 
      error: "Failed to fix user activity information",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Find users with missing activity information
    const usersWithMissingInfo = await users.find({
      $or: [
        { totalLogins: { $exists: false } },
        { totalLogins: null },
        { profileCompleted: { $exists: false } },
        { profileCompleted: null },
        { emailVerified: { $exists: false } },
        { emailVerified: null },
        { mobileVerified: { $exists: false } },
        { mobileVerified: null },
      ]
    }, {
      projection: {
        _id: 1,
        email: 1,
        name: 1,
        totalLogins: 1,
        profileCompleted: 1,
        emailVerified: 1,
        mobileVerified: 1
      }
    }).toArray()

    return NextResponse.json({
      success: true,
      count: usersWithMissingInfo.length,
      users: usersWithMissingInfo.map(user => ({
        _id: user._id,
        email: user.email,
        name: user.name,
        totalLogins: user.totalLogins,
        profileCompleted: user.profileCompleted,
        emailVerified: user.emailVerified,
        mobileVerified: user.mobileVerified
      }))
    })

  } catch (error) {
    console.error("Error checking user activity information:", error)
    return NextResponse.json({ 
      error: "Failed to check user activity information",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
