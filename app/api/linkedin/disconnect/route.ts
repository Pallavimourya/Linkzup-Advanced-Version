import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { MongoClient } from "mongodb"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    console.log("Disconnect API - Session user:", session?.user?.email, session?.user?.id)
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update user's LinkedIn connection status in database
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")

      const { ObjectId } = await import("mongodb")
      
      const updateResult = await users.updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $unset: {
            linkedinId: "",
            linkedinConnected: "",
            linkedinConnectedAt: "",
            linkedinAccessToken: "",
          },
          $set: {
            updatedAt: new Date(),
          },
        }
      )

      console.log("Database update result:", updateResult)

      // Verify the update by checking the user data
      const updatedUser = await users.findOne({ _id: new ObjectId(session.user.id) })
      console.log("Updated user LinkedIn data:", {
        linkedinId: updatedUser?.linkedinId,
        linkedinConnected: updatedUser?.linkedinConnected,
        linkedinAccessToken: updatedUser?.linkedinAccessToken ? "exists" : "missing"
      })

      return NextResponse.json({
        success: true,
        message: "LinkedIn account disconnected successfully",
        updatedUser: {
          linkedinId: updatedUser?.linkedinId,
          linkedinConnected: updatedUser?.linkedinConnected,
          linkedinAccessToken: updatedUser?.linkedinAccessToken ? "exists" : "missing"
        }
      })
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error disconnecting LinkedIn:", error)
    return NextResponse.json({ error: "Failed to disconnect LinkedIn account" }, { status: 500 })
  }
}
