"use client"

import type React from "react"

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
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Sparkles,
  Wand2,
  Target,
  Users,
  Calendar,
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
  RefreshCw,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

import type { CustomizationOptions } from "@/components/ai-customization-panel"
import { MicrophoneButton } from "@/components/ui/microphone-button"
import { LinkedInPostPreview } from "@/components/linkedin-post-preview"
import { EnhancedLinkedInPreview } from "@/components/enhanced-linkedin-preview"
import { ImageManager } from "@/components/image-manager"
import { ProcessingOverlay } from "@/components/processing-overlay"

interface GeneratedPost {
  id: string
  content: string
  tone: string
  wordCount: number
  createdAt: Date
}

interface PersonalizedTopic {
  id: string
  topicText: string
  status: string
  category?: string
}

export default function DashboardPage() {
  const { data: session, update: updateSession } = useSession()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check for LinkedIn connection success/error messages and refresh session
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const openImageManager = searchParams.get("open_image_manager")

    if (success === "linkedin_connected") {
      // Refresh session to get updated LinkedIn connection status
      updateSession()
        .then(() => {
          // Clear the success parameter from URL after successful update
          const url = new URL(window.location.href)
          url.searchParams.delete("success")
          window.history.replaceState({}, "", url.toString())
        })
        .catch((error) => {
          console.error("Failed to update session:", error)
          // Force page reload as fallback
          window.location.reload()
        })

      toast({
        title: "LinkedIn Connected!",
        description:
          "Your LinkedIn account has been successfully connected. You can now post content directly to LinkedIn.",
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
  const [showImageManager, setShowImageManager] = useState(false)
  const [imageManagerActiveTab, setImageManagerActiveTab] = useState("upload")
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

  const [personalizedTopics, setPersonalizedTopics] = useState<PersonalizedTopic[]>([])
  const [hasPersonalStory, setHasPersonalStory] = useState(false)
  const [isLoadingTopics, setIsLoadingTopics] = useState(true)
  const [isRegeneratingTopics, setIsRegeneratingTopics] = useState(false)
  const [personalStoryTopic, setPersonalStoryTopic] = useState<string | null>(null)

  // State declarations first
  const [clickedTopic, setClickedTopic] = useState<string | null>(null)

  // Content generation states (kept for backward compatibility)
  const [activeContentType, setActiveContentType] = useState<string | null>(null)
  const [generatedContentCards, setGeneratedContentCards] = useState<any[]>([])
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)

  const fetchPersonalizedTopics = async () => {
    try {
      setIsLoadingTopics(true)
      const response = await fetch("/api/story-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          count: 6, // Request 6 topics for dashboard
          context: "dashboard", // Specify dashboard context
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No personal story found
          setHasPersonalStory(false)
          setPersonalizedTopics([])
          return
        }
        throw new Error("Failed to fetch topics")
      }

      const data = await response.json()
      setPersonalizedTopics(data.topics || [])
      setHasPersonalStory(true)

      if (data.topics && data.topics.length > 0) {
        toast({
          title: "Topics Loaded!",
          description: `${data.topics.length} personalized topics based on your story are ready.`,
        })
      }
    } catch (error) {
      console.error("Error fetching personalized topics:", error)
      setHasPersonalStory(false)
      setPersonalizedTopics([])
      toast({
        title: "Error",
        description: "Failed to load topics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTopics(false)
    }
  }

  const handleRegenerateTopics = async () => {
    try {
      setIsRegeneratingTopics(true)
      const response = await fetch("/api/story-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate",
          count: 6, // Request 6 topics for dashboard
          context: "dashboard", // Specify dashboard context
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No personal story found
          setHasPersonalStory(false)
          setPersonalizedTopics([])
          return
        }
        throw new Error("Failed to regenerate topics")
      }

      const data = await response.json()
      setPersonalizedTopics(data.topics || [])
      setHasPersonalStory(true)

      toast({
        title: "Topics Regenerated!",
        description: `${data.topics.length} new personalized topics based on your story generated.`,
      })
    } catch (error) {
      console.error("Error regenerating topics:", error)
      setHasPersonalStory(false)
      setPersonalizedTopics([])
      toast({
        title: "Error",
        description: "Failed to regenerate topics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegeneratingTopics(false)
    }
  }

  useEffect(() => {
    fetchPersonalizedTopics()
  }, [])

  // Function to get appropriate icon for each topic category
  const getTopicIcon = (category?: string) => {
    if (!category) return <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />

    switch (category.toLowerCase()) {
      case "productivity":
        return <MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "leadership":
        return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "marketing":
        return <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "technology":
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "career":
        return <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "business":
        return <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "innovation":
        return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "analytics":
        return <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      case "trends":
        return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      default:
        return <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    }
  }

  // Handle recommended topic click
  const handleTopicClick = async (topic: string) => {
    setPrompt(topic)
    setClickedTopic(topic)
    // Mark this as a personal story topic for content generation
    setPersonalStoryTopic(topic)

    // Wait for prompt to be set, then open customization panel
    setTimeout(() => {
      setShowCustomizationPanel(true)
      setClickedTopic(null)
    }, 200)
  }

  // Handle AI content generator card click - Navigate to respective pages
  const handleContentGeneratorClick = (contentType: string) => {
    switch (contentType) {
      case "ai-carousel":
        router.push("/dashboard/ai-carousel")
        break
      case "ai-articles":
        router.push("/dashboard/ai-articles")
        break
      case "personal-story":
        router.push("/dashboard/personal-story")
        break
      default:
        setActiveContentType(contentType)
        setGeneratedContentCards([])
    }
  }

  // Generate more content for the active content type
  const handleGenerateMoreContent = async () => {
    if (!activeContentType) return

    setIsGeneratingContent(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate 2 new content cards based on the active content type
      const newCards = generateContentForType(activeContentType, 2)
      setGeneratedContentCards((prev) => [...prev, ...newCards])

      toast({
        title: "Content Generated!",
        description: `Generated 2 new ${activeContentType} content cards for you.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingContent(false)
    }
  }

  // Generate content based on type
  const generateContentForType = (contentType: string, count: number) => {
    const baseContent = {
      "ai-carousel": {
        titles: [
          "5 Productivity Hacks for Remote Workers",
          "The Future of AI in Business",
          "Building Strong Team Culture",
          "Digital Marketing Trends 2024",
          "Leadership Lessons from Startups",
        ],
        descriptions: [
          "Discover proven strategies to boost your productivity while working from home.",
          "Explore how artificial intelligence is transforming modern business operations.",
          "Learn the key principles of creating an inclusive and motivated team environment.",
          "Stay ahead with the latest digital marketing trends and strategies.",
          "Insights from successful startup founders on effective leadership.",
        ],
      },
      "ai-articles": {
        titles: [
          "The Art of Effective Communication",
          "Innovation in the Digital Age",
          "Sustainable Business Practices",
          "Mental Health in the Workplace",
          "The Power of Networking",
        ],
        descriptions: [
          "Master the skills needed to communicate effectively in any professional setting.",
          "How technology is driving innovation across industries and creating new opportunities.",
          "Implementing eco-friendly practices that benefit both business and environment.",
          "Creating a supportive workplace culture that prioritizes employee wellbeing.",
          "Building meaningful professional relationships that advance your career.",
        ],
      },
      "personal-story": {
        titles: [
          "My Journey from Student to Entrepreneur",
          "Overcoming Career Challenges",
          "Lessons Learned from Failure",
          "Building Confidence in Leadership",
          "The Power of Mentorship",
        ],
        descriptions: [
          "A personal account of the challenges and triumphs in starting my own business.",
          "How I navigated difficult career transitions and emerged stronger.",
          "The valuable insights gained from setbacks and how they shaped my success.",
          "Developing the confidence to lead teams and make important decisions.",
          "How mentors have influenced my professional growth and development.",
        ],
      },
    }

    const content = baseContent[contentType as keyof typeof baseContent] || baseContent["ai-articles"]
    const cards = []

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * content.titles.length)
      cards.push({
        id: `${contentType}-${Date.now()}-${i}`,
        title: content.titles[randomIndex],
        description: content.descriptions[randomIndex],
        type: contentType,
        createdAt: new Date(),
      })
    }

    return cards
  }

  const imageSources = [
    { value: "unsplash", label: "Unsplash" },
    { value: "pexels", label: "Pexels" },
    { value: "pixabay", label: "Pixabay" },
    { value: "google", label: "Google Images" },
  ]

  // Handle LinkedIn connection feedback
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "linkedin_connected") {
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
      let response: Response
      
      // Check if this is a personal story topic
      if (personalStoryTopic && hasPersonalStory) {
        // Use story-content API for personal story topics with topic text
        response = await fetch("/api/story-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicText: prompt, // Pass topic text directly
            contentType: contentType,
          }),
        })
      } else {
        // Use regular content generation
        response = await fetch("/api/ai/generate-unique", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: contentType,
            prompt: prompt,
            provider: provider,
            customization: customization,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      console.log("Content generation response:", data) // Debug log
      let generatedPosts: GeneratedPost[] = []
      
      if (personalStoryTopic && hasPersonalStory) {
        // Handle personal story content response from story-content API
        if (data.success && data.content) {
          // Handle the specific response structure from story-content API
          const contentData = data.content
          const contentText = typeof contentData === 'string' ? contentData : contentData.content || contentData
          
          generatedPosts = [{
            id: `post-${Date.now()}-0`,
            content: contentText,
            tone: customization.tone || "professional",
            wordCount: contentText.split(' ').length,
            createdAt: new Date(),
          }]
        } else {
          console.error("Personal story content generation failed:", data)
          throw new Error("Failed to generate personal story content")
        }
      } else {
        // Handle regular content response
        generatedPosts = Array.isArray(data.data.content)
          ? data.data.content.map((content: string, index: number) => ({
              id: `post-${Date.now()}-${index}`,
              content,
              tone: customization.tone || "professional",
              wordCount: customization.wordCount || 150,
              createdAt: new Date(),
            }))
          : [
              {
                id: `post-${Date.now()}-0`,
                content: data.data.content as string,
                tone: customization.tone || "professional",
                wordCount: customization.wordCount || 150,
                createdAt: new Date(),
              },
            ]
      }

      // Credits are automatically deducted by the centralized API

      setGeneratedPosts(generatedPosts)
      // Clear personal story topic after successful generation
      setPersonalStoryTopic(null)
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
    const titleToSave = title || (personalStoryTopic ? `Personal Story: ${prompt}` : `AI Generated ${contentType}`)
    const formatToSave = format || contentType

    if (!contentToSave) {
      toast({
        title: "Error",
        description: "No content to save. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      // Map format to valid Draft type
      const draftType = formatToSave === "linkedin-post" ? "text" : formatToSave === "story" ? "story" : "text"
      
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToSave,
          content: contentToSave,
          format: draftType,
          niche: personalStoryTopic ? "Personal Story" : "AI Generated",
          source: personalStoryTopic ? "personal-story" : "ai-generated",
        }),
      })

      if (response.ok) {
        toast({
          title: "Draft Saved!",
          description: "Your content has been saved to drafts successfully.",
        })
        setShowPreviewModal(false)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: errorData.error || "Failed to save draft. Please try again.",
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
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: "Please select only image files",
            variant: "destructive",
          })
          continue
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setUploadedImages((prev) => [...prev, data.url])
          toast({
            title: "Upload successful",
            description: "Image uploaded to Cloudinary",
          })
        } else {
          throw new Error("Upload failed")
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
      const response = await fetch("/api/search-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            variant: "destructive",
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
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setAiResults((prev) => [newResult, ...prev])
        setAiPrompt("")
        toast({
          title: "Image generated",
          description: "AI image generated successfully",
        })
      } else {
        throw new Error("Generation failed")
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
        content: editableContent,
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
      <div
        className={`px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 lg:space-8 pb-4 sm:pb-6 lg:pb-8 transition-all duration-300 relative z-10 ${
          showCustomizationPanel ? "blur-sm" : ""
        }`}
      >
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
                        onTranscript={(transcript) => {
                          const trimmedTranscript = transcript.trim()
                          if (trimmedTranscript) {
                            setPrompt((prev) => {
                              const newPrompt = prev + (prev ? " " : "") + trimmedTranscript
                              // Prevent duplicates by checking if the transcript is already at the end
                              if (prev.endsWith(trimmedTranscript)) {
                                return prev
                              }
                              return newPrompt
                            })
                          }
                        }}
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
                onClick={() => handleContentGeneratorClick("ai-carousel")}
              >
                <CardContent className="p-6 sm:p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">AI Carousels</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Create stunning swipe-worthy carousels with AI-generated content and visuals
                    </p>
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
                onClick={() => handleContentGeneratorClick("ai-articles")}
              >
                <CardContent className="p-6 sm:p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/10 to-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">Topic Generator</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Create compelling post ideas and headlines that capture attention
                    </p>
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
                onClick={() => handleContentGeneratorClick("personal-story")}
              >
                <CardContent className="p-6 sm:p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">Personal Stories</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Share your personal journey and experiences in an engaging way
                    </p>
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

        {/* Content Generation Section */}
        {activeContentType && (
          <div className="max-w-6xl mx-auto space-y-8 mt-20 sm:mt-32">
            {/* Section Header */}
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-secondary/20 to-blue-400/20 blur-3xl rounded-full"></div>
                <div className="relative">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-black via-blue-600 to-secondary dark:from-white dark:via-blue-400 dark:to-secondary bg-clip-text text-transparent mb-4">
                    {activeContentType === "ai-carousel" && "AI Carousel Generator"}
                    {activeContentType === "ai-articles" && "Post Ideas Generator"}
                    {activeContentType === "personal-story" && "Personal Story Generator"}
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    {activeContentType === "ai-carousel" &&
                      "Generate stunning carousel content with AI-powered visuals and engaging text"}
                    {activeContentType === "ai-articles" &&
                      "Create compelling post ideas and headlines that capture attention"}
                    {activeContentType === "personal-story" &&
                      "Share your personal journey and experiences in an engaging way"}
                  </p>
                </div>
              </div>

              {/* Generate More Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerateMoreContent}
                  disabled={isGeneratingContent}
                  className="bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isGeneratingContent ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate More Content
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Content Cards */}
            {generatedContentCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {generatedContentCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-2xl overflow-hidden">
                      <CardContent className="p-6 sm:p-8 relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            {activeContentType === "ai-carousel" && <Layers className="w-8 h-8 text-white" />}
                            {activeContentType === "ai-articles" && <BookOpen className="w-8 h-8 text-white" />}
                            {activeContentType === "personal-story" && <User className="w-8 h-8 text-white" />}
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {card.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{card.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              <span className="font-medium">Click to customize</span>
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {activeContentType === "ai-carousel" && "Carousel"}
                              {activeContentType === "ai-articles" && "Post Idea"}
                              {activeContentType === "personal-story" && "Story"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Back Button */}
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveContentType(null)
                  setGeneratedContentCards([])
                }}
                className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              >
                <X className="w-4 h-4 mr-2" />
                Back to AI Tools
              </Button>
            </div>
          </div>
        )}

        {!isGenerating && generatedPosts.length === 0 && (
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 mt-20 sm:mt-32">
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
            </div>

            {/* Enhanced Topics Grid */}
            <div className="relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-secondary/5 rounded-3xl"></div>

              <div className="relative p-6 sm:p-8">
                {isLoadingTopics ? (
                  // Loading State
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Generating personalized topics...
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      Creating unique topics based on your personal story
                    </p>
                  </div>
                ) : !hasPersonalStory ? (
                  // Empty State - No Personal Story
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
                      <User className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Create Your Personal Story First
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
                      To get personalized topic suggestions, you need to create your personal story first. Share your
                      journey and we'll generate unique topics based on your experiences.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/personal-story")}
                      className="bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Create Personal Story
                    </Button>
                  </div>
                ) : personalizedTopics.length < 3 ? (
                  // Empty State - No Topics Generated Yet
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Generating More Topics</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                      We need at least 3 topics to display. Generating more personalized topics from your story...
                    </p>
                    <Button
                      onClick={handleRegenerateTopics}
                      disabled={isRegeneratingTopics}
                      className="bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isRegeneratingTopics ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Topics
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  // Topics Grid
                  <>
                    <div className="flex justify-end items-center mb-6">
                      <Button
                        onClick={handleRegenerateTopics}
                        disabled={isRegeneratingTopics}
                        variant="outline"
                        size="sm"
                        className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 bg-transparent"
                      >
                        {isRegeneratingTopics ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {personalizedTopics.map((topicData, index) => (
                        <motion.div
                          key={topicData.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: "easeOut",
                          }}
                          whileHover={{
                            scale: 1.05,
                            y: -5,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Card
                            className={`group cursor-pointer transition-all duration-500 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl overflow-hidden relative ${
                              clickedTopic === topicData.topicText
                                ? "ring-2 ring-blue-500/60 bg-gradient-to-br from-blue-500/10 to-secondary/10 scale-105 shadow-2xl"
                                : "hover:ring-2 hover:ring-blue-500/30 hover:bg-gradient-to-br hover:from-white/90 dark:hover:from-black/90 hover:to-blue-500/5"
                            }`}
                            onClick={() => handleTopicClick(topicData.topicText)}
                          >
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Floating Elements */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>

                            <CardContent className="p-6 relative z-10">
                              <div className="space-y-4">
                                {/* Icon Container */}
                                <div
                                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
                                    clickedTopic === topicData.topicText
                                      ? "bg-gradient-to-br from-blue-500 to-secondary scale-110 shadow-lg"
                                      : "bg-gradient-to-br from-blue-500/10 to-secondary/10 group-hover:from-blue-500/20 group-hover:to-secondary/20 group-hover:scale-110"
                                  }`}
                                >
                                  {clickedTopic === topicData.topicText ? (
                                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                                  ) : (
                                    <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors duration-300">
                                      {getTopicIcon(topicData.category)}
                                    </div>
                                  )}
                                </div>

                                {/* Topic Title */}
                                <h3
                                  className={`text-base font-bold leading-tight transition-colors duration-300 ${
                                    clickedTopic === topicData.topicText
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                  }`}
                                >
                                  {topicData.topicText}
                                </h3>

                                {/* Action Indicator */}
                                <div className="flex items-center justify-between pt-2">
                                  <div
                                    className={`flex items-center text-sm transition-colors duration-300 ${
                                      clickedTopic === topicData.topicText
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                    }`}
                                  >
                                    <span className="font-medium">Click to generate</span>
                                    <motion.svg
                                      className="w-4 h-4 ml-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      animate={{ x: clickedTopic === topicData.topicText ? 5 : 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </motion.svg>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Generated Posts - Centered when content is generated */}
        {generatedPosts.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-black via-blue-600 to-secondary dark:from-white dark:via-blue-400 dark:to-secondary bg-clip-text text-transparent">
                Your Content is Ready!
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                We've generated {generatedPosts.length} unique {generatedPosts.length === 1 ? "post" : "posts"} for you.
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
                className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate More Content
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customization Panel - Overlay */}
      {showCustomizationPanel && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[45%] bg-white dark:bg-black h-full shadow-2xl overflow-y-auto border-l border-blue-200/50 dark:border-blue-800/50">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-black border-b border-blue-200 dark:border-blue-800 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white">Customize your post</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomizationPanel(false)
                  setPersonalStoryTopic(null) // Clear personal story topic when closing panel
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Input Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-black dark:text-white">
                  What would you like to post about?
                </Label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white dark:bg-black border-blue-200 dark:border-blue-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                      onValueChange={(value) => setCustomization((prev) => ({ ...prev, tone: value as any }))}
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
                      onValueChange={(value) =>
                        setCustomization((prev) => ({ ...prev, wordCount: Number.parseInt(value) }))
                      }
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
                    onValueChange={(value) => setCustomization((prev) => ({ ...prev, language: value }))}
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
                  <Select value={contentType} onValueChange={(value) => setContentType(value as any)}>
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
                    onChange={(e) => setCustomization((prev) => ({ ...prev, targetAudience: e.target.value }))}
                    className="h-10 sm:h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Main Goal</Label>
                  <Select
                    value={customization.mainGoal}
                    onValueChange={(value) => setCustomization((prev) => ({ ...prev, mainGoal: value as any }))}
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
                <div className="space-y-3 pt-4 border-t border-blue-200 dark:border-blue-800">
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
                        onChange={(e) => setCustomization((prev) => ({ ...prev, includeHashtags: e.target.checked }))}
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
                        onChange={(e) => setCustomization((prev) => ({ ...prev, includeEmojis: e.target.checked }))}
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
                        onChange={(e) => setCustomization((prev) => ({ ...prev, callToAction: e.target.checked }))}
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
            setSelectedPost((prev) => (prev ? { ...prev, content: newContent } : null))
          }}
        />
      )}

      {/* Image Manager Modal */}
      <ImageManager
        onImageSelect={(imageUrl, imageData) => {
          setSelectedImage(imageUrl)
          setShowImageManager(false)
          toast({
            title: "Image Selected",
            description: "Image has been added to your content.",
          })
        }}
        trigger={null}
        className="hidden"
        open={showImageManager}
        onOpenChange={setShowImageManager}
        defaultActiveTab={imageManagerActiveTab}
      />

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
                  <Badge variant="outline" className="text-xs">
                    {contentType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">Tone:</span>
                  <Badge variant="outline" className="text-xs">
                    {customization.tone}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">Word Count:</span>
                  <Badge variant="outline" className="text-xs">
                    {customization.wordCount} words
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">Language:</span>
                  <Badge variant="outline" className="text-xs">
                    {customization.language}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setShowGenerationModal(false)}
                className="w-full sm:w-auto min-h-[40px] border-teal-200 dark:border-teal-800 text-black dark:text-white hover:bg-teal-50 dark:hover:bg-teal-950/50"
              >
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

      {/* Processing Overlays */}
      <ProcessingOverlay 
        isVisible={isGenerating} 
        type="content"
        title="Creating Content..."
        description="Our AI is crafting engaging content tailored just for you..."
      />
    </div>
  )
}
