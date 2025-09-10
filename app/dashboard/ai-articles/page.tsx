"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
<<<<<<< HEAD
import { Loader2, Sparkles, X, RefreshCw, Calendar, Save, Eye, Settings } from "lucide-react"
=======
import { Loader2, Sparkles, X, Calendar, Save, Eye, Settings } from "lucide-react"
>>>>>>> 136723e (new)
import { useToast } from "@/hooks/use-toast"
import { LinkedInPreview } from "@/components/linkedin-preview"
import { LinkedInPostButton } from "@/components/linkedin-post-button"
import { ScheduleButton } from "@/components/schedule-button"
import { AICustomizationPanel, type CustomizationOptions } from "@/components/ai-customization-panel"
<<<<<<< HEAD


const predefinedNiches = [
  "Marketing",
  "Advertising",
  "Content Creation",
  "Technology",
  "Design",
  "Sales",
  "Entrepreneurship",
  "Social Media",
  "Business",
  "Finance",
  "Leadership",
  "Custom Niche",
]

const contentFormats = ["Story", "List", "Quote", "Before/After", "Tips", "Insights", "Question"]
=======
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


>>>>>>> 136723e (new)

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
<<<<<<< HEAD
  const [selectedNiche, setSelectedNiche] = useState("")
  const [customNiche, setCustomNiche] = useState("")
  const [topicCount, setTopicCount] = useState(6)
=======
  const [topicPrompt, setTopicPrompt] = useState("")
  const [contentType, setContentType] = useState<"caseStudy" | "descriptive" | "list" | "story">("caseStudy")
>>>>>>> 136723e (new)
  const [isGenerating, setIsGenerating] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewingTopicId, setPreviewingTopicId] = useState<string | null>(null)
<<<<<<< HEAD
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [contentType, setContentType] = useState<string>("article")
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai")
=======
  const [showCustomization, setShowCustomization] = useState<string | null>(null)
  const [showTopicGenerator, setShowTopicGenerator] = useState(true)
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai")
  const [recommendedTopics, setRecommendedTopics] = useState<Topic[]>([])
>>>>>>> 136723e (new)

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

<<<<<<< HEAD
=======
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

