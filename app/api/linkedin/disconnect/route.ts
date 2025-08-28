import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MongoClient } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update user's LinkedIn connection status in database
    const client = new MongoClient(process.env.MONGODB_URI!)
    
    try {
      await client.connect()
      const db = client.db()
      const users = db.collection("users")

      await users.updateOne(
        { _id: session.user.id },
        {
          $unset: {
            linkedinId: "",
            linkedinConnected: "",
            linkedinConnectedAt: "",
            accessToken: "",
          },
          $set: {
            updatedAt: new Date(),
          },
        }
      )

      return NextResponse.json({
        success: true,
        message: "LinkedIn account disconnected successfully",
      })
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error disconnecting LinkedIn:", error)
    return NextResponse.json({ error: "Failed to disconnect LinkedIn account" }, { status: 500 })
  }
}
