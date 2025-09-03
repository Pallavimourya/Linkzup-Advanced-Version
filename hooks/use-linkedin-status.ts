"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useLinkedInStatus() {
  const { data: session, update } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set initial status
    const linkedinStatus = !!(session?.user as any)?.linkedinConnected
    setIsConnected(linkedinStatus)
    setIsLoading(false)
    console.log("[LinkedIn Status] Initial status set:", linkedinStatus)
  }, [session?.user?.id, (session?.user as any)?.linkedinConnected]) // Only depend on specific values

  // Remove the refresh parameter logic - it's causing unnecessary session updates

  // Remove the polling logic entirely - it's causing infinite loops
  // The session will be updated naturally when LinkedIn connects/disconnects

  // Update local state when session changes
  useEffect(() => {
    const newStatus = !!(session?.user as any)?.linkedinConnected
    console.log("[LinkedIn Status] Session changed, checking status:", {
      newStatus,
      currentStatus: isConnected,
      sessionLinkedIn: (session?.user as any)?.linkedinConnected
    })
    
    if (newStatus !== isConnected) {
      console.log("[LinkedIn Status] Connection status updated:", newStatus)
      setIsConnected(newStatus)
    }
  }, [session?.user?.id, (session?.user as any)?.linkedinConnected]) // Remove isConnected to prevent loops

  const forceRefresh = async () => {
    console.log("[LinkedIn Status] Force refreshing status...")
    setIsLoading(true)
    try {
      await update()
      // Also check the status API directly
      const response = await fetch("/api/linkedin/status")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsConnected(data.isConnected)
          console.log("[LinkedIn Status] Status updated from API:", data.isConnected)
        }
      }
    } catch (error) {
      console.error("[LinkedIn Status] Error refreshing status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isConnected,
    isLoading,
    refreshStatus: update,
    forceRefresh,
  }
}
