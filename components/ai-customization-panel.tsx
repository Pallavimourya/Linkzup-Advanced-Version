"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Palette, 
  Target, 
  Users, 
  Hash, 
  Smile, 
  MousePointer,
  Sparkles,
  Zap,
  Brain,
  MessageSquare
} from "lucide-react"

export interface CustomizationOptions {
  tone?: "professional" | "casual" | "friendly" | "authoritative" | "conversational" | "inspirational"
  language?: string
  wordCount?: number
  targetAudience?: string
  mainGoal?: "engagement" | "awareness" | "conversion" | "education" | "entertainment"
  format?: string
  niche?: string
  includeHashtags?: boolean
  includeEmojis?: boolean
  callToAction?: boolean
  temperature?: number
  maxTokens?: number
  humanLike?: boolean
  ambiguity?: number
  randomness?: number
  personalTouch?: boolean
  storytelling?: boolean
  emotionalDepth?: number
  conversationalStyle?: boolean
}

interface AICustomizationPanelProps {
  customization: CustomizationOptions
  onCustomizationChange: (customization: CustomizationOptions) => void
  provider?: "openai" | "perplexity"
  onProviderChange?: (provider: "openai" | "perplexity") => void
  contentType?: string
  onContentTypeChange?: (type: string) => void
  onSavePreset?: (name: string, customization: CustomizationOptions) => void
  savedPresets?: Array<{ name: string; customization: CustomizationOptions }>
  onLoadPreset?: (customization: CustomizationOptions) => void
  showAdvanced?: boolean
  onToggleAdvanced?: () => void
}

export function AICustomizationPanel({
  customization,
  onCustomizationChange,
  provider = "openai",
  onProviderChange,
  contentType,
  onContentTypeChange,
  onSavePreset,
  savedPresets = [],
  onLoadPreset,
  showAdvanced = false,
  onToggleAdvanced
}: AICustomizationPanelProps) {
  const [presetName, setPresetName] = useState("")

  const updateCustomization = (updates: Partial<CustomizationOptions>) => {
    onCustomizationChange({ ...customization, ...updates })
  }

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), customization)
      setPresetName("")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          AI Customization
        </CardTitle>
        <CardDescription>
          Fine-tune your content generation settings for the perfect output
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        {onProviderChange && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">AI Provider</Label>
            <Select value={provider} onValueChange={onProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    OpenAI GPT-4 (High Quality)
                  </div>
                </SelectItem>
                <SelectItem value="perplexity">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Perplexity AI (Fast & Cost-effective)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content Type Selection */}
        {onContentTypeChange && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Content Type</Label>
            <Select value={contentType} onValueChange={onContentTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin-post">LinkedIn Posts</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="story">Personal Story</SelectItem>
                <SelectItem value="list">List Content</SelectItem>
                <SelectItem value="quote">Quote Post</SelectItem>
                <SelectItem value="before-after">Before/After</SelectItem>
                <SelectItem value="tips">Tips & Advice</SelectItem>
                <SelectItem value="insights">Insights</SelectItem>
                <SelectItem value="question">Question Post</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Basic Settings
          </h3>

          {/* Tone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tone</Label>
            <Select 
              value={customization.tone} 
              onValueChange={(value) => updateCustomization({ tone: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
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

          {/* Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Language</Label>
            <Select 
              value={customization.language} 
              onValueChange={(value) => updateCustomization({ language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="portuguese">Portuguese</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="korean">Korean</SelectItem>
                <SelectItem value="arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Word Count */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Word Count</Label>
            <Select 
              value={customization.wordCount?.toString()} 
              onValueChange={(value) => updateCustomization({ wordCount: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">Short (50 words)</SelectItem>
                <SelectItem value="100">Medium (100 words)</SelectItem>
                <SelectItem value="150">Standard (150 words)</SelectItem>
                <SelectItem value="200">Long (200 words)</SelectItem>
                <SelectItem value="300">Extended (300 words)</SelectItem>
                <SelectItem value="500">Article (500 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Audience</Label>
            <Input
              placeholder="e.g., Software developers, Marketing professionals..."
              value={customization.targetAudience || ""}
              onChange={(e) => updateCustomization({ targetAudience: e.target.value })}
            />
          </div>

          {/* Main Goal */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Main Goal</Label>
            <Select 
              value={customization.mainGoal} 
              onValueChange={(value) => updateCustomization({ mainGoal: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select main goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Drive Engagement</SelectItem>
                <SelectItem value="awareness">Build Awareness</SelectItem>
                <SelectItem value="conversion">Generate Leads</SelectItem>
                <SelectItem value="education">Educate Audience</SelectItem>
                <SelectItem value="entertainment">Entertain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>



        {/* Presets */}
        {onSavePreset && savedPresets.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Saved Presets</h3>
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((preset, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => onLoadPreset?.(preset.customization)}
                  >
                    {preset.name}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
