"use client"

import { Button } from "@/components/ui/button"
import { Send, Calendar, Loader2 } from "lucide-react"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"

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

  const handleClick = async () => {
    let result
    if (variant === "post") {
      result = await postToLinkedIn({ content, images })
    } else {
      result = await scheduleLinkedInPost({ content, images, scheduledFor })
    }
    
    if (result.success && onSuccess) {
      onSuccess()
    }
  }

  const isDisabled = disabled || !isLinkedInConnected || isPosting || isScheduling
  const isLoading = isPosting || isScheduling

  if (variant === "post") {
    return (
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        {isLinkedInConnected ? "Post to LinkedIn" : "Connect LinkedIn First"}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant="outline"
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Calendar className="w-4 h-4 mr-2" />
      )}
      {isLinkedInConnected ? "Schedule for LinkedIn" : "Connect LinkedIn First"}
    </Button>
  )
}
