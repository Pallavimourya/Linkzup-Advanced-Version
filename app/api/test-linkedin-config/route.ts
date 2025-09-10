import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID ? '✅ Configured' : '❌ Missing',
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET ? '✅ Configured' : '❌ Missing',
    nextAuthUrl: process.env.NEXTAUTH_URL || '❌ Missing',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Missing',
    environment: process.env.NODE_ENV || 'development',
    callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/linkedin/callback`,
    productionUrl: 'https://www.linkzup.in',
    productionCallbackUrl: 'https://www.linkzup.in/api/linkedin/callback',
    linkedinRedirectUri: process.env.LINKEDIN_REDIRECT_URI || '❌ Not set'
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
      requiredCallbackUrl: config.productionCallbackUrl,
      fixRedirectUri: 'To fix "redirect_uri does not match" error, add this exact URL to LinkedIn app:',
      exactUrl: config.productionCallbackUrl
    },
    troubleshooting: {
      redirectUriMismatch: 'If you see "redirect_uri does not match", add the exact callback URL to LinkedIn app',
      invalidClient: 'If you see "invalid_client", verify your Client ID and Secret in Vercel environment variables',
      unauthorized: 'If you see "Unauthorized", check if LinkedIn+ API is enabled in your project'
    },
    criticalFix: {
      title: '🚨 CRITICAL: LinkedIn Redirect URI Mismatch',
      description: 'The error "redirect_uri does not match" means LinkedIn app is not configured with the correct callback URL',
      steps: [
        '1. Go to LinkedIn Developers Console',
        '2. Select your app',
        '3. Go to Auth tab',
        '4. Add this exact redirect URI:',
        `   ${config.productionCallbackUrl}`,
        '5. Save changes',
        '6. Try signing in again'
      ]
    }
  })
}
