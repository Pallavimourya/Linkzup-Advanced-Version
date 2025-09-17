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
  Smartphone
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<"ai-carousel" | "search" | "ai-generate" | "upload" | null>(null)
  
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
  const [selectedSource, setSelectedSource] = useState("unsplash")
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
    setSelectedImage(imageUrl)
    toast({
      title: "Image selected",
      description: "Image has been selected for your content",
    })
  }

  const handleSchedulePost = () => {
    setShowScheduleModal(true)
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
            deviceView === "mobile" ? "max-w-sm mx-2" : "max-w-4xl"
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
            <div className={`border border-gray-200 rounded-lg bg-white shadow-sm transition-all duration-300 ${
              deviceView === "mobile" 
                ? "max-w-sm mx-auto p-3" 
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
                        className="w-full h-full rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center w-full h-full border border-gray-200`}>
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
                    <div className={`font-semibold text-gray-900 ${
                      deviceView === "mobile" ? "text-sm" : "text-base"
                    }`}>
                      {session?.user?.name || "Your Name"}
                    </div>
                    <div className={`text-gray-500 ${
                      deviceView === "mobile" ? "text-xs" : "text-sm"
                    }`}>
                      {session?.user?.email?.split('@')[0] || "Professional"} • Now • 🌍
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-500 hover:text-gray-700">
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
                      className={`resize-none ${
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
                    <div className={`whitespace-pre-wrap text-gray-800 ${
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

              {selectedImage && (
                <div className="mb-4">
                  <img 
                    src={selectedImage} 
                    alt="Post image" 
                    className={`w-full rounded-lg ${
                      deviceView === "mobile" ? "h-48 object-cover" : ""
                    }`}
                  />
                </div>
              )}

              {/* Engagement Stats */}
              <div className={`flex items-center justify-between text-gray-500 mb-3 ${
                deviceView === "mobile" ? "text-xs" : "text-sm"
              }`}>
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">👍</span>
                    </div>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">👏</span>
                    </div>
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">❤️</span>
                    </div>
                  </div>
                  <span className="ml-2">John Doe and 68 others</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>4 comments</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-3">
                <div className={`flex items-center justify-between ${
                  deviceView === "mobile" ? "text-xs" : "text-sm"
                }`}>
                  <button className={`flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 ${
                    deviceView === "mobile" ? "py-1 px-2 min-h-[32px]" : "py-2 px-3"
                  }`}>
                    <svg className={`fill="currentColor" viewBox="0 0 24 24" ${
                      deviceView === "mobile" ? "w-4 h-4" : "w-5 h-5"
                    }`}>
                      <path d="M19.46 11l-3.91-3.91a7 7 0 0 1-1.69-2.74l-.49-1.47A.82.82 0 0 0 12.65 2a.81.81 0 0 0-.72.57L11 5.09l-1.35.45a1 1 0 0 0-.79.68l-.72 2.19a6.65 6.65 0 0 1-1.28 2.6l-2.32 3.56a1 1 0 0 0-.11.57l.43 4.24a1 1 0 0 0 .9.9l4.24.43a1 1 0 0 0 .57-.11l3.56-2.32a6.65 6.65 0 0 1 2.6-1.28l2.19-.72a1 1 0 0 0 .68-.79l.45-1.35.52-1.93a.81.81 0 0 0-.58-.95z"/>
                    </svg>
                    <span>Like</span>
                  </button>
                  <button className={`flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 ${
                    deviceView === "mobile" ? "py-1 px-2 min-h-[32px]" : "py-2 px-3"
                  }`}>
                    <svg className={`fill="currentColor" viewBox="0 0 24 24" ${
                      deviceView === "mobile" ? "w-4 h-4" : "w-5 h-5"
                    }`}>
                      <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    <span>Comment</span>
                  </button>
                  <button className={`flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 ${
                    deviceView === "mobile" ? "py-1 px-2 min-h-[32px]" : "py-2 px-3"
                  }`}>
                    <svg className={`fill="currentColor" viewBox="0 0 24 24" ${
                      deviceView === "mobile" ? "w-4 h-4" : "w-5 h-5"
                    }`}>
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    <span>Share</span>
                  </button>
                  <button className={`flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 ${
                    deviceView === "mobile" ? "py-1 px-2 min-h-[32px]" : "py-2 px-3"
                  }`}>
                    <svg className={`fill="currentColor" viewBox="0 0 24 24" ${
                      deviceView === "mobile" ? "w-4 h-4" : "w-5 h-5"
                    }`}>
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    <span>Send</span>
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
                }`}>Add Image to Your Post</h3>
                {selectedImage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedImage(null)}
                    className={deviceView === "mobile" ? "w-full" : ""}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                )}
              </div>

              {selectedImage && (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected for content"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Badge className="absolute top-2 left-2">
                    Selected Image
                  </Badge>
                </div>
              )}

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className={`grid w-full grid-cols-3 ${
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
                            {uploadedImages.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Uploaded ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageSelect(url)}
                                />
                              </div>
                            ))}
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
                            {searchResults.map((result) => (
                              <div key={result.id} className="relative group">
                                <img
                                  src={result.thumbnail}
                                  alt={result.title || 'Search result'}
                                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageSelect(result.url)}
                                />
                                <Badge className="absolute top-1 left-1 text-xs">
                                  {result.source}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
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
                            {aiResults.map((result) => (
                              <div key={result.id} className="relative group">
                                <img
                                  src={result.url}
                                  alt={result.prompt}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageSelect(result.url)}
                                />
                                <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded">
                                  {result.prompt.substring(0, 50)}...
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className={`flex pt-4 border-t ${
              deviceView === "mobile" 
                ? "flex-col gap-3" 
                : "gap-3 justify-end"
            }`}>
              <Button 
                variant="outline" 
                onClick={onClose}
                className={deviceView === "mobile" ? "w-full h-12 text-base" : ""}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => onSaveToDraft(content, "LinkedIn Post", "linkedin-post")}
                variant="outline"
                className={deviceView === "mobile" ? "w-full h-12 text-base" : ""}
              >
                <Save className="w-4 h-4 mr-2" />
                Save to Draft
              </Button>
              <Button 
                onClick={handleSchedulePost}
                variant="outline"
                className={deviceView === "mobile" ? "w-full h-12 text-base" : ""}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
              <LinkedInPostButton 
                content={content} 
                images={selectedImage ? [selectedImage] : undefined}
                className={deviceView === "mobile" ? "w-full h-12 text-base" : ""}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Post Modal */}
      {showScheduleModal && (
        <SchedulePostModal
          content={content}
          images={selectedImage ? [selectedImage] : []}
          onSuccess={() => {
            setShowScheduleModal(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
