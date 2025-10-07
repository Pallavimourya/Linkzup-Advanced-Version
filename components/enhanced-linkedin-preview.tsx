"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Image, 
  Search, 
  Sparkles, 
  Upload,
  Save,
  X,
  Loader2,
  Send,
  Settings,
  Calendar as CalendarIcon,
  Clock,
  Monitor,
  Smartphone,
  Check,
  HardDrive,
  ExternalLink,
  Copy
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
import { LinkedInPostButton } from "@/components/linkedin-post-button"
import { SchedulePostModal } from "@/components/schedule-post-modal"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

interface EnhancedLinkedInPreviewProps {
  content: string
  onSaveToDraft: (content: string, title: string, format: string) => void
  onClose: () => void
  onContentUpdate?: (newContent: string) => void
}

export function EnhancedLinkedInPreview({ 
  content, 
  onSaveToDraft, 
  onClose, 
  onContentUpdate 
}: EnhancedLinkedInPreviewProps) {
  const { toast } = useToast()
  const { isLinkedInConnected } = useLinkedInPosting()
  const { data: session } = useSession()
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [imageSource, setImageSource] = useState<"ai-carousel" | "search" | "ai-generate" | "upload" | "google-drive" | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Google Drive state
  const [googleDriveResults, setGoogleDriveResults] = useState<any[]>([])
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false)
  const [googleDriveQuery, setGoogleDriveQuery] = useState("")
  const [googleDrivePageToken, setGoogleDrivePageToken] = useState("")
  
  // Edit functionality state
  const [isEditing, setIsEditing] = useState(false)
  const [editableContent, setEditableContent] = useState(content)

  // Scheduling state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")

  // Device view state
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop")

  // Update editableContent when content prop changes
  React.useEffect(() => {
    setEditableContent(content)
  }, [content])

  // Initial connection check when component mounts
  React.useEffect(() => {
    checkGoogleDriveConnection()
  }, [])

  // Check for Google Drive connection success from URL parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('google_drive_connected') === 'true') {
      // Connection was successful, check status and load images
      setTimeout(() => {
        checkGoogleDriveConnection()
      }, 1000) // Small delay to ensure connection is fully established
    }
  }, [])

  // Auto-load Google Drive images when connection is established
  React.useEffect(() => {
    if (googleDriveConnected && googleDriveResults.length === 0) {
      // Automatically load all images when Google Drive is connected
      searchGoogleDriveImages()
    }
  }, [googleDriveConnected])

  // Check for connection status changes periodically
  React.useEffect(() => {
    const checkConnectionPeriodically = setInterval(() => {
      // Always check connection status to maintain persistent connection
      checkGoogleDriveConnection()
    }, 10000) // Check every 10 seconds to maintain connection

    return () => clearInterval(checkConnectionPeriodically)
  }, [])

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    // Handle escape key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    
    // Re-enable body scroll when modal is closed
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])
  
  // Image Management State
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedSource, setSelectedSource] = useState("google")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResults, setAiResults] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  // Edit functions
  const handleEdit = () => {
    setIsEditing(true)
    setEditableContent(content)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    if (onContentUpdate) {
      onContentUpdate(editableContent)
    }
    toast({
      title: "Content updated",
      description: "Your post content has been updated successfully.",
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditableContent(content)
  }

  const imageSources = [
    { value: "unsplash", label: "Unsplash" },
    { value: "pexels", label: "Pexels" },
    { value: "pixabay", label: "Pixabay" },
    { value: "google", label: "Google Images" },
  ]

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
    if (selectedImages.includes(imageUrl)) {
      // If image is already selected, remove it
      setSelectedImages(prev => prev.filter(img => img !== imageUrl))
      toast({
        title: "Image removed",
        description: "Image has been removed from selection",
      })
    } else {
      // Add new image to selection
      setSelectedImages(prev => [...prev, imageUrl])
      toast({
        title: "Image selected",
        description: "Image has been added to your selection",
      })
    }
  }

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
  }

  const handleRemoveImage = (imageUrl: string) => {
    setSelectedImages(prev => prev.filter(img => img !== imageUrl))
    toast({
      title: "Image removed",
      description: "Image has been removed from selection",
    })
  }

  // Google Drive functions
  const checkGoogleDriveConnection = async () => {
    try {
      const response = await fetch('/api/google-drive/auth?action=check')
      if (response.ok) {
        const data = await response.json()
        setGoogleDriveConnected(data.connected)
      }
    } catch (error) {
      console.error('Failed to check Google Drive connection:', error)
    }
  }

  const connectGoogleDrive = async () => {
    try {
      const response = await fetch('/api/google-drive/auth?action=connect')
      if (response.ok) {
        const data = await response.json()
        window.open(data.authUrl, '_blank')
        toast({
          title: "Google Drive Authorization",
          description: "Please complete the authorization in the new window.",
        })
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Google Drive. Please try again.",
        variant: "destructive",
      })
    }
  }

  const disconnectGoogleDrive = async () => {
    try {
      const response = await fetch('/api/google-drive/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'disconnect' }),
      })

      if (response.ok) {
        setGoogleDriveConnected(false)
        setGoogleDriveResults([])
        toast({
          title: "Disconnected",
          description: "Google Drive has been disconnected successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Disconnect failed",
        description: "Failed to disconnect from Google Drive. Please try again.",
        variant: "destructive",
      })
    }
  }

  const searchGoogleDriveImages = async (loadMore = false) => {
    if (!googleDriveConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your Google Drive account first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const action = googleDriveQuery.trim() ? 'search' : 'list'
      const params = new URLSearchParams({
        action,
        ...(googleDriveQuery.trim() && { query: googleDriveQuery }),
        ...(loadMore && googleDrivePageToken && { pageToken: googleDrivePageToken }),
      })

      const response = await fetch(`/api/google-drive?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.images && data.images.length > 0) {
          if (loadMore) {
            setGoogleDriveResults(prev => [...prev, ...data.images])
          } else {
            setGoogleDriveResults(data.images)
          }
          setGoogleDrivePageToken(data.nextPageToken || '')
          
          if (!loadMore) {
            toast({
              title: "Search Complete",
              description: `Found ${data.images.length} images from Google Drive`,
            })
          }
        } else {
          if (!loadMore) {
            setGoogleDriveResults([])
            toast({
              title: "No Images Found",
              description: "No images found in your Google Drive. Try a different search term.",
              variant: "destructive"
            })
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.needsReconnect) {
          setGoogleDriveConnected(false)
          toast({
            title: "Reconnection Required",
            description: "Your Google Drive access has expired. Please reconnect your account.",
            variant: "destructive",
          })
          return
        }
        throw new Error(errorData.error || "Google Drive search failed")
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search Google Drive. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreGoogleDriveImages = () => {
    if (googleDrivePageToken) {
      searchGoogleDriveImages(true)
    }
  }

  const handleClearAllImages = () => {
    setSelectedImages([])
    toast({
      title: "All images cleared",
      description: "All selected images have been removed",
    })
  }

  const handleSchedulePost = () => {
    setShowScheduleModal(true)
  }

  const handleScheduleSuccess = () => {
    setShowScheduleModal(false)
    onClose()
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <Card 
          className={`w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${
            deviceView === "mobile" ? "max-w-md mx-2" : "max-w-4xl"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                LinkedIn Post Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Device View Controls */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={deviceView === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDeviceView("desktop")}
                    className="h-8 w-8 p-0"
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={deviceView === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDeviceView("mobile")}
                    className="h-8 w-8 p-0"
                    title="Mobile View"
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`space-y-6 overflow-y-auto pb-6 ${
            deviceView === "mobile" ? "max-h-[calc(90vh-100px)]" : "max-h-[calc(90vh-120px)]"
          }`}>
            {/* LinkedIn Post Preview */}
            <div className={`border border-border rounded-lg bg-card shadow-sm transition-all duration-300 ${
              deviceView === "mobile" 
                ? "max-w-sm mx-auto p-4" 
                : "p-5"
            }`}>
              {/* Profile Header */}
              <div className={`flex items-start justify-between mb-4 ${
                deviceView === "mobile" ? "mb-3" : "mb-4"
              }`}>
                <div className={`flex items-center gap-3 ${
                  deviceView === "mobile" ? "gap-2" : "gap-3"
                }`}>
                  <div className={`relative ${
                    deviceView === "mobile" ? "w-10 h-10" : "w-12 h-12"
                  }`}>
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center w-full h-full border border-border`}>
                        <span className={`text-white font-semibold ${
                          deviceView === "mobile" ? "text-sm" : "text-lg"
                        }`}>
                          {session?.user?.name?.charAt(0) || "👤"}
                        </span>
                      </div>
                    )}
                    {/* LinkedIn verification badge */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border border-white">
                      <span className="text-white text-xs font-bold">in</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-foreground ${
                      deviceView === "mobile" ? "text-sm" : "text-base"
                    }`}>
                      {session?.user?.name || "Your Name"}
                    </div>
                    <div className={`text-muted-foreground ${
                      deviceView === "mobile" ? "text-xs" : "text-sm"
                    }`}>
                      {session?.user?.email?.split('@')[0] || "Professional"} • Now • 🌍
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 dark:text-white hover:text-foreground">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className={`leading-relaxed mb-4 ${
                deviceView === "mobile" ? "text-xs" : "text-sm"
              }`}>
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className={`resize-none border border-gray-300 dark:border-gray-600 ${
                        deviceView === "mobile" ? "min-h-[100px] text-xs" : "min-h-[150px]"
                      }`}
                      placeholder="Edit your post content..."
                    />
                    <div className={`flex gap-2 ${
                      deviceView === "mobile" ? "flex-col" : "flex-row"
                    }`}>
                      <Button size="sm" onClick={handleSaveEdit} className={deviceView === "mobile" ? "w-full" : ""}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className={deviceView === "mobile" ? "w-full" : ""}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`whitespace-pre-wrap text-foreground ${
                      deviceView === "mobile" ? "text-xs leading-relaxed" : ""
                    }`}>{content}</div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleEdit}
                      className={`mt-2 ${deviceView === "mobile" ? "w-full" : ""}`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Post
                    </Button>
                  </div>
                )}
              </div>

              {selectedImages.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedImages.map((imageUrl, index) => (
                      <img 
                        key={index}
                        src={imageUrl} 
                        alt={`Post image ${index + 1}`} 
                        className={`w-full rounded-lg ${
                          deviceView === "mobile" ? "h-48 object-cover" : "h-32 object-cover"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Stats */}
              <div className={`flex items-center justify-between text-muted-foreground mb-3 ${
                deviceView === "mobile" ? "text-xs" : "text-sm"
              }`}>
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className={`bg-blue-500 rounded-full flex items-center justify-center ${
                      deviceView === "mobile" ? "w-6 h-6" : "w-5 h-5"
                    }`}>
                      <span className={`text-white ${
                        deviceView === "mobile" ? "text-xs" : "text-xs"
                      }`}>👍</span>
                    </div>
                    <div className={`bg-green-500 rounded-full flex items-center justify-center ${
                      deviceView === "mobile" ? "w-6 h-6" : "w-5 h-5"
                    }`}>
                      <span className={`text-white ${
                        deviceView === "mobile" ? "text-xs" : "text-xs"
                      }`}>👏</span>
                    </div>
                    <div className={`bg-red-500 rounded-full flex items-center justify-center ${
                      deviceView === "mobile" ? "w-6 h-6" : "w-5 h-5"
                    }`}>
                      <span className={`text-white ${
                        deviceView === "mobile" ? "text-xs" : "text-xs"
                      }`}>❤️</span>
                    </div>
                  </div>
                  <span className={`ml-2 ${
                    deviceView === "mobile" ? "text-xs" : ""
                  }`}>John Doe and 68 others</span>
                </div>
                <div className={`flex items-center gap-4 ${
                  deviceView === "mobile" ? "text-xs" : ""
                }`}>
                  <span>4 comments</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-3">
                <div className={`flex items-center justify-between ${
                  deviceView === "mobile" ? "text-xs" : "text-sm"
                }`}>
                  <button className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted ${
                    deviceView === "mobile" ? "py-2 px-3 min-h-[40px] flex-1 justify-center" : "py-2 px-3"
                  }`}>
                    <svg className={`w-5 h-5 fill-current`} viewBox="0 0 24 24">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    <span className={deviceView === "mobile" ? "text-sm" : ""}>Like</span>
                  </button>
                  <button className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted ${
                    deviceView === "mobile" ? "py-2 px-3 min-h-[40px] flex-1 justify-center" : "py-2 px-3"
                  }`}>
                    <svg className={`w-5 h-5 fill-current`} viewBox="0 0 24 24">
                      <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    <span className={deviceView === "mobile" ? "text-sm" : ""}>Comment</span>
                  </button>
                  <button className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted ${
                    deviceView === "mobile" ? "py-2 px-3 min-h-[40px] flex-1 justify-center" : "py-2 px-3"
                  }`}>
                    <svg className={`w-5 h-5 fill-current`} viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    <span className={deviceView === "mobile" ? "text-sm" : ""}>Share</span>
                  </button>
                  <button className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted ${
                    deviceView === "mobile" ? "py-2 px-3 min-h-[40px] flex-1 justify-center" : "py-2 px-3"
                  }`}>
                    <svg className={`w-5 h-5 fill-current`} viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    <span className={deviceView === "mobile" ? "text-sm" : ""}>Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Image Options */}
            <div className="space-y-4">
              <div className={`flex items-center justify-between ${
                deviceView === "mobile" ? "flex-col gap-2" : "flex-row"
              }`}>
                <h3 className={`font-medium ${
                  deviceView === "mobile" ? "text-base" : "text-lg"
                }`}>Add Images to Your Post</h3>
                {selectedImages.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearAllImages}
                      className={deviceView === "mobile" ? "w-full" : ""}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>

              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Images ({selectedImages.length})</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Selected ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImagePreview(imageUrl)}
                        />
                        <Badge className="absolute top-2 left-2">
                          {index + 1}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage(imageUrl)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className={`grid w-full grid-cols-4 ${
                  deviceView === "mobile" ? "h-10" : ""
                }`}>
                  <TabsTrigger value="upload" className={deviceView === "mobile" ? "text-xs" : ""}>
                    <Upload className={`${deviceView === "mobile" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
                    {deviceView === "mobile" ? "Upload" : "Upload"}
                  </TabsTrigger>
                  <TabsTrigger value="search" className={deviceView === "mobile" ? "text-xs" : ""}>
                    <Search className={`${deviceView === "mobile" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
                    {deviceView === "mobile" ? "Search" : "Search"}
                  </TabsTrigger>
                  <TabsTrigger value="google-drive" className={deviceView === "mobile" ? "text-xs" : ""}>
                    <HardDrive className={`${deviceView === "mobile" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
                    {deviceView === "mobile" ? "Drive" : "Google Drive"}
                  </TabsTrigger>
                  <TabsTrigger value="ai-generate" className={deviceView === "mobile" ? "text-xs" : ""}>
                    <Sparkles className={`${deviceView === "mobile" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
                    {deviceView === "mobile" ? "AI" : "AI Generate"}
                  </TabsTrigger>
                </TabsList>
                
                {/* Upload Tab */}
                <TabsContent value="upload" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop images here or click to browse
                        </p>
                        <Button
                          onClick={() => document.getElementById('enhanced-file-upload')?.click()}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Choose Files
                        </Button>
                        <input
                          id="enhanced-file-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <Label>Uploaded Images</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {uploadedImages.map((url, index) => {
                              const isSelected = selectedImages.includes(url)
                              return (
                                <div key={index} className="relative group">
                                  <img
                                    src={url}
                                    alt={`Uploaded ${index + 1}`}
                                    className={`w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                      isSelected ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => handleImageSelect(url)}
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                      <div className="bg-blue-500 text-white rounded-full p-1">
                                        <Check className="w-3 h-3" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Search Tab */}
                <TabsContent value="search" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Search for images..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                          className="flex-1"
                        />
                        <Select value={selectedSource} onValueChange={setSelectedSource}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {imageSources.map((source) => (
                              <SelectItem key={source.value} value={source.value}>
                                {source.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={searchImages} disabled={isLoading || !searchQuery.trim()}>
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="space-y-2">
                          <Label>Search Results</Label>
                          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            {searchResults.map((result) => {
                              const isSelected = selectedImages.includes(result.url)
                              return (
                                <div key={result.id} className="relative group">
                                  <img
                                    src={result.thumbnail}
                                    alt={result.title || 'Search result'}
                                    className={`w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                      isSelected ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => handleImageSelect(result.url)}
                                  />
                                  <Badge className="absolute top-1 left-1 text-xs">
                                    {result.source}
                                  </Badge>
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                      <div className="bg-blue-500 text-white rounded-full p-1">
                                        <Check className="w-3 h-3" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Google Drive Tab */}
                <TabsContent value="google-drive" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <HardDrive className="w-5 h-5 mr-2" />
                          Google Drive
                        </span>
                        {googleDriveConnected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={disconnectGoogleDrive}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={connectGoogleDrive}
                          >
                            Connect
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!googleDriveConnected ? (
                        <div className="text-center py-8">
                          <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Connect Google Drive</h3>
                          <p className="text-muted-foreground mb-4">
                            Connect your Google Drive account to access your images directly from your cloud storage.
                          </p>
                          <Button onClick={connectGoogleDrive} className="w-full">
                            <HardDrive className="w-4 h-4 mr-2" />
                            Connect Google Drive
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search your Google Drive images..."
                              value={googleDriveQuery}
                              onChange={(e) => setGoogleDriveQuery(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && searchGoogleDriveImages()}
                              className="flex-1"
                            />
                            <Button 
                              onClick={() => searchGoogleDriveImages()} 
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Search className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          {googleDriveResults.length > 0 && (
                            <div className="space-y-2">
                              <Label>Google Drive Images</Label>
                              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                {googleDriveResults.map((result) => {
                                  const isSelected = selectedImages.includes(result.downloadUrl)
                                  return (
                                    <div key={result.id} className="relative group">
                                      <img
                                        src={result.url}
                                        alt={result.name}
                                        className={`w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                          isSelected ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                        onClick={() => handleImageSelect(result.downloadUrl)}
                                      />
                                      <Badge className="absolute top-1 left-1 text-xs">
                                        Drive
                                      </Badge>
                                      <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded truncate">
                                        {result.name}
                                      </div>
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                          <div className="bg-blue-500 text-white rounded-full p-1">
                                            <Check className="w-3 h-3" />
                                          </div>
                                        </div>
                                      )}
                                      <div className="absolute top-1 right-1 flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                                          onClick={() => navigator.clipboard.writeText(result.downloadUrl)}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                                          onClick={() => window.open(result.webViewLink, '_blank')}
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              
                              {googleDrivePageToken && (
                                <Button
                                  variant="outline"
                                  onClick={loadMoreGoogleDriveImages}
                                  disabled={isLoading}
                                  className="w-full"
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    'Load More'
                                  )}
                                </Button>
                              )}
                            </div>
                          )}

                          {googleDriveResults.length === 0 && googleDriveConnected && (
                            <div className="text-center py-8">
                              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                              <h3 className="text-lg font-semibold mb-2">No Images Found</h3>
                              <p className="text-muted-foreground mb-4">
                                {googleDriveQuery ? 
                                  `No images found matching "${googleDriveQuery}". Try a different search term.` :
                                  "No images found in your Google Drive. Upload some images to get started."
                                }
                              </p>
                              <Button 
                                variant="outline" 
                                onClick={() => searchGoogleDriveImages()}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Search className="w-4 h-4 mr-2" />
                                )}
                                {googleDriveQuery ? 'Search Again' : 'Browse All Images'}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* AI Generate Tab */}
                <TabsContent value="ai-generate" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <Label>Describe the image you want to generate</Label>
                        <Textarea
                          placeholder="A professional business meeting with modern office background..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={3}
                          className="border border-gray-300 dark:border-gray-600"
                        />
                        <Button 
                          onClick={generateAIImage} 
                          disabled={isLoading || !aiPrompt.trim()}
                          className="w-full"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Generate Image
                        </Button>
                      </div>

                      {aiResults.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <Label>Generated Images</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {aiResults.map((result) => {
                              const isSelected = selectedImages.includes(result.url)
                              return (
                                <div key={result.id} className="relative group">
                                  <img
                                    src={result.url}
                                    alt={result.prompt}
                                    className={`w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                      isSelected ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => handleImageSelect(result.url)}
                                  />
                                  <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded">
                                    {result.prompt.substring(0, 50)}...
                                  </div>
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                      <div className="bg-blue-500 text-white rounded-full p-1">
                                        <Check className="w-3 h-3" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className={`pt-4 border-t ${
              deviceView === "mobile" 
                ? "space-y-3" 
                : "flex gap-3 justify-end"
            }`}>
              {deviceView === "mobile" ? (
                // Mobile: Stack buttons vertically
                <div className="space-y-3">
                  <LinkedInPostButton 
                    content={content} 
                    images={selectedImages.length > 0 ? selectedImages : undefined}
                    className="w-full h-12 text-base"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => onSaveToDraft(content, "LinkedIn Post", "linkedin-post")}
                      variant="outline"
                      className="w-full h-12 text-base"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button 
                      onClick={handleSchedulePost}
                      variant="outline"
                      className="w-full h-12 text-base"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="w-full h-12 text-base"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                // Desktop: Horizontal layout
                <>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => onSaveToDraft(content, "LinkedIn Post", "linkedin-post")}
                    variant="outline"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Draft
                  </Button>
                  <Button 
                    onClick={handleSchedulePost}
                    variant="outline"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                  <LinkedInPostButton 
                    content={content} 
                    images={selectedImages.length > 0 ? selectedImages : undefined}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Post Modal */}
      <SchedulePostModal
        content={editableContent}
        images={selectedImages}
        onSuccess={handleScheduleSuccess}
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
