"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, X, RefreshCw, Calendar, Save, Eye, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LinkedInPreview } from "@/components/linkedin-preview"
import { LinkedInPostButton } from "@/components/linkedin-post-button"
import { ScheduleButton } from "@/components/schedule-button"
import { AICustomizationPanel, type CustomizationOptions } from "@/components/ai-customization-panel"


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
  const [selectedNiche, setSelectedNiche] = useState("")
  const [customNiche, setCustomNiche] = useState("")
  const [topicCount, setTopicCount] = useState(6)
  const [isGenerating, setIsGenerating] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewingTopicId, setPreviewingTopicId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [contentType, setContentType] = useState<string>("article")
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai")

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
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const niche = selectedNiche === "Custom Niche" ? customNiche : selectedNiche
      
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
          prompt: niche,
          provider: "openai",
          customization: {
            tone: customization.tone,
            language: customization.language,
            wordCount: topicCount * 20,
            targetAudience: customization.targetAudience,
            mainGoal: customization.mainGoal,
            includeHashtags: customization.includeHashtags,
            includeEmojis: customization.includeEmojis,
            callToAction: customization.callToAction,
            temperature: customization.temperature,
            maxTokens: customization.maxTokens,
            niche: niche
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate topics")
      }

      const data = await response.json()
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

  const generateContent = async (topic: Topic, format: string) => {
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

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
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
            format: format,
            niche: topic.niche
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      const content = Array.isArray(data.data.content) ? data.data.content : [data.data.content]

      setTopics(prev => prev.map(t => 
        t.id === topic.id 
          ? { ...t, content: content, format, status: "content-ready" as const }
          : t
      ))

      toast({
        title: "Success!",
        description: `Generated ${format} content for "${topic.title}"`,
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
    <div className="flex flex-col gap-4 min-h-screen">
      {/* Header */}
      <div className="px-2 sm:px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            AI Articles & Topics Generator 📝
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Generate viral topics and create engaging articles with 6 variations using OpenAI.
          </p>
        </div>
      </div>

      {/* Content Generator */}
      <div className="px-2 sm:px-4 space-y-4 sm:space-y-6 pb-6">
        {/* Main Content Area */}
        <div className="space-y-4 sm:space-y-6">
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
                  </SelectContent>
                </Select>
              </div>

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
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      Generated Topics ({topics.length})
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Click on a topic to expand and generate content.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearTopics} className="w-full sm:w-auto min-h-[40px]">
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                                            onClick={() => {
                                              setPreviewContent(content)
                                              setPreviewingTopicId(topic.id)
                                            }}
                                          >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Preview
                                          </Button>
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
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
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
                                          onClick={() => {
                                            setPreviewContent(getTopicContent(topic))
                                            setPreviewingTopicId(topic.id)
                                          }}
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          Preview
                                        </Button>
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
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>

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
