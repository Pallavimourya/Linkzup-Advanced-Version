import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID ? '✅ Configured' : '❌ Missing',
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET ? '✅ Configured' : '❌ Missing',
    nextAuthUrl: process.env.NEXTAUTH_URL || '❌ Missing',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Missing',
    environment: process.env.NODE_ENV || 'development',
    callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/linkedin/callback`
  }

  return NextResponse.json({
    message: 'LinkedIn OAuth Configuration Status',
    config,
    instructions: {
      linkedinConsole: 'Go to LinkedIn Developers > Your App > Auth tab',
      addRedirectUri: `Add this redirect URI: ${config.callbackUrl}`,
      verifyEnvVars: 'Make sure all environment variables are set in Vercel'
    }
  })
}
