"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Image, 
  Search, 
  Sparkles, 
  Upload,
  Save,
  X,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LinkedInPreviewProps {
  content: string
  onSaveToDraft: (content: string, title: string, format: string) => void
  onClose: () => void
}

export function LinkedInPreview({ content, onSaveToDraft, onClose }: LinkedInPreviewProps) {
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<"ai-carousel" | "search" | "ai-generate" | "upload" | null>(null)
  
  // Image Management State
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedSource, setSelectedSource] = useState("unsplash")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResults, setAiResults] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const imageSources = [
    { value: "unsplash", label: "Unsplash" },
    { value: "pexels", label: "Pexels" },
    { value: "pixabay", label: "Pixabay" },
    { value: "serp", label: "Google Images" },
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
        setSearchResults(data.results || [])
      } else {
        throw new Error('Search failed')
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>LinkedIn Preview</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* LinkedIn Post Preview */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">👤</span>
              </div>
              <div>
                <div className="font-medium">Your Name</div>
                <div className="text-sm text-gray-500">Just now • 🌍</div>
              </div>
            </div>
            
            <div className="text-sm leading-relaxed mb-4">
              {content}
            </div>

            {selectedImage && (
              <div className="mb-4">
                <img 
                  src={selectedImage} 
                  alt="Post image" 
                  className="w-full rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>👍</span>
                <span>Like</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>Comment</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔄</span>
                <span>Repost</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📤</span>
                <span>Send</span>
              </div>
            </div>
          </div>

          {/* Image Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Add Image to Your Post</h3>
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
                        onClick={() => document.getElementById('linkedin-file-upload')?.click()}
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
                        id="linkedin-file-upload"
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
                                onClick={() => handleImageSelect(result.url, result)}
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
                                onClick={() => handleImageSelect(result.url, result)}
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
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => onSaveToDraft(content, "LinkedIn Post", "linkedin-post")}
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
