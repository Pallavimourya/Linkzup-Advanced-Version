import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'check') {
      // Check if user has Google Drive connected
      const { MongoClient } = await import('mongodb')
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      
      const users = client.db("Linkzup-Advanced").collection("users")
      const user = await users.findOne({ _id: session.user.id })
      
      return NextResponse.json({
        connected: !!user?.googleAccessToken,
        hasRefreshToken: !!user?.googleRefreshToken
      })
    }

    if (action === 'connect') {
      // Generate Google Drive authorization URL
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXTAUTH_URL}/api/google-drive/callback`
      )

      const scopes = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: session.user.id, // Pass user ID in state
        prompt: 'consent'
      })

      return NextResponse.json({
        authUrl,
        message: 'Redirect user to this URL to authorize Google Drive access'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Google Drive auth error:', error)
    return NextResponse.json({ 
      error: 'Failed to process Google Drive authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'disconnect') {
      // Remove Google Drive tokens from user
      const { MongoClient } = await import('mongodb')
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      
      const users = client.db("Linkzup-Advanced").collection("users")
      await users.updateOne(
        { _id: session.user.id },
        {
          $unset: {
            googleAccessToken: 1,
            googleRefreshToken: 1,
            googleDriveConnected: 1,
            googleDriveConnectedAt: 1
          },
          $set: {
            updatedAt: new Date()
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Google Drive disconnected successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Google Drive disconnect error:', error)
    return NextResponse.json({ 
      error: 'Failed to disconnect Google Drive',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
