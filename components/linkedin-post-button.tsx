"use client"

import { Button } from "@/components/ui/button"
import { Send, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
import { useState } from "react"

interface LinkedInPostButtonProps {
  content: string
  images?: string[]
  className?: string
  disabled?: boolean
  onSuccess?: () => void
}

export function LinkedInPostButton({
  content,
  images,
  className = "",
  disabled = false,
  onSuccess,
}: LinkedInPostButtonProps) {
  const { postToLinkedIn, isPosting, isLinkedInConnected } = useLinkedInPosting()
  const [postStatus, setPostStatus] = useState<"idle" | "success" | "error">("idle")

  const handleClick = async () => {
    setPostStatus("idle")
    const result = await postToLinkedIn({ content, images })
    
    if (result.success) {
      setPostStatus("success")
      if (onSuccess) {
        onSuccess()
      }
      // Reset status after 3 seconds
      setTimeout(() => setPostStatus("idle"), 3000)
    } else {
      setPostStatus("error")
      // Reset status after 3 seconds
      setTimeout(() => setPostStatus("idle"), 3000)
    }
  }

  const isDisabled = disabled || isPosting || !isLinkedInConnected

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      variant={postStatus === "success" ? "default" : postStatus === "error" ? "destructive" : "default"}
    >
      {isPosting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : postStatus === "success" ? (
        <CheckCircle className="w-4 h-4 mr-2" />
      ) : postStatus === "error" ? (
        <XCircle className="w-4 h-4 mr-2" />
      ) : (
        <Send className="w-4 h-4 mr-2" />
      )}
      {isPosting 
        ? "Posting..." 
        : postStatus === "success" 
          ? "Posted Successfully!" 
          : postStatus === "error" 
            ? "Post Failed" 
            : "Post to LinkedIn"
      }
    </Button>
  )
}
