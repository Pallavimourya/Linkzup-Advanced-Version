import { NextResponse } from "next/server"
import { signIn } from "next-auth/react"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    // Only allow admin login in offline mode
    if (email === "admin@linkzup.com" && password === "admin4321") {
      return NextResponse.json({
        success: true,
        message: "Offline admin login successful",
        user: {
          id: "admin-offline",
          email: "admin@linkzup.com",
          name: "Administrator",
          role: "admin"
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      message: "Invalid credentials or offline mode only allows admin access"
    }, { status: 401 })
    
  } catch (error) {
    console.error("Offline login error:", error)
    return NextResponse.json({
      success: false,
      error: "Offline login failed"
    }, { status: 500 })
  }
}
