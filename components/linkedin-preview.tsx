"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Image, 
  Search, 
  Sparkles, 
  Upload,
  Save,
  X
} from "lucide-react"

interface LinkedInPreviewProps {
  content: string
  onSaveToDraft: (content: string, title: string, format: string) => void
  onClose: () => void
}

export function LinkedInPreview({ content, onSaveToDraft, onClose }: LinkedInPreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<"ai-carousel" | "search" | "ai-generate" | "upload" | null>(null)

  const handleImageSelect = (source: "ai-carousel" | "search" | "ai-generate" | "upload") => {
    setImageSource(source)
    // Here you would implement the actual image selection logic
    // For now, we'll just set a placeholder
    setSelectedImage("https://via.placeholder.com/600x400/0077b5/ffffff?text=LinkedIn+Post+Image")
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
            <h3 className="font-medium">Add Image to Your Post</h3>
            <Tabs defaultValue="ai-carousel" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ai-carousel" onClick={() => handleImageSelect("ai-carousel")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Carousel
                </TabsTrigger>
                <TabsTrigger value="search" onClick={() => handleImageSelect("search")}>
                  <Search className="w-4 h-4 mr-2" />
                  Search Images
                </TabsTrigger>
                <TabsTrigger value="ai-generate" onClick={() => handleImageSelect("ai-generate")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </TabsTrigger>
                <TabsTrigger value="upload" onClick={() => handleImageSelect("upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai-carousel" className="mt-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a carousel of images using AI based on your content.
                  </p>
                  <Button onClick={() => handleImageSelect("ai-carousel")}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Carousel
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="mt-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Search for relevant images from our image library.
                  </p>
                  <Button onClick={() => handleImageSelect("search")}>
                    <Search className="w-4 h-4 mr-2" />
                    Search Images
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="ai-generate" className="mt-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a custom image using AI based on your content.
                  </p>
                  <Button onClick={() => handleImageSelect("ai-generate")}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Image
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="mt-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an image from your device.
                  </p>
                  <Button onClick={() => handleImageSelect("upload")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
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
