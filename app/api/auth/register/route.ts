import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { validatePasswordStrength } from "@/lib/password-utils"
import { sendWelcomeEmail } from "@/lib/email-utils"
import { checkFraudProtection, logFraudAttempt } from "@/lib/fraud-protection"

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, deviceFingerprint } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Check fraud protection
    const fraudCheck = await checkFraudProtection(
      email,
      deviceFingerprint,
      ipAddress
    )

    if (!fraudCheck.isAllowed) {
      // Log the fraud attempt
      await logFraudAttempt(
        email,
        deviceFingerprint,
        ipAddress,
        request.headers.get('user-agent') || 'unknown',
        fraudCheck.reason || "Multiple trial attempt detected"
      )

      return NextResponse.json({ 
        error: "Registration blocked due to fraud protection. Please contact support if you believe this is an error.",
        details: fraudCheck.reason
      }, { status: 403 })
    }

    // Validate password strength
    const passwordStrength = validatePasswordStrength(password)
    if (!passwordStrength.isValid) {
      return NextResponse.json({ 
        error: "Password does not meet strength requirements",
        details: passwordStrength.feedback 
      }, { status: 400 })
    }

    await client.connect()
    const users = client.db("Linkzup-Advanced").collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with 10 free trial credits
    const trialStartDate = new Date()
    const trialEndDate = new Date(trialStartDate.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days

    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      emailVerified: null,
      image: null,
      credits: 10, // Give 10 free credits for trial
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate,
      trialPeriodDays: 2,
      isTrialActive: true,
      totalCreditsEver: 10, // Track total credits ever received
      bio: null,
      profilePicture: null,
      darkMode: false,
      hasUsedCoupon: false, // Track coupon usage
      deviceFingerprint: deviceFingerprint || null, // For fraud protection
      registrationIP: ipAddress, // Store IP for fraud protection
      updatedAt: new Date(),
    })

    // Create trial started notification
    const notifications = client.db("Linkzup-Advanced").collection("notifications")
    await notifications.insertOne({
      userId: result.insertedId,
      type: "trial_started",
      title: "🎉 Welcome! Your 2-day free trial has started",
      message: "You have 2 days free trial with 10 credits to explore all features.",
      isRead: false,
      createdAt: new Date(),
      metadata: {
        trialEndDate: trialEndDate,
        credits: 10,
        trialPeriodDays: 2
      }
    })

    // Schedule trial ending reminder (24 hours before expiry)
    const reminderDate = new Date(trialStartDate.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day later
    await notifications.insertOne({
      userId: result.insertedId,
      type: "trial_ending_reminder",
      title: "⏳ Your trial will expire soon",
      message: "Your trial will expire in 24 hours. Please choose a subscription plan to continue.",
      isRead: false,
      scheduledFor: reminderDate,
      createdAt: new Date(),
      metadata: {
        trialEndDate: trialEndDate,
        reminderType: "24_hours"
      }
    })

    // Send welcome email to new user
    try {
      await sendWelcomeEmail({
        name,
        email,
      })
      console.log(`Welcome email sent to ${email}`)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
