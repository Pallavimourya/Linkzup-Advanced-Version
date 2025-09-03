import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { useLinkedInStatus } from "./use-linkedin-status"

interface PostData {
  content: string
  images?: string[]
}

export function useLinkedInPosting() {
  const { data: session, update } = useSession()
  const { isConnected: isLinkedInConnected } = useLinkedInStatus()
  const [isPosting, setIsPosting] = useState(false)

  // Type assertion to ensure session has the extended user properties
  const typedSession = session as any

  const postToLinkedIn = async (postData: PostData) => {
    // Check if session exists
    if (!typedSession?.user?.id || !typedSession?.user?.email) {
      toast({
        title: "Session Error",
        description: "Please sign in again to continue.",
        variant: "destructive",
      })
      return { success: false }
    }

    setIsPosting(true)
    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postData.content,
          images: postData.images || [],
          userId: typedSession.user.id,
          userEmail: typedSession.user.email,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Posted!",
          description: "Your post has been published to LinkedIn",
        })
        // Force session update to refresh LinkedIn connection status
        await update()
        // Refresh credits display
        if (typeof window !== 'undefined' && (window as any).refreshCredits) {
          (window as any).refreshCredits()
        }
        return { success: true }
      } else {
        // Handle specific error cases
        if (result.errorCode === "INSUFFICIENT_CREDITS") {
          toast({
            title: "Insufficient Credits",
            description: "You need 1 credit to post to LinkedIn. Please purchase more credits or upgrade your plan.",
            variant: "destructive",
          })
        } else if (result.errorCode === "LINKEDIN_NOT_CONNECTED") {
          toast({
            title: "LinkedIn Not Connected",
            description: "Please connect your LinkedIn account first to post content.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to post to LinkedIn",
            variant: "destructive",
          })
        }
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error("Error posting to LinkedIn:", error)
      toast({
        title: "Error",
        description: "Failed to post to LinkedIn. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    } finally {
      setIsPosting(false)
    }
  }

  return {
    postToLinkedIn,
    isPosting,
    isLinkedInConnected,
  }
}
