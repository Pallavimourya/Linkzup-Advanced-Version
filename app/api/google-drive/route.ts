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
    const query = searchParams.get('query') || ''
    const pageToken = searchParams.get('pageToken') || ''

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 })
    }

    // Get user's Google access token from database
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    
    const users = client.db("Linkzup-Advanced").collection("users")
    const user = await users.findOne({ _id: session.user.id })
    
    if (!user?.googleAccessToken) {
      return NextResponse.json({ 
        error: 'Google Drive not connected. Please connect your Google account first.' 
      }, { status: 400 })
    }

    // Set up Google Drive API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    )

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    switch (action) {
      case 'search':
        return await searchImages(drive, query, pageToken)
      case 'list':
        return await listImages(drive, pageToken)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Google Drive API error:', error)
    return NextResponse.json({ 
      error: 'Failed to access Google Drive',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function searchImages(drive: any, query: string, pageToken: string) {
  try {
    const response = await drive.files.list({
      q: `name contains '${query}' and mimeType contains 'image/' and trashed=false`,
      fields: 'nextPageToken, files(id, name, thumbnailLink, webViewLink, size, modifiedTime)',
      pageSize: 50,
      pageToken: pageToken || undefined,
      orderBy: 'modifiedTime desc'
    })

    const images = response.data.files?.map((file: any) => ({
      id: file.id,
      name: file.name,
      url: file.thumbnailLink || file.webViewLink,
      downloadUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
      webViewLink: file.webViewLink,
      size: file.size,
      modifiedTime: file.modifiedTime,
      source: 'google-drive'
    })) || []

    return NextResponse.json({
      success: true,
      images,
      nextPageToken: response.data.nextPageToken || null,
      query
    })

  } catch (error) {
    console.error('Google Drive search error:', error)
    throw error
  }
}

async function listImages(drive: any, pageToken: string) {
  try {
    const response = await drive.files.list({
      q: "mimeType contains 'image/' and trashed=false",
      fields: 'nextPageToken, files(id, name, thumbnailLink, webViewLink, size, modifiedTime)',
      pageSize: 50,
      pageToken: pageToken || undefined,
      orderBy: 'modifiedTime desc'
    })

    const images = response.data.files?.map((file: any) => ({
      id: file.id,
      name: file.name,
      url: file.thumbnailLink || file.webViewLink,
      downloadUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
      webViewLink: file.webViewLink,
      size: file.size,
      modifiedTime: file.modifiedTime,
      source: 'google-drive'
    })) || []

    return NextResponse.json({
      success: true,
      images,
      nextPageToken: response.data.nextPageToken || null
    })

  } catch (error) {
    console.error('Google Drive list error:', error)
    throw error
  }
}
