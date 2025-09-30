import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, service, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Create contact submission document
    const contactSubmission = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      service: service || null,
      message: message.trim(),
      status: 'new', // new, read, replied
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert into database
    const result = await db.collection('contactSubmissions').insertOne(contactSubmission)

    // Create notification for admin
    const notification = {
      type: 'contact_submission',
      title: 'New Contact Form Submission',
      message: `${firstName} ${lastName} submitted a contact form`,
      data: {
        submissionId: result.insertedId,
        contactName: `${firstName} ${lastName}`,
        email: email,
        service: service
      },
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection('notifications').insertOne(notification)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully',
        id: result.insertedId 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()
    
    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }

    // Get contact submissions with pagination
    const submissions = await db.collection('contactSubmissions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await db.collection('contactSubmissions').countDocuments(query)

    return NextResponse.json({
      submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
