"use client"

import { useState, useRef, useCallback } from 'react'

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
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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
    recognition.continuous = false // Set to false to avoid continuous recognition
    recognition.interimResults = false // Set to false to only get final results
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsRecording(true)
      setIsPaused(false)
      setError(null)
      setTranscript('') // Clear previous transcript
    }

    recognition.onresult = (event) => {
      // Get the most confident result
      const result = event.results[0][0]
      const transcript = result.transcript.trim()
      
      if (transcript) {
        setTranscript(transcript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
      setIsPaused(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      setIsPaused(false)
    }

    return recognition
  }, [language])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      // Check for microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Initialize speech recognition
      const recognition = initializeSpeechRecognition()
      if (!recognition) {
        setError('Speech recognition is not supported in this browser')
        return
      }

      recognitionRef.current = recognition
      recognition.start()
      
      // Clean up the stream after starting recognition
      stream.getTracks().forEach(track => track.stop())
      
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
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(async () => {
    if (isPaused && !isRecording) {
      try {
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
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
