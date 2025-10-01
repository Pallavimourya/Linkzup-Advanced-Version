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
  audioLevel: number
  isListening: boolean
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  clearTranscript: () => void
  checkMicrophonePermission: () => Promise<string>
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
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  
  const recognitionRef = useRef<any | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Check if speech recognition is supported
  const checkSupport = useCallback(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
      return !!SpeechRecognition
    }
    return false
  }, [])

  // Check microphone permissions
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        return permission.state
      }
      return 'unknown'
    } catch (err) {
      console.warn('Could not check microphone permission:', err)
      return 'unknown'
    }
  }, [])

  // Monitor audio levels
  const monitorAudioLevel = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording && !isPaused) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1
          setAudioLevel(normalizedLevel)
          setIsListening(normalizedLevel > 0.01) // Consider listening if level > 1%
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        } else if (isPaused) {
          // When paused, set audio level to 0
          setAudioLevel(0)
          setIsListening(false)
        }
      }
      
      updateAudioLevel()
    } catch (err) {
      console.warn('Could not monitor audio levels:', err)
    }
  }, [isRecording, isPaused])

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = true // Set to true for continuous recording
    recognition.interimResults = true // Set to true to get interim results
    recognition.lang = language
    recognition.maxAlternatives = 3 // Increase alternatives for better accuracy
    
    // Add additional configuration for better sensitivity
    if ('webkitSpeechRecognition' in window) {
      // Webkit specific settings for better detection
      recognition.continuous = true
      recognition.interimResults = true
    }

    recognition.onstart = () => {
      console.log('Speech recognition started')
      setIsRecording(true)
      setIsPaused(false)
      setError(null)
      // Don't clear transcript on resume - keep previous content
      if (!isPaused) {
        setTranscript('')
      }
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      // Process all results with better accuracy
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          // Use the best alternative for final results
          const bestAlternative = result[0] || result
          finalTranscript += bestAlternative.transcript
        } else {
          // Use interim results for real-time feedback
          const bestAlternative = result[0] || result
          interimTranscript += bestAlternative.transcript
        }
      }
      
      // Only update with final results to avoid duplicates
      // Interim results are just for real-time feedback
      if (finalTranscript.trim()) {
        setTranscript(finalTranscript.trim())
      } else if (interimTranscript.trim()) {
        // Only show interim if no final results yet
        setTranscript(interimTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      
      // Handle specific error types with better recovery
      if (event.error === 'no-speech') {
        // No speech detected - this is normal, don't show error
        console.log('No speech detected, continuing to listen...')
        return
      } else if (event.error === 'audio-capture') {
        // Audio capture issue - try to recover
        console.log('Audio capture issue, attempting to recover...')
        setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('Recovery attempt failed:', e)
            }
          }
        }, 1000)
        return
      } else if (event.error === 'network') {
        setError('Network error. Please check your internet connection.')
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.')
      } else if (event.error === 'service-not-allowed') {
        setError('Speech recognition service not allowed. Please check browser settings.')
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
      
      // Only stop recording for serious errors
      if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
        setIsRecording(false)
        setIsPaused(false)
      }
    }

    recognition.onend = () => {
      console.log('Speech recognition ended, isPaused:', isPaused)
      // Only stop if not manually paused
      if (!isPaused) {
        setIsRecording(false)
        setIsListening(false)
        setAudioLevel(0)
      }
    }

    return recognition
  }, [language, isPaused])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      // Check if already recording
      if (isRecording) {
        return
      }
      
      // Check for microphone permission with enhanced audio settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1, // Mono for speech recognition
          volume: 1.0, // Maximum volume
          latency: 0.01 // Low latency
        } 
      })
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
      
      // Start monitoring audio levels
      monitorAudioLevel(stream)
      
      // Keep the stream alive for continuous recording
      
    } catch (err) {
      console.error('Error starting recording:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow microphone access and refresh the page.')
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.')
        } else if (err.name === 'NotReadableError') {
          setError('Microphone is being used by another application. Please close other apps using the microphone.')
        } else {
          setError(`Error accessing microphone: ${err.message}`)
        }
      } else {
        setError('Failed to start recording. Please try again.')
      }
    }
  }, [initializeSpeechRecognition, isRecording])

  const pauseRecording = useCallback(() => {
    if (recognitionRef.current && isRecording && !isPaused) {
      console.log('Pausing recording...')
      recognitionRef.current.stop()
      setIsPaused(true)
      setIsRecording(false) // Set recording to false when paused
      setAudioLevel(0) // Reset audio level when paused
      setIsListening(false) // Reset listening state when paused
      // Keep the stream alive when pausing for resume functionality
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(async () => {
    if (isPaused && !isRecording) {
      try {
        console.log('Resuming recording...')
        setError(null)
        
        // Check if we still have a valid stream
        if (!streamRef.current) {
          // Re-acquire stream if needed
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 44100,
              channelCount: 1,
              volume: 1.0,
              latency: 0.01
            } 
          })
          streamRef.current = stream
        }
        
        // Create a new recognition instance for resume
        const recognition = initializeSpeechRecognition()
        if (recognition) {
          recognitionRef.current = recognition
          recognition.start()
          
          // Restart audio level monitoring
          if (streamRef.current) {
            monitorAudioLevel(streamRef.current)
          }
        }
      } catch (err) {
        console.error('Error resuming recording:', err)
        setError('Failed to resume recording. Please try again.')
      }
    }
  }, [isPaused, isRecording, initializeSpeechRecognition, monitorAudioLevel])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    // Stop audio level monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    // Clean up the audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    setIsRecording(false)
    setIsPaused(false)
    setAudioLevel(0)
    setIsListening(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  // Check support on mount
  useEffect(() => {
    checkSupport()
  }, [checkSupport])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
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
    audioLevel,
    isListening,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearTranscript,
    checkMicrophonePermission
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
