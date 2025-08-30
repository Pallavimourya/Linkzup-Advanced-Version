import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { validatePasswordStrength } from "@/lib/password-utils"
import { sendWelcomeEmail } from "@/lib/email-utils"

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      emailVerified: null,
      image: null,
      credits: 10, // Give 10 free credits for trial
      trialStartDate: new Date(),
      trialPeriodDays: 2,
      isTrialActive: true,
      totalCreditsEver: 10, // Track total credits ever received
      bio: null,
      profilePicture: null,
      darkMode: false,
      updatedAt: new Date(),
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
