import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { sendWelcomeEmail } from "@/lib/email-utils"
import { signIn } from "next-auth/react"

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
      return NextResponse.redirect(new URL('/auth/signin?error=linkedin_oauth_failed', process.env.NEXTAUTH_URL!))
    }

    if (!code || !state) {
      console.error("Missing required parameters - code:", !!code, "state:", !!state)
      return NextResponse.redirect(new URL('/auth/signin?error=missing_params', process.env.NEXTAUTH_URL!))
    }

    let stateData
    try {
      stateData = JSON.parse(decodeURIComponent(state))
    } catch (e) {
      console.error("Invalid state parameter:", e)
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_state', process.env.NEXTAUTH_URL!))
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
      return NextResponse.redirect(new URL('/auth/signin?error=token_exchange_failed', process.env.NEXTAUTH_URL!))
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
      return NextResponse.redirect(new URL('/auth/signin?error=profile_fetch_failed', process.env.NEXTAUTH_URL!))
    }

    const profile = await profileResponse.json()

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")
      const { ObjectId } = await import("mongodb")

      // Check if user exists
      let user = await users.findOne({ email: profile.email })
      
      if (!user) {
        // Create new user for sign-in
        const newUser = {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          linkedinId: profile.sub,
          linkedinConnected: true,
          linkedinConnectedAt: new Date(),
          linkedinAccessToken: accessToken,
          credits: 0,
          trialStartDate: new Date(),
          trialPeriodDays: 2,
          isTrialActive: true,
          totalCreditsEver: 0,
          bio: null,
          profilePicture: null,
          darkMode: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        const result = await users.insertOne(newUser)
        user = { ...newUser, _id: result.insertedId }
        console.log("Created new user for LinkedIn sign-in:", user.email)
        
        // Send welcome email to new LinkedIn user
        try {
          await sendWelcomeEmail({
            name: profile.name,
            email: profile.email,
          })
          console.log(`Welcome email sent to LinkedIn user: ${profile.email}`)
        } catch (emailError) {
          console.error("Failed to send welcome email to LinkedIn user:", emailError)
          // Don't fail the sign-in if email fails
        }
      } else {
        // Update existing user's LinkedIn connection
        await users.updateOne(
          { _id: user._id },
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
        console.log("Updated existing user's LinkedIn connection:", user.email)
      }

      // Redirect based on action
      if (stateData.action === 'connect') {
        // For connection flow, redirect to dashboard
        return NextResponse.redirect(new URL(`/dashboard?success=linkedin_connected`, process.env.NEXTAUTH_URL!))
      } else {
        // For sign-in flow, redirect to a special page that will create the session
        const sessionToken = Buffer.from(JSON.stringify({
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          linkedinId: profile.sub,
          accessToken: accessToken,
          timestamp: Date.now()
        })).toString('base64')
        
        return NextResponse.redirect(new URL(`/auth/linkedin-signin?token=${sessionToken}`, process.env.NEXTAUTH_URL!))
      }
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Error in LinkedIn callback:", error)
    return NextResponse.redirect(new URL('/auth/signin?error=callback_failed', process.env.NEXTAUTH_URL!))
  }
}
