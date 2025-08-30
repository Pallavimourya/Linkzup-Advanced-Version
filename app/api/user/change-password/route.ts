import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"
import { validatePasswordStrength } from "@/lib/password-utils"

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 })
    }

    // Validate new password strength
    const passwordStrength = validatePasswordStrength(newPassword)
    if (!passwordStrength.isValid) {
      return NextResponse.json({ 
        error: "New password does not meet strength requirements",
        details: passwordStrength.feedback 
      }, { status: 400 })
    }

    await client.connect()
    const users = client.db("Linkzup-Advanced").collection("users")

    // Get current user
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found or no password set" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 400 })
    }

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
