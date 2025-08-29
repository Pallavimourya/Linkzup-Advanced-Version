"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Wand2,
  Target,
  Users,
  Calendar,
  ImageIcon,
  Upload,
  Search,
  Palette,
  Send,
  Save,
  Eye,
  Settings,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { CreditDisplay } from "@/components/credit-display"
import { LinkedInPostButton } from "@/components/linkedin-post-button"
import { AICustomizationPanel, type CustomizationOptions } from "@/components/ai-customization-panel"


interface GeneratedPost {
  id: string
  content: string
  tone: string
  wordCount: number
  createdAt: Date
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState<string>("linkedin-post")
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai")
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

  // Handle LinkedIn connection feedback
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'linkedin_connected') {
      toast({
        title: "Success",
        description: "LinkedIn account connected successfully!",
      })
    } else if (error) {
      const errorMessages: Record<string, string> = {
        linkedin_oauth_failed: "LinkedIn connection failed. Please try again.",
        missing_params: "Missing required parameters for LinkedIn connection.",
        invalid_state: "Invalid state parameter. Please try again.",
        token_exchange_failed: "Failed to exchange authorization code. Please try again.",
        profile_fetch_failed: "Failed to fetch LinkedIn profile. Please try again.",
        callback_failed: "LinkedIn connection callback failed. Please try again.",
      }
      
      toast({
        title: "Error",
        description: errorMessages[error] || "LinkedIn connection failed. Please try again.",
        variant: "destructive",
      })
    }
  }, [searchParams])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate content",
        variant: "destructive",
      })
      return
    }

    try {
      const creditResponse = await fetch("/api/billing/credits")
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()

        // Check if user has trial or credits
        if (!creditData.isTrialActive && creditData.credits < 0.5) {
          toast({
            title: "Insufficient Credits",
            description: "You need at least 0.5 credits to generate content. Please purchase more credits.",
            variant: "destructive",
          })
          // Redirect to billing page
          window.location.href = "/dashboard/billing"
          return
        }
      }
    } catch (error) {
      console.error("Failed to check credits:", error)
    }

    setIsGenerating(true)

    try {
      // Call the centralized AI API with customization
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          prompt: prompt,
          provider: provider,
          customization: customization
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      const generatedPosts: GeneratedPost[] = Array.isArray(data.data.content) 
        ? data.data.content.map((content: string, index: number) => ({
            id: `post-${Date.now()}-${index}`,
            content,
            tone: customization.tone || "professional",
            wordCount: customization.wordCount || 150,
            createdAt: new Date(),
          }))
        : [{
            id: `post-${Date.now()}-0`,
            content: data.data.content as string,
            tone: customization.tone || "professional",
            wordCount: customization.wordCount || 150,
            createdAt: new Date(),
          }]

      // Credits are automatically deducted by the centralized API

      setGeneratedPosts(generatedPosts)
      toast({
        title: "Success!",
        description: `Generated ${generatedPosts.length} unique ${contentType} content for you`,
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

  const handleSelectPost = (post: GeneratedPost) => {
    setSelectedPost(post)
    setShowPreviewModal(true)
  }

  const handleSaveDraft = async () => {
    if (!selectedPost) return

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `AI Generated ${contentType}`,
          content: selectedPost.content,
          format: contentType,
          niche: "AI Generated"
        })
      })

      if (response.ok) {
        toast({
          title: "Draft Saved!",
          description: "Your content has been saved to drafts successfully.",
        })
        setShowPreviewModal(false)
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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Content Generator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <CreditDisplay />
        </div>
      </header>

      {/* Welcome Section */}
      <div className="px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to create engaging LinkedIn content with AI? Let's generate some amazing posts for your audience.
          </p>
        </div>
      </div>

      {/* Content Generator */}
      <div className="px-4 space-y-6">
        {/* Main Content Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Content Generator
              </CardTitle>
              <CardDescription>
                Describe what you want to post about, and our AI will generate engaging content for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">What would you like to post about?</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., Share insights about remote work productivity, discuss industry trends, celebrate a team achievement..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* AI Customization Panel - Collapsible */}
              <div className="border rounded-lg">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Customization Options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{customization.tone}</Badge>
                    <Badge variant="outline">{customization.wordCount} words</Badge>
                    <span className="text-sm text-muted-foreground">
                      {showAdvanced ? "Hide" : "Show"}
                    </span>
                  </div>
                </button>
                
                {showAdvanced && (
                  <div className="p-4 border-t">
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
                onClick={() => setShowGenerationModal(true)}
                disabled={!prompt.trim() || isGenerating}
                className="w-full relative overflow-hidden"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="absolute inset-0 bg-primary/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    <div className="relative flex items-center justify-center w-full">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Generating Content...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Posts */}
          {generatedPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Generated Content ({generatedPosts.length})
                </CardTitle>
                <CardDescription>Select content to preview and customize before publishing to LinkedIn.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {generatedPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectPost(post)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{post.tone}</Badge>
                          <Badge variant="outline">{post.wordCount} words</Badge>
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>


      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Content</DialogTitle>
            <DialogDescription>
              Review your generated content before publishing to LinkedIn.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{selectedPost.tone}</Badge>
                  <Badge variant="outline">{selectedPost.wordCount} words</Badge>
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {selectedPost.content}
                </div>
              </div>
              
              <div className="flex gap-2">
                <LinkedInPostButton content={selectedPost.content} />
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Drafts
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generation Modal */}
      <Dialog open={showGenerationModal} onOpenChange={setShowGenerationModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Content</DialogTitle>
            <DialogDescription>
              Review your settings and generate content with AI.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Prompt Preview */}
            <div className="space-y-2">
              <Label>Your Topic</Label>
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm">{prompt}</p>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="space-y-2">
              <Label>Current Settings</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Content Type:</span>
                  <Badge variant="outline">{contentType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tone:</span>
                  <Badge variant="outline">{customization.tone}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Word Count:</span>
                  <Badge variant="outline">{customization.wordCount} words</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Language:</span>
                  <Badge variant="outline">{customization.language}</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowGenerationModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleGenerate()
                  setShowGenerationModal(false)
                }}
                disabled={isGenerating}
                className="relative overflow-hidden"
              >
                {isGenerating ? (
                  <>
                    <div className="absolute inset-0 bg-primary/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    <div className="relative flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Generating...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
