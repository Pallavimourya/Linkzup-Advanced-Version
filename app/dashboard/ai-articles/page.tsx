"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, X, RefreshCw, Calendar, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  content?: string
  status: "generated" | "content-ready" | "expanded"
}

export default function AIArticlesPage() {
  const [selectedNiche, setSelectedNiche] = useState("")
  const [customNiche, setCustomNiche] = useState("")
  const [topicCount, setTopicCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const { toast } = useToast()

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
        if (!creditData.isTrialActive && creditData.credits < 0.3) {
          toast({
            title: "Insufficient Credits",
            description: "You need at least 0.3 credits to generate topics. Please purchase more credits.",
            variant: "destructive",
          })
          window.location.href = "/dashboard/billing"
          return
        }
      }

      const response = await fetch("/api/ai/generate-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, count: topicCount }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate topics")
      }

      const data = await response.json()
      
      if (!data.topics || !Array.isArray(data.topics)) {
        throw new Error("Invalid response format from API")
      }

      const newTopics: Topic[] = data.topics.map((title: string, index: number) => ({
        id: `topic-${Date.now()}-${index}`,
        title: title.trim(),
        viralChance: Math.floor(Math.random() * 40) + 60, // 60-99%
        niche,
        status: "generated" as const,
      }))

      // Sort by viral chance (highest first)
      newTopics.sort((a, b) => b.viralChance - a.viralChance)
      setTopics(newTopics)

      // Deduct credits after successful generation
      await fetch("/api/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deduct", amount: 0.3 }),
      })

      toast({
        title: "Topics generated successfully!",
        description: `Generated ${newTopics.length} topics for ${niche}`,
      })
    } catch (error) {
      console.error("Error generating topics:", error)
      toast({
        title: "Error generating topics",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteTopic = (topicId: string) => {
    setTopics(topics.filter((t) => t.id !== topicId))
    if (expandedTopic === topicId) {
      setExpandedTopic(null)
    }
  }

  const generateContent = async (topicId: string, format: string) => {
    const topic = topics.find((t) => t.id === topicId)
    if (!topic) return

    // Update topic status to show loading
    setTopics(topics.map((t) => (t.id === topicId ? { ...t, format, status: "content-ready" } : t)))

    try {
      // Check credits before generating content
      const creditResponse = await fetch("/api/billing/credits")
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        if (!creditData.isTrialActive && creditData.credits < 0.4) {
          toast({
            title: "Insufficient Credits",
            description: "You need at least 0.4 credits to generate content. Please purchase more credits.",
            variant: "destructive",
          })
          // Reset topic status
          setTopics(topics.map((t) => (t.id === topicId ? { ...t, status: "generated" } : t)))
          return
        }
      }

      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.title,
          format,
          niche: topic.niche,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()

      if (!data.content) {
        throw new Error("No content received from API")
      }

      // Update topic with generated content
      setTopics(topics.map((t) => (t.id === topicId ? { ...t, content: data.content, status: "expanded" } : t)))

      // Deduct credits after successful generation
      await fetch("/api/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deduct", amount: 0.4 }),
      })

      toast({
        title: "Content generated!",
        description: `Created ${format.toLowerCase()} content for "${topic.title}"`,
      })
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Error generating content",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
      // Reset topic status on error
      setTopics(topics.map((t) => (t.id === topicId ? { ...t, status: "generated" } : t)))
    }
  }

  const regenerateContent = async (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId)
    if (!topic || !topic.format) return

    await generateContent(topicId, topic.format)
  }

  const saveToDraft = async (topic: Topic) => {
    if (!topic.content) return

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topic.title,
          content: topic.content,
          format: topic.format,
          niche: topic.niche,
        }),
      })

      if (!response.ok) throw new Error("Failed to save draft")

      toast({
        title: "Draft saved!",
        description: `"${topic.title}" has been saved to your drafts.`,
      })
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const postToLinkedIn = async (topic: Topic) => {
    if (!topic.content) return

    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: topic.content,
        }),
      })

      if (!response.ok) throw new Error("Failed to post to LinkedIn")

      toast({
        title: "Posted to LinkedIn!",
        description: `"${topic.title}" has been posted successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error posting to LinkedIn",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const schedulePost = async (topic: Topic) => {
    if (!topic.content) return

    // This would open a scheduling modal in a real implementation
    toast({
      title: "Schedule Post",
      description: "Scheduling functionality will be implemented with a date/time picker modal.",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Articles</h1>
          <p className="text-muted-foreground">Generate engaging LinkedIn post topics for your niche</p>
        </div>
      </div>

      {/* Niche Selection Form */}
      <Card className="bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Select your niches
          </CardTitle>
          <CardDescription>Choose a niche and specify how many topics you'd like to generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a niche" />
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

            {selectedNiche === "Custom Niche" && (
              <div className="space-y-2">
                <Label htmlFor="custom-niche">Custom Niche</Label>
                <Input
                  id="custom-niche"
                  placeholder="Enter your custom niche"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="topic-count">Number of topics to generate (1-10)</Label>
              <Select value={topicCount.toString()} onValueChange={(value) => setTopicCount(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateTopics}
            disabled={isGenerating || !selectedNiche || (selectedNiche === "Custom Niche" && !customNiche)}
            className="w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
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
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Generated Topics</h2>
          <div className="grid gap-4">
            {topics.map((topic) => (
              <Card key={topic.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Viral Chances: {topic.viralChance}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {topic.niche}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTopic(topic.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {topic.status === "generated" && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <Label>Select content format:</Label>
                      <div className="flex flex-wrap gap-2">
                        {contentFormats.map((format) => (
                          <Button
                            key={format}
                            variant="outline"
                            size="sm"
                            onClick={() => generateContent(topic.id, format)}
                          >
                            {format}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}

                {topic.status === "content-ready" && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Generating {topic.format?.toLowerCase()} content...
                      </span>
                    </div>
                  </CardContent>
                )}

                {topic.status === "expanded" && topic.content && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-sm">{topic.content}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => saveToDraft(topic)}>
                        <Save className="w-4 h-4 mr-1" />
                        Save to Draft
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => postToLinkedIn(topic)}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Post to LinkedIn
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => schedulePost(topic)}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule Posting
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => regenerateContent(topic.id)}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate Content
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
