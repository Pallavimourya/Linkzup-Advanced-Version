"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Upload, Search, Sparkles, Image as ImageIcon, X, Download, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ImageManagerProps {
  onImageSelect: (imageUrl: string, imageData?: any) => void
  trigger?: React.ReactNode
  className?: string
}

interface SearchResult {
  id: string
  url: string
  thumbnail: string
  title?: string
  author?: string
  source: 'unsplash' | 'pexels' | 'pixabay' | 'serp'
}

interface AIGenerationResult {
  id: string
  url: string
  prompt: string
  timestamp: Date
}

export function ImageManager({ onImageSelect, trigger, className }: ImageManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedSource, setSelectedSource] = useState("unsplash")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResults, setAiResults] = useState<AIGenerationResult[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const imageSources = [
    { value: "unsplash", label: "Unsplash", apiKey: process.env.NEXT_PUBLIC_UNSPLASH_API_KEY },
    { value: "pexels", label: "Pexels", apiKey: process.env.NEXT_PUBLIC_PEXELS_API_KEY },
    { value: "pixabay", label: "Pixabay", apiKey: process.env.NEXT_PUBLIC_PIXABAY_API_KEY },
    { value: "serp", label: "Google Images", apiKey: process.env.NEXT_PUBLIC_SERP_API },
  ]

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
        const newResult: AIGenerationResult = {
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

  const handleImageSelect = (imageUrl: string, imageData?: any) => {
    onImageSelect(imageUrl, imageData)
    setIsOpen(false)
  }

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL copied",
      description: "Image URL copied to clipboard",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                 <DialogHeader>
           <DialogTitle>Image Manager</DialogTitle>
           <DialogDescription>
             Upload your own image, search from stock photo libraries, or generate AI images for your carousel background.
           </DialogDescription>
         </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop images here or click to browse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
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
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
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
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyImageUrl(url)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
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
              <CardHeader>
                <CardTitle>Search Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
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
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyImageUrl(result.url)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
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
              <CardHeader>
                <CardTitle>AI Image Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div className="space-y-2">
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
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyImageUrl(result.url)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
