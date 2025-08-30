import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { MongoClient } from "mongodb"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Get the latest user data from database to ensure we have the most current LinkedIn status
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")
      const { ObjectId } = await import("mongodb")
      
      const userData = await users.findOne({ _id: new ObjectId(session.user.id) })
      
      if (userData) {
        // Return the current LinkedIn connection status
        return NextResponse.json({ 
          success: true, 
          linkedinConnected: !!(userData.linkedinId && userData.linkedinAccessToken),
          linkedinId: userData.linkedinId || null,
          linkedinAccessToken: userData.linkedinAccessToken ? "exists" : null
        })
      } else {
        return NextResponse.json({ 
          success: true, 
          linkedinConnected: false,
          linkedinId: null,
          linkedinAccessToken: null
        })
      }
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json({ 
      error: "Failed to refresh session" 
    }, { status: 500 })
  }
}
