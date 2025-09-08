"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square, AlertCircle } from 'lucide-react'
import { useMicrophone } from '@/hooks/use-microphone'
import { cn } from '@/lib/utils'

interface MicrophoneButtonProps {
  onTranscript: (transcript: string) => void
  className?: string
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
}

export function MicrophoneButton({ 
  onTranscript, 
  className, 
  disabled = false,
  size = 'default',
  variant = 'outline'
}: MicrophoneButtonProps) {
  const { 
    isRecording, 
    isSupported, 
    transcript, 
    error, 
    startRecording, 
    stopRecording, 
    clearTranscript 
  } = useMicrophone()

  const [showError, setShowError] = useState(false)

  // Handle transcript updates - only when recording stops and we have new transcript
  useEffect(() => {
    if (transcript && !isRecording) {
      onTranscript(transcript)
      clearTranscript()
    }
  }, [transcript, isRecording, onTranscript, clearTranscript])

  // Handle errors
  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleClick = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={cn("opacity-50 cursor-not-allowed", className)}
        title="Speech recognition not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "transition-all duration-200",
          isRecording && "bg-red-500 hover:bg-red-600 text-white animate-pulse",
          className
        )}
        title={isRecording ? "Click to stop recording" : "Click to start recording"}
      >
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {/* Error Tooltip */}
      {showError && error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-500 text-white text-xs rounded-md shadow-lg z-50 max-w-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
        </div>
      )}
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  )
}
