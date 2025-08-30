"use client"

import { Button } from "@/components/ui/button"
import { Send, Calendar, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
import { useState } from "react"

interface LinkedInPostButtonProps {
  content: string
  images?: string[]
  scheduledFor?: Date
  variant?: "post" | "schedule"
  className?: string
  disabled?: boolean
  onSuccess?: () => void
}

export function LinkedInPostButton({
  content,
  images,
  scheduledFor,
  variant = "post",
  className = "",
  disabled = false,
  onSuccess,
}: LinkedInPostButtonProps) {
  const { postToLinkedIn, scheduleLinkedInPost, isPosting, isScheduling, isLinkedInConnected } = useLinkedInPosting()
  const [postStatus, setPostStatus] = useState<"idle" | "success" | "error">("idle")

  const handleClick = async () => {
    setPostStatus("idle")
    let result
    if (variant === "post") {
      result = await postToLinkedIn({ content, images })
    } else {
      result = await scheduleLinkedInPost({ content, images, scheduledFor })
    }
    
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

  const isDisabled = disabled || isPosting || isScheduling
  const isLoading = isPosting || isScheduling

  if (variant === "post") {
    return (
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        className={className}
        variant={postStatus === "success" ? "default" : postStatus === "error" ? "destructive" : "default"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : postStatus === "success" ? (
          <CheckCircle className="w-4 h-4 mr-2" />
        ) : postStatus === "error" ? (
          <XCircle className="w-4 h-4 mr-2" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        {isLoading 
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

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={postStatus === "success" ? "default" : postStatus === "error" ? "destructive" : "outline"}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : postStatus === "success" ? (
        <CheckCircle className="w-4 h-4 mr-2" />
      ) : postStatus === "error" ? (
        <XCircle className="w-4 h-4 mr-2" />
      ) : (
        <Calendar className="w-4 h-4 mr-2" />
      )}
      {isLoading 
        ? "Scheduling..." 
        : postStatus === "success" 
          ? "Scheduled Successfully!" 
          : postStatus === "error" 
            ? "Schedule Failed" 
            : "Schedule for LinkedIn"
      }
    </Button>
  )
}
