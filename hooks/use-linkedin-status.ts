"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export function useLinkedInStatus() {
  const { data: session, update } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Set initial status
    setIsConnected(!!(session?.user as any)?.linkedinConnected)
    setIsLoading(false)
  }, [session])

  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh")
    if (shouldRefresh === "true") {
      console.log("[v0] Forcing session refresh due to LinkedIn callback")
      update()
      // Remove the refresh parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete("refresh")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams, update])

  useEffect(() => {
    if (isConnected) return // Don't poll if already connected

    let pollCount = 0
    const maxPolls = 15 // Stop after 15 attempts (30 seconds)

    const pollInterval = setInterval(async () => {
      try {
        pollCount++
        console.log(`[v0] Polling LinkedIn status (attempt ${pollCount}/${maxPolls})`)

        // Check status via API for more efficient polling
        const response = await fetch("/api/linkedin/status")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.isConnected !== isConnected) {
            console.log("[v0] LinkedIn status changed, updating session")
            // Force session update if status changed
            await update()
          }
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          console.log("[v0] Stopped polling LinkedIn status after max attempts")
          clearInterval(pollInterval)
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
      console.log("[v0] LinkedIn connection status updated:", newStatus)
      setIsConnected(newStatus)
    }
  }, [session, isConnected])

  return {
    isConnected,
    isLoading,
    refreshStatus: update,
  }
}
