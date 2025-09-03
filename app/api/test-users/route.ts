import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await users.insertOne({
      email: email.toLowerCase(),
      name: name || "Test User",
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
      userId: result.insertedId 
    })

  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
