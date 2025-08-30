"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Copy, 
  Download, 
  Share2, 
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,

} from "lucide-react"
import { useAIGeneration } from "@/hooks/use-ai-generation"
import { AIQueueStatus } from "@/components/ai-queue-status"
import { useToast } from "@/hooks/use-toast"

import type { ContentType, AIProvider, CustomizationOptions, AIResponse } from "@/lib/ai-service"

export default function AIGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState<ContentType>("linkedin-post")
  const [provider] = useState<AIProvider>("openai") // Always use OpenAI
  const [customization, setCustomization] = useState<CustomizationOptions>({
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
  })
  const [generatedContent, setGeneratedContent] = useState<AIResponse | null>(null)

  const { toast } = useToast()

  const {
    isGenerating,
    progress,
    queueStatus,
    generateContent,
    generateLinkedInPosts,
    generateTopics,
    generateArticle,
    generateCarousel,
    generateFormattedContent,
    abortGeneration,
    canGenerate,
    estimatedWaitTime
  } = useAIGeneration()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    const response = await generateContent({
      type: contentType,
      prompt: prompt.trim(),
      provider,
      customization
    })

    if (response) {
      setGeneratedContent(response)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }



  const saveToDraft = async (content: string, title: string, format: string = "content") => {
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

  const formatContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index} className="mb-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{contentType === "linkedin-post" ? "Post" : "Variation"} {index + 1}</Badge>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(item)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => downloadContent(item, `${contentType}-${index + 1}.txt`)}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveToDraft(item, `${contentType} ${index + 1}`, contentType)}
              >
                <Save className="w-4 h-4" />
                Save to Draft
              </Button>
            </div>
          </div>
          <div className="whitespace-pre-wrap text-sm">{item}</div>
        </div>
      ))
    }
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">Generated Content</Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(content)}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => downloadContent(content, "generated-content.txt")}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => saveToDraft(content, `${contentType} content`, contentType)}
            >
              <Save className="w-4 h-4" />
              Save to Draft
            </Button>
          </div>
        </div>
        <div className="whitespace-pre-wrap text-sm">{content}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Content Generator</h1>
          <p className="text-muted-foreground">
            Generate high-quality content with 6 variations for each type using OpenAI
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Powered by OpenAI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Generation Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle>Content Prompt</CardTitle>
              <CardDescription>
                Describe what you want to generate. Be specific for better results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">What would you like to create?</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., Share insights about remote work productivity, discuss industry trends, create viral topics for marketing..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>


              
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || !prompt.trim() || isGenerating}
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
                      Generate Content
                    </>
                  )}
                </Button>
                
                {isGenerating && (
                  <Button
                    variant="outline"
                    onClick={abortGeneration}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Content */}
          {generatedContent && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Content</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {generatedContent.metadata.provider}
                    </Badge>
                    <Badge variant="outline">
                      {generatedContent.metadata.model}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Generated in {generatedContent.metadata.processingTime}ms using {generatedContent.metadata.tokensUsed} tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formatContent(generatedContent.content)}
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Provider:</span> {generatedContent.metadata.provider}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {generatedContent.metadata.model}
                  </div>
                  <div>
                    <span className="font-medium">Tokens:</span> {generatedContent.metadata.tokensUsed}
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span> ${generatedContent.metadata.cost.toFixed(4)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Queue Status */}
          <AIQueueStatus
            queueStatus={queueStatus}
            isGenerating={isGenerating}
            progress={progress}
            estimatedWaitTime={estimatedWaitTime}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Generate common content types with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setContentType("topics")
                setPrompt("Marketing")
                handleGenerate()
              }}
              disabled={isGenerating}
            >
              Generate Topics
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setContentType("linkedin-post")
                setPrompt("Remote work productivity tips")
                handleGenerate()
              }}
              disabled={isGenerating}
            >
              LinkedIn Posts
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setContentType("article")
                setPrompt("Digital marketing trends 2024")
                handleGenerate()
              }}
              disabled={isGenerating}
            >
              Article
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setContentType("carousel")
                setPrompt("Leadership skills")
                handleGenerate()
              }}
              disabled={isGenerating}
            >
              Carousel
            </Button>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
