"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
  const [imageSearchQuery, setImageSearchQuery] = useState("")
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

  // Recommended topics data with categories - 50 topics
  const recommendedTopics = [
    { topic: "Remote work productivity tips", category: "productivity" },
    { topic: "Industry trends and insights", category: "trends" },
    { topic: "Personal career journey", category: "career" },
    { topic: "Team collaboration strategies", category: "leadership" },
    { topic: "Leadership lessons learned", category: "leadership" },
    { topic: "Digital transformation insights", category: "technology" },
    { topic: "Customer success stories", category: "business" },
    { topic: "Innovation in business", category: "innovation" },
    { topic: "Work-life balance tips", category: "lifestyle" },
    { topic: "Professional networking advice", category: "career" },
    { topic: "Startup challenges and solutions", category: "entrepreneurship" },
    { topic: "Technology adoption strategies", category: "technology" },
    { topic: "Employee engagement ideas", category: "leadership" },
    { topic: "Market analysis and predictions", category: "business" },
    { topic: "Sustainability in business", category: "sustainability" },
    { topic: "Diversity and inclusion initiatives", category: "culture" },
    { topic: "Mental health in the workplace", category: "wellness" },
    { topic: "Future of work trends", category: "trends" },
    { topic: "Client relationship building", category: "business" },
    { topic: "Productivity hacks and tools", category: "productivity" },
    { topic: "AI and automation impact", category: "technology" },
    { topic: "Building company culture", category: "culture" },
    { topic: "Sales and marketing strategies", category: "marketing" },
    { topic: "Financial planning for professionals", category: "finance" },
    { topic: "Mentorship and career growth", category: "career" },
    { topic: "Digital marketing trends", category: "marketing" },
    { topic: "Entrepreneurship journey", category: "entrepreneurship" },
    { topic: "Data-driven decision making", category: "analytics" },
    { topic: "Customer experience optimization", category: "business" },
    { topic: "Brand building strategies", category: "marketing" },
    { topic: "Project management best practices", category: "productivity" },
    { topic: "Cybersecurity awareness", category: "technology" },
    { topic: "E-commerce growth tactics", category: "business" },
    { topic: "Social media marketing", category: "marketing" },
    { topic: "Content creation strategies", category: "marketing" },
    { topic: "Business development tips", category: "business" },
    { topic: "Investment and wealth building", category: "finance" },
    { topic: "Supply chain optimization", category: "business" },
    { topic: "Human resources insights", category: "leadership" },
    { topic: "Quality assurance processes", category: "productivity" },
    { topic: "Risk management strategies", category: "business" },
    { topic: "International business expansion", category: "business" },
    { topic: "Product development lifecycle", category: "innovation" },
    { topic: "Customer retention techniques", category: "business" },
    { topic: "Performance metrics and KPIs", category: "analytics" },
    { topic: "Change management strategies", category: "leadership" },
    { topic: "Vendor relationship management", category: "business" },
    { topic: "Compliance and regulations", category: "business" },
    { topic: "Innovation and R&D", category: "innovation" },
    { topic: "Strategic planning methods", category: "business" },
    { topic: "Crisis management approaches", category: "leadership" },
    { topic: "Partnership and collaboration", category: "business" },
    { topic: "Market research techniques", category: "analytics" },
    { topic: "Competitive analysis strategies", category: "business" },
    { topic: "Business process improvement", category: "productivity" },
    { topic: "Digital security best practices", category: "technology" },
    { topic: "Remote team management", category: "leadership" },
    { topic: "Customer feedback systems", category: "business" },
    { topic: "Business automation tools", category: "technology" },
    { topic: "Professional development planning", category: "career" }
  ]

  // Topic categories
  const topicCategories = [
    { id: "all", name: "All Topics", icon: "🌟", count: recommendedTopics.length },
    { id: "business", name: "Business", icon: "💼", count: recommendedTopics.filter(t => t.category === "business").length },
    { id: "technology", name: "Technology", icon: "🚀", count: recommendedTopics.filter(t => t.category === "technology").length },
    { id: "leadership", name: "Leadership", icon: "👥", count: recommendedTopics.filter(t => t.category === "leadership").length },
    { id: "marketing", name: "Marketing", icon: "📈", count: recommendedTopics.filter(t => t.category === "marketing").length },
    { id: "career", name: "Career", icon: "🎯", count: recommendedTopics.filter(t => t.category === "career").length },
    { id: "productivity", name: "Productivity", icon: "⚡", count: recommendedTopics.filter(t => t.category === "productivity").length },
    { id: "innovation", name: "Innovation", icon: "💡", count: recommendedTopics.filter(t => t.category === "innovation").length },
    { id: "trends", name: "Trends", icon: "📊", count: recommendedTopics.filter(t => t.category === "trends").length }
  ]

  // State declarations first
  const [clickedTopic, setClickedTopic] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Get filtered and random topics
  const getFilteredTopics = () => {
    let filtered = recommendedTopics

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(t => 
        t.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Shuffle and return up to 12 topics
    const shuffled = [...filtered].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 12)
  }

  // Function to get appropriate icon for each topic category
  const getTopicIcon = (category: string) => {
    switch (category) {
      case 'productivity':
      return <MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'leadership':
      return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'marketing':
      return <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'technology':
      return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'career':
      return <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'business':
      return <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'innovation':
      return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'analytics':
      return <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case 'trends':
      return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      default:
      return <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    }
  }

  const [randomTopics, setRandomTopics] = useState(() => {
    // Initialize with all topics shuffled
    const shuffled = [...recommendedTopics].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 12)
  })

  // Update topics when filters change
  useEffect(() => {
    setRandomTopics(getFilteredTopics())
  }, [selectedCategory, searchQuery])

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

  const handleSaveDraft = async (content?: string, title?: string, format?: string) => {
    const contentToSave = content || selectedPost?.content
    const titleToSave = title || `AI Generated ${contentType}`
    const formatToSave = format || contentType

    if (!contentToSave) return

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToSave,
          content: contentToSave,
          format: formatToSave,
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
    if (!imageSearchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/search-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: imageSearchQuery,
          source: selectedSource,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.images && data.images.length > 0) {
          setSearchResults(data.images)
          toast({
            title: "Search Complete",
            description: `Found ${data.images.length} images for "${imageSearchQuery}" from ${data.source}`,
          })
        } else {
          setSearchResults([])
          toast({
            title: "No Images Found",
            description: `No images found for "${imageSearchQuery}". Try a different search term.`,
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-black/5 dark:from-black dark:via-blue-950/20 dark:to-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1 flex-shrink-0" />
        </div>
      </header>


      {/* Content Generator */}
      <div className={`px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 lg:space-y-8 pb-4 sm:pb-6 lg:pb-8 transition-all duration-300 relative z-10 ${
        showCustomizationPanel ? 'blur-sm' : ''
      }`}>
        {/* Show form only when not generating and no content generated */}
        {!isGenerating && generatedPosts.length === 0 && (
          <div className="max-w-5xl mx-auto">
            <Card className="shadow-2xl bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50">
              <CardHeader className="pb-6 sm:pb-8 lg:pb-12 text-center px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Wand2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black dark:text-white">
                  Start Creating
                </CardTitle>
                <CardDescription className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-2xl sm:max-w-3xl mx-auto">
                  Describe what you want to post about, and our AI will generate engaging content for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-8 xl:px-12 pb-8 sm:pb-10 lg:pb-12">
                {/* Main Prompt */}
                <div className="space-y-3">
                  <Label htmlFor="prompt" className="text-base sm:text-lg font-semibold text-black dark:text-white">
                    What would you like to post about?
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Tip: Click the microphone icon to record your prompt instead of typing
                  </p>
                  <div className="relative group">
                    <Textarea
                      id="prompt"
                      placeholder="e.g., Share insights about remote work productivity, discuss industry trends, celebrate a team achievement..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] sm:min-h-[140px] text-lg resize-none pr-14 border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 rounded-xl bg-white/80 dark:bg-black/80 focus:bg-white dark:focus:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <div className="absolute bottom-4 right-4">
                      <MicrophoneButton
                        onTranscript={(transcript) => setPrompt(prev => prev + (prev ? ' ' : '') + transcript.trim())}
                        size="sm"
                        variant="ghost"
                        className="h-10 w-10 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={() => setShowCustomizationPanel(true)}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full h-14 sm:h-16 text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  size="lg"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Generate Content
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Cards */}
        {!isGenerating && generatedPosts.length === 0 && (
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 mt-32 sm:mt-40">
            {/* Section Title */}
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-black via-blue-600 to-secondary dark:from-white dark:via-blue-400 dark:to-secondary bg-clip-text text-transparent mb-4">
                Explore AI Tools
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                Choose from our powerful AI-powered content creation tools
              </p>
            </div>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Carousel Card */}
              <Card 
                className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-2xl overflow-hidden"
                onClick={() => router.push('/dashboard/ai-carousel')}
              >
                <CardContent className="p-6 sm:p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">AI Carousels</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Create stunning swipe-worthy carousels with AI-generated content and visuals</p>
                    <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      <span>Get Started</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Topics Card */}
              <Card 
                className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-2xl overflow-hidden"
                onClick={() => router.push('/dashboard/ai-articles')}
              >
                <CardContent className="p-6 sm:p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/10 to-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">Post Ideas</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Generate compelling post ideas and headlines that capture attention</p>
                    <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      <span>Get Started</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Story Card */}
              <Card 
                className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-2xl overflow-hidden"
                onClick={() => router.push('/dashboard/personal-story')}
              >
                <CardContent className="p-6 sm:p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">Personal Stories</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Share your personal journey and experiences in an engaging way</p>
                    <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      <span>Get Started</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Enhanced Topic Generator Section */}
        {!isGenerating && generatedPosts.length === 0 && (
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
            {/* Enhanced Section Header */}
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-secondary/20 to-blue-400/20 blur-3xl rounded-full"></div>
                <div className="relative">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-black via-blue-600 to-secondary dark:from-white dark:via-blue-400 dark:to-secondary bg-clip-text text-transparent mb-4">
                    AI Topic Generator
              </h2>
                  <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Discover trending topics and get instant inspiration for your next viral post
              </p>
                </div>
              </div>
              
              {/* Enhanced Controls */}
              <div className="space-y-6 pt-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-lg focus:shadow-xl transition-all duration-300 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {topicCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                          selectedCategory === category.id
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-white/90 dark:bg-black/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedCategory === category.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}>
                          {category.count}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                      setRandomTopics(getFilteredTopics())
                  toast({
                        title: "✨ Topics Refreshed!",
                        description: "Fresh topic suggestions have been loaded for you.",
                  })
                }}
                    className="bg-white/90 dark:bg-black/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
              >
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    <span className="font-semibold">Refresh Topics</span>
              </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Live trending data</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Topics Grid */}
            <div className="relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-secondary/5 rounded-3xl"></div>
              
              <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 p-6 sm:p-8">
                {randomTopics.length > 0 ? (
                  randomTopics.map((topicData, index) => (
                    <motion.div
                  key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card 
                        className={`group cursor-pointer transition-all duration-500 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-xl hover:shadow-2xl overflow-hidden relative ${
                          clickedTopic === topicData.topic 
                            ? 'ring-2 ring-teal-500/60 bg-gradient-to-br from-teal-500/10 to-secondary/10 scale-105 shadow-2xl' 
                            : 'hover:ring-2 hover:ring-teal-500/30 hover:bg-gradient-to-br hover:from-white/90 dark:hover:from-black/90 hover:to-teal-500/5'
                        }`}
                        onClick={() => handleTopicClick(topicData.topic)}
                      >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Floating Elements */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-500/10 to-secondary/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-secondary/10 to-teal-500/10 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500"></div>
                        
                        <CardContent className="p-6 sm:p-8 relative z-10">
                          <div className="space-y-4">
                            {/* Icon Container */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                              clickedTopic === topicData.topic 
                                ? 'bg-gradient-to-br from-teal-500 to-secondary scale-110 shadow-lg' 
                                : 'bg-gradient-to-br from-teal-500/10 to-secondary/10 group-hover:from-teal-500/20 group-hover:to-secondary/20 group-hover:scale-110 group-hover:shadow-lg'
                            }`}>
                              {clickedTopic === topicData.topic ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              ) : (
                                <div className="text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors duration-300">
                                  {getTopicIcon(topicData.category)}
                                </div>
                        )}
                      </div>
                            
                            {/* Topic Title */}
                            <h3 className={`text-base sm:text-lg font-bold leading-tight transition-colors duration-300 ${
                              clickedTopic === topicData.topic 
                          ? 'text-teal-600 dark:text-teal-400' 
                          : 'text-black dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400'
                      }`}>
                              {topicData.topic}
                      </h3>
                            
                            {/* Category Badge */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium">
                                {topicCategories.find(c => c.id === topicData.category)?.name || topicData.category}
                              </span>
                            </div>
                            
                            {/* Action Indicator */}
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center text-sm transition-colors duration-300 ${
                                clickedTopic === topicData.topic 
                                  ? 'text-teal-600 dark:text-teal-400' 
                                  : 'text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                              }`}>
                                <span className="font-medium">Click to generate</span>
                                <motion.svg 
                                  className="w-4 h-4 ml-2" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                  animate={{ x: clickedTopic === topicData.topic ? 5 : 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </motion.svg>
                              </div>
                              
                              {/* Trending Badge */}
                              <div className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">Trending</span>
                              </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-gray-400" />
            </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics found</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      {searchQuery.trim() 
                        ? `No topics match "${searchQuery}". Try adjusting your search or category filter.`
                        : "No topics available in this category. Try selecting a different category."
                      }
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("all")
                      }}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Footer */}
            <div className="text-center space-y-4 pt-8">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{recommendedTopics.length}+ Topics Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>9 Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Smart Search & Filter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>AI-Powered Generation</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 max-w-3xl mx-auto">
                Each topic is carefully curated and categorized for maximum engagement. 
                Use the search and category filters to find exactly what you need, then click any topic to instantly generate personalized content with our advanced AI.
              </p>
            </div>
          </div>
        )}

        {/* Show loading state when generating */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-8">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-teal-200 dark:border-teal-800 border-t-teal-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-teal-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-4 max-w-md mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-black via-teal-600 to-secondary dark:from-white dark:via-teal-400 dark:to-secondary bg-clip-text text-transparent">
                Creating Magic
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Our AI is crafting engaging content tailored just for you...
              </p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Posts - Centered when content is generated */}
        {generatedPosts.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-secondary rounded-2xl mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-black via-teal-600 to-secondary dark:from-white dark:via-teal-400 dark:to-secondary bg-clip-text text-transparent">
                Your Content is Ready!
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                We've generated {generatedPosts.length} unique {generatedPosts.length === 1 ? 'post' : 'posts'} for you. 
                Click on any post to preview and customize before publishing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {generatedPosts.map((post, index) => (
                <div key={post.id} className="group">
                  <LinkedInPostPreview
                    content={post.content}
                    tone={post.tone}
                    wordCount={post.wordCount}
                    onClick={() => handleSelectPost(post)}
                    className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  />
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                onClick={() => {
                  setGeneratedPosts([])
                  setShowAdvanced(false)
                }}
                variant="outline"
                size="lg"
                className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate More Content
              </Button>
              <Button
                onClick={() => {
                  setGeneratedPosts([])
                  setShowAdvanced(false)
                }}
                variant="ghost"
                size="lg"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customization Panel - Overlay */}
      {showCustomizationPanel && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[45%] bg-white dark:bg-black h-full shadow-2xl overflow-y-auto border-l border-teal-200/50 dark:border-teal-800/50">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-black border-b border-teal-200 dark:border-teal-800 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white">Customize your post</h2>
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
                <Label className="text-sm font-medium text-black dark:text-white">What would you like to post about?</Label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white dark:bg-black border-teal-200 dark:border-teal-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your topic..."
                />
              </div>

              {/* Original Customization Options */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">Tone</Label>
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
                    <Label className="text-sm font-medium text-black dark:text-white">Word Count</Label>
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
                  <Label className="text-sm font-medium text-black dark:text-white">Language</Label>
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
                  <Label className="text-sm font-medium text-black dark:text-white">Content Type</Label>
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
                  <Label className="text-sm font-medium text-black dark:text-white">Target Audience</Label>
                  <Input
                    placeholder="e.g., LinkedIn professionals"
                    value={customization.targetAudience}
                    onChange={(e) => setCustomization(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="h-10 sm:h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Main Goal</Label>
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
                <div className="space-y-3 pt-4 border-t border-teal-200 dark:border-teal-800">
                  <h3 className="text-sm font-medium text-black dark:text-white">Content Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        <Label className="text-sm text-black dark:text-white">Include Hashtags</Label>
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
                        <Label className="text-sm text-black dark:text-white">Include Emojis</Label>
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
                        <Label className="text-sm text-black dark:text-white">Call to Action</Label>
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
                  className="w-full h-10 sm:h-11 md:h-12 bg-gradient-to-r from-teal-500 to-secondary hover:from-teal-600 hover:to-secondary/90 text-white"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          onClose={() => handleClosePreview(false)}
          onContentUpdate={(newContent) => {
            setSelectedPost(prev => prev ? { ...prev, content: newContent } : null)
          }}
        />
      )}

      {/* Generation Modal */}
      {/* Generation Modal */}
      <Dialog open={showGenerationModal} onOpenChange={setShowGenerationModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-2 sm:mx-4 lg:mx-auto w-[calc(100vw-1rem)] sm:w-auto bg-white dark:bg-black border-teal-200 dark:border-teal-800">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-black dark:text-white">Generate Content</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Review your settings and generate content with AI.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Prompt Preview */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base text-black dark:text-white">Your Topic</Label>
              <div className="p-3 border border-teal-200 dark:border-teal-800 rounded-lg bg-gray-50 dark:bg-gray-900">
                <p className="text-sm sm:text-base text-black dark:text-white">{prompt}</p>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base text-black dark:text-white">Current Settings</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">Content Type:</span>
                  <Badge variant="outline" className="text-xs">{contentType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">Tone:</span>
                  <Badge variant="outline" className="text-xs">{customization.tone}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">Word Count:</span>
                  <Badge variant="outline" className="text-xs">{customization.wordCount} words</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">Language:</span>
                  <Badge variant="outline" className="text-xs">{customization.language}</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowGenerationModal(false)} className="w-full sm:w-auto min-h-[40px] border-teal-200 dark:border-teal-800 text-black dark:text-white hover:bg-teal-50 dark:hover:bg-teal-950/50">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleGenerate()
                  setShowGenerationModal(false)
                }}
                disabled={isGenerating}
                className="relative overflow-hidden w-full sm:w-auto min-h-[40px] bg-gradient-to-r from-teal-500 to-secondary hover:from-teal-600 hover:to-secondary/90 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="absolute inset-0 bg-teal-500/20" />
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

