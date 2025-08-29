import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("Testing database connection...")
    const { db } = await connectToDatabase()
    console.log("Database connected successfully")
    
    const users = db.collection("users")
    console.log("Accessing users collection...")
    
    const totalUsers = await users.countDocuments()
    console.log(`Total users found: ${totalUsers}`)
    
    const allUsers = await users.find({}).limit(10).toArray()
    console.log("Users found:", allUsers.map(u => ({ id: u._id, email: u.email, name: u.name })))
    
    return NextResponse.json({
      success: true,
      totalUsers,
      users: allUsers.map(u => ({
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role || 'user',
        isAdmin: u.isAdmin || false,
        credits: u.credits || 0,
        createdAt: u.createdAt
      }))
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
