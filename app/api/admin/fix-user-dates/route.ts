import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Find users with missing or invalid createdAt dates
    const usersWithInvalidDates = await users.find({
      $or: [
        { createdAt: { $exists: false } },
        { createdAt: null },
        { createdAt: { $type: "string" } }, // If it's stored as string instead of Date
        { createdAt: { $lt: new Date("2020-01-01") } }, // Very old dates that might be invalid
      ]
    }).toArray()

    console.log(`Found ${usersWithInvalidDates.length} users with invalid dates`)

    let fixedCount = 0
    const results = []

    for (const user of usersWithInvalidDates) {
      let newCreatedAt: Date

      // Try to determine the best date to use
      if (user.trialStartDate && new Date(user.trialStartDate).getTime() > 0) {
        // Use trial start date if available and valid
        newCreatedAt = new Date(user.trialStartDate)
      } else if (user.updatedAt && new Date(user.updatedAt).getTime() > 0) {
        // Use updatedAt if available and valid
        newCreatedAt = new Date(user.updatedAt)
      } else {
        // Use current date as fallback
        newCreatedAt = new Date()
      }

      // Update the user with the new createdAt date
      await users.updateOne(
        { _id: user._id },
        { 
          $set: { 
            createdAt: newCreatedAt,
            updatedAt: new Date()
          } 
        }
      )

      fixedCount++
      results.push({
        userId: user._id,
        email: user.email,
        name: user.name,
        oldCreatedAt: user.createdAt,
        newCreatedAt: newCreatedAt,
        source: user.trialStartDate ? 'trialStartDate' : user.updatedAt ? 'updatedAt' : 'currentDate'
      })

      console.log(`Fixed user ${user.email}: ${user.createdAt} -> ${newCreatedAt}`)
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} users with invalid dates`,
      totalFound: usersWithInvalidDates.length,
      fixedCount,
      results
    })

  } catch (error) {
    console.error("Error fixing user dates:", error)
    return NextResponse.json({ 
      error: "Failed to fix user dates",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Find users with missing or invalid createdAt dates
    const usersWithInvalidDates = await users.find({
      $or: [
        { createdAt: { $exists: false } },
        { createdAt: null },
        { createdAt: { $type: "string" } }, // If it's stored as string instead of Date
        { createdAt: { $lt: new Date("2020-01-01") } }, // Very old dates that might be invalid
      ]
    }, {
      projection: {
        _id: 1,
        email: 1,
        name: 1,
        createdAt: 1,
        trialStartDate: 1,
        updatedAt: 1
      }
    }).toArray()

    return NextResponse.json({
      success: true,
      count: usersWithInvalidDates.length,
      users: usersWithInvalidDates.map(user => ({
        _id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        trialStartDate: user.trialStartDate,
        updatedAt: user.updatedAt
      }))
    })

  } catch (error) {
    console.error("Error checking user dates:", error)
    return NextResponse.json({ 
      error: "Failed to check user dates",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
