import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth?.token as any
    
    // Redirect admin users from dashboard to admin panel
    if (path.startsWith("/dashboard") && token?.isAdmin === true) {
      const url = req.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path.startsWith("/dashboard")) return !!token
        if (path.startsWith("/app")) return !!token
        if (path.startsWith("/admin")) return !!token && (token as any).isAdmin === true
        return true
      },
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*", "/admin/:path*"],
}
