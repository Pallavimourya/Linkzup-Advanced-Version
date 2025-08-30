import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useLinkedInStatus() {
  const { data: session, update } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set initial status
    setIsConnected(!!(session?.user as any)?.linkedinConnected)
    setIsLoading(false)
  }, [session])

  // Poll for status updates when not connected
  useEffect(() => {
    if (isConnected) return // Don't poll if already connected

    const pollInterval = setInterval(async () => {
      try {
        // Check status via API for more efficient polling
        const response = await fetch('/api/linkedin/status')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.isConnected !== isConnected) {
            // Force session update if status changed
            await update()
          }
        }
      } catch (error) {
        console.error("Error polling LinkedIn status:", error)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [isConnected, update])

  // Update local state when session changes
  useEffect(() => {
    const newStatus = !!(session?.user as any)?.linkedinConnected
    if (newStatus !== isConnected) {
      setIsConnected(newStatus)
    }
  }, [session, isConnected])

  return {
    isConnected,
    isLoading,
    refreshStatus: update,
  }
}
