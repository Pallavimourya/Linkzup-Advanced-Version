"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Sparkles, 
  X, 
  Calendar, 
  Save, 
  Eye, 
  Settings,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Zap,
  Heart,
  Star,
  ArrowRight,
  RefreshCw,
  Copy,
  Share2,
  MessageSquare,
  BarChart3,
  Globe,
  Award,
  Brain,
  PenTool,
  CheckCircle,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LinkedInPreview } from "@/components/linkedin-preview"
import { LinkedInPostButton } from "@/components/linkedin-post-button"
import { ScheduleButton } from "@/components/schedule-button"
import { AICustomizationPanel, type CustomizationOptions } from "@/components/ai-customization-panel"
import { useEffect } from "react"

// Predefined recommended topics
const allRecommendedTopics = [
  "The Future of Remote Work: Trends and Predictions",
  "Building a Personal Brand on LinkedIn: A Complete Guide",
  "AI in Marketing: How Technology is Changing the Game",
  "Leadership Lessons from Successful Entrepreneurs",
  "Digital Transformation: What Every Business Needs to Know",
  "Mental Health in the Workplace: Creating Supportive Environments",
  "Sustainable Business Practices: Going Green for Growth",
  "The Rise of Freelancing: Building a Successful Gig Economy Career",
  "Data-Driven Decision Making: Analytics for Business Success",
  "Customer Experience: The Key to Business Growth",
  "Innovation in Traditional Industries: Modernizing Old Business Models",
  "Work-Life Balance: Strategies for the Modern Professional",
  "Social Media Marketing: Best Practices for 2024",
  "Cybersecurity for Small Businesses: Essential Protection Strategies",
  "The Psychology of Sales: Understanding Customer Behavior",
  "Team Building in Virtual Environments: Remote Collaboration Tips",
  "Financial Planning for Entrepreneurs: Managing Business Finances",
  "Content Marketing Strategies: Creating Engaging Brand Stories",
  "Diversity and Inclusion: Building Better Workplaces",
  "E-commerce Trends: The Future of Online Shopping",
  "Productivity Hacks: Maximizing Efficiency in the Digital Age",
  "Startup Funding: Navigating the Investment Landscape",
  "Customer Retention: Building Long-Term Business Relationships",
  "Technology Adoption: Embracing Change in the Workplace",
  "Personal Development: Skills Every Professional Should Master"
]

interface Topic {
  id: string
  title: string
  viralChance: number
  niche: string
  format?: string
  content?: string | string[]
  status: "generated" | "content-ready" | "expanded"
  isPersonalized?: boolean
}

