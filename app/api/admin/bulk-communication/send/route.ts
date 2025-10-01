import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendEmail } from "@/lib/email-utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, content, type, userType, selectedUsers } = await request.json()

    // Validate request
    if (!subject || !content || !type || !userType || !selectedUsers || !Array.isArray(selectedUsers)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (selectedUsers.length === 0) {
      return NextResponse.json({ error: "No users selected" }, { status: 400 })
    }

    // Check if user is admin (using the same method as other admin APIs)
    if (!(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const notifications = db.collection("notifications")
    const bulkMessages = db.collection("bulk_messages")

    // Get selected users
    const userIds = selectedUsers.map((id: string) => new ObjectId(id))
    const targetUsers = await users.find({ _id: { $in: userIds } }).toArray()

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: "No valid users found" }, { status: 400 })
    }

    // Create bulk message record
    const bulkMessageRecord = {
      adminId: session.user.id,
      subject,
      content,
      type, // 'email' or 'whatsapp'
      userType, // 'trial', 'active', 'pending'
      targetUserIds: selectedUsers,
      totalRecipients: targetUsers.length,
      sentCount: 0,
      failedCount: 0,
      status: 'sending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const bulkMessageResult = await bulkMessages.insertOne(bulkMessageRecord)
    const bulkMessageId = bulkMessageResult.insertedId

    let sentCount = 0
    let failedCount = 0
    const results = []

    // Process each user
    for (const user of targetUsers) {
      try {
        if (type === 'email') {
          // Send actual email using your email service
          const emailResult = await sendEmail({
            to: user.email,
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                    📧 Message from LinkzUp Admin
                  </h1>
                </div>
                
                <div style="background: white; padding: 40px 20px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
                    ${subject}
                  </h2>
                  
                  <div style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px; white-space: pre-wrap;">
                    ${content}
                  </div>
                  
                  <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="color: #2563eb; margin: 0 0 10px 0; font-size: 16px;">
                      📧 This is an official message from LinkzUp
                    </h3>
                    <p style="color: #666; line-height: 1.6; margin: 0; font-size: 14px;">
                      If you have any questions, please contact our support team.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://linkzup.in/dashboard" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;
                              font-weight: bold;
                              font-size: 16px;">
                      🚀 Go to Dashboard
                    </a>
                  </div>
                  
                  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                    <p style="color: #999; font-size: 14px; margin: 0;">
                      Best regards,<br>
                      <strong>LinkzUp Admin Team</strong><br>
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
            text: `${subject}\n\n${content}\n\nThis is an official message from LinkzUp.\n\nBest regards,\nLinkzUp Admin Team\nsupport@linkzup.in`
          })

          if (emailResult.success) {
            // Also create in-app notification
            await notifications.insertOne({
              userId: user._id,
              type: "admin_bulk_email",
              title: subject,
              message: content,
              isRead: false,
              createdAt: new Date(),
              metadata: {
                bulkMessageId: bulkMessageId,
                adminId: session.user.id,
                messageType: 'email'
              }
            })

            sentCount++
            results.push({
              userId: user._id,
              email: user.email,
              mobile: user.mobile,
              status: 'success'
            })
          } else {
            throw new Error(emailResult.error || 'Failed to send email')
          }
          
        } else if (type === 'whatsapp') {
          // Send WhatsApp notification (for now, just create in-app notification)
          // TODO: Integrate with WhatsApp API when available
          await notifications.insertOne({
            userId: user._id,
            type: "admin_bulk_whatsapp",
            title: "WhatsApp Message from Admin",
            message: content,
            isRead: false,
            createdAt: new Date(),
            metadata: {
              bulkMessageId: bulkMessageId,
              adminId: session.user.id,
              messageType: 'whatsapp',
              phoneNumber: user.mobile
            }
          })

          // For now, we'll mark WhatsApp as successful (when WhatsApp API is integrated, this will send real messages)
          sentCount++
          results.push({
            userId: user._id,
            email: user.email,
            mobile: user.mobile,
            status: 'success'
          })
        }

      } catch (error) {
        console.error(`Failed to send message to user ${user._id}:`, error)
        failedCount++
        results.push({
          userId: user._id,
          email: user.email,
          mobile: user.mobile,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update bulk message record with results
    await bulkMessages.updateOne(
      { _id: bulkMessageId },
      {
        $set: {
          sentCount,
          failedCount,
          status: failedCount === 0 ? 'completed' : 'partial',
          results,
          updatedAt: new Date()
        }
      }
    )

    // Create admin notification about bulk message completion
    await notifications.insertOne({
      userId: session.user.id,
      type: "bulk_message_completed",
      title: "Bulk Message Completed",
      message: `Your bulk ${type} message has been sent to ${sentCount} users. ${failedCount > 0 ? `${failedCount} failed.` : ''}`,
      isRead: false,
      createdAt: new Date(),
      metadata: {
        bulkMessageId: bulkMessageId,
        sentCount,
        failedCount,
        messageType: type,
        userType
      }
    })

    return NextResponse.json({
      success: true,
      message: `Bulk message sent successfully`,
      sentCount,
      failedCount,
      totalRecipients: targetUsers.length,
      bulkMessageId: bulkMessageId,
      results
    })

  } catch (error) {
    console.error("Error sending bulk message:", error)
    return NextResponse.json({ error: "Failed to send bulk message" }, { status: 500 })
  }
}
