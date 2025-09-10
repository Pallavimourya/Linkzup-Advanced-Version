import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("LinkedIn callback API called")
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    const error = url.searchParams.get("error")

    console.log(
      "Callback params - code:",
      code ? "exists" : "missing",
      "state:",
      state ? "exists" : "missing",
      "error:",
      error,
    )

    const baseUrl = process.env.NEXTAUTH_URL || "https://www.linkzup.in"

    if (error) {
      console.error("LinkedIn OAuth error:", error)
      return NextResponse.redirect(new URL("/auth/signin?error=linkedin_oauth_failed", baseUrl))
    }

    if (!code || !state) {
      console.error("Missing required parameters - code:", !!code, "state:", !!state)
      return NextResponse.redirect(new URL("/auth/signin?error=missing_params", baseUrl))
    }

    let stateData
    try {
      stateData = JSON.parse(decodeURIComponent(state))
    } catch (e) {
      console.error("Invalid state parameter:", e)
      return NextResponse.redirect(new URL("/auth/signin?error=invalid_state", baseUrl))
    }

    const redirectUri = `${baseUrl}/api/linkedin/callback`

    // Exchange code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Failed to get LinkedIn access token:", await tokenResponse.text())
      return NextResponse.redirect(new URL("/auth/signin?error=token_exchange_failed", baseUrl))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user profile from LinkedIn
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!profileResponse.ok) {
      console.error("Failed to get LinkedIn profile:", await profileResponse.text())
      return NextResponse.redirect(new URL("/auth/signin?error=profile_fetch_failed", baseUrl))
    }

    const profile = await profileResponse.json()

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")

    try {
      await client.connect()
      const db = client.db("Linkzup-Advanced")
      const users = db.collection("users")

      if (stateData.action === "connect" && stateData.userId) {
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
          },
        )

        if (result.modifiedCount > 0) {
          console.log("LinkedIn connected successfully for user:", stateData.userId)
          return NextResponse.redirect(new URL("/dashboard?success=linkedin_connected", baseUrl))
        } else {
          console.error("Failed to update user with LinkedIn connection")
          return NextResponse.redirect(new URL("/dashboard?error=update_failed", baseUrl))
        }
      } else {
        let user = await users.findOne({ email: profile.email })

        if (!user) {
          // Create new user with proper NextAuth structure and 10 free trial credits
          const trialStartDate = new Date()
          const trialEndDate = new Date(trialStartDate.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days
          
          const newUser = {
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            linkedinId: profile.sub,
            linkedinConnected: true,
            linkedinConnectedAt: new Date(),
            linkedinAccessToken: accessToken,
            credits: 10, // Give 10 free credits for trial
            trialStartDate: trialStartDate,
            trialEndDate: trialEndDate,
            trialPeriodDays: 2,
            isTrialActive: true,
            totalCreditsEver: 10, // Track total credits ever received
            bio: null,
            profilePicture: null,
            darkMode: false,
            hasUsedCoupon: false, // Track coupon usage
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const result = await users.insertOne(newUser)
          user = { ...newUser, _id: result.insertedId }
          console.log("New user created with LinkedIn:", profile.email)

          // Create trial started notification for new LinkedIn user
          const notifications = db.collection("notifications")
          await notifications.insertOne({
            userId: result.insertedId,
            type: "trial_started",
            title: "🎉 Welcome! Your 2-day free trial has started",
            message: "You have 2 days free trial with 10 credits to explore all features.",
            isRead: false,
            createdAt: new Date(),
            metadata: {
              trialEndDate: trialEndDate,
              credits: 10,
              trialPeriodDays: 2
            }
          })

          // Schedule trial ending reminder (24 hours before expiry)
          const reminderDate = new Date(trialStartDate.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day later
          await notifications.insertOne({
            userId: result.insertedId,
            type: "trial_ending_reminder",
            title: "⏰ Your free trial ends tomorrow",
            message: "Your 2-day free trial ends in 24 hours. Consider upgrading to continue using all features.",
            isRead: false,
            scheduledFor: reminderDate,
            createdAt: new Date(),
            metadata: {
              trialEndDate: trialEndDate,
              reminderType: "trial_ending"
            }
          })
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
                name: profile.name, // Update name from LinkedIn
                image: profile.picture, // Update image from LinkedIn
                updatedAt: new Date(),
              },
            },
          )
          console.log("Existing user LinkedIn connection updated:", profile.email)
        }

        const callbackUrl = new URL("/auth/linkedin-callback", baseUrl)
        callbackUrl.searchParams.set("email", profile.email)
        callbackUrl.searchParams.set("userId", user._id.toString())

        return NextResponse.redirect(callbackUrl.toString())
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.redirect(new URL("/auth/signin?error=database_error", baseUrl))
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("LinkedIn callback error:", error)
    return NextResponse.redirect(
      new URL("/auth/signin?error=callback_failed", process.env.NEXTAUTH_URL || "https://www.linkzup.in"),
    )
  }
}
