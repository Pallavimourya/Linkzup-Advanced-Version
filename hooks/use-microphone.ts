"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseMicrophoneOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

interface UseMicrophoneReturn {
  isRecording: boolean
  isPaused: boolean
  isSupported: boolean
  transcript: string
  error: string | null
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  clearTranscript: () => void
}

export function useMicrophone(options: UseMicrophoneOptions = {}): UseMicrophoneReturn {
  const { 
    language = 'en-US', 
    continuous = true, 
    interimResults = true 
  } = options
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<any | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Check if speech recognition is supported
  const checkSupport = useCallback(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
      return !!SpeechRecognition
    }
    return false
  }, [])

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = true // Set to true for continuous recording
    recognition.interimResults = true // Set to true to get interim results
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsRecording(true)
      setIsPaused(false)
      setError(null)
      setTranscript('') // Clear previous transcript
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }
      
      // Update transcript with both final and interim results
      const fullTranscript = finalTranscript + interimTranscript
      if (fullTranscript.trim()) {
        setTranscript(fullTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      // Don't stop recording for certain errors that can be recovered
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // These errors are common and don't require stopping
        return
      }
      setError(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
      setIsPaused(false)
    }

    recognition.onend = () => {
      // Only stop if not manually paused
      if (!isPaused) {
        setIsRecording(false)
      }
    }

    return recognition
  }, [language, isPaused])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      // Check for microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream // Store the stream for cleanup
      
      // Initialize speech recognition
      const recognition = initializeSpeechRecognition()
      if (!recognition) {
        setError('Speech recognition is not supported in this browser')
        // Clean up stream if recognition fails
        stream.getTracks().forEach(track => track.stop())
        return
      }

      recognitionRef.current = recognition
      recognition.start()
      
      // Keep the stream alive for continuous recording
      
    } catch (err) {
      console.error('Error starting recording:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow microphone access.')
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.')
        } else {
          setError(`Error accessing microphone: ${err.message}`)
        }
      } else {
        setError('Failed to start recording. Please try again.')
      }
    }
  }, [initializeSpeechRecognition])

  const pauseRecording = useCallback(() => {
    if (recognitionRef.current && isRecording && !isPaused) {
      recognitionRef.current.stop()
      setIsPaused(true)
      // Keep the stream alive when pausing for resume functionality
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(async () => {
    if (isPaused && !isRecording) {
      try {
        // Check if we still have a valid stream
        if (!streamRef.current) {
          // Re-acquire stream if needed
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          streamRef.current = stream
        }
        
        const recognition = initializeSpeechRecognition()
        if (recognition) {
          recognitionRef.current = recognition
          recognition.start()
        }
      } catch (err) {
        console.error('Error resuming recording:', err)
        setError('Failed to resume recording. Please try again.')
      }
    }
  }, [isPaused, isRecording, initializeSpeechRecognition])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    // Clean up the audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    setIsRecording(false)
    setIsPaused(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  // Check support on mount
  useState(() => {
    checkSupport()
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    isRecording,
    isPaused,
    isSupported,
    transcript,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearTranscript
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
