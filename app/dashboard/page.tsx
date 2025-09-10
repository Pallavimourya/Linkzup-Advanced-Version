"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Loader2,
  X,
  Mic,
  Hash,
  Smile,
  MousePointer,
  Layers,
  BookOpen,
  User,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

import { LinkedInPostButton } from "@/components/linkedin-post-button"
import { ScheduleButton } from "@/components/schedule-button"
import { AICustomizationPanel, type CustomizationOptions } from "@/components/ai-customization-panel"
import { MicrophoneButton } from "@/components/ui/microphone-button"
import { LinkedInPostPreview } from "@/components/linkedin-post-preview"
import { EnhancedLinkedInPreview } from "@/components/enhanced-linkedin-preview"


interface GeneratedPost {
  id: string
  content: string
  tone: string
  wordCount: number
  createdAt: Date
}

export default function DashboardPage() {
  const { data: session, update: updateSession } = useSession()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check for LinkedIn connection success/error messages and refresh session
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success === 'linkedin_connected') {
      // Refresh session to get updated LinkedIn connection status
      updateSession().then(() => {
        // Clear the success parameter from URL after successful update
        const url = new URL(window.location.href)
        url.searchParams.delete('success')
        window.history.replaceState({}, '', url.toString())
      }).catch((error) => {
        console.error('Failed to update session:', error)
        // Force page reload as fallback
        window.location.reload()
      })
      
      toast({
        title: "LinkedIn Connected!",
        description: "Your LinkedIn account has been successfully connected. You can now post content directly to LinkedIn.",
      })
    } else if (error) {
      toast({
        title: "LinkedIn Connection Failed",
        description: `Failed to connect LinkedIn: ${error}`,
        variant: "destructive",
      })
    }
  }, [searchParams, updateSession, toast])
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState<string>("linkedin-post")
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai")
  
  // Image Management State
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedSource, setSelectedSource] = useState("unsplash")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResults, setAiResults] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Edit functionality state
  const [isEditing, setIsEditing] = useState(false)
  const [editableContent, setEditableContent] = useState("")
  
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

  // Recommended topics data - 50 topics
  const recommendedTopics = [
    "Remote work productivity tips",
    "Industry trends and insights",
    "Personal career journey",
    "Team collaboration strategies",
    "Leadership lessons learned",
    "Digital transformation insights",
    "Customer success stories",
    "Innovation in business",
    "Work-life balance tips",
    "Professional networking advice",
    "Startup challenges and solutions",
    "Technology adoption strategies",
    "Employee engagement ideas",
    "Market analysis and predictions",
    "Sustainability in business",
    "Diversity and inclusion initiatives",
    "Mental health in the workplace",
    "Future of work trends",
    "Client relationship building",
    "Productivity hacks and tools",
    "AI and automation impact",
    "Building company culture",
    "Sales and marketing strategies",
    "Financial planning for professionals",
    "Mentorship and career growth",
    "Digital marketing trends",
    "Entrepreneurship journey",
    "Data-driven decision making",
    "Customer experience optimization",
    "Brand building strategies",
    "Project management best practices",
    "Cybersecurity awareness",
    "E-commerce growth tactics",
    "Social media marketing",
    "Content creation strategies",
    "Business development tips",
    "Investment and wealth building",
    "Supply chain optimization",
    "Human resources insights",
    "Quality assurance processes",
    "Risk management strategies",
    "International business expansion",
    "Product development lifecycle",
    "Customer retention techniques",
    "Performance metrics and KPIs",
    "Change management strategies",
    "Vendor relationship management",
    "Compliance and regulations",
    "Innovation and R&D",
    "Strategic planning methods",
    "Crisis management approaches",
    "Partnership and collaboration",
    "Market research techniques",
    "Competitive analysis strategies",
    "Business process improvement",
    "Digital security best practices",
    "Remote team management",
    "Customer feedback systems",
    "Business automation tools",
    "Professional development planning"
  ]

  // Get 12 random topics
  const getRandomTopics = () => {
    const shuffled = [...recommendedTopics].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 12)
  }

  // Function to get appropriate icon for each topic
  const getTopicIcon = (topic: string) => {
    const topicLower = topic.toLowerCase()
    
    if (topicLower.includes('remote') || topicLower.includes('work') || topicLower.includes('productivity')) {
      return <MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('leadership') || topicLower.includes('team') || topicLower.includes('management')) {
      return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('marketing') || topicLower.includes('sales') || topicLower.includes('brand')) {
      return <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('ai') || topicLower.includes('technology') || topicLower.includes('digital')) {
      return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('career') || topicLower.includes('personal') || topicLower.includes('journey')) {
      return <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('business') || topicLower.includes('strategy') || topicLower.includes('growth')) {
      return <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('innovation') || topicLower.includes('startup') || topicLower.includes('entrepreneur')) {
      return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('data') || topicLower.includes('analytics') || topicLower.includes('metrics')) {
      return <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('customer') || topicLower.includes('client') || topicLower.includes('experience')) {
      return <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else if (topicLower.includes('finance') || topicLower.includes('investment') || topicLower.includes('wealth')) {
      return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    } else {
      return <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    }
  }

  const [randomTopics, setRandomTopics] = useState(getRandomTopics())
  const [clickedTopic, setClickedTopic] = useState<string | null>(null)

  // Shuffle topics on every page visit
  useEffect(() => {
    setRandomTopics(getRandomTopics())
  }, [])

  // Handle recommended topic click
  const handleTopicClick = async (topic: string) => {
    setPrompt(topic)
    setClickedTopic(topic)
    
    // Wait for prompt to be set, then open customization panel
    setTimeout(() => {
      setShowCustomizationPanel(true)
      setClickedTopic(null)
    }, 200)
  }

  const imageSources = [
    { value: "unsplash", label: "Unsplash" },
    { value: "pexels", label: "Pexels" },
    { value: "pixabay", label: "Pixabay" },
    { value: "google", label: "Google Images" },
  ]

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

    // Close the generation modal immediately
    setShowGenerationModal(false)
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
    setEditableContent(post.content)
    setIsEditing(false)
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

  // Image Management Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select only image files",
            variant: "destructive",
          })
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setUploadedImages(prev => [...prev, data.url])
          toast({
            title: "Upload successful",
            description: "Image uploaded to Cloudinary",
          })
        } else {
          throw new Error('Upload failed')
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchImages = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/search-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          source: selectedSource,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.images && data.images.length > 0) {
          setSearchResults(data.images)
          toast({
            title: "Search Complete",
            description: `Found ${data.images.length} images for "${searchQuery}" from ${data.source}`,
          })
        } else {
          setSearchResults([])
          toast({
            title: "No Images Found",
            description: `No images found for "${searchQuery}". Try a different search term.`,
            variant: "destructive"
          })
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Search failed")
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newResult = {
          id: Date.now().toString(),
          url: data.url,
          prompt: aiPrompt,
          timestamp: new Date(),
        }
        setAiResults(prev => [newResult, ...prev])
        setAiPrompt("")
        toast({
          title: "Image generated",
          description: "AI image generated successfully",
        })
      } else {
        throw new Error('Generation failed')
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    toast({
      title: "Image selected",
      description: "Image has been selected for your content",
    })
  }

  // Edit functions
  const handleEdit = () => {
    if (selectedPost) {
      setIsEditing(true)
      setEditableContent(selectedPost.content)
    }
  }

  const handleSaveEdit = () => {
    if (selectedPost) {
      setIsEditing(false)
      setSelectedPost({
        ...selectedPost,
        content: editableContent
      })
      toast({
        title: "Content updated",
        description: "Your post content has been updated successfully.",
      })
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (selectedPost) {
      setEditableContent(selectedPost.content)
    }
  }

  const handleClosePreview = (open: boolean) => {
    if (!open) {
      setIsEditing(false)
      setSelectedImage(null)
    }
    setShowPreviewModal(open)
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-2 sm:px-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1 flex-shrink-0" />
        </div>
      </header>


      {/* Content Generator */}
      <div className={`px-2 sm:px-4 space-y-4 sm:space-y-6 pb-6 transition-all duration-300 ${
        showCustomizationPanel ? 'blur-sm' : ''
      }`}>
        {/* Show form only when not generating and no content generated */}
        {!isGenerating && generatedPosts.length === 0 && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  Create your next post
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Describe what you want to post about, and our AI will generate engaging content for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Main Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm sm:text-base">What would you like to post about?</Label>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mic className="h-3 w-3" />
                    Tip: Click the microphone icon to record your prompt instead of typing
                  </p>
                  <div className="relative">
                    <Textarea
                      id="prompt"
                      placeholder="e.g., Share insights about remote work productivity, discuss industry trends, celebrate a team achievement..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[70px] sm:min-h-[80px] md:min-h-[100px] text-sm sm:text-base resize-none pr-10 sm:pr-12 border-2 border-black"
                    />
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
                      <MicrophoneButton
                        onTranscript={(transcript) => setPrompt(prev => prev + (prev ? ' ' : '') + transcript.trim())}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-muted"
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={() => setShowCustomizationPanel(true)}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full relative overflow-hidden h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Generate Content</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Cards */}
        {!isGenerating && generatedPosts.length === 0 && (
          <div className="space-y-6 sm:space-y-8">
            {/* Section Title */}
            <h2 className="text-[28px] sm:text-[34px] md:text-[46px] font-bold text-gray-900 ml-[10px] sm:ml-[25px] flex items-center gap-3">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              Create with AI
            </h2>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Carousel Card */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 bg-white border border-gray-200 shadow-sm hover:shadow-md"
                onClick={() => router.push('/dashboard/ai-carousel')}
              >
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                    <div className="p-2 sm:p-3 md:p-4 bg-purple-100 rounded-lg flex-shrink-0">
                      <Layers className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Carousels</h3>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">Swipe-worthy carousels in seconds</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Topics Card */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 bg-white border border-gray-200 shadow-sm hover:shadow-md"
                onClick={() => router.push('/dashboard/ai-articles')}
              >
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                    <div className="p-2 sm:p-3 md:p-4 bg-purple-100 rounded-lg flex-shrink-0">
                      <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Post Ideas</h3>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">Craft magnetic personal headlines</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Story Card */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 bg-white border border-gray-200 shadow-sm hover:shadow-md"
                onClick={() => router.push('/dashboard/personal-story')}
              >
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                    <div className="p-2 sm:p-3 md:p-4 bg-purple-100 rounded-lg flex-shrink-0">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Story</h3>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">Share your personal journey</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recommended Topics Section */}
        {!isGenerating && generatedPosts.length === 0 && (
          <div className="space-y-6 sm:space-y-8">
            {/* Section Title */}
            <div className="flex items-center justify-between ml-[10px] sm:ml-[25px]">
              <h2 className="text-[28px] sm:text-[34px] md:text-[46px] font-bold text-gray-900 flex items-center gap-3">
                <Hash className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                Recommended Topics for Your Next Post
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRandomTopics(getRandomTopics())
                  toast({
                    title: "Topics Refreshed!",
                    description: "New topic suggestions have been loaded.",
                  })
                }}
                className="mr-[10px] sm:mr-[25px]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {/* Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {randomTopics.map((topic, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 bg-white border shadow-sm hover:shadow-md hover:border-primary/30 ${
                    clickedTopic === topic 
                      ? 'border-primary bg-primary/5 scale-105' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleTopicClick(topic)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        clickedTopic === topic 
                          ? 'bg-primary/20' 
                          : 'bg-primary/10'
                      }`}>
                        {clickedTopic === topic ? (
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        ) : (
                          getTopicIcon(topic)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base font-medium leading-tight ${
                          clickedTopic === topic 
                            ? 'text-primary' 
                            : 'text-gray-900'
                        }`}>
                          {topic}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Show loading state when generating */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Generating Your Content</h3>
              <p className="text-sm text-muted-foreground">Our AI is crafting engaging LinkedIn posts for you...</p>
            </div>
          </div>
        )}

        {/* Generated Posts - Centered when content is generated */}
        {generatedPosts.length > 0 && (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-4xl bg-white">
              <div className="pb-4 sm:pb-6 text-center">
                <h2 className="flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold text-foreground mb-2">
                  <Target className="w-5 h-5 text-primary flex-shrink-0" />
                  Generated Content ({generatedPosts.length})
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Select content to preview and customize before publishing to LinkedIn.
                </p>
              </div>
              <div className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {generatedPosts.map((post, index) => (
                    <LinkedInPostPreview
                      key={post.id}
                      content={post.content}
                      tone={post.tone}
                      wordCount={post.wordCount}
                      onClick={() => handleSelectPost(post)}
                      className="hover:shadow-lg transition-all duration-200"
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Generate More Button */}
            <Button
              onClick={() => {
                setGeneratedPosts([])
                setShowAdvanced(false)
              }}
              variant="outline"
              className="px-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate More Content
            </Button>
          </div>
        )}
      </div>

      {/* Customization Panel - Overlay */}
      {showCustomizationPanel && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[45%] bg-white h-full shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Customize your post</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomizationPanel(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Input Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">What would you like to post about?</Label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full"
                  placeholder="Enter your topic..."
                />
              </div>

              {/* Original Customization Options */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tone</Label>
                    <Select
                      value={customization.tone}
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, tone: value as any }))}
                    >
                      <SelectTrigger className="h-10 sm:h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Word Count</Label>
                    <Select
                      value={customization.wordCount?.toString()}
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, wordCount: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-10 sm:h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 words</SelectItem>
                        <SelectItem value="150">150 words</SelectItem>
                        <SelectItem value="200">200 words</SelectItem>
                        <SelectItem value="250">250 words</SelectItem>
                        <SelectItem value="300">300 words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Language</Label>
                  <Select
                    value={customization.language}
                    onValueChange={(value) => setCustomization(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                      </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Content Type</Label>
                  <Select
                    value={contentType}
                    onValueChange={(value) => setContentType(value as any)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin-post">LinkedIn Post</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <Input
                    placeholder="e.g., LinkedIn professionals"
                    value={customization.targetAudience}
                    onChange={(e) => setCustomization(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="h-10 sm:h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Main Goal</Label>
                  <Select
                    value={customization.mainGoal}
                    onValueChange={(value) => setCustomization(prev => ({ ...prev, mainGoal: value as any }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Features */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-medium">Content Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        <Label className="text-sm">Include Hashtags</Label>
                      </div>
                      <input
                        type="checkbox"
                        checked={customization.includeHashtags}
                        onChange={(e) => setCustomization(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                        className="h-5 w-5 sm:h-4 sm:w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4" />
                        <Label className="text-sm">Include Emojis</Label>
                      </div>
                      <input
                        type="checkbox"
                        checked={customization.includeEmojis}
                        onChange={(e) => setCustomization(prev => ({ ...prev, includeEmojis: e.target.checked }))}
                        className="h-5 w-5 sm:h-4 sm:w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MousePointer className="w-4 h-4" />
                        <Label className="text-sm">Call to Action</Label>
                      </div>
                      <input
                        type="checkbox"
                        checked={customization.callToAction}
                        onChange={(e) => setCustomization(prev => ({ ...prev, callToAction: e.target.checked }))}
                        className="h-5 w-5 sm:h-4 sm:w-4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  onClick={async () => {
                    setShowCustomizationPanel(false)
                    await handleGenerate()
                  }}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full h-10 sm:h-11 md:h-12"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Preview Modal */}
      {showPreviewModal && selectedPost && (
        <EnhancedLinkedInPreview
          content={selectedPost.content}
          onSaveToDraft={(content, title, format) => handleSaveDraft(content, title, format)}
          onClose={handleClosePreview}
          onContentUpdate={(newContent) => {
            setSelectedPost(prev => prev ? { ...prev, content: newContent } : null)
          }}
        />
      )}

      {/* Generation Modal */}
      {/* Generation Modal */}
      <Dialog open={showGenerationModal} onOpenChange={setShowGenerationModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-2 sm:mx-4 lg:mx-auto w-[calc(100vw-1rem)] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Generate Content</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Review your settings and generate content with AI.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Prompt Preview */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Your Topic</Label>
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm sm:text-base">{prompt}</p>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Current Settings</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Content Type:</span>
                  <Badge variant="outline" className="text-xs">{contentType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tone:</span>
                  <Badge variant="outline" className="text-xs">{customization.tone}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Word Count:</span>
                  <Badge variant="outline" className="text-xs">{customization.wordCount} words</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Language:</span>
                  <Badge variant="outline" className="text-xs">{customization.language}</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowGenerationModal(false)} className="w-full sm:w-auto min-h-[40px]">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleGenerate()
                  setShowGenerationModal(false)
                }}
                disabled={isGenerating}
                className="relative overflow-hidden w-full sm:w-auto min-h-[40px]"
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
