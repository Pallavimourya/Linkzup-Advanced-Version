"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Loader2 } from "lucide-react"
import { SchedulePostModal } from "@/components/schedule-post-modal"

interface ScheduleButtonProps {
  content: string
  images?: string[]
  trigger?: React.ReactNode
  onSuccess?: () => void
  defaultPlatform?: "linkedin" | "twitter" | "facebook"
  defaultType?: "text" | "carousel" | "image" | "article"
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
  renderAs?: "button" | "div" | "span"
}

export function ScheduleButton({
  content,
  images = [],
  trigger,
  onSuccess,
  defaultPlatform = "linkedin",
  defaultType = "text",
  variant = "outline",
  size = "default",
  className = "",
  disabled = false,
  renderAs = "button",
}: ScheduleButtonProps) {
  return (
    <SchedulePostModal
      content={content}
      images={images}
      trigger={
        trigger || (
          renderAs === "button" ? (
            <Button
              variant={variant}
              size={size}
              className={className}
              disabled={disabled}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Post
            </Button>
          ) : (
            <div
              className={`inline-flex items-center justify-center gap-2 cursor-pointer ${className}`}
              role="button"
              tabIndex={0}
            >
              <Calendar className="h-4 w-4" />
              Schedule Post
            </div>
          )
        )
      }
      onSuccess={onSuccess}
      defaultPlatform={defaultPlatform}
      defaultType={defaultType}
    />
  )
}
