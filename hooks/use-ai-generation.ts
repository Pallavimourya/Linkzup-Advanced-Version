import { useState, useCallback, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import type { ContentType, AIProvider, CustomizationOptions, AIResponse } from "@/lib/ai-service"

interface GenerationRequest {
  type: ContentType
  prompt: string
  provider?: AIProvider
  customization?: CustomizationOptions
  priority?: "low" | "normal" | "high"
}

interface GenerationState {
  isGenerating: boolean
  progress: number
  queuePosition?: number
  estimatedTime?: number
}

interface QueueStatus {
  queueLength: number
  activeRequests: number
  maxConcurrentRequests: number
  isProcessing: boolean
}

export function useAIGeneration() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0
  })
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Poll queue status
  useEffect(() => {
    const pollQueueStatus = async () => {
      try {
        const response = await fetch("/api/ai/generate", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        })
        
        if (response.ok) {
          const data = await response.json()
          setQueueStatus(data.queue)
        }
      } catch (error) {
        console.warn("Failed to poll queue status:", error)
      }
    }

    // Poll immediately
    pollQueueStatus()

    // Set up interval for polling
    const interval = setInterval(pollQueueStatus, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [])

  // Start progress simulation
  const startProgressSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isGenerating: true, progress: 0 }))
    
    progressIntervalRef.current = setInterval(() => {
      setState(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 10, 90)
        return { ...prev, progress: newProgress }
      })
    }, 500)
  }, [])

  // Stop progress simulation
  const stopProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setState(prev => ({ ...prev, isGenerating: false, progress: 0 }))
  }, [])

  // Generate content
  const generateContent = useCallback(async (request: GenerationRequest): Promise<AIResponse | null> => {
    if (!session?.user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate content",
        variant: "destructive"
      })
      return null
    }

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      startProgressSimulation()

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 402) {
          toast({
            title: "Insufficient Credits",
            description: errorData.suggestion || "Please purchase more credits to continue",
            variant: "destructive"
          })
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }
        
        return null
      }

      const data = await response.json()
      
      // Complete progress
      setState(prev => ({ ...prev, progress: 100 }))
      
      // Show success message
      toast({
        title: "Content Generated!",
        description: data.message || "Your content has been generated successfully",
      })

      return data.data
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted")
        return null
      }

      console.error("Error generating content:", error)
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive"
      })

      return null
    } finally {
      stopProgressSimulation()
      abortControllerRef.current = null
    }
  }, [session?.user?.email, toast, startProgressSimulation, stopProgressSimulation])

  // Abort current generation
  const abortGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    stopProgressSimulation()
  }, [stopProgressSimulation])

  // Generate LinkedIn posts
  const generateLinkedInPosts = useCallback(async (
    prompt: string,
    customization?: CustomizationOptions,
    provider: AIProvider = "openai" // Always use OpenAI
  ) => {
    return generateContent({
      type: "linkedin-post",
      prompt,
      provider,
      customization
    })
  }, [generateContent])

  // Generate topics
  const generateTopics = useCallback(async (
    niche: string,
    count: number = 5,
    provider: AIProvider = "openai" // Always use OpenAI
  ) => {
    return generateContent({
      type: "topics",
      prompt: niche,
      provider,
      customization: { niche }
    })
  }, [generateContent])

  // Generate article
  const generateArticle = useCallback(async (
    topic: string,
    customization?: CustomizationOptions,
    provider: AIProvider = "openai" // Always use OpenAI
  ) => {
    return generateContent({
      type: "article",
      prompt: topic,
      provider,
      customization
    })
  }, [generateContent])

  // Generate carousel
  const generateCarousel = useCallback(async (
    topic: string,
    customization?: CustomizationOptions,
    provider: AIProvider = "openai" // Always use OpenAI
  ) => {
    return generateContent({
      type: "carousel",
      prompt: topic,
      provider,
      customization
    })
  }, [generateContent])

  // Generate specific format content
  const generateFormattedContent = useCallback(async (
    topic: string,
    format: ContentType,
    customization?: CustomizationOptions,
    provider: AIProvider = "openai" // Always use OpenAI
  ) => {
    return generateContent({
      type: format,
      prompt: topic,
      provider,
      customization
    })
  }, [generateContent])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  return {
    // State
    isGenerating: state.isGenerating,
    progress: state.progress,
    queueStatus,
    
    // Actions
    generateContent,
    generateLinkedInPosts,
    generateTopics,
    generateArticle,
    generateCarousel,
    generateFormattedContent,
    abortGeneration,
    
    // Utility
    canGenerate: !!session?.user?.email,
    estimatedWaitTime: queueStatus ? 
      Math.ceil(queueStatus.queueLength / queueStatus.maxConcurrentRequests) * 30 : 0 // Rough estimate: 30 seconds per request
  }
}
