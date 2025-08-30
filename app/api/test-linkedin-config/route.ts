import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID ? '✅ Configured' : '❌ Missing',
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET ? '✅ Configured' : '❌ Missing',
    nextAuthUrl: process.env.NEXTAUTH_URL || '❌ Missing',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Missing',
    environment: process.env.NODE_ENV || 'development',
    callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/linkedin/callback`,
    productionUrl: 'https://linkzup-advanced-version.vercel.app',
    productionCallbackUrl: 'https://linkzup-advanced-version.vercel.app/api/linkedin/callback'
  }

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.VERCEL_ENV === 'production' ||
                      process.env.NEXTAUTH_URL?.includes('vercel.app')

  return NextResponse.json({
    message: 'LinkedIn OAuth Configuration Status',
    config,
    isProduction,
    instructions: {
      linkedinConsole: 'Go to LinkedIn Developers > Your App > Auth tab',
      addRedirectUri: `Add this redirect URI: ${config.productionCallbackUrl}`,
      verifyEnvVars: 'Make sure all environment variables are set in Vercel',
      currentCallbackUrl: config.callbackUrl,
      requiredCallbackUrl: config.productionCallbackUrl
    },
    troubleshooting: {
      redirectUriMismatch: 'If you see "redirect_uri does not match", add the exact callback URL to LinkedIn app',
      invalidClient: 'If you see "invalid_client", verify your Client ID and Secret in Vercel environment variables',
      unauthorized: 'If you see "Unauthorized", check if LinkedIn+ API is enabled in your project'
    }
  })
}
