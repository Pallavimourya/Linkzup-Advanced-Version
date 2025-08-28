"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { CreditDisplay } from "@/components/credit-display"
import { LinkedInPostButton } from "@/components/linkedin-post-button"

interface GeneratedPost {
  id: string
  content: string
  tone: string
  wordCount: number
  createdAt: Date
}

interface ContentGeneratorForm {
  prompt: string
  tone: string
  language: string
  wordCount: string
  targetAudience: string
  mainGoal: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const [formData, setFormData] = useState<ContentGeneratorForm>({
    prompt: "",
    tone: "",
    language: "english",
    wordCount: "150",
    targetAudience: "",
    mainGoal: "",
  })

  const handleInputChange = (field: keyof ContentGeneratorForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
    if (!formData.prompt.trim()) {
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
      // Call the new AI API with all form parameters
      const response = await fetch("/api/ai/generate-linkedin-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate posts")
      }

      const data = await response.json()
      const generatedPosts: GeneratedPost[] = data.posts

      // Deduct credits after successful generation
      await fetch("/api/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deduct", amount: 0.5 }),
      })

      setGeneratedPosts(generatedPosts)
      toast({
        title: "Success!",
        description: `Generated ${generatedPosts.length} unique LinkedIn posts for you`,
      })
    } catch (error) {
      console.error("Error generating posts:", error)
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
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



  const handleSaveDraft = () => {
    // TODO: Implement draft saving
    toast({
      title: "Saved!",
      description: "Your post has been saved to drafts",
    })
    setShowPreviewModal(false)
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
      <div className="grid gap-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              AI Content Generator
            </CardTitle>
            <CardDescription>
              Describe what you want to post about, and our AI will generate engaging LinkedIn content for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">What would you like to post about?</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., Share insights about remote work productivity, discuss industry trends, celebrate a team achievement..."
                value={formData.prompt}
                onChange={(e) => handleInputChange("prompt", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Configuration Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange("tone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="thought-leadership">Thought Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordCount">Word Count</Label>
                <Select value={formData.wordCount} onValueChange={(value) => handleInputChange("wordCount", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">Short (50 words)</SelectItem>
                    <SelectItem value="100">Medium (100 words)</SelectItem>
                    <SelectItem value="150">Standard (150 words)</SelectItem>
                    <SelectItem value="200">Long (200 words)</SelectItem>
                    <SelectItem value="300">Extended (300 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Software developers, Marketing professionals, Entrepreneurs..."
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainGoal">Main Goal</Label>
                <Select value={formData.mainGoal} onValueChange={(value) => handleInputChange("mainGoal", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select main goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engagement">Drive Engagement</SelectItem>
                    <SelectItem value="awareness">Build Awareness</SelectItem>
                    <SelectItem value="leads">Generate Leads</SelectItem>
                    <SelectItem value="thought-leadership">Establish Thought Leadership</SelectItem>
                    <SelectItem value="networking">Expand Network</SelectItem>
                    <SelectItem value="education">Educate Audience</SelectItem>
                    <SelectItem value="brand-building">Build Brand</SelectItem>
                    <SelectItem value="community">Build Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Configuration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">AI Configuration</Label>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Your customization settings will be used to generate unique, tailored content</p>
                <p>• Each post will be optimized for your target audience and goals</p>
                <p>• Content will be formatted specifically for LinkedIn with proper hashtags and emojis</p>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate LinkedIn Posts
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
                Generated Posts ({generatedPosts.length})
              </CardTitle>
              <CardDescription>Select a post to preview and customize before publishing to LinkedIn.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {generatedPosts.map((post, index) => (
                  <Card key={post.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Post {index + 1}</Badge>
                            <Badge variant="outline">{post.tone}</Badge>
                            <Badge variant="outline">{post.wordCount} words</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                        </div>
                        <Button onClick={() => handleSelectPost(post)} variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Post Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
            <DialogDescription>Review your post and add images before publishing to LinkedIn.</DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <div className="space-y-6">
              {/* LinkedIn Preview */}
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{session?.user?.name || "Your Name"}</h4>
                    <p className="text-sm text-muted-foreground">Professional Title • Now</p>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm mb-4">{selectedPost.content}</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔄 Repost</span>
                  <span>📤 Send</span>
                </div>
              </div>

              {/* Image Options */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Add Images (Optional)</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="search">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </TabsTrigger>
                    <TabsTrigger value="ai">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate
                    </TabsTrigger>
                    <TabsTrigger value="carousel">
                      <Palette className="w-4 h-4 mr-2" />
                      Carousel
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Drag and drop images here, or click to browse</p>
                      <Button variant="outline">Choose Files</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="search" className="mt-4">
                    <div className="space-y-4">
                      <Input placeholder="Search for images (e.g., business meeting, technology, success)" />
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4">
                    <div className="space-y-4">
                      <Input placeholder="Describe the image you want to generate..." />
                      <Button className="w-full">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Image
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="carousel" className="mt-4">
                    <div className="text-center py-8">
                      <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Select from your saved carousel designs</p>
                      <Button variant="outline">Browse Carousels</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

                             {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-3">
                 <LinkedInPostButton
                   content={selectedPost.content}
                   variant="post"
                   className="flex-1"
                   onSuccess={() => setShowPreviewModal(false)}
                 />
                 <LinkedInPostButton
                   content={selectedPost.content}
                   variant="schedule"
                   className="flex-1"
                   scheduledFor={new Date(Date.now() + 60 * 60 * 1000)} // 1 hour from now
                   onSuccess={() => setShowPreviewModal(false)}
                 />
                 <Button onClick={handleSaveDraft} variant="outline" className="flex-1 bg-transparent">
                   <Save className="w-4 h-4 mr-2" />
                   Save as Draft
                 </Button>
               </div>
               
               {!session?.user?.linkedinConnected && (
                 <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                   <p className="text-sm text-yellow-800">
                     💡 Connect your LinkedIn account to post content directly to LinkedIn
                   </p>
                 </div>
               )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
