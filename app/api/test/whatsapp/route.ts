import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || (session.user.email !== 'admin@linkzup.com' && session.user.email !== 'admin@linkzup.in')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phoneNumber, message } = body

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, message' },
        { status: 400 }
      )
    }

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
    const phoneWithCountryCode = cleanPhone.startsWith('+') 
      ? cleanPhone 
      : cleanPhone.startsWith('91') 
        ? `+${cleanPhone}`
        : `+91${cleanPhone}`

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(phoneWithCountryCode, message)

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'WhatsApp message sent successfully' : 'Failed to send WhatsApp message',
      details: result
    })

  } catch (error) {
    console.error('WhatsApp test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
        error: 'WhatsApp API not configured. Please set WHATSAPP_API_URL, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_PHONE_NUMBER_ID environment variables.',
        configured: false
      }
    }

    console.log('Sending WhatsApp message:', {
      to: phoneNumber,
      message: message.substring(0, 50) + '...',
      apiUrl: whatsappApiUrl,
      phoneNumberId: phoneNumberId
    })

    // Check if using dummy credentials
    const isDummyCredentials = whatsappToken.includes('dummy') || phoneNumberId.includes('dummy')

    if (isDummyCredentials) {
      // Simulate successful WhatsApp message sending for dummy credentials
      console.log(`[DUMMY] WhatsApp test message would be sent to ${phoneNumber}:`)
      console.log(`[DUMMY] Message: ${message.substring(0, 100)}...`)
      
      return {
        success: true,
        messageId: `dummy_test_message_id_${Date.now()}`,
        whatsappResponse: {
          messaging_product: 'whatsapp',
          contacts: [{ input: phoneNumber, wa_id: phoneNumber }],
          messages: [{ id: `dummy_test_message_id_${Date.now()}` }]
        },
        configured: true,
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

    console.log('WhatsApp API response:', {
      status: response.status,
      success: response.ok,
      response: result
    })

    if (response.ok) {
      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        whatsappResponse: result,
        configured: true
      }
    } else {
      return {
        success: false,
        error: result.error?.message || 'Failed to send WhatsApp message',
        whatsappResponse: result,
        configured: true
      }
    }

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      configured: true
    }
  }
}

// GET endpoint to check WhatsApp configuration
export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || (session.user.email !== 'admin@linkzup.com' && session.user.email !== 'admin@linkzup.in')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const whatsappApiUrl = process.env.WHATSAPP_API_URL
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    const isConfigured = !!(whatsappApiUrl && whatsappToken && phoneNumberId)

    return NextResponse.json({
      configured: isConfigured,
      details: {
        apiUrl: whatsappApiUrl ? 'Set' : 'Not set',
        accessToken: whatsappToken ? 'Set' : 'Not set',
        phoneNumberId: phoneNumberId ? 'Set' : 'Not set'
      },
      message: isConfigured 
        ? 'WhatsApp API is configured and ready to use'
        : 'WhatsApp API is not configured. Please set the required environment variables.'
    })

  } catch (error) {
    console.error('WhatsApp config check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
