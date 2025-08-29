import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Create admin user
    const adminEmail = "admin@linkzup.com"
    const adminPassword = "admin4321"
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

    // Check if admin exists
    const existingAdmin = await users.findOne({ email: adminEmail })
    if (!existingAdmin) {
      await users.insertOne({
        email: adminEmail,
        name: "Administrator",
        password: hashedAdminPassword,
        role: "admin",
        isAdmin: true,
        credits: 1000,
        isTrialActive: false,
        totalCreditsEver: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log("Admin user created")
    } else {
      // Update admin password and ensure admin flags
      await users.updateOne(
        { email: adminEmail },
        {
          $set: {
            password: hashedAdminPassword,
            role: "admin",
            isAdmin: true,
            updatedAt: new Date(),
          },
        }
      )
      console.log("Admin user updated")
    }

    // Create test users
    const testUsers = [
      {
        email: "john@example.com",
        name: "John Doe",
        password: await bcrypt.hash("password123", 10),
        role: "user",
        isAdmin: false,
        credits: 50,
        isTrialActive: true,
        trialStartDate: new Date(),
        trialPeriodDays: 7,
        totalCreditsEver: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
        password: await bcrypt.hash("password123", 10),
        role: "user",
        isAdmin: false,
        credits: 25,
        isTrialActive: false,
        totalCreditsEver: 100,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(),
      },
      {
        email: "bob@example.com",
        name: "Bob Johnson",
        password: await bcrypt.hash("password123", 10),
        role: "user",
        isAdmin: false,
        credits: 0,
        isTrialActive: false,
        totalCreditsEver: 0,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(),
      },
      {
        email: "alice@example.com",
        name: "Alice Brown",
        password: await bcrypt.hash("password123", 10),
        role: "user",
        isAdmin: false,
        credits: 200,
        isTrialActive: false,
        totalCreditsEver: 500,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
      },
    ]

    // Insert test users
    for (const user of testUsers) {
      const existingUser = await users.findOne({ email: user.email })
      if (!existingUser) {
        await users.insertOne(user)
        console.log(`Test user created: ${user.email}`)
      } else {
        // Update password
        await users.updateOne(
          { email: user.email },
          {
            $set: {
              password: user.password,
              updatedAt: new Date(),
            },
          }
        )
        console.log(`Test user updated: ${user.email}`)
      }
    }

    // Get total count
    const totalUsers = await users.countDocuments()

    return NextResponse.json({
      success: true,
      message: "Test data setup completed successfully",
      adminCredentials: {
        email: adminEmail,
        password: adminPassword
      },
      testUsers: testUsers.map(u => ({ email: u.email, password: "password123" })),
      totalUsers
    })

  } catch (error) {
    console.error("Error setting up test data:", error)
    return NextResponse.json({ 
      error: "Failed to setup test data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
