"use client"

import { useState } from "react"
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
      // TODO: Replace with actual AI API call
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate API call

      await fetch("/api/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deduct", amount: 0.5 }),
      })

      // Mock generated posts
      const mockPosts: GeneratedPost[] = [
        {
          id: "1",
          content: `🚀 Just discovered an incredible insight about ${formData.prompt}!\n\nAfter years in the industry, I've learned that success isn't just about having the right strategy—it's about executing with precision and adapting quickly to change.\n\nHere are 3 key takeaways that transformed my approach:\n\n✅ Focus on value creation over feature accumulation\n✅ Build genuine relationships, not just networks\n✅ Embrace failure as your greatest teacher\n\nWhat's been your biggest game-changer this year? Drop your thoughts below! 👇\n\n#Leadership #Growth #Success`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
        {
          id: "2",
          content: `💡 Here's something that completely shifted my perspective on ${formData.prompt}...\n\nLast week, I had a conversation that reminded me why we do what we do. It's not just about the metrics or the bottom line—it's about the impact we create.\n\nThree principles that guide my daily decisions:\n\n1️⃣ Always ask "How does this serve others?"\n2️⃣ Choose progress over perfection\n3️⃣ Stay curious, even when you think you know\n\nThe best leaders I know aren't the ones with all the answers—they're the ones asking the right questions.\n\nWhat question changed your perspective recently? 🤔\n\n#Mindset #Leadership #Innovation`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
        {
          id: "3",
          content: `🎯 Quick story about ${formData.prompt} that might resonate with you...\n\nTwo years ago, I was stuck in analysis paralysis. Every decision felt monumental, every move had to be perfect.\n\nThen a mentor told me: "Done is better than perfect, but strategic is better than done."\n\nGame changer. 🔥\n\nNow I follow the 70% rule:\n• If I'm 70% confident, I move forward\n• I gather feedback quickly\n• I iterate based on real data, not assumptions\n\nResult? Faster growth, better outcomes, less stress.\n\nSometimes the best strategy is simply starting.\n\nWhat's one decision you've been overthinking? Let's discuss! 💬\n\n#Strategy #Productivity #Entrepreneurship`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
        {
          id: "4",
          content: `🌟 Unpopular opinion about ${formData.prompt}:\n\nEveryone talks about "work-life balance," but I think we're approaching it wrong.\n\nIt's not about perfect balance—it's about intentional integration.\n\nSome days, work demands more. Some days, life takes priority. The key is being present wherever you are.\n\nMy framework:\n🔹 Set clear boundaries, but stay flexible\n🔹 Communicate expectations early and often\n🔹 Protect your energy, not just your time\n🔹 Remember: saying no to good things means saying yes to great things\n\nBalance isn't a destination—it's a daily practice.\n\nHow do you manage competing priorities? Share your approach! 👇\n\n#WorkLifeBalance #Productivity #Wellness`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
        {
          id: "5",
          content: `📈 Data point that surprised me about ${formData.prompt}:\n\n87% of professionals say they learn more from failure than success, yet we still celebrate wins and hide losses.\n\nTime to flip the script.\n\nHere's what I learned from my biggest "failure" last quarter:\n\n❌ What went wrong: Assumed I knew what customers wanted\n✅ What I learned: Always validate assumptions with real users\n🚀 What changed: Now I prototype fast and test faster\n\nResult: 40% improvement in product-market fit scores.\n\nFailure isn't the opposite of success—it's a stepping stone to it.\n\nWhat's one failure that became your biggest teacher? Let's normalize learning from setbacks! 💪\n\n#Growth #Learning #Resilience`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
        {
          id: "6",
          content: `🔥 Controversial take on ${formData.prompt}:\n\nNetworking events are overrated. Real relationships are built in the trenches, not at cocktail parties.\n\nThe best connections I've made happened when:\n• Helping someone solve a real problem\n• Collaborating on meaningful projects\n• Sharing honest struggles and victories\n• Following up with genuine value, not just "checking in"\n\nAuthentic relationships > Transactional networking\n\nStop collecting business cards. Start creating value.\n\nThe network effect happens naturally when you focus on being genuinely helpful.\n\nWhat's the most valuable professional relationship you've built? How did it start? 🤝\n\n#Networking #Relationships #Value`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
      ]

      setGeneratedPosts(mockPosts)
      toast({
        title: "Success!",
        description: `Generated ${mockPosts.length} LinkedIn posts for you`,
      })
    } catch (error) {
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

  const handlePostNow = async () => {
    try {
      await fetch("/api/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deduct", amount: 0.5 }),
      })
    } catch (error) {
      console.error("Failed to deduct posting credits:", error)
    }

    // TODO: Implement LinkedIn API posting
    toast({
      title: "Posted!",
      description: "Your post has been published to LinkedIn",
    })
    setShowPreviewModal(false)
  }

  const handleSchedulePost = () => {
    // TODO: Implement scheduling logic
    toast({
      title: "Scheduled!",
      description: "Your post has been scheduled for later",
    })
    setShowPreviewModal(false)
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
                  </SelectContent>
                </Select>
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
                <Button onClick={handlePostNow} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Post Now
                </Button>
                <Button onClick={handleSchedulePost} variant="outline" className="flex-1 bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
                <Button onClick={handleSaveDraft} variant="outline" className="flex-1 bg-transparent">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
