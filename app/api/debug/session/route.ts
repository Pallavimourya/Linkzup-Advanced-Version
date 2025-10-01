import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any

    return NextResponse.json({
      success: true,
      session: session ? {
        user: session.user,
        hasSession: true,
        isAdmin: session.user?.email === 'admin@linkzup.com' || session.user?.email === 'admin@linkzup.in'
      } : {
        hasSession: false,
        isAdmin: false
      },
      adminEmails: ['admin@linkzup.com', 'admin@linkzup.in'],
      message: session ? 'Session found' : 'No session found'
    })

  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
