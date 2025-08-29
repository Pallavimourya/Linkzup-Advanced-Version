import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MongoClient } from "mongodb"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("LinkedIn connect API called")
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "exists" : "null")
    
    // Check if this is a sign-in or connection request
    const url = new URL(request.url)
    const isSignIn = url.searchParams.get('signin') === 'true'
    
    if (isSignIn) {
      // For sign-in, we don't need a session
      console.log("LinkedIn sign-in flow initiated")
    } else {
      // For connection, we need a valid session
      if (!session?.user?.email || !session?.user?.id) {
        console.log("Unauthorized - missing session data")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      console.log("LinkedIn connection flow initiated for user:", session.user.email)
    }
    
    console.log("LinkedIn Client ID:", process.env.LINKEDIN_CLIENT_ID ? "exists" : "missing")
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
    
    // Fix the NEXTAUTH_URL if it has https instead of http for localhost
    let baseUrl = process.env.NEXTAUTH_URL
    if (baseUrl?.includes('https://localhost')) {
      baseUrl = baseUrl.replace('https://localhost', 'http://localhost')
      console.log("Fixed NEXTAUTH_URL from https to http:", baseUrl)
    }
    
    const redirectUri = baseUrl + '/api/linkedin/callback'
    console.log("Redirect URI being used:", redirectUri)
    console.log("LinkedIn Client ID value:", process.env.LINKEDIN_CLIENT_ID)

    // Prepare state data based on action
    const stateData = isSignIn 
      ? { action: 'signin' }
      : { 
          action: 'connect', 
          userId: session?.user?.id,
          email: session?.user?.email 
        }

    // Generate LinkedIn OAuth URL
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('openid profile email w_member_social r_events')}&` +
      `state=${encodeURIComponent(JSON.stringify(stateData))}`

    console.log("Generated LinkedIn auth URL:", linkedinAuthUrl)

    return NextResponse.json({
      success: true,
      authUrl: linkedinAuthUrl,
    })
  } catch (error) {
    console.error("Error generating LinkedIn auth URL:", error)
    return NextResponse.json({ error: "Failed to generate LinkedIn auth URL" }, { status: 500 })
  }
}
