import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

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
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/linkedin/callback`,
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

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")
    
    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")

      if (stateData.action === 'connect' && stateData.userId) {
        // Update existing user's LinkedIn connection
        const result = await users.updateOne(
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

        if (result.modifiedCount > 0) {
          console.log("LinkedIn connected successfully for user:", stateData.userId)
          return NextResponse.redirect(new URL('/dashboard?success=linkedin_connected', process.env.NEXTAUTH_URL!))
        } else {
          console.error("Failed to update user with LinkedIn connection")
          return NextResponse.redirect(new URL('/dashboard?error=update_failed', process.env.NEXTAUTH_URL!))
        }
      } else {
        // Handle sign-in flow (create new user or sign in existing)
        let user = await users.findOne({ email: profile.email })
        
        if (!user) {
          // Create new user
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
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          const result = await users.insertOne(newUser)
          user = { ...newUser, _id: result.insertedId }
          console.log("New user created with LinkedIn:", profile.email)
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
          console.log("Existing user LinkedIn connection updated:", profile.email)
        }

        // Redirect to dashboard with success
        return NextResponse.redirect(new URL('/dashboard?success=linkedin_connected', process.env.NEXTAUTH_URL!))
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.redirect(new URL('/dashboard?error=database_error', process.env.NEXTAUTH_URL!))
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("LinkedIn callback error:", error)
    return NextResponse.redirect(new URL('/dashboard?error=callback_failed', process.env.NEXTAUTH_URL!))
  }
}
