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
  CheckCircle
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
    }))
    setRecommendedTopics(selected)
  }

  // Initialize recommended topics and fetch approved topics on component mount
  useEffect(() => {
    generateRandomRecommendedTopics()
    
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
            topicCount: 4 // Explicitly request 4 topics
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
      
      // Ensure we have exactly 4 topics
      if (topicsArray.length < 4) {
        // If we have fewer than 4 topics, create additional unique topics
        const baseTopic = topicPrompt.trim()
        const additionalTopics = [
          `${baseTopic}: Key Strategies and Best Practices`,
          `${baseTopic}: Future Trends and Predictions`,
          `${baseTopic}: Common Challenges and Solutions`,
          `${baseTopic}: Success Stories and Case Studies`
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
          `${baseTopic}: Success Stories and Case Studies`
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
      const content = Array.isArray(data.data.content) ? data.data.content : [data.data.content]

      // Update recommended topics
      setRecommendedTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format: "linkedin-post", status: "content-ready" as const }
          : t
      ))

      // Set the selected topic and hide others
      setSelectedTopicId(topic.id)
      toast({
        title: "Content Generated!",
        description: `Generated ${content.length} variations for "${topic.title}"`,
      })
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
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
        <motion.div 
          className="hidden sm:flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
            {["business", "technology", "leadership", "marketing", "career", "productivity", "innovation", "trends"].map((category) => (
              <Button 
                key={category}
                variant="outline"
                className="px-6 py-3 rounded-full font-medium transition-all duration-200 bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Star className="w-4 h-4 mr-2" />
                <span className="ml-2 capitalize">{category}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Refresh and Live Indicator */}
        <motion.div 
          className="flex justify-center items-center gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            variant="outline"
            className="px-6 py-2 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-black"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Topics
          </Button>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live trending data</span>
          </div>
        </motion.div>

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
                    className="w-full h-24 px-8 text-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && generateTopics()}
                  />
                  
                  <Button
                    onClick={generateTopics}
                    disabled={!topicPrompt.trim() || isGenerating}
                    className="w-full h-16 px-8 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white text-lg"
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
                      <SelectTrigger className="w-48 h-16 border-0 bg-transparent focus:ring-0">
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
                      className="h-16 px-6 text-lg border-0 focus-visible:ring-0 bg-transparent text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && generateTopics()}
                    />
                  </div>
                  
                  <div className="flex-shrink-0 p-3">
                    <Button
                      onClick={generateTopics}
                      disabled={!topicPrompt.trim() || isGenerating}
                      className="h-12 px-8 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white text-lg"
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
                              className="flex-1 h-9 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base"
                            >
                              {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                              )}
                              Generate Content
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
          {showTopicGenerator && recommendedTopics.length > 0 && (
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
                      Recommended Topics
                  </CardTitle>
                    <CardDescription className="mt-2">
                      Hand-picked trending topics to inspire your next post
                  </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomRecommendedTopics}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
                </CardHeader>
              <CardContent className="p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {recommendedTopics.map((topic, index) => (
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
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 mt-4"
                          >
                              <Button
                                onClick={() => generateRecommendedTopicContent(topic)}
                                size="sm"
                              className="w-full h-10 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white"
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
                        className="group relative bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6 hover:border-green-200 hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        <div className="space-y-3 sm:space-y-4 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-base sm:text-lg leading-tight text-gray-900 group-hover:text-green-600 transition-colors flex-1">
                              {topic.title}
                            </h3>
                            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 text-xs flex-shrink-0">
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
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 mt-4"
                            >
                        <Button
                              onClick={() => setShowCustomization(topic.id)}
                          size="sm"
                                className="w-full h-10 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
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
                                <Badge variant="default" className="text-xs bg-green-100 text-green-700">
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