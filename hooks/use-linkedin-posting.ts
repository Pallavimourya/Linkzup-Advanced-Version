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

    // Check LinkedIn connection before posting
    if (!isLinkedInConnected) {
      toast({
        title: "LinkedIn Not Connected",
        description: "Please connect your LinkedIn account first to post content.",
        variant: "destructive",
      })
      return { success: false }
    }

    // Validate post content
    if (!postData.content.trim()) {
      toast({
        title: "Empty Content",
        description: "Please add some content to your post before publishing.",
        variant: "destructive",
      })
      return { success: false }
    }

    // Check content length
    if (postData.content.length > 3000) {
      toast({
        title: "Content Too Long",
        description: "LinkedIn posts have a 3000 character limit. Please shorten your content.",
        variant: "destructive",
      })
      return { success: false }
    }

    setIsPosting(true)
    
    // Show posting started notification
    toast({
      title: "Posting to LinkedIn",
      description: "Your post is being published to LinkedIn. This may take a few moments...",
    })

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
        // Show success notification with post details
        const imageCount = postData.images?.length || 0
        const hasImages = imageCount > 0
        const imageText = hasImages ? ` with ${imageCount} image${imageCount > 1 ? 's' : ''}` : ''
        
        toast({
          title: "Posted Successfully! 🎉",
          description: `Your post has been published to LinkedIn${imageText}. It's now live on your profile!`,
        })
        
        // Force session update to refresh LinkedIn connection status
        await update()
        
        // Refresh credits display
        if (typeof window !== 'undefined' && (window as any).refreshCredits) {
          (window as any).refreshCredits()
        }
        
        return { success: true }
      } else {
        // Handle specific error cases with detailed notifications
        if (result.errorCode === "INSUFFICIENT_CREDITS") {
          toast({
            title: "Insufficient Credits",
            description: "You need 1 credit to post to LinkedIn. Please purchase more credits or upgrade your plan.",
            variant: "destructive",
          })
        } else if (result.errorCode === "LINKEDIN_NOT_CONNECTED") {
          toast({
            title: "LinkedIn Connection Lost",
            description: "Your LinkedIn connection has expired. Please reconnect your account to continue posting.",
            variant: "destructive",
          })
        } else if (result.errorCode === "LINKEDIN_API_ERROR") {
          toast({
            title: "LinkedIn API Error",
            description: "LinkedIn is experiencing issues. Please try again in a few minutes.",
            variant: "destructive",
          })
        } else if (result.errorCode === "CONTENT_VIOLATION") {
          toast({
            title: "Content Policy Violation",
            description: "Your post content violates LinkedIn's community guidelines. Please review and edit your content.",
            variant: "destructive",
          })
        } else if (result.errorCode === "RATE_LIMIT") {
          toast({
            title: "Posting Too Fast",
            description: "You're posting too frequently. Please wait a few minutes before posting again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Posting Failed",
            description: result.message || "Failed to post to LinkedIn. Please check your connection and try again.",
            variant: "destructive",
          })
        }
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error("Error posting to LinkedIn:", error)
      
      // Show network-specific error notifications
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Unable to connect to our servers. Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else if (error instanceof Error && error.message.includes('timeout')) {
        toast({
          title: "Request Timeout",
          description: "The request took too long. LinkedIn may be experiencing high traffic. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred while posting. Please try again or contact support if the issue persists.",
          variant: "destructive",
        })
      }
      
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
