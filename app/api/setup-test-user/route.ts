import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email = "test@example.com", password = "test123", name = "Test User" } = await req.json()
    
    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      // Update existing user password
      const hashedPassword = await bcrypt.hash(password, 10)
      await users.updateOne(
        { email: email.toLowerCase() },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        }
      )
      
      return NextResponse.json({
        success: true,
        message: "Test user updated successfully",
        credentials: { email, password }
      })
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await users.insertOne({
      email: email.toLowerCase(),
      name: name,
      password: hashedPassword,
      role: "user",
      isAdmin: false,
      credits: 10,
      isTrialActive: true,
      trialStartDate: new Date(),
      trialPeriodDays: 2,
      totalCreditsEver: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      userId: result.insertedId,
      credentials: { email, password }
    })

  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
