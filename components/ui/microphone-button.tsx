"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square, AlertCircle, Pause, Play } from 'lucide-react'
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
    isPaused,
    isSupported, 
    transcript, 
    error, 
    audioLevel,
    isListening,
    startRecording, 
    pauseRecording,
    resumeRecording,
    stopRecording, 
    clearTranscript,
    checkMicrophonePermission
  } = useMicrophone()

  const [showError, setShowError] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const status = await checkMicrophonePermission()
      setPermissionStatus(status)
    }
    checkPermission()
  }, [checkMicrophonePermission])

  // Handle transcript updates - only when recording stops and we have new transcript
  useEffect(() => {
    if (transcript && !isRecording) {
      // Only add transcript if it's not empty and not already added
      const trimmedTranscript = transcript.trim()
      if (trimmedTranscript) {
        onTranscript(trimmedTranscript)
        clearTranscript()
      }
    }
  }, [transcript, isRecording, onTranscript, clearTranscript])

  // Handle errors
  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 8000) // Show error longer
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleClick = async () => {
    if (isRecording) {
      stopRecording()
    } else if (isPaused) {
      await resumeRecording()
    } else {
      await startRecording()
    }
  }

  const handlePauseClick = () => {
    console.log('Pause button clicked, isRecording:', isRecording, 'isPaused:', isPaused)
    if (isRecording && !isPaused) {
      pauseRecording()
    }
  }

  const handleStopClick = () => {
    stopRecording()
  }

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={cn("opacity-50 cursor-not-allowed", className)}
        title="Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari."
      >
        <MicOff className="h-4 w-4" />
      </Button>
    )
  }

  // Check if microphone is disabled due to permissions
  const isMicrophoneDisabled = disabled || permissionStatus === 'denied'

  return (
    <div className="relative">
      {/* Show pause and stop buttons when recording */}
      {isRecording ? (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size={size}
            onClick={handlePauseClick}
            disabled={isMicrophoneDisabled || !isRecording || isPaused}
            className={cn(
              "h-8 w-8 p-0 hover:bg-yellow-100 text-yellow-600",
              (!isRecording || isPaused) && "opacity-50 cursor-not-allowed",
              className
            )}
            title={isPaused ? "Already paused" : "Pause recording"}
          >
            <Pause className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size={size}
            onClick={handleStopClick}
            disabled={isMicrophoneDisabled}
            className={cn(
              "h-8 w-8 p-0 hover:bg-red-100 text-red-600",
              className
            )}
            title="Stop recording"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        /* Show main microphone button when not recording */
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          disabled={isMicrophoneDisabled}
          className={cn(
            "transition-all duration-200",
            isPaused && "bg-yellow-500 hover:bg-yellow-600 text-white",
            permissionStatus === 'denied' && "opacity-50 cursor-not-allowed",
            className
          )}
          title={
            permissionStatus === 'denied' 
              ? "Microphone permission denied. Please allow microphone access in browser settings."
              : isPaused 
                ? "Click to resume recording" 
                : "Click to start recording"
          }
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      )}
      
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
      
      {/* Recording indicator with audio level */}
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
      
      {/* Audio level indicator */}
      {isRecording && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full transition-all duration-100"
             style={{
               transform: `scale(${1 + audioLevel * 2})`,
               opacity: isListening ? 1 : 0.3
             }}
             title={`Audio level: ${Math.round(audioLevel * 100)}%`}
        ></div>
      )}
    </div>
  )
}
