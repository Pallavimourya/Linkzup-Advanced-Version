import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { MongoClient } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check current LinkedIn status
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")

      const { ObjectId } = await import("mongodb")
      
      const user = await users.findOne({ _id: new ObjectId(session.user.id) })
      
      return NextResponse.json({
        message: "LinkedIn Status Check",
        user: {
          id: session.user.id,
          email: session.user.email,
          linkedinId: user?.linkedinId,
          linkedinConnected: user?.linkedinConnected,
          linkedinAccessToken: user?.linkedinAccessToken ? "exists" : "missing",
          linkedinConnectedAt: user?.linkedinConnectedAt
        },
        session: {
          linkedinConnected: (session?.user as any)?.linkedinConnected
        }
      })
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error checking LinkedIn status:", error)
    return NextResponse.json({ error: "Failed to check LinkedIn status" }, { status: 500 })
  }
}
