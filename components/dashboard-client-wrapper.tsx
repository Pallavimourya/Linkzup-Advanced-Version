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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show loading state during session loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render anything if no session
  if (!session) {
    return null
  }

  return <>{children}</>
}