>>>>>>> 136723e (new)
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
<<<<<<< HEAD
  }

  const generateTopics = async () => {
    if (!selectedNiche) {
      toast({
        title: "Please select a niche",
        description: "Choose a niche to generate topics for.",
        variant: "destructive",
      })
      return
    }

    if (selectedNiche === "Custom Niche" && !customNiche.trim()) {
      toast({
        title: "Please enter a custom niche",
        description: "Enter your custom niche to generate topics.",
=======
    
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
>>>>>>> 136723e (new)
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
<<<<<<< HEAD
      const niche = selectedNiche === "Custom Niche" ? customNiche : selectedNiche
      
=======
>>>>>>> 136723e (new)
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
<<<<<<< HEAD
          prompt: niche,
=======
          prompt: `Generate exactly 4 different ${contentType} topic ideas about: ${topicPrompt.trim()}. Each topic should be unique and engaging for LinkedIn professionals.`,
>>>>>>> 136723e (new)
          provider: "openai",
          customization: {
            tone: customization.tone,
            language: customization.language,
<<<<<<< HEAD
            wordCount: topicCount * 20,
=======
            wordCount: 100, // Increased for better topic generation
>>>>>>> 136723e (new)
            targetAudience: customization.targetAudience,
            mainGoal: customization.mainGoal,
            includeHashtags: customization.includeHashtags,
            includeEmojis: customization.includeEmojis,
            callToAction: customization.callToAction,
            temperature: customization.temperature,
            maxTokens: customization.maxTokens,
<<<<<<< HEAD
            niche: niche
=======
            niche: topicPrompt.trim(),
            contentType: contentType,
            topicCount: 4 // Explicitly request 4 topics
>>>>>>> 136723e (new)
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate topics")
      }

      const data = await response.json()
<<<<<<< HEAD
      const generatedTopics: Topic[] = Array.isArray(data.data.content) 
        ? data.data.content.map((title: string, index: number) => ({
            id: `topic-${Date.now()}-${index}`,
            title,
            viralChance: Math.floor(Math.random() * 40) + 60, // 60-100%
            niche,
            status: "generated" as const,
          }))
        : []

      setTopics(generatedTopics)
      toast({
        title: "Success!",
        description: `Generated ${generatedTopics.length} viral topics for ${niche}`,
=======
      let topicsArray = Array.isArray(data.data.content) ? data.data.content : []
      
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
      
      const generatedTopics: Topic[] = topicsArray.slice(0, 4).map((title: string, index: number) => ({
            id: `topic-${Date.now()}-${index}`,
            title,
            viralChance: Math.floor(Math.random() * 40) + 60, // 60-100%
        niche: topicPrompt.trim(),
            status: "generated" as const,
          }))

      setTopics(generatedTopics)
      setShowTopicGenerator(false) // Hide the topic generator section
      toast({
        title: "Success!",
        description: `Generated 4 topics for ${contentType}`,
>>>>>>> 136723e (new)
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

<<<<<<< HEAD
  const generateContent = async (topic: Topic, format: string) => {
=======
  const generateContent = async (topic: Topic) => {
>>>>>>> 136723e (new)
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

<<<<<<< HEAD
      // Map format to content type
      const contentTypeMap: Record<string, string> = {
        "Story": "story",
        "List": "list", 
        "Quote": "quote",
        "Before/After": "before-after",
        "Tips": "tips",
        "Insights": "insights",
        "Question": "question"
      }
      
      const contentType = contentTypeMap[format] || "article"

=======
>>>>>>> 136723e (new)
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
<<<<<<< HEAD
          type: contentType,
=======
          type: "linkedin-post",
>>>>>>> 136723e (new)
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
<<<<<<< HEAD
            format: format,
            niche: topic.niche
=======
            format: contentType,
            niche: topic.niche,
            variations: 4 // Generate 4 variations
>>>>>>> 136723e (new)
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      const content = Array.isArray(data.data.content) ? data.data.content : [data.data.content]

<<<<<<< HEAD
      setTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format, status: "content-ready" as const }
          : t
      ))

      toast({
        title: "Success!",
        description: `Generated ${format} content for "${topic.title}"`,
=======
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

      setShowCustomization(null)
      toast({
        title: "Success!",
        description: `Generated 4 LinkedIn posts for "${topic.title}"`,
>>>>>>> 136723e (new)
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

  const clearTopics = () => {
    setTopics([])
    setExpandedTopic(null)
<<<<<<< HEAD
=======
    setShowTopicGenerator(true) // Show the topic generator section again
>>>>>>> 136723e (new)
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
<<<<<<< HEAD
    <div className="flex flex-col gap-4 min-h-screen">
      {/* Header */}
      <div className="px-2 sm:px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            AI Articles & Topics Generator 📝
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Generate viral topics and create engaging articles with 2 variations using OpenAI.
          </p>
=======
    <div className="flex flex-col gap-4 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-2 sm:px-4">
        <div className="text-center py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
            What's on your mind today?
          </h1>
>>>>>>> 136723e (new)
        </div>
      </div>

      {/* Content Generator */}
      <div className="px-2 sm:px-4 space-y-4 sm:space-y-6 pb-6">
        {/* Main Content Area */}
        <div className="space-y-4 sm:space-y-6">
<<<<<<< HEAD
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                Topic Generator
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Select a niche and generate viral-worthy topics for your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Niche Selection */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Select Niche</Label>
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Choose a niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedNiches.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Niche Input */}
              {selectedNiche === "Custom Niche" && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Custom Niche</Label>
                  <Input
                    placeholder="Enter your custom niche..."
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
              )}

              {/* Topic Count */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Number of Topics</Label>
                <Select value={topicCount.toString()} onValueChange={(value) => setTopicCount(parseInt(value))}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Topics</SelectItem>
                    <SelectItem value="6">6 Topics</SelectItem>
                    <SelectItem value="10">10 Topics</SelectItem>
                    <SelectItem value="15">15 Topics</SelectItem>
=======
          {/* Topic Generator Section - Only show when no topics generated */}
          {showTopicGenerator && (
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    {/* Single Line Input Component */}
                    <div className="flex items-center border-2 border-primary rounded-lg overflow-hidden bg-white">
                      {/* Content Type Dropdown */}
                      <div className="flex-shrink-0">
                        <Select value={contentType} onValueChange={(value: "caseStudy" | "descriptive" | "list" | "story") => setContentType(value)}>
                          <SelectTrigger className="border-0 rounded-none h-14 px-4 text-sm font-medium bg-transparent focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                            <SelectItem value="caseStudy">Case Study</SelectItem>
                            <SelectItem value="descriptive">Descriptive</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
>>>>>>> 136723e (new)
                  </SelectContent>
                </Select>
              </div>

<<<<<<< HEAD
              {/* AI Customization Panel - Collapsible */}
              <div className="border rounded-lg">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors min-h-[48px] touch-manipulation"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">Customization Options</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs hidden xs:inline-flex">{customization.tone}</Badge>
                    <Badge variant="outline" className="text-xs hidden xs:inline-flex">{customization.language}</Badge>
                    <Badge variant="outline" className="text-xs hidden xs:inline-flex">{customization.wordCount} words</Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {showAdvanced ? "Hide" : "Show"}
                    </span>
                  </div>
                </button>
                
                {showAdvanced && (
                  <div className="p-3 sm:p-4 border-t">
                    <AICustomizationPanel
                      customization={customization}
                      onCustomizationChange={setCustomization}
                      contentType={contentType}
                      onContentTypeChange={setContentType}
                      showAdvanced={false}
                      onToggleAdvanced={() => {}}
                    />
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateTopics}
                disabled={isGenerating || !selectedNiche || (selectedNiche === "Custom Niche" && !customNiche.trim())}
                className="w-full h-12 sm:h-11 text-sm sm:text-base"
                size="lg"
=======
                      {/* Separator */}
                      <div className="w-px h-8 bg-border"></div>
                      
                      {/* Topic Input */}
                      <div className="flex-1">
                        <Input
                          placeholder="Enter a topic of your choice..."
                          value={topicPrompt}
                          onChange={(e) => setTopicPrompt(e.target.value)}
                          className="border-0 rounded-none h-14 px-4 text-sm bg-transparent focus:ring-0 focus:ring-offset-0 placeholder:text-muted-foreground"
                          onKeyPress={(e) => e.key === 'Enter' && !isGenerating && topicPrompt.trim() && generateTopics()}
                        />
              </div>

              {/* Generate Button */}
                      <div className="flex-shrink-0">
              <Button
                onClick={generateTopics}
                          disabled={isGenerating || !topicPrompt.trim()}
                          className="h-14 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-none border-0 focus:ring-0 focus:ring-offset-0"
>>>>>>> 136723e (new)
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
<<<<<<< HEAD
                    Generating Topics...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Topics
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Topics */}
          {topics.length > 0 && (
            <Card>
=======
                              Generating...
                  </>
                ) : (
                  <>
                              Generate ideas
                              <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
                      </div>
                    </div>
            </CardContent>
          </Card>
              </div>
            </div>
          )}

          {/* Recommended Topics Section - Only show when no topics generated */}
          {showTopicGenerator && recommendedTopics.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                    Recommended Topics Crafted for You
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Click on any topic to generate content, or use the input above to create your own.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendedTopics.map((topic) => (
                      <div key={topic.id} className="group relative border rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-sm sm:text-base leading-tight">{topic.title}</h3>
                            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                              {topic.viralChance}% viral
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{topic.niche}</Badge>
                            <Badge variant={topic.status === "content-ready" ? "default" : "outline"} className="text-xs">
                              {topic.status === "content-ready" ? "Content Ready" : "Generated"}
                            </Badge>
                          </div>

                          {/* Hover Generate Button */}
                          {topic.status === "generated" && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                onClick={() => setShowCustomization(topic.id)}
                                size="sm"
                                className="w-full"
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Content
                              </Button>
                            </div>
                          )}

                          {/* Generated Content Display */}
                          {topic.status === "content-ready" && topic.content && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">{topic.format}</Badge>
                                <span className="text-xs text-muted-foreground">4 variations generated</span>
                              </div>
                              
                              {Array.isArray(topic.content) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {topic.content.map((content, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                                      <div className="flex items-start justify-between mb-2">
                                        <Badge variant="outline" className="text-xs">Post {index + 1}</Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                                        {content}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 text-xs h-8"
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
                                          className="flex-1 text-xs h-8"
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
                                <div className="p-3 border rounded-lg bg-muted/30">
                                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                                    {getTopicContent(topic)}
                                  </p>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 text-xs h-8"
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
                                      className="flex-1 text-xs h-8"
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
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Generated Topics */}
          {topics.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg">
>>>>>>> 136723e (new)
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      Generated Topics ({topics.length})
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
<<<<<<< HEAD
                      Click on a topic to expand and generate content.
=======
                        Hover over topics to see generate button, or click to view generated content.
>>>>>>> 136723e (new)
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearTopics} className="w-full sm:w-auto min-h-[40px]">
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
<<<<<<< HEAD
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-2 text-sm sm:text-base">{topic.title}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{topic.niche}</Badge>
                            <Badge variant="outline" className="text-xs">Viral Score: {topic.viralChance}%</Badge>
                            <Badge variant={topic.status === "content-ready" ? "default" : "outline"} className="text-xs">
                              {topic.status === "content-ready" ? "Content Ready" : "Generated"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                          className="w-full sm:w-auto min-h-[40px]"
                        >
                          {expandedTopic === topic.id ? "Collapse" : "Expand"}
                        </Button>
                      </div>

                      {expandedTopic === topic.id && (
                        <div className="space-y-4 pt-4 border-t">
                          {topic.status === "content-ready" ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">{topic.format}</Badge>
                                <span className="text-xs sm:text-sm text-muted-foreground">Content generated</span>
                              </div>
                              {Array.isArray(topic.content) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                  {topic.content.map((content, index) => (
                                    <div key={index} className="aspect-[4/3] sm:aspect-square p-3 sm:p-4 border rounded-lg bg-muted/30 flex flex-col">
                                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                                        <Badge variant="outline" className="text-xs">Variation {index + 1}</Badge>
                                        <Badge variant="secondary" className="text-xs">{topic.format}</Badge>
                                      </div>
                                      <div className="flex-1 overflow-hidden">
                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-4 sm:line-clamp-6 leading-relaxed whitespace-pre-wrap">
                                          {content}
                                        </p>
                                      </div>
                                      <div className="mt-2 sm:mt-3 pt-2 border-t border-muted/30 space-y-2">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <Button 
                                            size="sm"
                                            className="flex-1 text-xs min-h-[32px]"
                                            onClick={() => saveToDraft(content, `${topic.title} - Variation ${index + 1}`, topic.format || "article")}
                                          >
                                            <Save className="w-3 h-3 mr-1" />
                                            Save
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1 text-xs min-h-[32px]"
=======
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="group relative border rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm sm:text-base leading-tight">{topic.title}</h3>
                          <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                            {topic.viralChance}% viral
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{topic.niche}</Badge>
                            <Badge variant={topic.status === "content-ready" ? "default" : "outline"} className="text-xs">
                              {topic.status === "content-ready" ? "Content Ready" : "Generated"}
                            </Badge>
                        </div>

                        {/* Hover Generate Button */}
                        {topic.status === "generated" && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                              onClick={() => setShowCustomization(topic.id)}
                          size="sm"
                              className="w-full"
                        >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Content
                        </Button>
                      </div>
                        )}

                        {/* Generated Content Display */}
                        {topic.status === "content-ready" && topic.content && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">{topic.format}</Badge>
                              <span className="text-xs text-muted-foreground">4 variations generated</span>
                              </div>
                            
                              {Array.isArray(topic.content) ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {topic.content.map((content, index) => (
                                  <div key={index} className="p-3 border rounded-lg bg-muted/30">
                                    <div className="flex items-start justify-between mb-2">
                                      <Badge variant="outline" className="text-xs">Post {index + 1}</Badge>
                                      </div>
                                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                                          {content}
                                        </p>
                                    <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                        className="flex-1 text-xs h-8"
>>>>>>> 136723e (new)
                                            onClick={() => {
                                              setPreviewContent(content)
                                              setPreviewingTopicId(topic.id)
                                            }}
                                          >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Preview
                                          </Button>
<<<<<<< HEAD
                                        </div>
                                        <LinkedInPostButton 
                                          content={content}
                                          className="w-full text-xs h-8 min-h-[32px]"
                                        />
                                        <ScheduleButton
                                          content={content}
                                          defaultPlatform="linkedin"
                                          defaultType="text"
                                          className="w-full text-xs h-8 min-h-[32px]"
                                        />
=======
                                      <Button 
                                        size="sm"
                                        className="flex-1 text-xs h-8"
                                        onClick={() => saveToDraft(content, `${topic.title} - Post ${index + 1}`, "linkedin-post")}
                                      >
                                        <Save className="w-3 h-3 mr-1" />
                                        Save
                                      </Button>
>>>>>>> 136723e (new)
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
<<<<<<< HEAD
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                  <div className="aspect-[4/3] sm:aspect-square p-3 sm:p-4 border rounded-lg bg-muted/30 flex flex-col">
                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                      <Badge variant="outline" className="text-xs">Single Content</Badge>
                                      <Badge variant="secondary" className="text-xs">{topic.format}</Badge>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-4 sm:line-clamp-6 leading-relaxed whitespace-pre-wrap">
                                        {getTopicContent(topic)}
                                      </p>
                                    </div>
                                    <div className="mt-2 sm:mt-3 pt-2 border-t border-muted/30 space-y-2">
                                      <div className="flex flex-col sm:flex-row gap-2">
                                        <Button 
                                          size="sm"
                                          className="flex-1 text-xs min-h-[32px]"
                                          onClick={() => saveToDraft(
                                            getTopicContent(topic), 
                                            topic.title, 
                                            topic.format || "article"
                                          )}
                                        >
                                          <Save className="w-3 h-3 mr-1" />
                                          Save
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="flex-1 text-xs min-h-[32px]"
=======
                              <div className="p-3 border rounded-lg bg-muted/30">
                                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                                        {getTopicContent(topic)}
                                      </p>
                                <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                    className="flex-1 text-xs h-8"
>>>>>>> 136723e (new)
                                          onClick={() => {
                                            setPreviewContent(getTopicContent(topic))
                                            setPreviewingTopicId(topic.id)
                                          }}
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          Preview
                                        </Button>
<<<<<<< HEAD
                                      </div>
                                      <LinkedInPostButton 
                                        content={getTopicContent(topic)}
                                        className="w-full text-xs h-8 min-h-[32px]"
                                      />
                                      <ScheduleButton
                                        content={getTopicContent(topic)}
                                        defaultPlatform="linkedin"
                                        defaultType="text"
                                        className="w-full text-xs h-8 min-h-[32px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Content Format</Label>
                                <Select onValueChange={(format) => generateContent(topic, format)}>
                                  <SelectTrigger className="text-sm sm:text-base">
                                    <SelectValue placeholder="Select format" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {contentFormats.map((format) => (
                                      <SelectItem key={format} value={format}>
                                        {format}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={() => generateContent(topic, "Story")}
                                disabled={isGenerating}
                                size="sm"
                                className="w-full min-h-[40px]"
                              >
=======
                                  <Button 
                                    size="sm"
                                    className="flex-1 text-xs h-8"
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
                                  </div>
                  ))}
                </div>
              </CardContent>
              </Card>
                                </div>
                              )}
                            </div>

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
>>>>>>> 136723e (new)
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
<<<<<<< HEAD
                                    Generate Story Content
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
=======
                      Generate 4 Posts
                                  </>
                                )}
                              </Button>
>>>>>>> 136723e (new)
                </div>
              </CardContent>
            </Card>
          )}
<<<<<<< HEAD
        </div>
=======
>>>>>>> 136723e (new)

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
    </div>
  )
}
