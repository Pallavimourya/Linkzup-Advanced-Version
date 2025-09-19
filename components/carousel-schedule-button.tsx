"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Loader2 } from "lucide-react"
import { SchedulePostModal } from "@/components/schedule-post-modal"
import { useToast } from "@/hooks/use-toast"

interface CarouselScheduleButtonProps {
  content: string
  onCaptureImages: () => Promise<string[]>
  trigger?: React.ReactNode
  onSuccess?: () => void
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
}

export function CarouselScheduleButton({
  content,
  onCaptureImages,
  trigger,
  onSuccess,
  variant = "outline",
  size = "default",
  className = "",
  disabled = false,
}: CarouselScheduleButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const { toast } = useToast()

  const handleScheduleClick = async () => {
    if (isCapturing) return

    setIsCapturing(true)
    try {
      console.log("Starting image capture for scheduling...")
      // Capture carousel slide images
      const images = await onCaptureImages()
      console.log(`Captured ${images.length} images:`, images)
      setCapturedImages(images)
      setShowModal(true)
      
      toast({
        title: "Images Captured!",
        description: `Successfully captured ${images.length} slide images for scheduling.`,
      })
    } catch (error) {
      console.error("Error capturing images:", error)
      toast({
        title: "Capture Failed",
        description: "Failed to capture carousel images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleScheduleSuccess = () => {
    setShowModal(false)
    setCapturedImages([])
    onSuccess?.()
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || isCapturing}
        onClick={handleScheduleClick}
      >
        {isCapturing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Capturing Images...
          </>
        ) : (
          trigger || (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Post
            </>
          )
        )}
      </Button>

      <SchedulePostModal
        content={content}
        images={capturedImages}
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={handleScheduleSuccess}
        defaultPlatform="linkedin"
        defaultType="carousel"
      />
    </>
  )
}
