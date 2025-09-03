import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { MongoClient, ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user data directly from database to get latest LinkedIn status
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")
      
      const userData = await users.findOne({ _id: new ObjectId(session.user.id) })
      
      const isConnected = !!(userData?.linkedinId && userData?.linkedinAccessToken)
      const linkedinId = userData?.linkedinId

      return NextResponse.json({
        success: true,
        isConnected,
        linkedinId,
        timestamp: new Date().toISOString(),
      })
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error checking LinkedIn status:", error)
    return NextResponse.json({ error: "Failed to check LinkedIn status" }, { status: 500 })
  }
}
