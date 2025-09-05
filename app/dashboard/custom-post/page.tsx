"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
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
  Loader2
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-card rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-border">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">Schedule Post</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
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
            <label className="block text-sm font-medium text-foreground mb-2">
              Time
            </label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="bg-primary/10 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-primary">
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
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
      </div>
    </div>
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
    
    if (htmlContent && htmlContent !== content) {
      // If we have HTML content (with formatting), preserve line breaks
      return htmlContent.replace(/\n/g, '<br>')
    } else {
      // If no HTML formatting, just preserve line breaks and convert to HTML
      return content
        .replace(/\n/g, '<br>')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }
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
    let newHtmlContent = postData.htmlContent
    
    // Get the plain text before and after selection
    const beforeText = postData.content.substring(0, start)
    const afterText = postData.content.substring(end)
    
    switch (format) {
      case 'bold':
        // Add bold formatting to HTML content
        newHtmlContent = beforeText + `<strong>${selectedText}</strong>` + afterText
        break
      case 'italic':
        // Add italic formatting to HTML content
        newHtmlContent = beforeText + `<em>${selectedText}</em>` + afterText
        break
      case 'underline':
        // Add underline formatting to HTML content
        newHtmlContent = beforeText + `<u>${selectedText}</u>` + afterText
        break
    }
    
    setPostData(prev => ({ 
      ...prev, 
      content: prev.content, // Keep plain text unchanged
      htmlContent: newHtmlContent
    }))
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + selectedText.length)
    }, 0)
    
    toast({
      title: "Text Formatted",
      description: `Applied ${format} formatting to selected text`
    })
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-2 sm:px-4">
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

      {/* Welcome Section */}
      <div className="px-2 sm:px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Create Custom LinkedIn Posts ✍️
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Craft personalized content with rich formatting, images, and scheduling options.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-2 sm:px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left: Editor */}
          <div className="space-y-4 sm:space-y-6">

            {/* Content Editor */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <label className="block text-sm font-medium text-foreground">
                  Content
                </label>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    characterCount > maxCharacters * 0.9 
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 bg-muted p-2 rounded-lg w-fit">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-accent"
                  onClick={() => formatText('bold')}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-accent"
                  onClick={() => formatText('italic')}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-accent"
                  onClick={() => formatText('underline')}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="w-px bg-border mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-accent"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Insert Emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-primary gap-1 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setShowAIAssist(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden xs:inline">AI Assist</span>
                </Button>
              </div>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute z-50 bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
                  <div className="grid grid-cols-8 gap-1">
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
                      <button
                        key={index}
                        onClick={() => {
                          insertEmoji(emoji)
                          setShowEmojiPicker(false)
                        }}
                        className="w-8 h-8 text-lg hover:bg-accent rounded transition-colors flex items-center justify-center"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Textarea
                placeholder="Write your post content here... Use @ to mention people, # for hashtags, and let your creativity flow!"
                value={postData.content}
                onChange={(e) => {
                  const newContent = e.target.value
                  setPostData(prev => ({ 
                    ...prev, 
                    content: newContent,
                    // Keep HTML content in sync with plain text (preserving any existing formatting)
                    htmlContent: prev.htmlContent === prev.content ? newContent : prev.htmlContent
                  }))
                }}
                className="min-h-[250px] sm:min-h-[300px] resize-none text-sm sm:text-base leading-relaxed border-2 focus:border-primary focus:ring-primary/20"
                maxLength={maxCharacters}
              />
            </div>

              {/* Tags */}
              <div className="space-y-3 sm:space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Tags
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="Add a tag..." 
                  value={newTag} 
                  onChange={(e) => setNewTag(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 text-sm sm:text-base"
                />
                <Button size="sm" onClick={addTag} className="gap-2 w-full sm:w-auto min-h-[40px]">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              
              {postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {postData.tags.map(tag => (
                    <span 
                      key={tag} 
                      onClick={() => removeTag(tag)} 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1"
                    >
                      #{tag}
                      <X className="h-3 w-3" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-3 sm:space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Attachments
              </label>
              
              {/* Attachment Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload Images */}
                <div
                  className="border-2 border-dashed border-border rounded-lg p-3 sm:p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group bg-muted/30 hover:bg-muted/50 transform hover:scale-105"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium text-foreground">Upload Images</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
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
                  className="border-2 border-dashed border-border rounded-lg p-3 sm:p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group bg-muted/30 hover:bg-muted/50 transform hover:scale-105"
                  onClick={() => setShowImageSearch(true)}
                >
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium text-foreground">Search Images</p>
                  <p className="text-xs text-muted-foreground">Find stock photos & graphics</p>
                </div>
              </div>
              
              {/* Uploaded Images Preview */}
              {postData.images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Uploaded Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {postData.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img 
                          src={img} 
                          alt="preview" 
                          className="rounded-lg h-16 sm:h-20 w-full object-cover border border-border" 
                        />
                        <button 
                          onClick={() => removeImage(i)} 
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 shadow-sm"
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

          {/* Right: Preview */}
          <div className="space-y-4 sm:space-y-6">
            {/* Preview Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "preview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Preview
              </button>
            </div>

            {/* Preview Content */}
            <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-sm sm:text-base">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground text-sm sm:text-base">
                    {session?.user?.name || "Your Name"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                    {postData.platform} • {postData.type}
                  </p>
                </div>
              </div>
              
              {postData.title && (
                <h3 className="font-semibold text-base sm:text-lg text-card-foreground mb-3">
                  {postData.title}
                </h3>
              )}
              
              <div 
                className="text-card-foreground leading-relaxed mb-4 prose prose-sm max-w-none text-sm sm:text-base"
                dangerouslySetInnerHTML={{ 
                  __html: formatContentForPreview(postData.content, postData.htmlContent)
                }}
              />
              
              {postData.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {postData.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt="preview" 
                      className="rounded-lg w-full h-24 sm:h-32 object-cover" 
                    />
                  ))}
                </div>
              )}
              
              {postData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {postData.tags.map(tag => (
                    <span key={tag} className="text-primary text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-muted rounded-xl p-3 sm:p-4">
              <h4 className="font-medium text-foreground mb-3 text-sm sm:text-base">Quick Actions</h4>
              <div className="space-y-3">
                <Button
                  onClick={handlePostNow}
                  disabled={!isContentValid || isPosting}
                  className="w-full gap-2 min-h-[40px]"
                >
                  {isPosting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                      <span className="text-sm sm:text-base">Posting to LinkedIn...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="text-sm sm:text-base">Post Now</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setShowScheduleModal(true)}
                  disabled={!isContentValid}
                  variant="outline"
                  className="w-full gap-2 min-h-[40px]"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Schedule Post</span>
                </Button>
                
                <Button
                  onClick={handleSaveDraft}
                  disabled={!isContentValid || isSavingDraft}
                  variant="secondary"
                  className="w-full gap-2 min-h-[40px]"
                >
                  {isSavingDraft ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground" />
                      <span className="text-sm sm:text-base">Saving Draft...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="text-sm sm:text-base">Save as Draft</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="space-y-3">
              {!isContentValid && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Write some content to enable posting</span>
                </div>
              )}
              
              {isContentValid && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Ready to post or schedule</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Search Modal */}
      {showImageSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-card rounded-2xl p-4 sm:p-6 w-full max-w-5xl shadow-2xl border border-border max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">Search Images</h3>
              <button
                onClick={() => setShowImageSearch(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Image Source Selection */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-foreground mb-2">
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
                  <label className="block text-sm font-medium text-foreground mb-2">
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
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
                        className="aspect-square rounded-lg object-cover border border-border hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement
                          target.src = `https://via.placeholder.com/400x400/666666/FFFFFF?text=${encodeURIComponent(searchQuery || 'Image')}`
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90 text-xs"
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
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center animate-pulse">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted-foreground/20 rounded-full"></div>
                        </div>
                      </div>
                    ))
                  ) : searchQuery && !isSearching ? (
                    // No results found state
                    <div className="col-span-3 sm:col-span-4 lg:col-span-5 flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                      <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
                      <h4 className="text-base sm:text-lg font-medium text-foreground mb-2">No images found</h4>
                      <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
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
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
              
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
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
          </div>
        </div>
      )}

      {/* AI Assist Modal */}
      <Dialog open={showAIAssist} onOpenChange={setShowAIAssist}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Assist
            </DialogTitle>
            <DialogDescription>
              Generate content for your post using AI. Describe what you want to write about.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Content Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Content Type</Label>
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
              <Label className="text-sm font-medium">What would you like to write about?</Label>
              <Textarea
                placeholder="e.g., Share insights about remote work productivity, tips for new entrepreneurs, or discuss the latest trends in AI..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
              />
            </div>

            {/* Customization Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Customization</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tone</Label>
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
                  <Label className="text-xs text-muted-foreground">Word Count</Label>
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
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim() || isGenerating}
                className="gap-2"
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
