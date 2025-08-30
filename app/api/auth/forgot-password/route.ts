import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { generateResetToken, hashPassword } from '@/lib/password-utils'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if user exists
    const user = await db.collection('users').findOne({ email: email.toLowerCase() })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in database
    await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        }
      }
    )

    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Email content
    const mailOptions = {
      from: `"LinkZup" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'LinkZup - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">LinkzUp</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hello ${user.name || 'there'},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password for your LinkzUp account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 1 hour. If you're having trouble clicking the button, 
              copy and paste this URL into your browser:
            </p>
            
            <p style="color: #999; font-size: 12px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 LinkzUp. All rights reserved.
            </p>
          </div>
        </div>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
