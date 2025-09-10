import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Configured' : '❌ Missing',
    nextAuthUrl: process.env.NEXTAUTH_URL || '❌ Missing',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Missing',
    environment: process.env.NODE_ENV || 'development',
    callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
  }

  return NextResponse.json({
    message: 'Google OAuth Configuration Status',
    config,
    instructions: {
      googleConsole: 'Go to Google Cloud Console > APIs & Services > Credentials',
      addRedirectUri: `Add this redirect URI: ${config.callbackUrl}`,
      verifyEnvVars: 'Make sure all environment variables are set in Vercel'
    }
  })
}
