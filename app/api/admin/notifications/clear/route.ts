import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Delete only contact form notifications
    const result = await db.collection('notifications').deleteMany({
      type: 'contact_submission'
    })

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.deletedCount} contact form notifications`,
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error('Error clearing notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Get contact form notification count only
    const totalCount = await db.collection('notifications').countDocuments({
      type: 'contact_submission'
    })
    const unreadCount = await db.collection('notifications').countDocuments({ 
      type: 'contact_submission',
      read: { $ne: true } 
    })
    
    // Get recent contact form notifications
    const recentNotifications = await db.collection('notifications')
      .find({ type: 'contact_submission' })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({
      totalCount,
      unreadCount,
      recentNotifications
    })

  } catch (error) {
    console.error('Error getting notification stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
