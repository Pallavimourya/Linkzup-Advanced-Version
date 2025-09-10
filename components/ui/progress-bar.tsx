"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

interface ProgressBarProps {
  isLoading: boolean
  title?: string
  description?: string
  duration?: number
  onComplete?: () => void
}

const motivationalMessages = [
  "Crafting your perfect content... ✨",
  "AI is working its magic... 🚀",
  "Almost there, stay patient... 💫",
  "Creating something amazing... 🌟",
  "Your content is being generated... ⚡",
  "Processing with precision... 🎯",
  "Making your post viral-ready... 📈",
  "Adding that special touch... ✨",
  "Optimizing for engagement... 🎉",
  "Preparing your masterpiece... 🎨"
]

export function ProgressBar({ 
  isLoading, 
  title = "Processing...", 
  description,
  duration = 3000,
  onComplete 
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      return
    }

    // Set initial message
    setCurrentMessage(motivationalMessages[0])

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          onComplete?.()
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const nextIndex = (prev + 1) % motivationalMessages.length
        setCurrentMessage(motivationalMessages[nextIndex])
        return nextIndex
      })
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [isLoading, duration, onComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              <p className="text-sm text-primary font-medium animate-pulse">
                {currentMessage}
              </p>
            </div>

            <div className="w-full space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
