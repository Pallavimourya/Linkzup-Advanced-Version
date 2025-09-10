import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Admin credentials
    const adminEmail = "admin@linkzup.com"
    const adminPassword = "admin4321"
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Check if admin exists
    const existingAdmin = await users.findOne({ email: adminEmail })

    if (existingAdmin) {
      // Update admin password and ensure admin flags
      await users.updateOne(
        { email: adminEmail },
        {
          $set: {
            password: hashedPassword,
            role: "admin",
            isAdmin: true,
            updatedAt: new Date(),
          },
        }
      )
      
      return NextResponse.json({
        success: true,
        message: "Admin user updated successfully",
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      })
    } else {
      // Create new admin user
      const result = await users.insertOne({
        email: adminEmail,
        name: "Administrator",
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
        credits: 1000,
        isTrialActive: false,
        totalCreditsEver: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: "Admin user created successfully",
        userId: result.insertedId,
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      })
    }

  } catch (error) {
    console.error("Error setting up admin:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
