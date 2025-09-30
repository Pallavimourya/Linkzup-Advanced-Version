import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Create a test notification
    const notification = {
      type: 'contact_submission',
      title: 'Test Contact Form Submission',
      message: 'Test User submitted a contact form',
      data: {
        contactName: 'Test User',
        email: 'test@example.com',
        service: 'test-service'
      },
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('notifications').insertOne(notification)

    return NextResponse.json({
      success: true,
      message: 'Test notification created successfully',
      notificationId: result.insertedId
    })

  } catch (error) {
    console.error('Error creating test notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
