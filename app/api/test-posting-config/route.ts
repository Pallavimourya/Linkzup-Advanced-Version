import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      environment: process.env.NODE_ENV,
      mongodb: {
        uri: process.env.MONGODB_URI ? "✅ Set" : "❌ Missing",
        connected: false,
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID ? "✅ Set" : "❌ Missing",
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
        redirectUri: process.env.LINKEDIN_REDIRECT_URI ? "✅ Set" : "❌ Missing",
      },
      nextauth: {
        url: process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Missing",
        secret: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
      },
      deployment: {
        vercel: process.env.VERCEL ? "✅ Vercel" : "❌ Not Vercel",
        region: process.env.VERCEL_REGION || "Unknown",
      }
    }

    // Test MongoDB connection
    try {
      const { MongoClient } = await import("mongodb")
      const client = new MongoClient(process.env.MONGODB_URI || "")
      await client.connect()
      await client.db().admin().ping()
      await client.close()
      config.mongodb.connected = true
    } catch (error) {
      config.mongodb.connected = false
    }

    return NextResponse.json({
      success: true,
      message: "Posting configuration check",
      config,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
