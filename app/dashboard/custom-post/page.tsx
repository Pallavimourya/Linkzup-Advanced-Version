"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { formatIstDate } from "@/lib/ist-utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
import { useAIGeneration } from "@/hooks/use-ai-generation"
import { MicrophoneButton } from "@/components/ui/microphone-button"
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Bold,
  Italic,
  Underline,
  Smile,
  Upload,
  Sparkles,
  Calendar,
  Clock,
  Image as ImageIcon,
  Tag,
  Save,
  Send,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Palette,
  Wand2,
  Loader2,
  Mic
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface PostData {
  content: string
  htmlContent: string // Add HTML content for formatted text
  images: string[]
  scheduledFor?: string
  platform: string
  type: string
  tags: string[]
  title?: string
}

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (date: string) => void
  isScheduling: boolean
}

function ScheduleModal({ isOpen, onClose, onSchedule, isScheduling }: ScheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  useEffect(() => {
    if (isOpen) {
      // Set default to tomorrow at 9 AM
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      
      const dateStr = tomorrow.toISOString().split('T')[0]
      const timeStr = tomorrow.toTimeString().slice(0, 5)
      
      setScheduledDate(dateStr)
      setScheduledTime(timeStr)
    }
  }, [isOpen])

  const handleSchedule = () => {
    if (scheduledDate && scheduledTime) {
      const dateTime = `${scheduledDate}T${scheduledTime}`
      onSchedule(dateTime)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white dark:bg-black rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-teal-200 dark:border-teal-800"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white">Schedule Post</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Date
            </label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Time
            </label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {scheduledDate && scheduledTime 
                  ? `Will be posted on ${formatIstDate(new Date(`${scheduledDate}T${scheduledTime}`))}`
                  : "Select date and time"
                }
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={handleSchedule}
            disabled={!scheduledDate || !scheduledTime || isScheduling}
            className="flex-1 min-h-[40px]"
          >
            {isScheduling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Post
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isScheduling}
            className="flex-1 min-h-[40px]"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CustomPostPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { postToLinkedIn, isPosting } = useLinkedInPosting()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [postData, setPostData] = useState<PostData>({
    content: "",
    htmlContent: "",
    images: [],
    platform: "linkedin",
    type: "text",
    tags: [],
    title: "",
  })
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [newTag, setNewTag] = useState("")
  
  // AI Assist state
  const [showAIAssist, setShowAIAssist] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiContentType, setAiContentType] = useState<"linkedin-post" | "article" | "story" | "list" | "quote" | "tips" | "insights" | "question">("linkedin-post")
  const [aiCustomization, setAiCustomization] = useState<{
    tone: "professional" | "casual" | "friendly" | "authoritative" | "conversational"
    language: "english"
    wordCount: number
    targetAudience: string
    mainGoal: "engagement"
    includeHashtags: boolean
    includeEmojis: boolean
    callToAction: boolean
  }>({
    tone: "professional",
    language: "english",
    wordCount: 150,
    targetAudience: "LinkedIn professionals",
    mainGoal: "engagement",
    includeHashtags: true,
    includeEmojis: true,
    callToAction: true,
  })
  
  const { generateContent, isGenerating } = useAIGeneration()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showImageSearch, setShowImageSearch] = useState(false)
  const [imageSource, setImageSource] = useState("unsplash")
  const [searchQuery, setSearchQuery] = useState("car")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setPostData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
    }
  }

  const removeImage = (index: number) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !postData.tags.includes(newTag.trim())) {
      setPostData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPostData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handlePostNow = async () => {
    if (!postData.content.trim()) {
      toast({ 
        title: "Content Required", 
        description: "Please write some content before posting", 
        variant: "destructive" 
      })
      return
    }

    try {
      const result = await postToLinkedIn({
        content: postData.content,
        images: postData.images,
      })

      if (result.success) {
        toast({ 
          title: "Posted Successfully!", 
          description: "Your post has been published to LinkedIn" 
        })
        // Reset form
        setPostData({ 
          content: "", 
          htmlContent: "",
          images: [], 
          platform: "linkedin", 
          type: "text", 
          tags: [], 
          title: "" 
        })
      }
    } catch (error) {
      console.error("Error posting:", error)
      toast({ 
        title: "Posting Failed", 
        description: "Failed to post to LinkedIn. Please try again.", 
        variant: "destructive" 
      })
    }
  }

  const handleSchedule = async (scheduledDateTime: string) => {
    if (!postData.content.trim()) {
      toast({ 
        title: "Content Required", 
        description: "Please write some content before scheduling", 
        variant: "destructive" 
      })
      return
    }

    setIsScheduling(true)
    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postData.content,
          images: postData.images,
          scheduledFor: scheduledDateTime,
          platform: postData.platform,
          type: postData.type,
          tags: postData.tags,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({ 
          title: "Post Scheduled!", 
          description: `Your post has been scheduled for ${formatIstDate(new Date(scheduledDateTime))}` 
        })
        // Reset form
        setPostData({ 
          content: "", 
          htmlContent: "",
          images: [], 
          platform: "linkedin", 
          type: "text", 
          tags: [], 
          title: "" 
        })
        setShowScheduleModal(false)
      } else {
        throw new Error(result.error || "Failed to schedule post")
      }
    } catch (error) {
      console.error("Error scheduling post:", error)
      toast({ 
        title: "Scheduling Failed", 
        description: "Failed to schedule post. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setIsScheduling(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!postData.content.trim()) {
      toast({ 
        title: "Content Required", 
        description: "Please write some content before saving", 
        variant: "destructive" 
      })
      return
    }

    setIsSavingDraft(true)
    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postData.title || `Custom Post - ${new Date().toLocaleDateString()}`,
          content: postData.content,
          format: postData.type,
          niche: "Custom Post"
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({ 
          title: "Draft Saved!", 
          description: "Your post has been saved to drafts successfully" 
        })
        // Reset form
        setPostData({ 
          content: "", 
          htmlContent: "",
          images: [], 
          platform: "linkedin", 
          type: "text", 
          tags: [], 
          title: "" 
        })
      } else {
        throw new Error(result.error || "Failed to save draft")
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({ 
        title: "Save Failed", 
        description: "Failed to save draft. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleImageSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ 
        title: "Search Query Required", 
        description: "Please enter a search term", 
        variant: "destructive" 
      })
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch("/api/search-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          source: imageSource,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.images && data.images.length > 0) {
          setSearchResults(data.images)
          toast({ 
            title: "Search Complete", 
            description: `Found ${data.images.length} images for "${searchQuery}" from ${data.source}` 
          })
        } else {
          // No images found
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
      console.error("Error searching images:", error)
      
      // Show error toast
      toast({ 
        title: "Search Failed", 
        description: "Unable to search images. Showing fallback options.",
        variant: "destructive"
      })
      
      // Set empty results to show placeholder
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddImageFromSearch = (imageUrl: string) => {
    setPostData(prev => ({ ...prev, images: [...prev.images, imageUrl] }))
    toast({ 
      title: "Image Added", 
      description: "Image has been added to your post" 
    })
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for AI generation",
        variant: "destructive"
      })
      return
    }

    const response = await generateContent({
      type: aiContentType,
      prompt: aiPrompt.trim(),
      provider: "openai",
      customization: aiCustomization
    })

    if (response && response.content) {
      // Handle different response types
      let generatedText = ""
      if (Array.isArray(response.content)) {
        // If multiple variations, use the first one
        generatedText = response.content[0] || ""
      } else {
        generatedText = response.content
      }

      // Insert generated content into the post
      setPostData(prev => ({
        ...prev,
        content: prev.content + (prev.content ? "\n\n" : "") + generatedText,
        htmlContent: prev.htmlContent + (prev.htmlContent ? "\n\n" : "") + generatedText
      }))

      // Close the AI Assist modal
      setShowAIAssist(false)
      setAiPrompt("")

      toast({
        title: "Content Generated!",
        description: "AI-generated content has been added to your post"
      })
    }
  }

  const characterCount = postData.content.length
  const maxCharacters = 3000
  const isContentValid = postData.content.trim().length > 0

  const insertEmoji = (emoji: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const newContent = postData.content.substring(0, start) + emoji + postData.content.substring(start)
    const newHtmlContent = postData.htmlContent.substring(0, start) + emoji + postData.htmlContent.substring(start)
    
    setPostData(prev => ({ 
      ...prev, 
      content: newContent,
      htmlContent: newHtmlContent
    }))
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
    
    toast({
      title: "Emoji Added",
      description: `Added ${emoji} to your post`
    })
  }

  // Function to format content for preview (preserves line breaks and HTML)
  const formatContentForPreview = (content: string, htmlContent: string) => {
    if (!content) return "Your content will appear here..."
    
    // Use the content that has the most formatting information
    const sourceContent = htmlContent && htmlContent !== content ? htmlContent : content
    
    // First, handle line breaks - convert \n to <br>
    let formattedContent = sourceContent.replace(/\n/g, '<br>')
    
    // Then escape HTML characters to prevent XSS, but preserve our formatting tags
    formattedContent = formattedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Now restore our allowed formatting tags
    formattedContent = formattedContent
      .replace(/&lt;br&gt;/g, '<br>')
      .replace(/&lt;strong&gt;/g, '<strong>')
      .replace(/&lt;\/strong&gt;/g, '</strong>')
      .replace(/&lt;em&gt;/g, '<em>')
      .replace(/&lt;\/em&gt;/g, '</em>')
      .replace(/&lt;u&gt;/g, '<u>')
      .replace(/&lt;\/u&gt;/g, '</u>')
    
    return formattedContent
  }

  // Text formatting functions with real HTML formatting
  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    // Get current selection
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = postData.content.substring(start, end)
    
    if (selectedText.length === 0) {
      toast({
        title: "No Text Selected",
        description: "Please select some text to format",
        variant: "destructive"
      })
      return
    }
    
    // Create new HTML content with formatting
    let newHtmlContent = postData.htmlContent || postData.content
    
    // Get the plain text before and after selection
    const beforeText = postData.content.substring(0, start)
    const afterText = postData.content.substring(end)
    
    // Create formatted text
    let formattedText = selectedText
    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`
        break
      case 'italic':
        formattedText = `<em>${selectedText}</em>`
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        break
    }
    
    // Update HTML content by replacing the selected text with formatted version
    newHtmlContent = beforeText + formattedText + afterText
    
    setPostData(prev => ({ 
      ...prev, 
      content: prev.content, // Keep plain text unchanged
      htmlContent: newHtmlContent
    }))
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
    
    toast({
      title: "Text Formatted",
      description: `Applied ${format} formatting to selected text`
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault()
            formatText('bold')
            break
          case 'i':
            e.preventDefault()
            formatText('italic')
            break
          case 'u':
            e.preventDefault()
            formatText('underline')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [postData.content])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-teal-50/20 to-black/5 dark:from-black dark:via-teal-950/20 dark:to-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-2 sm:px-4 relative z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm sm:text-base">Custom Post</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div 
        className="px-2 sm:px-4 py-6 sm:py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <motion.div 
            className="space-y-2 sm:space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-black via-teal-600 to-secondary dark:from-white dark:via-teal-400 dark:to-secondary bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Create Custom Posts
            </motion.h1>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="px-2 sm:px-4 pb-6 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Left: Editor */}
            <motion.div 
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >

            {/* Content Editor */}
            <motion.div 
              className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200/50 dark:border-teal-800/50 p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <label className="block text-lg sm:text-xl font-bold text-black dark:text-white mb-2">
                      Write Your Content
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Tip: Click the microphone icon to record your content instead of typing
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm px-3 py-1 rounded-full font-medium",
                      characterCount > maxCharacters * 0.9 
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {characterCount}/{maxCharacters}
                    </span>
                  </div>
                </div>

                {/* Toolbar */}
                <motion.div 
                  className="flex flex-wrap gap-2 bg-teal-50/50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-200/50 dark:border-teal-800/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                        onClick={() => formatText('bold')}
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                        onClick={() => formatText('italic')}
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                        onClick={() => formatText('underline')}
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="w-px bg-teal-300 dark:bg-teal-700 mx-2" />
                  
                  <div className="flex items-center gap-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Insert Emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 px-4 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 gap-2 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200"
                        onClick={() => {
                          setAiPrompt(postData.content.trim())
                          setShowAIAssist(true)
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">AI Assist</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              
                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div 
                      className="absolute z-50 bg-white dark:bg-black border border-teal-200 dark:border-teal-800 rounded-xl p-4 shadow-2xl max-w-sm"
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          '😊', '😄', '😃', '😀', '😉', '😋', '😎', '😍',
                          '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👊',
                          '🎉', '🎊', '🎈', '🎁', '🎂', '🎄', '🎃', '🎗️',
                          '🔥', '💡', '💎', '💪', '🎯', '✨', '🌟', '⭐',
                          '💼', '💻', '📱', '📧', '📞', '📱', '💾', '🔋',
                          '🚀', '✈️', '🚗', '🚲', '🚢', '🚁', '🚂', '🚌',
                          '❤️', '💙', '💚', '💛', '💜', '🖤', '💔', '💕',
                          '🌍', '🌎', '🌏', '🌙', '⭐', '☀️', '🌦️'
                        ].map((emoji, index) => (
                          <motion.button
                            key={index}
                            onClick={() => {
                              insertEmoji(emoji)
                              setShowEmojiPicker(false)
                            }}
                            className="w-10 h-10 text-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg transition-colors flex items-center justify-center"
                            title={emoji}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.1, delay: index * 0.01 }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Textarea
                    placeholder="Write your post content here... Use @ to mention people, # for hashtags, and let your creativity flow!"
                    value={postData.content}
                    onChange={(e) => {
                      const newContent = e.target.value
                      setPostData(prev => ({ 
                        ...prev, 
                        content: newContent,
                        // If HTML content was the same as plain text, update it too
                        // Otherwise, keep the HTML content as is (preserving formatting)
                        htmlContent: prev.htmlContent === prev.content ? newContent : prev.htmlContent
                      }))
                    }}
                    className="min-h-[200px] sm:min-h-[250px] resize-none text-base leading-relaxed border-2 border-teal-200 dark:border-teal-800 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-teal-200 dark:focus:ring-teal-800/20 rounded-xl bg-white/80 dark:bg-black/80 focus:bg-white dark:focus:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12 transition-all duration-200"
                    maxLength={maxCharacters}
                  />
                  <div className="absolute bottom-4 right-4">
                    <MicrophoneButton
                      onTranscript={(transcript) => setPostData(prev => ({ 
                        ...prev, 
                        content: prev.content + (prev.content ? ' ' : '') + transcript.trim(),
                        htmlContent: prev.htmlContent + (prev.htmlContent ? ' ' : '') + transcript.trim()
                      }))}
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

              {/* Tags */}
              <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200/50 dark:border-teal-800/50 p-6 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <label className="block text-lg sm:text-xl font-bold text-black dark:text-white">
                    Tags & Hashtags
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input 
                      placeholder="Add a tag or hashtag..." 
                      value={newTag} 
                      onChange={(e) => setNewTag(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 text-base border-2 border-teal-200 dark:border-teal-800 focus:border-teal-500 dark:focus:border-teal-400 rounded-xl h-12 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <Button size="lg" onClick={addTag} className="gap-2 w-full sm:w-auto h-12 bg-gradient-to-r from-teal-500 to-secondary hover:from-teal-600 hover:to-secondary/90 text-white">
                      <Plus className="h-5 w-5" />
                      Add Tag
                    </Button>
                  </div>
                  
                  {postData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {postData.tags.map(tag => (
                        <span 
                          key={tag} 
                          onClick={() => removeTag(tag)} 
                          className="px-4 py-2 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium cursor-pointer hover:bg-teal-200 dark:hover:bg-teal-800/50 transition-colors flex items-center gap-2"
                        >
                          #{tag}
                          <X className="h-4 w-4" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200/50 dark:border-teal-800/50 p-6 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <label className="block text-lg sm:text-xl font-bold text-black dark:text-white">
                    Add Images
                  </label>
                  
                  {/* Attachment Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Upload Images */}
                    <div
                      className="border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-xl p-6 text-center cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-all duration-200 group bg-teal-50/30 dark:bg-teal-950/20 transform hover:scale-105"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                      <p className="text-base font-semibold text-black dark:text-white mb-1">Upload Images</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </div>

                    {/* Search Images */}
                    <div 
                      className="border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-xl p-6 text-center cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-all duration-200 group bg-teal-50/30 dark:bg-teal-950/20 transform hover:scale-105"
                      onClick={() => setShowImageSearch(true)}
                    >
                      <Search className="h-8 w-8 mx-auto mb-3 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                      <p className="text-base font-semibold text-black dark:text-white mb-1">Search Images</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Find stock photos & graphics</p>
                    </div>
                  </div>
              
                  {/* Uploaded Images Preview */}
                  {postData.images.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-black dark:text-white">Uploaded Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {postData.images.map((img, i) => (
                          <div key={i} className="relative group">
                            <img 
                              src={img} 
                              alt="preview" 
                              className="rounded-xl h-20 sm:h-24 w-full object-cover border-2 border-teal-200 dark:border-teal-800 shadow-sm" 
                            />
                            <button 
                              onClick={() => removeImage(i)} 
                              className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: Preview */}
            <motion.div 
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            >
              {/* Preview Header */}
              <motion.div 
                className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200/50 dark:border-teal-800/50 p-6 sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
                >
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-teal-500 to-secondary rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Live Preview</h2>
                </motion.div>

                {/* Preview Content - LinkedIn Style */}
                <motion.div 
                  className="bg-white dark:bg-black rounded-2xl shadow-lg border border-teal-200 dark:border-teal-800 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  {/* LinkedIn Header */}
                  <div className="p-6 border-b border-teal-200/30 dark:border-teal-800/30">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full overflow-hidden shadow-lg">
                        {session?.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt={session.user.name || "Profile"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-teal-500 to-secondary flex items-center justify-center text-white font-bold text-xl">
                            {session?.user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-black dark:text-white text-lg">
                          {session?.user?.name || "Your Name"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          LinkedIn • {postData.type === 'text' ? 'Text' : 'Post'}
                        </p>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
              
                  {/* LinkedIn Content */}
                  <div className="p-6">
                    {postData.title && (
                      <h3 className="font-bold text-xl text-black dark:text-white mb-4">
                        {postData.title}
                      </h3>
                    )}
                    
                    <div 
                      className="text-black dark:text-white leading-relaxed mb-6 text-base"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContentForPreview(postData.content, postData.htmlContent)
                      }}
                    />
                    
                    {postData.images.length > 0 && (
                      <div className={`grid gap-3 mb-6 ${postData.images.length === 1 ? 'grid-cols-1' : postData.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                        {postData.images.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt="preview" 
                            className={`rounded-xl w-full object-cover shadow-sm ${postData.images.length === 1 ? 'h-64' : 'h-32'}`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {postData.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-6">
                        {postData.tags.map(tag => (
                          <span key={tag} className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* LinkedIn Footer */}
                  <div className="px-6 py-4 border-t border-teal-200/30 dark:border-teal-800/30">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
                      <div className="flex items-center gap-8">
                        <button className="flex items-center gap-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Like</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Comment</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>
                      <button className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200/50 dark:border-teal-800/50 p-6 sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="space-y-4 sm:space-y-6">
                  <motion.h4 
                    className="text-lg sm:text-xl font-bold text-black dark:text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 2.0, ease: "easeOut" }}
                  >
                    Quick Actions
                  </motion.h4>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2.2, ease: "easeOut" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handlePostNow}
                        disabled={!isContentValid || isPosting}
                        className="w-full gap-3 h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-teal-500 to-secondary hover:from-teal-600 hover:to-secondary/90 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        {isPosting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            <span>Posting to LinkedIn...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            <span>Post Now</span>
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2.4, ease: "easeOut" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => setShowScheduleModal(true)}
                        disabled={!isContentValid}
                        variant="outline"
                        className="w-full gap-3 h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 border-teal-200 dark:border-teal-800 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-xl transition-all duration-200"
                      >
                        <Calendar className="h-5 w-5" />
                        <span>Schedule Post</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2.6, ease: "easeOut" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleSaveDraft}
                        disabled={!isContentValid || isSavingDraft}
                        variant="secondary"
                        className="w-full gap-3 h-12 sm:h-14 text-base sm:text-lg font-semibold bg-teal-100 dark:bg-teal-900/50 hover:bg-teal-200 dark:hover:bg-teal-800/50 text-teal-700 dark:text-teal-300 rounded-xl transition-all duration-200"
                      >
                        {isSavingDraft ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600" />
                            <span>Saving Draft...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>Save as Draft</span>
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Status Indicators */}
              <motion.div 
                className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200/50 dark:border-teal-800/50 p-6 sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.8, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!isContentValid && (
                      <motion.div 
                        className="flex items-center gap-3 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Write some content to enable posting</span>
                      </motion.div>
                    )}
                    
                    {isContentValid && (
                      <motion.div 
                        className="flex items-center gap-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-4 rounded-xl border border-green-200 dark:border-green-800"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Ready to post or schedule</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Image Search Modal */}
      <AnimatePresence>
        {showImageSearch && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white dark:bg-black rounded-2xl p-4 sm:p-6 w-full max-w-5xl shadow-2xl border border-teal-200 dark:border-teal-800 max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white">Search Images</h3>
              <button
                onClick={() => setShowImageSearch(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Image Source Selection */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Image Source
                  </label>
                  <Select value={imageSource} onValueChange={setImageSource}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select image source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unsplash">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          Unsplash
                        </div>
                      </SelectItem>
                      <SelectItem value="pexels">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          Pexels
                        </div>
                      </SelectItem>
                      <SelectItem value="pixabay">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          Pixabay
                        </div>
                      </SelectItem>
                      <SelectItem value="google">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          Google Images
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Search Images
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Search for images (e.g., business, technology, nature)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleImageSearch()}
                      className="flex-1 text-sm sm:text-base"
                    />
                    <Button 
                      onClick={handleImageSearch}
                      disabled={isSearching}
                      className="gap-2 w-full sm:w-auto min-h-[40px]"
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span className="text-sm sm:text-base">Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          <span className="text-sm sm:text-base">Search</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Search Results */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 max-h-64 sm:max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((image, i) => (
                    <div key={image.id || i} className="relative group cursor-pointer">
                      <img 
                        src={image.url} 
                        alt={image.alt || `Search result ${i + 1}`}
                        className="aspect-square rounded-lg object-cover border border-teal-200 dark:border-teal-800 hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement
                          target.src = `https://via.placeholder.com/400x400/666666/FFFFFF?text=${encodeURIComponent(searchQuery || 'Image')}`
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button 
                          size="sm" 
                          className="bg-teal-500 hover:bg-teal-600 text-xs"
                          onClick={() => handleAddImageFromSearch(image.url)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show different states based on search status
                  isSearching ? (
                    // Loading state
                    Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="relative group cursor-pointer">
                        <div className="aspect-square bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-500/20 rounded-full"></div>
                        </div>
                      </div>
                    ))
                  ) : searchQuery && !isSearching ? (
                    // No results found state
                    <div className="col-span-3 sm:col-span-4 lg:col-span-5 flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                      <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500 dark:text-gray-400 mb-3 sm:mb-4" />
                      <h4 className="text-base sm:text-lg font-medium text-black dark:text-white mb-2">No images found</h4>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                        No images found for "{searchQuery}". Try a different search term or image source.
                      </p>
                      <Button 
                        onClick={() => setSearchQuery("")}
                        variant="outline"
                        className="gap-2 text-sm sm:text-base"
                      >
                        <Search className="h-4 w-4" />
                        Try different search
                      </Button>
                    </div>
                  ) : (
                    // Initial state - placeholder images
                    Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="relative group cursor-pointer">
                        <div className="aspect-square bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
              
              <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {searchResults.length > 0 ? (
                  <span>
                    <span className="font-medium capitalize">{imageSource}</span> • Free to use • High quality stock photos
                  </span>
                ) : (
                  <span>
                    {isSearching ? "Searching..." : "Enter a search term to find images"}
                  </span>
                )}
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assist Modal */}
      <Dialog open={showAIAssist} onOpenChange={setShowAIAssist}>
        <DialogContent className="max-w-2xl bg-white dark:bg-black border-teal-200 dark:border-teal-800">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <DialogTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </motion.div>
                  AI Assist
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Generate content for your post using AI. Describe what you want to write about.
                </DialogDescription>
              </motion.div>
            </DialogHeader>
          
          <div className="space-y-6">
            {/* Content Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black dark:text-white">Content Type</Label>
              <Select value={aiContentType} onValueChange={(value: any) => setAiContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin-post">LinkedIn Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="tips">Tips</SelectItem>
                  <SelectItem value="insights">Insights</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black dark:text-white">What would you like to write about?</Label>
              <Textarea
                placeholder="e.g., Share insights about remote work productivity, tips for new entrepreneurs, or discuss the latest trends in AI..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="border border-teal-200 dark:border-teal-800 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Customization Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-black dark:text-white">Customization</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Tone</Label>
                  <Select value={aiCustomization.tone} onValueChange={(value: "professional" | "casual" | "friendly" | "authoritative" | "conversational") => setAiCustomization(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Word Count</Label>
                  <Select value={aiCustomization.wordCount.toString()} onValueChange={(value) => setAiCustomization(prev => ({ ...prev, wordCount: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 words</SelectItem>
                      <SelectItem value="150">150 words</SelectItem>
                      <SelectItem value="200">200 words</SelectItem>
                      <SelectItem value="300">300 words</SelectItem>
                      <SelectItem value="500">500 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAIAssist(false)}
                disabled={isGenerating}
                className="border-teal-200 dark:border-teal-800 text-black dark:text-white hover:bg-teal-50 dark:hover:bg-teal-950/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim() || isGenerating}
                className="gap-2 bg-gradient-to-r from-teal-500 to-secondary hover:from-teal-600 hover:to-secondary/90 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
        isScheduling={isScheduling}
      />
    </div>
  )
}
