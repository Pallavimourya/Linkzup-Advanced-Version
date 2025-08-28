import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("LinkedIn callback API called")
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    console.log("Callback params - code:", code ? "exists" : "missing", "state:", state ? "exists" : "missing", "error:", error)

    if (error) {
      console.error("LinkedIn OAuth error:", error)
      return NextResponse.redirect(new URL('/dashboard?error=linkedin_oauth_failed', process.env.NEXTAUTH_URL!))
    }

    if (!code || !state) {
      console.error("Missing required parameters - code:", !!code, "state:", !!state)
      return NextResponse.redirect(new URL('/dashboard?error=missing_params', process.env.NEXTAUTH_URL!))
    }

    let stateData
    try {
      stateData = JSON.parse(decodeURIComponent(state))
    } catch (e) {
      console.error("Invalid state parameter:", e)
      return NextResponse.redirect(new URL('/dashboard?error=invalid_state', process.env.NEXTAUTH_URL!))
    }

    // Exchange code for access token
    // Fix the NEXTAUTH_URL if it has https instead of http for localhost
    let baseUrl = process.env.NEXTAUTH_URL
    if (baseUrl?.includes('https://localhost')) {
      baseUrl = baseUrl.replace('https://localhost', 'http://localhost')
      console.log("Fixed NEXTAUTH_URL from https to http:", baseUrl)
    }
    
    const redirectUri = baseUrl + '/api/linkedin/callback'
    console.log("Using redirect URI for token exchange:", redirectUri)
    
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Failed to get LinkedIn access token:", await tokenResponse.text())
      return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', process.env.NEXTAUTH_URL!))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user profile from LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!profileResponse.ok) {
      console.error("Failed to get LinkedIn profile:", await profileResponse.text())
      return NextResponse.redirect(new URL('/dashboard?error=profile_fetch_failed', process.env.NEXTAUTH_URL!))
    }

    const profile = await profileResponse.json()

    // Update user's LinkedIn connection in database
    const client = new MongoClient(process.env.MONGODB_URI!)
    
    try {
      await client.connect()
      const db = client.db()
      const users = db.collection("users")
      const { ObjectId } = await import("mongodb")

             await users.updateOne(
         { _id: new ObjectId(stateData.userId) },
         {
           $set: {
             linkedinId: profile.sub,
             linkedinConnected: true,
             linkedinConnectedAt: new Date(),
             linkedinAccessToken: accessToken,
             updatedAt: new Date(),
           },
         }
       )

               // Redirect to dashboard with success message
        return NextResponse.redirect(new URL(`/dashboard?success=linkedin_connected`, process.env.NEXTAUTH_URL!))
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error in LinkedIn callback:", error)
    return NextResponse.redirect(new URL('/dashboard?error=callback_failed', process.env.NEXTAUTH_URL!))
  }
}
