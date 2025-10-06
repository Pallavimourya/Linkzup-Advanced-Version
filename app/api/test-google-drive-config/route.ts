import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Configured' : '❌ Missing',
    nextAuthUrl: process.env.NEXTAUTH_URL || '❌ Missing',
    environment: process.env.NODE_ENV || 'development',
    googleDriveCallbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/google-drive/callback`,
    mainCallbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
  }

  return NextResponse.json({
    message: 'Google Drive OAuth Configuration Status',
    config,
    requiredRedirectUris: [
      'https://www.linkzup.in/api/auth/callback/google',
      'https://www.linkzup.in/api/google-drive/callback',
      'http://localhost:3000/api/auth/callback/google',
      'http://localhost:3000/api/google-drive/callback'
    ],
    troubleshooting: {
      step1: 'Verify all redirect URIs are added to Google Console',
      step2: 'Check OAuth consent screen publishing status',
      step3: 'Add test users if app is in testing mode',
      step4: 'Enable Google Drive API in Google Console',
      step5: 'Wait 5-10 minutes for changes to propagate'
    }
  })
}
