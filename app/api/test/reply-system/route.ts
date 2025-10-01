import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
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
    const { testType, submissionId } = body

    const { db } = await connectToDatabase()

    if (testType === 'check_submission') {
      // Check if submission exists and its schema
      const submission = await db.collection('contactSubmissions').findOne({
        _id: new ObjectId(submissionId)
      })

      if (!submission) {
        return NextResponse.json({
          success: false,
          error: 'Submission not found'
        })
      }

      return NextResponse.json({
        success: true,
        submission: {
          id: submission._id,
          firstName: submission.firstName,
          lastName: submission.lastName,
          email: submission.email,
          phone: submission.phone,
          hasReplies: submission.replies !== undefined,
          hasReplyCount: submission.replyCount !== undefined,
          replies: submission.replies || [],
          replyCount: submission.replyCount || 0,
          status: submission.status
        }
      })
    }

    if (testType === 'test_email') {
      // Test email sending
      const { sendEmail } = await import('@/lib/email-utils')
      
      const testEmailData = {
        to: 'test@example.com',
        subject: 'Test Email from LinkzUp Reply System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Test Email</h1>
            <p>This is a test email from the LinkzUp reply system.</p>
            <p>If you receive this, the email system is working correctly.</p>
          </div>
        `,
        text: 'Test Email from LinkzUp Reply System. If you receive this, the email system is working correctly.'
      }

      const result = await sendEmail(testEmailData)
      
      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Email system is working' : 'Email system failed',
        details: result
      })
    }

    if (testType === 'test_whatsapp') {
      // Test WhatsApp configuration
      const whatsappApiUrl = process.env.WHATSAPP_API_URL
      const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

      return NextResponse.json({
        success: true,
        configured: !!(whatsappApiUrl && whatsappToken && phoneNumberId),
        details: {
          apiUrl: whatsappApiUrl ? 'Set' : 'Not set',
          accessToken: whatsappToken ? 'Set' : 'Not set',
          phoneNumberId: phoneNumberId ? 'Set' : 'Not set'
        }
      })
    }

    if (testType === 'migrate_schema') {
      // Migrate existing submissions to add missing fields
      const updateResult = await db.collection('contactSubmissions').updateMany(
        { replies: { $exists: false } },
        {
          $set: {
            replies: [],
            replyCount: 0,
            lastRepliedAt: null
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: `Migration completed: ${updateResult.modifiedCount} documents updated`,
        modifiedCount: updateResult.modifiedCount
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid test type. Use: check_submission, test_email, test_whatsapp, or migrate_schema'
    })

  } catch (error) {
    console.error('Test API error:', error)
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

export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || (session.user.email !== 'admin@linkzup.com' && session.user.email !== 'admin@linkzup.in')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get system status
    const totalSubmissions = await db.collection('contactSubmissions').countDocuments()
    const submissionsWithReplies = await db.collection('contactSubmissions').countDocuments({
      replies: { $exists: true }
    })
    const submissionsNeedingMigration = totalSubmissions - submissionsWithReplies

    // Check email configuration
    const emailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)

    // Check WhatsApp configuration
    const whatsappConfigured = !!(
      process.env.WHATSAPP_API_URL && 
      process.env.WHATSAPP_ACCESS_TOKEN && 
      process.env.WHATSAPP_PHONE_NUMBER_ID
    )

    return NextResponse.json({
      success: true,
      systemStatus: {
        totalSubmissions,
        submissionsWithReplies,
        submissionsNeedingMigration,
        emailConfigured,
        whatsappConfigured,
        needsMigration: submissionsNeedingMigration > 0
      }
    })

  } catch (error) {
    console.error('System status check error:', error)
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
