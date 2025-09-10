import { NextResponse } from 'next/server'

export async function GET() {
  // Get the base URL from environment
  let baseUrl = process.env.NEXTAUTH_URL
  
  // Fix the NEXTAUTH_URL if it has https instead of http for localhost
  if (baseUrl?.includes('https://localhost')) {
    baseUrl = baseUrl.replace('https://localhost', 'http://localhost')
  }
  
  // Use LINKEDIN_REDIRECT_URI if set, otherwise construct from NEXTAUTH_URL
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || (baseUrl?.endsWith('/') 
    ? baseUrl + 'api/linkedin/callback'
    : baseUrl + '/api/linkedin/callback')

  return NextResponse.json({
    message: 'LinkedIn Redirect URI Debug',
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI,
      NODE_ENV: process.env.NODE_ENV
    },
    generated: {
      baseUrl,
      redirectUri,
      encodedRedirectUri: encodeURIComponent(redirectUri)
    },
    instructions: {
      step1: 'Copy the exact redirectUri value above',
      step2: 'Go to LinkedIn Developer Console > Your App > Auth tab',
      step3: 'Add the redirectUri as an Authorized Redirect URL',
      step4: 'Make sure there are no extra spaces or characters'
    }
  })
}
