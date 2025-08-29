import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Fix the NEXTAUTH_URL if it has https instead of http for localhost
    let baseUrl = process.env.NEXTAUTH_URL
    if (baseUrl?.includes('https://localhost')) {
      baseUrl = baseUrl.replace('https://localhost', 'http://localhost')
    }
    
    const redirectUri = baseUrl + '/api/linkedin/callback'
    
    return NextResponse.json({
      success: true,
      session: session ? {
        id: session.user?.id,
        email: session.user?.email,
        linkedinConnected: session.user?.linkedinConnected,
      } : null,
             env: {
         LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? "exists" : "missing",
         LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ? "exists" : "missing",
         NEXTAUTH_URL: process.env.NEXTAUTH_URL,
         NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "exists" : "missing",
       },
       redirectUri: redirectUri,
       correctedBaseUrl: baseUrl,
       linkedinAuthUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('openid profile email w_member_social r_events')}`
    })
  } catch (error) {
    console.error("Test LinkedIn error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
