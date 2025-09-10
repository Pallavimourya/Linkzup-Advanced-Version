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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <Card 
          className={`w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${
            deviceView === "mobile" ? "max-w-md" : "max-w-5xl"
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
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={deviceView === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDeviceView("mobile")}
                    className="h-8 w-8 p-0"
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
          <CardContent className={`space-y-6 overflow-y-auto ${
            deviceView === "mobile" ? "max-h-[calc(90vh-100px)]" : "max-h-[calc(90vh-120px)]"
          }`}>
            {/* LinkedIn Post Preview */}
            <div className={`border rounded-lg bg-white shadow-sm transition-all duration-300 ${
              deviceView === "mobile" 
                ? "max-w-sm mx-auto p-4" 
                : "p-6"
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
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center w-full h-full`}>
                        <span className={`text-white font-semibold ${
                          deviceView === "mobile" ? "text-sm" : "text-lg"
                        }`}>
                          {session?.user?.name?.charAt(0) || "👤"}
                        </span>
                      </div>
                    )}
                    {/* LinkedIn verification badge */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
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
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Image Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">Add Image to Your Post</h3>
                {selectedImage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedImage(null)}
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="search">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </TabsTrigger>
                  <TabsTrigger value="ai-generate">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
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
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
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
                images={selectedImage ? [selectedImage] : undefined}
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
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
