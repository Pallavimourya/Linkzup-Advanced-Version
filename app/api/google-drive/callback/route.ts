import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { MongoClient, ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state") // This should contain the user ID
    const error = searchParams.get("error")

    if (error) {
      console.error("Google Drive OAuth error:", error)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/custom-post?error=google_drive_auth_failed`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/custom-post?error=missing_auth_params`)
    }

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/google-drive/callback`,
    )

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info to verify
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()

    // Store tokens in database
    const client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()

    const users = client.db("Linkzup-Advanced").collection("users")
    await users.updateOne(
      { _id: new ObjectId(state) },
      {
        $set: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleDriveConnected: true,
          googleDriveConnectedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    await client.close()

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/custom-post?google_drive_connected=true`)
  } catch (error) {
    console.error("Google Drive callback error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/custom-post?error=google_drive_callback_failed`)
  }
}
