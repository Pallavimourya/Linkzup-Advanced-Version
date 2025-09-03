import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasLinkedinClientId: !!process.env.LINKEDIN_CLIENT_ID,
    timestamp: new Date().toISOString(),
    deployment: "vercel"
  })
}
