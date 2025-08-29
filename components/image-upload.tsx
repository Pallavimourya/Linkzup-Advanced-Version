"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ImageIcon, Sparkles, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void
  type?: "post" | "carousel" | "ai-generated"
  className?: string
}

export function ImageUpload({ onImageSelect, type = "post", className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("type", type)

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        onImageSelect(imageUrl)
        toast({
          title: "Image Uploaded",
          description: "Your image has been successfully uploaded.",
        })
      } else {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/images/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        onImageSelect(imageUrl)
        toast({
          title: "Image Generated",
          description: "Your AI image has been successfully generated.",
        })
        setAiPrompt("")
      } else {
        throw new Error("Failed to generate image")
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Upload Image</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Drag and drop an image here, or click to browse</p>
              <Button
                variant="outline"
                onClick={() => document.getElementById(`file-upload-${type}`)?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
              <input
                id={`file-upload-${type}`}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Generation */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">AI Image Generation</Label>
            <div className="space-y-3">
              <Input
                placeholder="Describe the image you want to generate..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button onClick={handleAiGenerate} disabled={isGenerating || !aiPrompt.trim()} className="w-full">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Images Search */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Search Stock Images</Label>
            <div className="space-y-3">
              <Input placeholder="Search for stock images..." />
              <Button variant="outline" className="w-full bg-transparent">
                <Search className="w-4 h-4 mr-2" />
                Search Images
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Search through millions of high-quality stock images</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
