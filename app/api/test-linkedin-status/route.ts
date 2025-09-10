import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      message: "Current LinkedIn Status",
      user: {
        id: session.user.id,
        email: session.user.email,
        linkedinConnected: (session?.user as any)?.linkedinConnected || false,
        linkedinId: (session?.user as any)?.linkedinId || null
      },
      session: {
        linkedinConnected: (session?.user as any)?.linkedinConnected || false
      },
      testUrls: {
        connect: "/api/linkedin/connect",
        disconnect: "/api/linkedin/disconnect",
        status: "/api/linkedin/status"
      }
    })
  } catch (error) {
    console.error("Error checking LinkedIn status:", error)
    return NextResponse.json({ error: "Failed to check LinkedIn status" }, { status: 500 })
  }
}
