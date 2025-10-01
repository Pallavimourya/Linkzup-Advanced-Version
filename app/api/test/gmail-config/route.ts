import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || (session.user.email !== 'admin@linkzup.com' && session.user.email !== 'admin@linkzup.in')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Gmail configuration
    const gmailUser = process.env.GMAIL_USER
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

    const isConfigured = !!(gmailUser && gmailAppPassword)

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      details: {
        gmailUser: gmailUser ? 'Set' : 'Not set',
        gmailAppPassword: gmailAppPassword ? 'Set' : 'Not set',
        gmailUserValue: gmailUser || 'Not configured'
      },
      message: isConfigured 
        ? 'Gmail is configured and ready to use'
        : 'Gmail is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.'
    })

  } catch (error) {
    console.error('Gmail config check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || (session.user.email !== 'admin@linkzup.com' && session.user.email !== 'admin@linkzup.in')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Missing testEmail field' },
        { status: 400 }
      )
    }

    // Test Gmail configuration by sending a test email
    const { sendEmail } = await import('@/lib/email-utils')
    
    const testEmailData = {
      to: testEmail,
      subject: 'Test Email from LinkzUp Reply System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              ✅ Gmail Test Successful!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Your Gmail configuration is working perfectly
            </p>
          </div>
          
          <div style="background: white; padding: 40px 20px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
              🎉 Congratulations!
            </h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              This is a test email from the LinkzUp reply system. If you're receiving this email, 
              it means your Gmail configuration is working correctly and you can now send replies 
              to customer enquiries.
            </p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #2563eb; margin: 0 0 10px 0; font-size: 16px;">
                📧 What This Means:
              </h3>
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Gmail credentials are properly configured</li>
                <li>Email sending functionality is working</li>
                <li>You can now reply to customer enquiries via email</li>
                <li>The reply system is ready for production use</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://linkzup.in/admin/contact" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;">
                🚀 Go to Admin Dashboard
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
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 LinkzUp. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Gmail Test Successful!\n\nThis is a test email from the LinkzUp reply system. If you're receiving this email, it means your Gmail configuration is working correctly and you can now send replies to customer enquiries.\n\nWhat This Means:\n- Gmail credentials are properly configured\n- Email sending functionality is working\n- You can now reply to customer enquiries via email\n- The reply system is ready for production use\n\nBest regards,\nLinkzUp Support Team\nsupport@linkzup.in`
    }

    const result = await sendEmail(testEmailData)
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Test email sent successfully to ${testEmail}` 
        : 'Failed to send test email',
      details: result
    })

  } catch (error) {
    console.error('Gmail test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
