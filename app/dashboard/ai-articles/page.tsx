"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, X, Eye, Settings, PenTool, CheckCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EnhancedLinkedInPreview } from "@/components/enhanced-linkedin-preview"
import { AICustomizationPanel, type CustomizationOptions } from "@/components/ai-customization-panel"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { ProcessingOverlay } from "@/components/processing-overlay"

// Predefined recommended topics
// const allRecommendedTopics = [
//   "The Future of Remote Work: Trends and Predictions",
//   "Building a Personal Brand on LinkedIn: A Complete Guide",
//   "AI in Marketing: How Technology is Changing the Game",
//   "Leadership Lessons from Successful Entrepreneurs",
//   "Digital Transformation: What Every Business Needs to Know",
//   "Mental Health in the Workplace: Creating Supportive Environments",
//   "Sustainable Business Practices: Going Green for Growth",
//   "The Rise of Freelancing: Building a Successful Gig Economy Career",
//   "Data-Driven Decision Making: Analytics for Business Success",
//   "Customer Experience: The Key to Business Growth",
//   "Innovation in Traditional Industries: Modernizing Old Business Models",
//   "Work-Life Balance: Strategies for the Modern Professional",
//   "Social Media Marketing: Best Practices for 2024",
//   "Cybersecurity for Small Businesses: Essential Protection Strategies",
//   "The Psychology of Sales: Understanding Customer Behavior",
//   "Team Building in Virtual Environments: Remote Collaboration Tips",
//   "Financial Planning for Entrepreneurs: Managing Business Finances",
//   "Content Marketing Strategies: Creating Engaging Brand Stories",
//   "Diversity and Inclusion: Building Better Workplaces",
//   "E-commerce Trends: The Future of Online Shopping",
//   "Productivity Hacks: Maximizing Efficiency in the Digital Age",
//   "Startup Funding: Navigating the Investment Landscape",
//   "Customer Retention: Building Long-Term Business Relationships",
//   "Technology Adoption: Embracing Change in the Workplace",
//   "Personal Development: Skills Every Professional Should Master",
// ]

interface Topic {
  id: string
  title: string
  viralChance: number
  niche: string
  format?: string
  content?: string | string[]
  status: "generated" | "content-ready" | "expanded"
  isPersonalized?: boolean
  storyTopicId?: string // Store original ID for story-content API
}

