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

  // Initial queue status fetch - only once when component mounts
  useEffect(() => {
    const fetchInitialQueueStatus = async () => {
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
        console.warn("Failed to fetch initial queue status:", error)
      }
    }

    fetchInitialQueueStatus()
  }, []) // Empty dependency array - only run once

  // Poll queue status - only when actively generating
  useEffect(() => {
    const pollQueueStatus = async () => {
      try {
        const response = await fetch("/api/ai/generate", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        })
        
        if (response.ok) {
          const data = await response.json()
          const newQueueStatus = data.queue
          
          // Show queue status notifications only if there's a significant change
          if (newQueueStatus && queueStatus && 
              (newQueueStatus.queueLength !== queueStatus.queueLength || 
               newQueueStatus.isProcessing !== queueStatus.isProcessing)) {
            if (newQueueStatus.queueLength > 0 && newQueueStatus.queueLength <= 3) {
              setTimeout(() => {
                toast({
                  title: "Queue Update",
                  description: `You are ${newQueueStatus.queueLength === 1 ? 'next' : `#${newQueueStatus.queueLength} in queue`}`,
                })
              }, 0)
            } else if (newQueueStatus.queueLength > 3) {
              setTimeout(() => {
                toast({
                  title: "Queue Busy",
                  description: `High demand! You are #${newQueueStatus.queueLength} in queue. Estimated wait: ${Math.ceil(newQueueStatus.queueLength / newQueueStatus.maxConcurrentRequests) * 30}s`,
                })
              }, 0)
            }
          }
          
          setQueueStatus(newQueueStatus)
        }
      } catch (error) {
        console.warn("Failed to poll queue status:", error)
      }
    }

    // Only start polling if we're actively generating
    if (state.isGenerating) {
      // Poll immediately
      pollQueueStatus()

      // Set up interval for polling - reduced frequency to 5 seconds
      const interval = setInterval(pollQueueStatus, 5000)

      return () => clearInterval(interval)
    }
  }, [state.isGenerating, toast]) // Only depend on isGenerating state

  // Start progress simulation
  const startProgressSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isGenerating: true, progress: 0 }))
    
    // Use setTimeout to defer toast to next tick to avoid render cycle issues
    setTimeout(() => {
      toast({
        title: "AI Generation Started",
        description: "Your content is being generated. This may take a few moments...",
      })
    }, 0)
    
    progressIntervalRef.current = setInterval(() => {
      setState(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 10, 90)
        
        // Show progress milestones - defer to next tick
        if (newProgress >= 25 && prev.progress < 25) {
          setTimeout(() => {
            toast({
              title: "Analyzing Content",
              description: "AI is analyzing your prompt and generating ideas...",
            })
          }, 0)
        } else if (newProgress >= 50 && prev.progress < 50) {
          setTimeout(() => {
            toast({
              title: "Creating Content",
              description: "AI is crafting your content with the specified tone and style...",
            })
          }, 0)
        } else if (newProgress >= 75 && prev.progress < 75) {
          setTimeout(() => {
            toast({
              title: "Finalizing",
              description: "AI is polishing and optimizing your content...",
            })
          }, 0)
        }
        
        return { ...prev, progress: newProgress }
      })
    }, 500)
  }, [toast])

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

    // Check queue status before starting
    if (queueStatus && queueStatus.queueLength > 5) {
      setTimeout(() => {
        toast({
          title: "High Queue Volume",
          description: `Queue is busy with ${queueStatus.queueLength} requests. Your request will be processed in order.`,
        })
      }, 0)
    }

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setTimeout(() => {
        toast({
          title: "Previous Request Cancelled",
          description: "Starting new generation request...",
        })
      }, 0)
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
        } else if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please wait a moment before trying again.",
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
      
      // Show success message with content details
      const contentType = request.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      setTimeout(() => {
        toast({
          title: "Content Generated Successfully! 🎉",
          description: `Your ${contentType} is ready! ${data.message || "Content has been generated with your specifications."}`,
        })
      }, 0)

      return data.data
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted")
        setTimeout(() => {
          toast({
            title: "Generation Cancelled",
            description: "Content generation was cancelled by user.",
          })
        }, 0)
        return null
      }

      console.error("Error generating content:", error)
      
      setTimeout(() => {
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
          variant: "destructive"
        })
      }, 0)

      return null
    } finally {
      stopProgressSimulation()
      abortControllerRef.current = null
    }
  }, [session?.user?.email, toast, startProgressSimulation, stopProgressSimulation, queueStatus])

  // Abort current generation
  const abortGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setTimeout(() => {
        toast({
          title: "Generation Cancelled",
          description: "Content generation has been cancelled.",
        })
      }, 0)
    }
    stopProgressSimulation()
  }, [stopProgressSimulation, toast])

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
