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
  PenTool
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

  // Initialize recommended topics on component mount
  useEffect(() => {
    generateRandomRecommendedTopics()
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
        {/* Clean Header */}
        <motion.div 
          className="text-center py-12 sm:py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            AI Topic Generator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover trending topics and get instant inspiration for your next viral post
          </p>
        </motion.div>

        {/* Topic Categories */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
            <Button 
              variant="default"
              className="px-6 py-3 rounded-full font-medium transition-all duration-200 bg-blue-600 text-white shadow-lg"
            >
              <Star className="w-4 h-4 mr-2" />
              All Topics
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {recommendedTopics.length}
              </Badge>
            </Button>
            
            {["business", "technology", "leadership", "marketing", "career", "productivity", "innovation", "trends"].map((category) => (
              <Button 
                key={category}
                variant="outline"
                className="px-6 py-3 rounded-full font-medium transition-all duration-200 bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              >
                <Star className="w-4 h-4 mr-2" />
                <span className="ml-2 capitalize">{category}</span>
                <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600">
                  {Math.floor(Math.random() * 10) + 1}
                </Badge>
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
            className="px-6 py-2 border-blue-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 bg-white"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Topics
          </Button>
          
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
            <div className="w-full max-w-2xl">
              <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-lg">
                <div className="flex-shrink-0">
                  <Select value={contentType} onValueChange={(value: "caseStudy" | "descriptive" | "list" | "story") => setContentType(value)}>
                    <SelectTrigger className="w-40 h-14 border-0 bg-transparent focus:ring-0">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-blue-600" />
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
                    className="h-14 px-6 text-base border-0 focus-visible:ring-0 bg-transparent placeholder:text-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && generateTopics()}
                  />
                </div>
                
                <div className="flex-shrink-0 p-2">
                  <Button
                    onClick={generateTopics}
                    disabled={!topicPrompt.trim() || isGenerating}
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
              </div>
            </div>
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
                    Refresh
                  </Button>
                </div>
                </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-purple-200 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="space-y-4">
                          <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-purple-600 transition-colors">
                            {topic.title}
                          </h3>
                          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
                              {topic.viralChance}% viral
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {topic.niche}
                          </Badge>
                            <Badge variant={topic.status === "content-ready" ? "default" : "outline"} className="text-xs">
                            {topic.status === "content-ready" ? "Content Ready" : "Ready to Generate"}
                            </Badge>
                          </div>

                        {/* Generate Button */}
                          {topic.status === "generated" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                              <Button
                                onClick={() => generateRecommendedTopicContent(topic)}
                                size="sm"
                              className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
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
                          <div className="space-y-4">
                              <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                                {topic.format}
                              </Badge>
                              <span className="text-xs text-gray-500">4 variations generated</span>
                              </div>
                              
                              {Array.isArray(topic.content) ? (
                              <div className="grid grid-cols-1 gap-3">
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

        {/* Enhanced Generated Topics */}
          {topics.length > 0 && (
          <motion.div 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-blue-50/50 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      Your Generated Topics
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Click on any topic to generate content or customize your preferences
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearTopics} 
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
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
                        className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-green-600 transition-colors">
                              {topic.title}
                            </h3>
                            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
                            {topic.viralChance}% viral
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {topic.niche}
                            </Badge>
                            <Badge variant={topic.status === "content-ready" ? "default" : "outline"} className="text-xs">
                              {topic.status === "content-ready" ? "Content Ready" : "Ready to Generate"}
                            </Badge>
                        </div>

                          {/* Generate Button */}
                        {topic.status === "generated" && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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