export default function AIArticlesPage() {
  const [topicPrompt, setTopicPrompt] = useState("")
  const [contentType, setContentType] = useState<"caseStudy" | "descriptive" | "list" | "story">("caseStudy")
  const [isGenerating, setIsGenerating] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewingTopicId, setPreviewingTopicId] = useState<string | null>(null)
  const [showCustomization, setShowCustomization] = useState<string | null>(null)
  const [showTopicGenerator, setShowTopicGenerator] = useState(true)
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai")
  const [recommendedTopics, setRecommendedTopics] = useState<Topic[]>([])
  const [personalizedTopics, setPersonalizedTopics] = useState<Topic[]>([])
  const [allPersonalizedTopics, setAllPersonalizedTopics] = useState<Topic[]>([]) // Store all 20 topics
  const [hasPersonalStory, setHasPersonalStory] = useState(false)
  const [isRefreshingTopics, setIsRefreshingTopics] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [hasGeneratedTopics, setHasGeneratedTopics] = useState(false)
  const [approvedTopics, setApprovedTopics] = useState<any[]>([])

  const [customization, setCustomization] = useState<CustomizationOptions>({
    tone: "professional",
    language: "english",
    wordCount: 300,
    targetAudience: "LinkedIn professionals",
    mainGoal: "engagement",
    includeHashtags: true,
    includeEmojis: true,
    callToAction: true,
    temperature: 0.7,
    maxTokens: 2000,
  })
  const { toast } = useToast()

  // Function to shuffle and select 10 random recommended topics
  const generateRandomRecommendedTopics = () => {
    const shuffled = [...allRecommendedTopics].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 10).map((title, index) => ({
      id: `recommended-${Date.now()}-${index}`,
      title,
      viralChance: Math.floor(Math.random() * 40) + 60, // 60-100%
      niche: "Recommended",
      status: "generated" as const,
      isPersonalized: false
    }))
    setRecommendedTopics(selected)
  }

  // Function to shuffle and select 6 topics from all personalized topics
  const shuffleAndSelectTopics = (allTopics: Topic[], count: number = 6) => {
    const shuffled = [...allTopics].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Function to fetch personalized topics based on personal story
  const fetchPersonalizedTopics = async () => {
    try {
      setIsRefreshingTopics(true)
      const response = await fetch('/api/personalized-topics')
      
      if (response.ok) {
        const data = await response.json()
        if (data.hasPersonalStory && data.topics) {
          // Store all topics
          setAllPersonalizedTopics(data.topics)
          // Shuffle and select 6 topics for display
          const shuffledTopics = shuffleAndSelectTopics(data.topics, 6)
          setPersonalizedTopics(shuffledTopics)
          setHasPersonalStory(true)
          
        } else {
          setHasPersonalStory(false)
          setPersonalizedTopics([])
          setAllPersonalizedTopics([])
        }
      } else {
        setHasPersonalStory(false)
        setPersonalizedTopics([])
      }
    } catch (error) {
      setHasPersonalStory(false)
      setPersonalizedTopics([])
      setAllPersonalizedTopics([])
    } finally {
      setIsRefreshingTopics(false)
    }
  }

  // Function to check personal story completion status
  const checkPersonalStoryStatus = async () => {
    try {
      const response = await fetch('/api/personalized-topics')
      
      if (response.ok) {
        const data = await response.json()
        // Status check data received
        const newHasPersonalStory = data.hasPersonalStory
        
        // Personal story status check completed
        
        // If personal story status changed, update topics
        if (newHasPersonalStory !== hasPersonalStory) {
          // Personal story status changed
          if (newHasPersonalStory) {
            await fetchPersonalizedTopics()
          } else {
            setHasPersonalStory(false)
            setPersonalizedTopics([])
    generateRandomRecommendedTopics()
          }
        } else {
          console.log("Personal story status unchanged")
        }
      } else {
        console.error("Status check failed:", response.status)
      }
    } catch (error) {
      console.error("Error checking personal story status:", error)
    }
  }

  // Force refresh personalized topics (can be called externally)
  const forceRefreshPersonalizedTopics = async () => {
    console.log("Force refreshing personalized topics...")
    await checkPersonalStoryStatus()
  }

  // Function to check when tab becomes active
  const handleTabActivation = () => {
    console.log("Topic Generator tab activated, checking personal story...")
    checkPersonalStoryStatus()
  }

  // Function to shuffle and display new set of 6 topics
  const handleShuffleTopics = () => {
    if (allPersonalizedTopics.length > 0) {
      const shuffledTopics = shuffleAndSelectTopics(allPersonalizedTopics, 6)
      setPersonalizedTopics(shuffledTopics)
      console.log("Shuffled topics:", shuffledTopics.length)
      toast({
        title: "Topics Shuffled!",
        description: "Showing 6 new personalized topics from your collection",
      })
    }
  }

  // Function to regenerate topics completely
  const handleRegenerateTopics = async () => {
    try {
      setIsRefreshingTopics(true)
      console.log("Regenerating personalized topics...")
      
      // Call API to force regeneration
      const response = await fetch('/api/personalized-topics/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.hasPersonalStory && data.topics) {
          setAllPersonalizedTopics(data.topics)
          const shuffledTopics = shuffleAndSelectTopics(data.topics, 6)
          setPersonalizedTopics(shuffledTopics)
          setHasPersonalStory(true)
        }
      } else {
        throw new Error('Failed to regenerate topics')
      }
    } catch (error) {
      console.error("Error regenerating topics:", error)
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate topics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshingTopics(false)
    }
  }

  // Expose the function globally for external calls
  useEffect(() => {
    (window as any).refreshPersonalizedTopics = forceRefreshPersonalizedTopics
    (window as any).checkTopicGeneratorTab = handleTabActivation
    return () => {
      delete (window as any).refreshPersonalizedTopics
      delete (window as any).checkTopicGeneratorTab
    }
  }, [])

  // Initialize recommended topics and fetch approved topics on component mount
  useEffect(() => {
    console.log("=== TOPIC GENERATOR INITIALIZED ===")
    // First try to fetch personalized topics
    fetchPersonalizedTopics()
    
    // Fetch approved topics
    const fetchApprovedTopics = async () => {
      try {
        const response = await fetch('/api/approved-topics')
        if (response.ok) {
          const data = await response.json()
          setApprovedTopics(data.approvedTopics || [])
        }
      } catch (error) {
        console.error('Error fetching approved topics:', error)
      }
    }

    fetchApprovedTopics()
  }, [])

  // Check immediately when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, checking personal story status
        checkPersonalStoryStatus()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Generate random recommended topics only if no personal story
  useEffect(() => {
    if (!hasPersonalStory) {
      generateRandomRecommendedTopics()
    }
  }, [hasPersonalStory])

  // Periodic check for personal story completion
  useEffect(() => {
    const interval = setInterval(() => {
      checkPersonalStoryStatus()
    }, 10000) // Check every 10 seconds to reduce API calls

    return () => clearInterval(interval)
  }, [hasPersonalStory])

  // More frequent check when user is active
  useEffect(() => {
    let activeInterval: NodeJS.Timeout
    
    const startActiveCheck = () => {
      activeInterval = setInterval(() => {
        checkPersonalStoryStatus()
      }, 5000) // Check every 5 seconds when active (reduced from 1 second)
    }
    
    const stopActiveCheck = () => {
      if (activeInterval) {
        clearInterval(activeInterval)
      }
    }

    // Start active checking when user interacts
    const handleUserActivity = () => {
      // User activity detected, starting active check
      stopActiveCheck()
      startActiveCheck()
      
      // Stop after 30 seconds of inactivity (increased from 15 seconds)
      setTimeout(stopActiveCheck, 30000)
    }

    document.addEventListener('mousemove', handleUserActivity)
    document.addEventListener('keypress', handleUserActivity)
    document.addEventListener('click', handleUserActivity)
    document.addEventListener('scroll', handleUserActivity)

    return () => {
      stopActiveCheck()
      document.removeEventListener('mousemove', handleUserActivity)
      document.removeEventListener('keypress', handleUserActivity)
      document.removeEventListener('click', handleUserActivity)
      document.removeEventListener('scroll', handleUserActivity)
    }
  }, [hasPersonalStory])

  // Removed redundant visibility change effect to reduce API calls

  // Function to discard all approved topics
  const handleDiscardAllApprovedTopics = async () => {
    if (approvedTopics.length === 0) return

    try {
      // Delete all approved topics from database
      const deletePromises = approvedTopics.map(topic => 
        fetch('/api/approved-topics', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topicId: topic._id }),
        })
      )

      await Promise.all(deletePromises)
      
      // Clear the local state
      setApprovedTopics([])
      
      toast({
        title: "All approved topics discarded",
        description: "All approved topics have been removed from your collection.",
      })
    } catch (error) {
      console.error('Error discarding approved topics:', error)
      toast({
        title: "Error",
        description: "Failed to discard approved topics. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to discard individual approved topic
  const handleDiscardApprovedTopic = async (topicId: string, topicTitle: string) => {
    try {
      console.log("Discarding topic - ID:", topicId, "Title:", topicTitle)
      
      const response = await fetch('/api/approved-topics', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topicId }),
      })
      
      console.log("Delete response status:", response.status)
      const responseData = await response.json()
      console.log("Delete response data:", responseData)

      if (response.ok) {
        // Remove from local state
        setApprovedTopics(prev => prev.filter(topic => topic._id !== topicId))
        
        toast({
          title: "Topic discarded",
          description: `"${topicTitle}" has been removed from your approved topics.`,
        })
      } else {
        throw new Error('Failed to delete topic')
      }
    } catch (error) {
      console.error('Error discarding approved topic:', error)
      toast({
        title: "Error",
        description: "Failed to discard topic. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to safely get content from topic
  const getTopicContent = (topic: Topic): string => {
    if (!topic.content) {
      return ""
    }
    if (Array.isArray(topic.content)) {
      return topic.content[0] || ""
    }
    return topic.content
  }

  // Function to update topic content
  const updateTopicContent = (topicId: string, newContent: string) => {
    setTopics(prevTopics => 
      prevTopics.map(topic => 
        topic.id === topicId 
          ? { ...topic, content: newContent }
          : topic
      )
    )
    
    // Also update recommended topics if needed
    setRecommendedTopics(prevTopics => 
      prevTopics.map(topic => 
        topic.id === topicId 
          ? { ...topic, content: newContent }
          : topic
      )
    )
  }

  const generateTopics = async () => {
    if (!topicPrompt.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Enter a topic to generate content ideas for.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Check credits before generating
      const creditResponse = await fetch("/api/billing/credits")
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        if (!creditData.isTrialActive && creditData.credits < 0.1) {
          toast({
            title: "Insufficient Credits",
            description: "You need at least 0.1 credits to generate topics. Please purchase more credits.",
            variant: "destructive",
          })
          window.location.href = "/dashboard/billing"
          return
        }
      }

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "topics",
          prompt: `Generate exactly 4 different ${contentType} topic ideas about: ${topicPrompt.trim()}. Each topic should be unique and engaging for LinkedIn professionals.`,
          provider: "openai",
          customization: {
            tone: customization.tone,
            language: customization.language,
            wordCount: 100, // Increased for better topic generation
            targetAudience: customization.targetAudience,
            mainGoal: customization.mainGoal,
            includeHashtags: customization.includeHashtags,
            includeEmojis: customization.includeEmojis,
            callToAction: customization.callToAction,
            temperature: customization.temperature,
            maxTokens: customization.maxTokens,
            niche: topicPrompt.trim(),
            contentType: contentType,
            topicCount: 3 // Explicitly request 3 topics
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate topics")
      }

      const data = await response.json()
      console.log("API Response:", data) // Debug log
      
      // Handle different response structures
      let topicsArray = []
      if (Array.isArray(data.data?.content)) {
        topicsArray = data.data.content
      } else if (Array.isArray(data.content)) {
        topicsArray = data.content
      } else if (Array.isArray(data.data)) {
        topicsArray = data.data
      } else if (Array.isArray(data)) {
        topicsArray = data
      }
      
      console.log("Topics Array:", topicsArray) // Debug log
      
      // Ensure we have exactly 3 topics
      if (topicsArray.length < 3) {
        // If we have fewer than 3 topics, create additional unique topics
        const baseTopic = topicPrompt.trim()
        const additionalTopics = [
          `${baseTopic}: Key Strategies and Best Practices`,
          `${baseTopic}: Future Trends and Predictions`,
          `${baseTopic}: Common Challenges and Solutions`
        ]
        
        // Add unique additional topics until we have 3
        let additionalIndex = 0
        while (topicsArray.length < 3 && additionalIndex < additionalTopics.length) {
          const newTopic = additionalTopics[additionalIndex]
          if (!topicsArray.includes(newTopic)) {
            topicsArray.push(newTopic)
          }
          additionalIndex++
        }
      }
      
      // If still no topics, create fallback topics
      if (topicsArray.length === 0) {
        const baseTopic = topicPrompt.trim()
        topicsArray = [
          `${baseTopic}: Key Strategies and Best Practices`,
          `${baseTopic}: Future Trends and Predictions`,
          `${baseTopic}: Common Challenges and Solutions`
        ]
      }
      
      const generatedTopics: Topic[] = topicsArray.slice(0, 3).map((title: string, index: number) => ({
            id: `topic-${Date.now()}-${index}`,
            title,
            viralChance: Math.floor(Math.random() * 40) + 60, // 60-100%
        niche: topicPrompt.trim(),
            status: "generated" as const,
          }))

      setTopics(generatedTopics)
      setShowTopicGenerator(false) // Hide the topic generator section
      setHasGeneratedTopics(true) // Mark that topics have been generated
      console.log("Generated topics:", generatedTopics) // Debug log
      toast({
        title: "Success!",
        description: `Generated 4 topics for ${contentType}`,
      })
    } catch (error) {
      console.error("Error generating topics:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate topics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateContentForTopic = async (topicTitle: string, topicId: string) => {
    setIsGenerating(true)

    try {
      console.log("Generating content for approved topic:", topicTitle)
      
      const creditResponse = await fetch("/api/billing/credits")
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        console.log("Credit data:", creditData)
        
        // Use the same credit check logic as the regular generateContent function
        if (!creditData.isTrialActive && creditData.credits < 0.3) {
          toast({
            title: "Insufficient Credits",
            description: "You need at least 0.3 credits to generate content. Please purchase more credits.",
            variant: "destructive",
          })
          setIsGenerating(false)
          return
        }
      } else {
        console.error("Failed to fetch credit data")
      }

      // Ensure we have a valid content type, default to "linkedin-post" if not set
      const validContentType = contentType || "linkedin-post"
      
      console.log("Sending content generation request...")
      console.log("Request payload:", {
        type: validContentType,
        prompt: topicTitle,
        provider,
        customization
      })
      
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: validContentType,
          prompt: topicTitle,
          provider,
          customization,
        }),
      })

      console.log("Content generation response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Content generation failed:", errorData)
        throw new Error(`Failed to generate content: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log("Content generation response data:", data)
      
      const content = data.data?.content || data.content || ""
      console.log("Generated content:", content)

      if (!content || content.length < 10) {
        console.log("Generated content is too short, creating fallback content")
        // Create fallback content based on the topic
        const fallbackContent = `${topicTitle}

This is an important topic that many professionals can relate to. In my experience, this has been a key factor in professional growth and development.

Key insights:
• Understanding the fundamentals is crucial
• Continuous learning and adaptation are essential
• Building strong relationships and networks matters
• Persistence and resilience lead to success

What are your thoughts on this topic? I'd love to hear your experiences and insights in the comments below.

#ProfessionalGrowth #CareerDevelopment #LinkedIn`

        // Create a topic object for the approved topic with fallback content
        const approvedTopic: Topic = {
          id: topicId,
          title: topicTitle,
          content: fallbackContent,
          category: "approved",
          description: "Approved topic from personal story (fallback content)",
          status: "generated"
        }

        // Add to topics list
        setTopics(prev => [approvedTopic, ...prev])
        setSelectedTopicId(topicId)
        setPreviewContent(fallbackContent)
        setShowPreview(true)

        toast({
          title: "Content Generated (Fallback)",
          description: "Generated fallback content for your approved topic.",
        })
        return
      }

      // Create a topic object for the approved topic
      const approvedTopic: Topic = {
        id: topicId,
        title: topicTitle,
        content: content,
        category: "approved",
        description: "Approved topic from personal story",
        status: "generated"
      }

      // Add to topics list
      setTopics(prev => [approvedTopic, ...prev])
      setSelectedTopicId(topicId)
      setPreviewContent(content)
      setShowPreview(true)

      toast({
        title: "Content Generated!",
        description: "Your content has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating content for approved topic:", error)
      
      // Create fallback content even if there's an error
      console.log("Creating fallback content due to error")
      const fallbackContent = `${topicTitle}

This is an important topic that many professionals can relate to. In my experience, this has been a key factor in professional growth and development.

Key insights:
• Understanding the fundamentals is crucial
• Continuous learning and adaptation are essential
• Building strong relationships and networks matters
• Persistence and resilience lead to success

What are your thoughts on this topic? I'd love to hear your experiences and insights in the comments below.

#ProfessionalGrowth #CareerDevelopment #LinkedIn`

      // Create a topic object for the approved topic with fallback content
      const approvedTopic: Topic = {
        id: topicId,
        title: topicTitle,
        content: fallbackContent,
        category: "approved",
        description: "Approved topic from personal story (fallback content)",
        status: "generated"
      }

      // Add to topics list
      setTopics(prev => [approvedTopic, ...prev])
      setSelectedTopicId(topicId)
      setPreviewContent(fallbackContent)
      setShowPreview(true)

      toast({
        title: "Content Generated (Fallback)",
        description: "Generated fallback content for your approved topic.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateContent = async (topic: Topic) => {
    setIsGenerating(true)

    try {
      const creditResponse = await fetch("/api/billing/credits")
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        if (!creditData.isTrialActive && creditData.credits < 0.3) {
          toast({
            title: "Insufficient Credits",
            description: "You need at least 0.3 credits to generate content. Please purchase more credits.",
            variant: "destructive",
          })
          window.location.href = "/dashboard/billing"
          return
        }
      }

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "linkedin-post",
          prompt: topic.title,
          provider: "openai",
          customization: {
            tone: customization.tone,
            language: customization.language,
            wordCount: customization.wordCount,
            targetAudience: customization.targetAudience,
            mainGoal: customization.mainGoal,
            includeHashtags: customization.includeHashtags,
            includeEmojis: customization.includeEmojis,
            callToAction: customization.callToAction,
            temperature: customization.temperature,
            maxTokens: customization.maxTokens,
            format: contentType,
            niche: topic.niche,
            variations: 4 // Generate 4 variations
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      const content = Array.isArray(data.data.content) ? data.data.content : [data.data.content]

      // Update topics (both regular and recommended)
      setTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format: contentType, status: "content-ready" as const }
          : t
      ))
      
      // Also update recommended topics if this is a recommended topic
      setRecommendedTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format: contentType, status: "content-ready" as const }
          : t
      ))
      
      // Also update personalized topics if this is a personalized topic
      setPersonalizedTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format: contentType, status: "content-ready" as const }
          : t
      ))

      // Set the selected topic and hide others
      setSelectedTopicId(topic.id)
      setShowCustomization(null)
      toast({
        title: "Success!",
        description: `Generated 4 LinkedIn posts for "${topic.title}"`,
      })
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Direct generation for recommended topics (bypasses customization)
  const generateRecommendedTopicContent = async (topic: Topic) => {
    console.log("Starting content generation for topic:", topic)
    console.log("Current topic status:", topic.status)
    setIsGenerating(true)

    try {
      const creditResponse = await fetch("/api/billing/credits")
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        if (!creditData.isTrialActive && creditData.credits < 0.3) {
          toast({
            title: "Insufficient Credits",
            description: "You need at least 0.3 credits to generate content. Please purchase more credits.",
            variant: "destructive",
          })
          window.location.href = "/dashboard/billing"
          return
        }
      }

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "linkedin-post",
          prompt: topic.title,
          provider: "openai",
          customization: {
            tone: "professional",
            language: "english",
            wordCount: 150,
            targetAudience: "LinkedIn professionals",
            mainGoal: "engagement",
            includeHashtags: true,
            includeEmojis: true,
            callToAction: true,
            temperature: 0.7,
            maxTokens: 1000,
            format: "linkedin-post",
            niche: topic.niche,
            variations: 4
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      console.log("Content generation response data:", data)
      
      const content = Array.isArray(data.data.content) ? data.data.content : [data.data.content]
      console.log("Processed content:", content)
      console.log("Content length:", content.length)

      // Update recommended topics
      setRecommendedTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format: "linkedin-post", status: "content-ready" as const }
          : t
      ))
      
      // Update personalized topics
      setPersonalizedTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format: "linkedin-post", status: "content-ready" as const }
          : t
      ))
      
      console.log("Updated topics with content")

      // Set the selected topic and hide others
      setSelectedTopicId(topic.id)
      toast({
        title: "Content Generated!",
        description: `Generated ${content.length} variations for "${topic.title}"`,
      })
    } catch (error) {
      console.error("Error generating content:", error)
      
      // Create fallback content if AI generation fails
      const fallbackContent = [`${topic.title}

This is an important topic that many professionals can relate to. In my experience, this has been a key factor in professional growth and development.

Key insights:
• Understanding the fundamentals is crucial
• Continuous learning and adaptation are essential  
• Building strong relationships and networks matters
• Persistence and resilience lead to success

What are your thoughts on this topic? I'd love to hear your experiences and insights in the comments below.

#ProfessionalGrowth #CareerDevelopment #LinkedIn`]

      // Update topics with fallback content
      setRecommendedTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: fallbackContent, format: "linkedin-post", status: "content-ready" as const }
          : t
      ))
      
      setPersonalizedTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: fallbackContent, format: "linkedin-post", status: "content-ready" as const }
          : t
      ))
      
      setSelectedTopicId(topic.id)
      
      toast({
        title: "Content Generated (Fallback)",
        description: "Generated fallback content for your topic.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const clearTopics = () => {
    setTopics([])
    setExpandedTopic(null)
    setShowTopicGenerator(true) // Show the topic generator section again
    setHasGeneratedTopics(false) // Reset the generated topics flag
    setSelectedTopicId(null) // Reset selected topic
  }

  const saveToDraft = async (content: string, title: string, format: string = "article") => {
    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          format,
          niche: "AI Generated",
        })
      })

      if (response.ok) {
        toast({
          title: "Draft Saved!",
          description: "Content has been saved to your drafts.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save draft. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-black/5 dark:from-black dark:via-blue-950/20 dark:to-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
        {/* Clean Header */}
        <motion.div 
          className="text-center py-12 sm:py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-black via-blue-600 to-secondary dark:from-white dark:via-blue-400 dark:to-secondary bg-clip-text text-transparent mb-4">
            AI Topic Generator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover trending topics and get instant inspiration for your next viral post
          </p>
        </motion.div>

        {/* Topic Categories - Desktop Only */}


        {/* Clean Topic Generator Input */}
        {showTopicGenerator && (
        <motion.div 
            className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="w-full sm:max-w-2xl">
              {/* Mobile Layout */}
              <div className="block sm:hidden space-y-8">
                <div className="w-full">
                  <Select value={contentType} onValueChange={(value: "caseStudy" | "descriptive" | "list" | "story") => setContentType(value)}>
                    <SelectTrigger className="w-full h-20 border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-black">
                      <div className="flex items-center gap-3">
                        <PenTool className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caseStudy">Case Study</SelectItem>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <Input
                    placeholder="Enter a topic or keyword..."
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    className="w-full h-32 px-8 text-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && generateTopics()}
                  />
                  
          <Button 
                    onClick={generateTopics}
                    disabled={!topicPrompt.trim() || isGenerating}
                    className="w-full h-16 px-8 bg-blue-500 hover:bg-blue-600 text-white text-lg"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Generate"
                    )}
          </Button>
          </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-center border-2 border-blue-200 dark:border-blue-800 rounded-2xl overflow-hidden bg-white dark:bg-black shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:shadow-lg">
                <div className="flex-shrink-0">
                  <Select value={contentType} onValueChange={(value: "caseStudy" | "descriptive" | "list" | "story") => setContentType(value)}>
                      <SelectTrigger className="w-48 h-20 border-0 bg-transparent focus:ring-0">
                      <div className="flex items-center gap-2">
                          <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caseStudy">Case Study</SelectItem>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Input
                    placeholder="Enter a topic or keyword..."
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                      className="h-20 px-6 text-lg border-0 focus-visible:ring-0 bg-transparent text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && generateTopics()}
                  />
                </div>
                
                  <div className="flex-shrink-0 p-3">
                  <Button
                    onClick={generateTopics}
                    disabled={!topicPrompt.trim() || isGenerating}
                      className="h-12 px-8 bg-blue-500 hover:bg-blue-600 text-white text-lg"
                  >
                    {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Approved Topics Section */}
        {showTopicGenerator && approvedTopics.length > 0 && (
          <motion.div 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-blue-500/10 to-secondary/10 dark:from-blue-950/20 dark:to-secondary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      Approved Topics
                  </CardTitle>
                    <CardDescription className="mt-2">
                      Topics approved from your personal stories
                  </CardDescription>
                  </div>
                  {approvedTopics.length > 0 && (
                  <Button
                      onClick={handleDiscardAllApprovedTopics}
                    variant="outline"
                    size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Discard All
                  </Button>
                  )}
                </div>
                </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-6">
                  {approvedTopics.map((topic, index) => (
                    <motion.div
                      key={topic._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group"
                    >
                      <Card className="bg-white dark:bg-black border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-blue-500 text-white">
                                Approved
                              </Badge>
                              <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                                From Story
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors self-start">
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-xs sm:text-sm font-medium">Generate Content</span>
                            </div>
                          </div>
                          
                          <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                            {topic.title}
                          </h3>
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                            <Button
                              onClick={() => {
                                console.log("Generating content for approved topic:", topic.title)
                                generateContentForTopic(topic.title, `approved-${topic._id || index}`)
                              }}
                              disabled={isGenerating}
                              className="flex-1 h-9 sm:h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base"
                            >
                              {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                              )}
                              Generate Content
                            </Button>
                            
                            <Button
                              onClick={() => handleDiscardApprovedTopic(topic._id, topic.title)}
                              variant="outline"
                              size="sm"
                              className="h-9 sm:h-10 px-3 sm:px-4 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                            >
                              <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Discard</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Recommended Topics Section */}
          {showTopicGenerator && (hasPersonalStory ? personalizedTopics.length > 0 : recommendedTopics.length > 0) && (
          <motion.div 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      {hasPersonalStory ? "Personalized Topics" : "Recommended Topics"}
                  </CardTitle>
                  </div>
                </div>
                </CardHeader>
              <CardContent className="p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {(hasPersonalStory ? personalizedTopics : recommendedTopics).map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group relative bg-white dark:bg-black border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 sm:p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      <div className="space-y-3 sm:space-y-4 flex-1">
                          <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-base sm:text-lg leading-tight text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                            {topic.title}
                          </h3>
                          <Badge className="bg-gradient-to-r from-blue-100 to-secondary/20 dark:from-blue-900/50 dark:to-secondary/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs flex-shrink-0">
                              {topic.viralChance}% viral
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {topic.niche}
                          </Badge>
                            <Badge variant={topic.status === "content-ready" ? "default" : "outline"} className={`text-xs ${topic.status === "content-ready" ? "bg-gradient-to-r from-blue-500 to-secondary text-white" : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"}`}>
                            {topic.status === "content-ready" ? "Content Ready" : "Ready to Generate"}
                            </Badge>
                          </div>

                        {/* Generate Button - Mobile: Always visible, Desktop: Hover */}
                          {topic.status === "generated" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 mt-4"
                          >
                              <Button
                                onClick={() => generateRecommendedTopicContent(topic)}
                                size="sm"
                              className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white"
                                disabled={isGenerating}
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Content
                                  </>
                                )}
                              </Button>
                          </motion.div>
                          )}

                        {/* Generate Button for Mobile - Always visible when not content-ready */}
                          {topic.status !== "content-ready" && (
                          <div className="block sm:hidden mt-4">
                              <Button
                                onClick={() => generateRecommendedTopicContent(topic)}
                                size="sm"
                              className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white"
                                disabled={isGenerating}
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Content
                                  </>
                                )}
                              </Button>
                          </div>
                          )}

                          {/* Generated Content Display */}
                          {topic.status === "content-ready" && topic.content && (
                          <div className="space-y-3 sm:space-y-4 mt-4">
                              <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="default" className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                {topic.format}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">4 variations generated</span>
                              </div>
                              
                              {Array.isArray(topic.content) ? (
                              <div className="grid grid-cols-1 gap-3">
                                  {topic.content.map((content, index) => (
                                  <div key={index} className="p-3 sm:p-4 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                                    <div className="flex items-start justify-between mb-3">
                                        <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">Post {index + 1}</Badge>
                                      </div>
                                    <p className="text-xs sm:text-sm text-black dark:text-white line-clamp-3 leading-relaxed mb-4 break-words">
                                        {content}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                        className="flex-1 text-xs h-8 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                                          onClick={() => {
                                            setPreviewContent(content)
                                            setPreviewingTopicId(topic.id)
                                          }}
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          Preview
                                        </Button>
                                        <Button 
                                          size="sm"
                                        className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white"
                                          onClick={() => saveToDraft(content, `${topic.title} - Post ${index + 1}`, "linkedin-post")}
                                        >
                                          <Save className="w-3 h-3 mr-1" />
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                              <div className="p-3 sm:p-4 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                                <p className="text-xs sm:text-sm text-black dark:text-white line-clamp-3 leading-relaxed mb-4 break-words">
                                    {getTopicContent(topic)}
                                  </p>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                    className="flex-1 text-xs h-8 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                                      onClick={() => {
                                        setPreviewContent(getTopicContent(topic))
                                        setPreviewingTopicId(topic.id)
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      Preview
                                    </Button>
                                    <Button 
                                      size="sm"
                                    className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white"
                                      onClick={() => saveToDraft(getTopicContent(topic), topic.title, "linkedin-post")}
                                    >
                                      <Save className="w-3 h-3 mr-1" />
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                    </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </motion.div>
          )}

        {/* Enhanced Generated Topics */}
          {topics.length > 0 && (
          <motion.div 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50/50 to-secondary/20 dark:from-teal-950/50 dark:to-secondary/10 border-b border-teal-200/50 dark:border-teal-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl text-black dark:text-white">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-secondary rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      Your Generated Topics
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                      Click on any topic to generate content or customize your preferences
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearTopics} 
                    className="gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  {(() => {
                    const filteredTopics = topics.filter(topic => {
                      if (!selectedTopicId) return true
                      return topic.id === selectedTopicId
                    })
                    return filteredTopics
                  })()
                    .sort((a, b) => {
                      if (selectedTopicId) {
                        if (a.id === selectedTopicId) return -1
                        if (b.id === selectedTopicId) return 1
                      }
                      return 0
                    })
                    .map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        <div className="space-y-3 sm:space-y-4 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-base sm:text-lg leading-tight text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                              {topic.title}
                            </h3>
                            <Badge className="bg-gradient-to-r from-blue-100 to-blue-100 text-blue-700 border-blue-200 text-xs flex-shrink-0">
                            {topic.viralChance}% viral
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {topic.niche}
                            </Badge>
                            <Badge variant={topic.status === "content-ready" ? "default" : "outline"} className="text-xs">
                              {topic.status === "content-ready" ? "Content Ready" : "Ready to Generate"}
                            </Badge>
                        </div>

                          {/* Generate Button - Mobile: Always visible, Desktop: Hover */}
                        {topic.status === "generated" && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              className="hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 mt-4"
                            >
                        <Button
                              onClick={() => setShowCustomization(topic.id)}
                          size="sm"
                                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Content
                        </Button>
                            </motion.div>
                        )}

                        {/* Generated Content Display */}
                        {topic.status === "content-ready" && topic.content && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
                                  {topic.format}
                                </Badge>
                                <span className="text-xs text-gray-500">4 variations generated</span>
                              </div>
                            
                              {Array.isArray(topic.content) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {topic.content.map((content, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                                      <div className="flex items-start justify-between mb-3">
                                      <Badge variant="outline" className="text-xs">Post {index + 1}</Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                                          {content}
                                        </p>
                                    <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                          className="flex-1 text-xs h-8 border-blue-200 hover:bg-blue-50"
                                            onClick={() => {
                                              setPreviewContent(content)
                                              setPreviewingTopicId(topic.id)
                                            }}
                                          >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Preview
                                          </Button>
                                      <Button 
                                        size="sm"
                                          className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                        onClick={() => saveToDraft(content, `${topic.title} - Post ${index + 1}`, "linkedin-post")}
                                      >
                                        <Save className="w-3 h-3 mr-1" />
                                        Save
                                      </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                                        {getTopicContent(topic)}
                                      </p>
                                <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                      className="flex-1 text-xs h-8 border-blue-200 hover:bg-blue-50"
                                          onClick={() => {
                                            setPreviewContent(getTopicContent(topic))
                                            setPreviewingTopicId(topic.id)
                                          }}
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          Preview
                                        </Button>
                                  <Button 
                                    size="sm"
                                      className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                    onClick={() => saveToDraft(getTopicContent(topic), topic.title, "linkedin-post")}
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            )}
                                      </div>
                        )}
                                    </div>
                      </motion.div>
                  ))}
                </div>
              </CardContent>
              </Card>
          </motion.div>
                              )}
                            </div>

        {/* Background Blur Overlay */}
        {showCustomization && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
        )}

        {/* Customization Panel */}
        {showCustomization && (
          <Card className="fixed inset-x-4 bottom-4 z-50 max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Customize Content Generation
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomization(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                              </div>
              <CardDescription>
                Customize the tone, style, and format for your LinkedIn posts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AICustomizationPanel
                customization={customization}
                onCustomizationChange={setCustomization}
                contentType="linkedin-post"
                onContentTypeChange={() => {}}
                showAdvanced={false}
                onToggleAdvanced={() => {}}
              />
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomization(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Check both regular topics and recommended topics
                    let topic = topics.find(t => t.id === showCustomization)
                    if (!topic) {
                      topic = recommendedTopics.find(t => t.id === showCustomization)
                    }
                    if (topic) {
                      generateContent(topic)
                    }
                  }}
                  disabled={isGenerating}
                  className="flex-1"
                >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                      Generate Posts
                                  </>
                                )}
                              </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* LinkedIn Preview Modal */}
        {previewContent && (
          <LinkedInPreview
            content={previewContent}
            onSaveToDraft={saveToDraft}
            onClose={() => {
              setPreviewContent(null)
              setPreviewingTopicId(null)
            }}
            onContentUpdate={(newContent) => {
              setPreviewContent(newContent)
              if (previewingTopicId) {
                updateTopicContent(previewingTopicId, newContent)
              }
            }}
          />
        )}
    </div>
  )
}