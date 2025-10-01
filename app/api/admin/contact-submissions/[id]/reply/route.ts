import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || (session.user.email !== 'admin@linkzup.com' && session.user.email !== 'admin@linkzup.in')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, type, replyTo } = body // type: 'email' | 'whatsapp', replyTo: email or phone

    if (!message || !type || !replyTo) {
      return NextResponse.json(
        { error: 'Missing required fields: message, type, replyTo' },
        { status: 400 }
      )
    }

    if (!['email', 'whatsapp'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be email or whatsapp' },
        { status: 400 }
      )
    }

    // Await params to fix Next.js warning
    const { id } = await params
    const { db } = await connectToDatabase()
    
    // Get the contact submission
    const submission = await db.collection('contactSubmissions').findOne({
      _id: new ObjectId(id)
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }

    // Create reply object
    const reply = {
      id: new ObjectId(),
      message: message.trim(),
      type,
      replyTo,
      sentAt: new Date(),
      sentBy: session.user.email,
      status: 'pending' // Will be updated after sending
    }

    // Send the reply based on type
    let sendResult: { success: boolean; error?: string; messageId?: any; whatsappResponse?: any } = { success: false, error: 'Unknown type' }
    if (type === 'email') {
      sendResult = await sendEmailReply(submission, message, replyTo)
    } else if (type === 'whatsapp') {
      sendResult = await sendWhatsAppReply(submission, message, replyTo)
    }

    // Update reply status based on send result
    reply.status = sendResult.success ? 'sent' : 'failed'

    // Add reply to submission and update status
    // First, ensure the document has the replies array if it doesn't exist
    if (!submission.replies) {
      await db.collection('contactSubmissions').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            replies: [],
            replyCount: 0
          }
        }
      )
    }

    // Now add the reply
    const updateResult = await db.collection('contactSubmissions').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { replies: reply as any },
        $set: {
          status: 'replied',
          lastRepliedAt: new Date(),
          updatedAt: new Date()
        },
        $inc: { replyCount: 1 }
      }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update contact submission' },
        { status: 500 }
      )
    }

    // Create admin notification
    await db.collection('notifications').insertOne({
      type: 'contact_reply_sent',
      title: `Reply sent to ${submission.firstName} ${submission.lastName}`,
      message: `Reply sent via ${type} to ${replyTo}`,
      data: {
        submissionId: id,
        contactName: `${submission.firstName} ${submission.lastName}`,
        replyType: type,
        replyTo: replyTo
      },
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Return success response
    const response = {
      success: true,
      message: `Reply sent successfully via ${type}`,
      reply: {
        ...reply,
        id: reply.id.toString()
      },
      sendResult
    }

    // Log success for debugging
    console.log(`Reply sent successfully to ${replyTo} via ${type}`)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error sending reply:', error)
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send reply',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// Email reply function
async function sendEmailReply(submission: any, message: string, email: string) {
  try {
    const { sendEmail } = await import('@/lib/email-utils')
    
    const emailData = {
      to: email,
      subject: `Re: Your enquiry about ${submission.service || 'LinkzUp services'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              LinkzUp Support
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Response to your enquiry
            </p>
          </div>
          
          <div style="background: white; padding: 40px 20px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
              Hello ${submission.firstName}! 👋
            </h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Thank you for reaching out to us. Here's our response to your enquiry:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
              <p style="color: #333; line-height: 1.6; font-size: 16px; margin: 0;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">
                📋 Your Original Enquiry:
              </h3>
              <p style="color: #666; line-height: 1.6; font-size: 14px; margin: 0;">
                ${submission.message}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://linkzup.in/contact" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Contact Us Again
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>LinkzUp Support Team</strong><br>
                <a href="mailto:support@linkzup.in" style="color: #667eea;">support@linkzup.in</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `Hello ${submission.firstName}!\n\nThank you for reaching out to us. Here's our response to your enquiry:\n\n${message}\n\nYour Original Enquiry:\n${submission.message}\n\nBest regards,\nLinkzUp Support Team\nsupport@linkzup.in`
    }

    const result = await sendEmail(emailData)
    return result

  } catch (error) {
    console.error('Error sending email reply:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// WhatsApp reply function
async function sendWhatsAppReply(submission: any, message: string, phone: string) {
  try {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    
    // Add country code if not present (assuming India +91)
    const phoneWithCountryCode = cleanPhone.startsWith('+') 
      ? cleanPhone 
      : cleanPhone.startsWith('91') 
        ? `+${cleanPhone}`
        : `+91${cleanPhone}`

    const whatsappMessage = `Hello ${submission.firstName}! 👋

Thank you for reaching out to LinkzUp. Here's our response to your enquiry:

${message}

---
Your Original Enquiry:
${submission.message}

Best regards,
LinkzUp Support Team
📧 support@linkzup.in
🌐 https://linkzup.in`

    // Use WhatsApp Business API or Twilio
    const result = await sendWhatsAppMessage(phoneWithCountryCode, whatsappMessage)
    return result

  } catch (error) {
    console.error('Error sending WhatsApp reply:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// WhatsApp message sending function
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    // Check if WhatsApp API is configured
    const whatsappApiUrl = process.env.WHATSAPP_API_URL
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!whatsappApiUrl || !whatsappToken || !phoneNumberId) {
      return {
        success: false,
        error: 'WhatsApp API not configured. Please set WHATSAPP_API_URL, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_PHONE_NUMBER_ID environment variables.'
      }
    }

    // Check if using dummy credentials
    const isDummyCredentials = whatsappToken.includes('dummy') || phoneNumberId.includes('dummy')

    if (isDummyCredentials) {
      // Simulate successful WhatsApp message sending for dummy credentials
      console.log(`[DUMMY] WhatsApp message would be sent to ${phoneNumber}:`)
      console.log(`[DUMMY] Message: ${message.substring(0, 100)}...`)
      
      return {
        success: true,
        messageId: `dummy_message_id_${Date.now()}`,
        whatsappResponse: {
          messaging_product: 'whatsapp',
          contacts: [{ input: phoneNumber, wa_id: phoneNumber }],
          messages: [{ id: `dummy_message_id_${Date.now()}` }]
        },
        isDummy: true
      }
    }

    // Real WhatsApp API call for production credentials
    const response = await fetch(`${whatsappApiUrl}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      })
    })

    const result = await response.json()

    if (response.ok) {
      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        whatsappResponse: result
      }
    } else {
      return {
        success: false,
        error: result.error?.message || 'Failed to send WhatsApp message',
        whatsappResponse: result
      }
    }

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get replies for a contact submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || (session.user.email !== 'admin@linkzup.com' && session.user.email !== 'admin@linkzup.in')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params to fix Next.js warning
    const { id } = await params
    const { db } = await connectToDatabase()
    
    // Get the contact submission with replies
    const submission = await db.collection('contactSubmissions').findOne({
      _id: new ObjectId(id)
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      replies: submission.replies || [],
      replyCount: submission.replyCount || 0,
      lastRepliedAt: submission.lastRepliedAt
    })

  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
