import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false, 
        message: "No session found" 
      })
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name
      },
      message: "Authentication successful" 
    })
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json({ 
      authenticated: false, 
      error: "Authentication test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
