"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

interface DashboardClientWrapperProps {
  children: React.ReactNode
}

export function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) redirect("/auth/signin")
  }, [session, status])

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status === "loading") {
        console.log("Session loading timeout - forcing refresh")
        window.location.reload()
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [status])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null // Return null instead of loading spinner to prevent hydration mismatch
  }

  // Show loading state during session loading
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading session...</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-sm text-primary hover:underline"
        >
          Click here if loading takes too long
        </button>
      </div>
    )
  }

  // Don't render anything if no session
  if (!session) {
    return null
  }

  return <>{children}</>
}
