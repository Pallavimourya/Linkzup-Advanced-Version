import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const { db } = await connectToDatabase()
    
    // Build query - only get contact form notifications
    const query: any = {
      type: 'contact_submission'
    }
    if (unreadOnly) {
      query.read = { $ne: true }
    }

    // Get contact form notifications only
    const notifications = await db.collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    // Get unread count for contact form notifications only
    const unreadCount = await db.collection('notifications').countDocuments({
      type: 'contact_submission',
      read: { $ne: true }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, data } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Create notification
    const notification = {
      type,
      title,
      message,
      data: data || {},
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('notifications').insertOne(notification)

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        _id: result.insertedId
      }
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, read } = body

    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Update notification
    const result = await db.collection('notifications').updateOne(
      { _id: id },
      { 
        $set: { 
          read,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