export default function AIArticlesPage() {
  const { data: session } = useSession()
  const [topicPrompt, setTopicPrompt] = useState("")
  const [contentType, setContentType] = useState<"caseStudy" | "descriptive" | "list" | "story">("caseStudy")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null)
  const [contentVariationCounter, setContentVariationCounter] = useState(0)
  const [topics, setTopics] = useState<Topic[]>([])
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewingTopicId, setPreviewingTopicId] = useState<string | null>(null)
  const [showCustomization, setShowCustomization] = useState<string | null>(null)
  const [showTopicGenerator, setShowTopicGenerator] = useState(true)
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai")
  // const [recommendedTopics, setRecommendedTopics] = useState<Topic[]>([])
  const [personalizedTopics, setPersonalizedTopics] = useState<Topic[]>([])
  const [allPersonalizedTopics, setAllPersonalizedTopics] = useState<Topic[]>([]) // Store all 20 topics
  const [hasPersonalStory, setHasPersonalStory] = useState(false)
  const [isRefreshingTopics, setIsRefreshingTopics] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [hasGeneratedTopics, setHasGeneratedTopics] = useState(false)
  const [approvedTopics, setApprovedTopics] = useState<any[]>([])

  // State for managing content generation for individual topics
  const [isGeneratingContent, setIsGeneratingContent] = useState<{ [key: string]: boolean }>({})
  const [generatedContents, setGeneratedContents] = useState<{ topicId: string; content: string }[]>([])
  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)

  const [isFirstLoad, setIsFirstLoad] = useState(true)

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
  // const generateRandomRecommendedTopics = () => {
  //   const shuffled = [...allRecommendedTopics].sort(() => Math.random() - 0.5)
  //   const selected = shuffled.slice(0, 10).map((title, index) => ({
  //     id: `recommended-${Date.now()}-${index}`,
  //     title,
  //     viralChance: Math.floor(Math.random() * 40) + 60, // 60-100%
  //     niche: "Recommended",
  //     status: "generated" as const,
  //     isPersonalized: false,
  //   }))
  //   setRecommendedTopics(selected)
  // }

  // Function to shuffle and select topics from all personalized topics
  const shuffleAndSelectTopics = (allTopics: Topic[], count = 6) => {
    const shuffled = [...allTopics].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Function to fetch personalized topics based on personal story
  const fetchPersonalizedTopics = async () => {
    try {
      setIsRefreshingTopics(true)
      console.log("Fetching personalized topics from story...")

      const response = await fetch("/api/story-topics", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.topics) {
          // Convert story topics to the format expected by the UI
          const formattedTopics = data.topics.map((topic: any) => ({
            id: topic._id || topic.id,
            storyTopicId: topic._id || topic.id, // Store original ID for story-content API
            title: topic.topicText,
            viralChance: Math.floor(Math.random() * 30) + 70, // 70-100% for story-based topics
            niche: "Personal Story",
            status: "generated" as const,
            isPersonalized: true,
          }))

          // Store all topics
          setAllPersonalizedTopics(formattedTopics)
          // Shuffle and select 6 topics for display
          const shuffledTopics = shuffleAndSelectTopics(formattedTopics, 6)
          setPersonalizedTopics(shuffledTopics)
          setHasPersonalStory(true)

          if (isFirstLoad && formattedTopics.length > 0) {
            toast({
              title: "Topics Ready!",
              description: `${formattedTopics.length} personalized topics generated from your story`,
            })
            setIsFirstLoad(false)
          }
        } else {
          setHasPersonalStory(false)
          setPersonalizedTopics([])
          setAllPersonalizedTopics([])
        }
      } else {
        setHasPersonalStory(false)
        setPersonalizedTopics([])
        setAllPersonalizedTopics([])
      }
    } catch (error) {
      console.error("Error fetching personalized topics:", error)
      setHasPersonalStory(false)
      setPersonalizedTopics([])
      setAllPersonalizedTopics([])
    } finally {
      setIsRefreshingTopics(false)
    }
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

  const handleRegenerateTopics = async () => {
    try {
      setIsRefreshingTopics(true)
      console.log("Regenerating personalized topics...")

      const response = await fetch("/api/story-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newTopics = data.topics.map((topic: any) => ({
          id: topic._id || topic.id,
          title: topic.topicText || topic.title,
          viralChance: Math.floor(Math.random() * 30) + 70,
          niche: "Personal Story",
          status: "generated" as const,
          isPersonalized: true,
          storyTopicId: topic._id || topic.id,
        }))

        setAllPersonalizedTopics(newTopics)
        setPersonalizedTopics(newTopics) // Directly set personalizedTopics to newTopics
        setHasPersonalStory(true)

        toast({
          title: "Topics Regenerated",
          description: `${newTopics.length} new topics generated from your personal story`,
        })
      } else {
        throw new Error("Failed to regenerate topics")
      }
    } catch (error) {
      console.error("Error regenerating topics:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate topics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshingTopics(false)
    }
  }

  // Function to check if user has a personal story (without loading topics)
  const checkPersonalStoryExists = async () => {
    try {
      const response = await fetch("/api/story-topics", {
        method: "GET",
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.topics && data.topics.length > 0) {
          setHasPersonalStory(true)
        } else {
          setHasPersonalStory(false)
        }
      } else {
        setHasPersonalStory(false)
      }
    } catch (error) {
      console.error("Error checking personal story:", error)
      setHasPersonalStory(false)
    }
  }

  useEffect(() => {
    console.log("=== TOPIC GENERATOR INITIALIZED ===")
    // Check if user has personal story without loading topics
    checkPersonalStoryExists()

    // Fetch approved topics from story system
    const fetchApprovedTopics = async () => {
      try {
        const response = await fetch("/api/approved-topics")
        if (response.ok) {
          const data = await response.json()
          setApprovedTopics(data.approvedTopics || [])
          console.log("Fetched approved topics:", data.approvedTopics?.length || 0)
        }
      } catch (error) {
        console.error("Error fetching approved topics:", error)
      }
    }

    fetchApprovedTopics()
  }, []) // Empty dependency array - runs only once on mount

  // Function to discard all approved topics
  const handleDiscardAllApprovedTopics = async () => {
    if (approvedTopics.length === 0) return

    try {
      // Delete all approved topics from database
      const deletePromises = approvedTopics.map((topic) =>
        fetch("/api/approved-topics", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topicId: topic._id }),
        }),
      )

      await Promise.all(deletePromises)

      // Clear the local state
      setApprovedTopics([])

      toast({
        title: "All approved topics discarded",
        description: "All approved topics have been removed from your collection.",
      })
    } catch (error) {
      console.error("Error discarding approved topics:", error)
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
      console.log("Topic ID type:", typeof topicId)
      console.log("Topic ID length:", topicId?.length)

      const response = await fetch("/api/approved-topics", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topicId }),
      })

      console.log("Delete response status:", response.status)
      
      // Check if response has content before parsing JSON
      const responseText = await response.text()
      console.log("Delete response text:", responseText)
      
      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError)
        responseData = { error: "Invalid response format" }
      }
      
      console.log("Delete response data:", responseData)

      if (response.ok) {
        // Remove from local state
        setApprovedTopics((prev) => prev.filter((topic) => topic._id !== topicId))

        toast({
          title: "Topic discarded",
          description: `"${topicTitle}" has been removed from your approved topics.`,
        })
      } else {
        const errorMessage = (responseData as any).error || `Server returned status ${response.status}`
        throw new Error(`Failed to delete topic: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Error discarding approved topic:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to discard topic: ${errorMessage}`,
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
    setTopics((prevTopics) =>
      prevTopics.map((topic) => (topic.id === topicId ? { ...topic, content: newContent } : topic)),
    )

    // Also update recommended topics if needed
    // setRecommendedTopics((prevTopics) =>
    //   prevTopics.map((topic) => (topic.id === topicId ? { ...topic, content: newContent } : topic)),
    // )
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
            topicCount: 3, // Explicitly request 3 topics
          },
        }),
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          const responseText = await response.text()
          console.log("Raw error response:", responseText)

          if (responseText) {
            try {
              errorData = JSON.parse(responseText)
            } catch (jsonError) {
              console.error("Failed to parse JSON error response:", jsonError)
              errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` }
            }
          } else {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        console.error("Topic generation failed:", errorData)
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorData?.details ||
          `HTTP ${response.status}: ${response.statusText}`
        throw new Error(`Topic generation failed: ${errorMessage}`)
      }

      const data = await response.json()
      console.log("API Response:", data) // Debug log

      // Handle different response structures
      let topicsArray = []
      if (data.data && Array.isArray(data.data.content)) {
        topicsArray = data.data.content
      } else if (Array.isArray(data.content)) {
        topicsArray = data.content
      } else if (Array.isArray(data.data)) {
        topicsArray = data.data
      } else if (Array.isArray(data)) {
        topicsArray = data
      }

      console.log("Topics Array:", topicsArray) // Debug log

      // Ensure we have exactly 4 topics
      if (topicsArray.length < 4) {
        // If we have fewer than 4 topics, create additional unique topics
        const baseTopic = topicPrompt.trim()
        const additionalTopics = [
          `${baseTopic}: Key Strategies and Best Practices`,
          `${baseTopic}: Future Trends and Predictions`,
          `${baseTopic}: Common Challenges and Solutions`,
          `${baseTopic}: Expert Insights and Advice`, // Added one more for variety
        ]

        // Add unique additional topics until we have 4
        let additionalIndex = 0
        while (topicsArray.length < 4 && additionalIndex < additionalTopics.length) {
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
          `${baseTopic}: Common Challenges and Solutions`,
          `${baseTopic}: Expert Insights and Advice`,
        ]
      }

      const generatedTopics: Topic[] = topicsArray.slice(0, 4).map((title: string, index: number) => ({
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
    setGeneratingTopicId(topicId)

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

      // Map content types to valid API content types
      const getValidContentType = (type: string): string => {
        switch (type) {
          case "caseStudy":
            return "story"
          case "descriptive":
            return "article"
          case "list":
            return "list"
          case "story":
            return "story"
          default:
            return "linkedin-post"
        }
      }

      const validContentType = getValidContentType(contentType)

      // Create highly varied, topic-specific prompts for maximum uniqueness
      const timestamp = Date.now()
      const randomSeed = Math.random().toString(36).substring(7)
      const variationStrategies = [
        "Share a personal experience related to this topic",
        "Provide actionable insights and practical tips",
        "Discuss common challenges and solutions",
        "Share industry trends and future outlook",
        "Tell a story that illustrates key concepts",
        "Provide data-driven insights and statistics",
        "Share lessons learned from real-world scenarios",
        "Discuss best practices and expert advice",
      ]

      const randomStrategy = variationStrategies[Math.floor(Math.random() * variationStrategies.length)]
      const contentAngles = [
        "from a beginner's perspective",
        "from an expert's viewpoint",
        "with real-world examples",
        "focusing on common mistakes",
        "highlighting success stories",
        "with actionable takeaways",
        "using industry insights",
        "with personal anecdotes",
      ]

      const randomAngle = contentAngles[Math.floor(Math.random() * contentAngles.length)]

      const enhancedPrompt = `Create a medium-length, professional LinkedIn post about: ${topicTitle}

Approach: ${randomStrategy} ${randomAngle}

Requirements:
- Keep it medium-length and professional (not too short, not too long)
- Tone must be direct, concise, and professional
- Share 1-2 actionable insights or key takeaways related to the topic
- Use clean formatting with proper spacing for LinkedIn readability
- Add minimal icons (1-2 where relevant) to highlight key points
- End with relevant hashtags only (3-5 hashtags, no extra text)
- Make it highly relevant to the topic: ${topicTitle}

FORMATTING RULES:
- NO conversation starters
- NO engagement prompts like "What do you think?"
- NO fluff or unnecessary content
- NO "Thank you for reading" or similar phrases
- NO "Join the conversation" or comment requests
- NO P.S. sections or extra content
- Just professional content + 3-5 relevant hashtags
- Keep it clean, direct, and well-formatted

Context ID: ${timestamp}-${randomSeed}
Variation #${contentVariationCounter + 1}
Create medium-length, professional content with actionable insights.`

      // Use more professional tones for better content
      const tones = ["professional", "authoritative", "direct", "insightful"]
      const randomTone = tones[Math.floor(Math.random() * tones.length)]

      // Enhance customization for maximum variety and topic-specific content
      const enhancedCustomization = {
        ...customization,
        temperature: 0.9, // High temperature for creativity (reduced from 1.3)
        randomness: 80, // Good randomness for variety
        humanLike: false, // More professional, less human-like
        personalTouch: false, // Less personal touch for professional tone
        storytelling: false, // Less storytelling for concise content
        emotionalDepth: 40, // Lower emotional depth for professional tone
        conversationalStyle: false, // Less conversational for professional tone
        wordCount: 180, // Medium-length content (not too short, not too long)
        mainGoal: "engagement", // Focus on engagement
        ambiguity: 30, // Lower ambiguity for more direct, professional content
        maxTokens: 800, // Medium-length content with adequate tokens
        tone: randomTone, // Random tone for variety
        targetAudience: "LinkedIn professionals interested in this specific topic",
        niche: topicTitle, // Use topic as niche for better relevance
        includeHashtags: true,
        includeEmojis: true, // Minimal icons (1-2) where relevant
        callToAction: false, // No call to action for clean professional posts
      }

      console.log("Sending content generation request...")
      console.log("Request payload:", {
        type: validContentType,
        prompt: enhancedPrompt,
        provider,
        customization: enhancedCustomization,
      })
      console.log("Enhanced prompt:", enhancedPrompt)
      console.log("Enhanced customization:", enhancedCustomization)

      const response = await fetch("/api/ai/generate-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: validContentType,
          topicTitle: topicTitle, // Use topicTitle instead of prompt
          provider,
          customization: enhancedCustomization,
          // userEmail is automatically included by the API from session
        }),
      })

      console.log("Content generation response status:", response.status)

      if (!response.ok) {
        let errorData: any = {}
        try {
          const responseText = await response.text()
          console.log("Raw error response:", responseText)

          if (responseText) {
            try {
              errorData = JSON.parse(responseText)
            } catch (jsonError) {
              console.error("Failed to parse JSON error response:", jsonError)
              errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` }
            }
          } else {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        console.error("Content generation failed:", errorData)
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorData?.details ||
          `HTTP ${response.status}: ${response.statusText}`
        throw new Error(`Content generation failed: ${errorMessage}`)
      }

      const data = await response.json()
      console.log("Content generation response data:", data)

      // Better content extraction logic
      let content = ""
      if (data.data) {
        if (Array.isArray(data.data.content)) {
          content = data.data.content[0] || data.data.content.join("\n\n")
        } else {
          content = data.data.content || ""
        }
      } else if (data.content) {
        if (Array.isArray(data.content)) {
          content = data.content[0] || data.content.join("\n\n")
        } else {
          content = data.content || ""
        }
      } else if (data.text) {
        content = data.text
      }

      console.log("Extracted content:", content)
      console.log("Content length:", content.length)

      // Clean unwanted content endings
      if (content) {
        content = content
          .replace(/\n*Join the conversation\.?\s*/gi, "")
          .replace(/\n*\[End of story\]\s*/gi, "")
          .replace(/\n*P\.S\.\s*.*$/gi, "")
          .replace(/\n*Join the discussion\.?\s*/gi, "")
          .replace(/\n*What do you think\?.*$/gi, "")
          .replace(/\n*Let me know your thoughts.*$/gi, "")
          .replace(/\n*Share your experience.*$/gi, "")
          .replace(/\n*Thank you for reading!.*$/gi, "")
          .replace(/\n*If you've experienced something similar.*$/gi, "")
          .replace(/\n*I'd love to hear it in the comments.*$/gi, "")
          .replace(/\n*I'd love to hear your thoughts.*$/gi, "")
          .replace(/\n*Feel free to share your experience.*$/gi, "")
          .replace(/\n*What's your take on this\?.*$/gi, "")
          .replace(/\n*Drop your thoughts below.*$/gi, "")
          .replace(/\n*Let's discuss in the comments.*$/gi, "")
          .replace(/\n*Share your story below.*$/gi, "")
          .replace(/\n*I'd love to hear from you.*$/gi, "")
          .replace(/\n*What do you think\?.*$/gi, "")
          .replace(/\n*Your thoughts\?.*$/gi, "")
          .trim()

        console.log("Cleaned content:", content)
      }

      if (!content || content.length < 10) {
        console.log("Generated content is too short, creating topic-specific fallback content")
        // Create topic-specific fallback content
        const fallbackContent = `I've been thinking about ${topicTitle} lately, and it's fascinating how this topic impacts our professional lives.

Here are some insights I've gathered:

• The key to success in this area is understanding the core principles
• Many professionals overlook the importance of continuous learning
• Building expertise takes time, but the results are worth it
• Sharing knowledge with others accelerates everyone's growth

The journey of mastering ${topicTitle} is both challenging and rewarding. Every professional's path is unique, but the principles remain constant.

#ProfessionalGrowth #Learning #LinkedIn`

        // Create a topic object for the approved topic with fallback content
        const approvedTopic: Topic = {
          id: topicId,
          title: topicTitle,
          content: fallbackContent,
          viralChance: 75,
          niche: "Approved Topic",
          status: "generated",
        }

        // Add to topics list
        setTopics((prev) => [approvedTopic, ...prev])
        setSelectedTopicId(topicId)
        setPreviewContent(fallbackContent)
        setPreviewingTopicId(topicId)

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
        viralChance: 75,
        niche: "Approved Topic",
        status: "generated",
      }

      // Add to topics list
      setTopics((prev) => [approvedTopic, ...prev])
      setSelectedTopicId(topicId)
      setPreviewContent(content)
      setPreviewingTopicId(topicId)

      toast({
        title: "Content Generated!",
        description: "Your unique content has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating content for approved topic:", error)

      // Create fallback content even if there's an error
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.log("Creating fallback content due to error:", errorMessage)

      // Show user-friendly error message
      toast({
        title: "Content Generation Failed",
        description: `Failed to generate content: ${errorMessage}. Using fallback content instead.`,
        variant: "destructive",
      })
      const fallbackContent = `I've been thinking about ${topicTitle} lately, and it's fascinating how this topic impacts our professional lives.

Here are some insights I've gathered:

• The key to success in this area is understanding the core principles
• Many professionals overlook the importance of continuous learning
• Building expertise takes time, but the results are worth it
• Sharing knowledge with others accelerates everyone's growth

The journey of mastering ${topicTitle} is both challenging and rewarding. Every professional's path is unique, but the principles remain constant.

#ProfessionalGrowth #Learning #LinkedIn`

      // Create a topic object for the approved topic with fallback content
      const approvedTopic: Topic = {
        id: topicId,
        title: topicTitle,
        content: fallbackContent,
        viralChance: 75,
        niche: "Approved Topic",
        status: "generated",
      }

      // Add to topics list
      setTopics((prev) => [approvedTopic, ...prev])
      setSelectedTopicId(topicId)
      setPreviewContent(fallbackContent)
      setPreviewingTopicId(topicId)

      toast({
        title: "Content Generated (Fallback)",
        description: "Generated fallback content for your approved topic.",
      })
    } finally {
      setIsGenerating(false)
      setGeneratingTopicId(null)
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
            model: "gpt-3.5-turbo", // Use free model
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
            variations: 4, // Generate 4 variations
          },
        }),
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          const responseText = await response.text()
          console.log("Raw error response:", responseText)

          if (responseText) {
            try {
              errorData = JSON.parse(responseText)
            } catch (jsonError) {
              console.error("Failed to parse JSON error response:", jsonError)
              errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` }
            }
          } else {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        console.error("Content generation failed:", errorData)
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorData?.details ||
          `HTTP ${response.status}: ${response.statusText}`
        throw new Error(`Content generation failed: ${errorMessage}`)
      }

      const data = await response.json()
      const content = Array.isArray(data.data.content) ? data.data.content : [data.data.content]

      // Update topics (both regular and recommended)
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id ? { ...t, content: content, format: contentType, status: "content-ready" as const } : t,
        ),
      )

      // Also update recommended topics if this is a recommended topic
      // setRecommendedTopics((prev) =>
      //   prev.map((t) =>
      //     t.id === topic.id ? { ...t, content: content, format: contentType, status: "content-ready" as const } : t,
      //   ),
      // )

      // Also update personalized topics if this is a personalized topic
      setPersonalizedTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id ? { ...t, content: content, format: contentType, status: "content-ready" as const } : t,
        ),
      )

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
    // Changed to accept Topic object
    console.log("Starting content generation for topic:", topic)
    setIsGeneratingContent((prev) => ({ ...prev, [topic.id]: true })) // Set generating state for this topic

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
      } else {
        console.error("Failed to fetch credit data")
      }

      if (topic.isPersonalized && topic.storyTopicId) {
        console.log("[v0] Found personalized topic, using story-content API")
        console.log("[v0] Story Topic ID:", topic.storyTopicId)
        console.log("[v0] Topic Title:", topic.title)

        const response = await fetch("/api/story-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicText: topic.title, // Use topic title as topicText for direct generation
            contentType: "linkedin-post",
          }),
        })

        if (!response.ok) {
          const responseText = await response.text()
          let errorData = {}
          try {
            errorData = responseText ? JSON.parse(responseText) : {}
          } catch (parseError) {
            console.error("Failed to parse error response JSON:", parseError)
          }
          console.error("Story content generation failed:", errorData)
          throw new Error((errorData as any).error || "Failed to generate content from personal story")
        }

        const data = await response.json()
        console.log("[v0] Story content generation response:", data)

        if (data.success && data.content) {
          // Format the content as an array for consistency
          const contentArray = [data.content.content]

          // Update personalized topics
          setPersonalizedTopics((prev) =>
            prev.map((t) =>
              t.id === topic.id
                ? { ...t, content: contentArray, format: "linkedin-post", status: "content-ready" as const }
                : t,
            ),
          )
          // Store generated content
          setGeneratedContents((prev) => [...prev, { topicId: topic.id, content: contentArray.join("\n\n") }])

          toast({
            title: "Content Generated from Your Story!",
            description: `Generated personalized content based on your personal story.`,
          })
          return
        } else {
          throw new Error("Invalid response from story content API")
        }
      }

      console.log("[v0] Using regular AI generation for non-personalized topic")
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
            variations: 4,
          },
        }),
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          const responseText = await response.text()
          console.log("Raw error response:", responseText)

          if (responseText) {
            try {
              errorData = JSON.parse(responseText)
            } catch (jsonError) {
              console.error("Failed to parse JSON error response:", jsonError)
              errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` }
            }
          } else {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        console.error("Content generation failed:", errorData)
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorData?.details ||
          `HTTP ${response.status}: ${response.statusText}`
        throw new Error(`Content generation failed: ${errorMessage}`)
      }

      const data = await response.json()
      console.log("Content generation response data:", data)

      const contentArray = Array.isArray(data.data.content) ? data.data.content : [data.data.content]
      console.log("Processed content:", contentArray)
      console.log("Content length:", contentArray.length)

      // Update personalized topics
      setPersonalizedTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id
            ? { ...t, content: contentArray, format: "linkedin-post", status: "content-ready" as const }
            : t,
        ),
      )
      // Store generated content
      setGeneratedContents((prev) => [...prev, { topicId: topic.id, content: contentArray.join("\n\n") }])

      toast({
        title: "Content Generated!",
        description: `Generated ${contentArray.length} variations for "${topic.title}"`,
      })
    } catch (error) {
      console.error("Error generating content:", error)

      const fallbackContent = topic.isPersonalized
        ? [
            `${topic.title}

This topic is deeply connected to my personal journey and experiences. Through my story, I've learned valuable lessons that I believe can help others in their professional development.

Key insights from my experience:
• Every challenge is an opportunity for growth
• Authenticity builds stronger connections
• Continuous learning is essential for success
• Building meaningful relationships matters

What aspects of this topic resonate with your own experiences? I'd love to hear your thoughts and stories in the comments.

#PersonalStory #ProfessionalGrowth #Authenticity #LinkedIn`,
          ]
        : [
            `${topic.title}

This is an important topic that many professionals can relate to. In my experience, this has been a key factor in professional growth and development.

Key insights:
• Understanding the fundamentals is crucial
• Continuous learning and adaptation are essential
• Building strong relationships and networks matters
• Persistence and resilience lead to success

What are your thoughts on this topic? I'd love to hear your experiences and insights in the comments below.

#ProfessionalGrowth #CareerDevelopment #LinkedIn`,
          ]

      // Update topics with fallback content
      setPersonalizedTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id
            ? { ...t, content: fallbackContent, format: "linkedin-post", status: "content-ready" as const }
            : t,
        ),
      )
      setGeneratedContents((prev) => [...prev, { topicId: topic.id, content: fallbackContent.join("\n\n") }])

      toast({
        title: "Content Generated (Fallback)",
        description: "Generated fallback content for your topic.",
      })
    } finally {
      setIsGeneratingContent((prev) => ({ ...prev, [topic.id]: false })) // Reset generating state
    }
  }

  // Generate content from approved topics using story-based content generation
  const generateContentFromApprovedTopic = async (topic: any) => {
    console.log("Starting content generation for approved topic:", topic)
    setIsGenerating(true) // Use global isGenerating for this flow

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

      // Use the story-content API to generate content based on the approved topic
      const response = await fetch("/api/story-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topic.id, // Assuming topic.id is the correct field
          contentType: "linkedin-post",
        }),
      })

      if (!response.ok) {
        const responseText = await response.text()
        let errorData = {}
        try {
          errorData = responseText ? JSON.parse(responseText) : {}
        } catch (parseError) {
          console.error("Failed to parse error response JSON:", parseError)
        }
        console.error("Story content generation failed:", errorData)
        throw new Error((errorData as any).error || "Failed to generate content from story")
      }

      const data = await response.json()
      console.log("Story content generation response:", data)

      if (data.success && data.content) {
        // Create a topic object for display
        const storyTopic: Topic = {
          id: `story-${topic.id}`,
          title: topic.title,
          viralChance: 85, // High viral chance for story-based content
          niche: "Personal Story",
          content: [data.content.content],
          format: "linkedin-post",
          status: "content-ready",
          isPersonalized: true,
        }

        // Add to topics list for display
        setTopics((prev) => [storyTopic, ...prev])

        // Store generated content
        setGeneratedContents((prev) => [...prev, { topicId: storyTopic.id, content: data.content.content }])

        // Set as selected topic
        setSelectedTopicId(storyTopic.id)

        toast({
          title: "Content Generated from Your Story!",
          description: `Generated personalized content for "${topic.title}" based on your personal story.`,
        })
      } else {
        throw new Error("Invalid response from story content API")
      }
    } catch (error) {
      console.error("Error generating content from approved topic:", error)

      // Create fallback content
      const fallbackContent = `${topic.title}

This topic is deeply connected to my personal journey and experiences. Through my story, I've learned valuable lessons that I believe can help others in their professional development.

Key insights from my experience:
• Every challenge is an opportunity for growth
• Authenticity builds stronger connections
• Continuous learning is essential for success
• Building meaningful relationships matters

What aspects of this topic resonate with your own experiences? I'd love to hear your thoughts and stories in the comments.

#PersonalStory #ProfessionalGrowth #Authenticity #LinkedIn`

      const storyTopic: Topic = {
        id: `story-fallback-${topic.id}`,
        title: topic.title,
        viralChance: 75,
        niche: "Personal Story",
        content: [fallbackContent],
        format: "linkedin-post",
        status: "content-ready",
        isPersonalized: true,
      }

      setTopics((prev) => [storyTopic, ...prev])
      setSelectedTopicId(storyTopic.id)
      setGeneratedContents((prev) => [...prev, { topicId: storyTopic.id, content: fallbackContent }])

      toast({
        title: "Content Generated (Fallback)",
        description: "Generated fallback content based on your approved topic.",
      })
    } finally {
      setIsGenerating(false) // Use global isGenerating for this flow
    }
  }

  const clearTopics = () => {
    setTopics([] as Topic[])
    setExpandedTopic(null)
    setShowTopicGenerator(true) // Show the topic generator section again
    setHasGeneratedTopics(false) // Reset the generated topics flag
    setSelectedTopicId(null) // Reset selected topic
  }

  const saveToDraft = async (content: string, title: string, format = "article") => {
    try {
      // Map format to valid Draft type
      const draftType = format === "linkedin-post" ? "text" : format === "story" ? "story" : "text"
      
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          format: draftType,
          niche: "Personal Story",
          source: "personal-story",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Draft saved successfully:", data)
        toast({
          title: "Draft Saved!",
          description: "Content has been saved to your drafts.",
        })
      } else {
        const responseText = await response.text()
        let errorData = {}
        try {
          errorData = responseText ? JSON.parse(responseText) : {}
        } catch (parseError) {
          console.error("Failed to parse error response JSON:", parseError)
        }
        console.error("Failed to save draft:", errorData)
        toast({
          title: "Error",
          description: (errorData as any).error || "Failed to save draft. Please try again.",
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
                  <Select
                    value={contentType}
                    onValueChange={(value: "caseStudy" | "descriptive" | "list" | "story") => setContentType(value)}
                  >
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
                    onKeyPress={(e) => e.key === "Enter" && generateTopics()}
                  />

                  <Button
                    onClick={generateTopics}
                    disabled={!topicPrompt.trim() || isGenerating}
                    className="w-full h-16 px-8 bg-blue-500 hover:bg-blue-600 text-white text-lg"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
                  </Button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-center border-2 border-blue-200 dark:border-blue-800 rounded-2xl overflow-hidden bg-white dark:bg-black shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:shadow-lg">
                  <div className="flex-shrink-0">
                    <Select
                      value={contentType}
                      onValueChange={(value: "caseStudy" | "descriptive" | "list" | "story") => setContentType(value)}
                    >
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
                      onKeyPress={(e) => e.key === "Enter" && generateTopics()}
                    />
                  </div>

                  <div className="flex-shrink-0 p-3">
                    <Button
                      onClick={generateTopics}
                      disabled={!topicPrompt.trim() || isGenerating}
                      className="h-12 px-8 bg-blue-500 hover:bg-blue-600 text-white text-lg"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
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
              <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-blue-50/10 to-secondary/10 dark:from-blue-950/20 dark:to-secondary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      Approved Topics
                    </CardTitle>
                    <CardDescription className="mt-2">Topics approved from your personal stories</CardDescription>
                  </div>
                  {approvedTopics.length > 0 && (
                    <Button
                      onClick={handleDiscardAllApprovedTopics}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 bg-transparent"
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
                            {!topics.some(t => t.id === `approved-${topic._id || index}` && t.status === "content-ready") && (
                              <Button
                                onClick={() => {
                                  console.log("Generating content for approved topic:", topic.title)
                                  generateContentForTopic(topic.title, `approved-${topic._id || index}`)
                                }}
                                disabled={generatingTopicId === `approved-${topic._id || index}`}
                                className="flex-1 h-9 sm:h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base"
                              >
                                {generatingTopicId === `approved-${topic._id || index}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Generate Content
                              </Button>
                            )}

                            <Button
                              onClick={() => handleDiscardApprovedTopic(topic._id, topic.title)}
                              variant="outline"
                              size="sm"
                              className="h-9 sm:h-10 px-3 sm:px-4 border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
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


        {showTopicGenerator && !hasPersonalStory && !isRefreshingTopics && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-blue-900">Topic Generator</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowTopicGenerator(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Create your personal story to get AI-generated topics based on your unique journey
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/dashboard/personal-story")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Personal Story
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showTopicGenerator && personalizedTopics.length === 0 && hasPersonalStory && !isRefreshingTopics && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-blue-900">Generate Personalized Topics</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowTopicGenerator(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-blue-700">
                  Click the button below to generate personalized topics based on your personal story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate Topics?</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    We'll create unique content ideas tailored specifically to your personal story and experiences.
                  </p>
                  <Button
                    onClick={fetchPersonalizedTopics}
                    disabled={isRefreshingTopics}
                    className="bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isRefreshingTopics ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Topics...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Topics
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showTopicGenerator && personalizedTopics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-blue-900">Topics from Your Personal Story</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateTopics}
                      disabled={isRefreshingTopics}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                    >
                      {isRefreshingTopics ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Regenerate Topics
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowTopicGenerator(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-blue-700">
                  AI-generated topics based on your unique personal story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {personalizedTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group cursor-pointer border-blue-100 transition-all hover:border-blue-300 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {topic.niche}
                            </Badge>
                            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                              {topic.viralChance}% viral
                            </Badge>
                          </div>
                          <h3 className="mb-3 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                            {topic.title}
                          </h3>
                          <div className="flex gap-2">
                            {topic.status !== "content-ready" && (
                              <Button
                                size="sm"
                                onClick={() => generateRecommendedTopicContent(topic)} // Pass topic object
                                disabled={isGeneratingContent[topic.id]}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                {isGeneratingContent[topic.id] ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-3 w-3" />
                                    Generate
                                  </>
                                )}
                              </Button>
                            )}
                            {topic.status === "content-ready" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const content = generatedContents.find((c) => c.topicId === topic.id)
                                  if (content) {
                                    setSelectedContent(content.content)
                                    setShowContentModal(true)
                                  }
                                }}
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
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
      </div>

      {/* Background Blur Overlay */}
      {showCustomization && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />}

      {/* Customization Panel */}
      {showCustomization && (
        <Card className="fixed inset-x-4 bottom-4 z-50 max-w-2xl mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Customize Content Generation
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCustomization(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>Customize the tone, style, and format for your LinkedIn posts.</CardDescription>
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
              <Button variant="outline" onClick={() => setShowCustomization(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Check both regular topics and recommended topics
                  let topic = topics.find((t) => t.id === showCustomization)
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

      {/* Enhanced LinkedIn Preview Modal */}
      {previewContent && (
        <EnhancedLinkedInPreview
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

      {/* Enhanced Content Modal for Viewing Generated Content */}
      {showContentModal && selectedContent && (
        <EnhancedLinkedInPreview
          content={selectedContent}
          onSaveToDraft={async (content, title, format) => {
            // Handle save to draft functionality
            await saveToDraft(content, title, format)
            setShowContentModal(false)
          }}
          onClose={() => setShowContentModal(false)}
          onContentUpdate={(newContent) => {
            setSelectedContent(newContent)
            // Update the generated content in state
            setGeneratedContents((prev) => 
              prev.map((c) => 
                c.content === selectedContent 
                  ? { ...c, content: newContent }
                  : c
              )
            )
          }}
        />
      )}

      {/* Processing Overlays */}
      <ProcessingOverlay 
        isVisible={isGenerating} 
        type="topics"
        title="Generating Topics..."
        description="Creating personalized topics from your story..."
      />
      
      <ProcessingOverlay 
        isVisible={isRefreshingTopics} 
        type="topics"
        title="Refreshing Topics..."
        description="Loading fresh topics from your personal story..."
      />
      
      <ProcessingOverlay 
        isVisible={Object.values(isGeneratingContent).some(Boolean)} 
        type="content"
        title="Creating Content..."
        description="Generating engaging content for your selected topic..."
      />
    </div>
  )
}
