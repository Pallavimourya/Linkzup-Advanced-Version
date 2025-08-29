"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Settings } from "lucide-react"

export interface PersonalStoryCustomization {
  tone: string
  language: string
  targetAudience: string
  mainGoal: string
}

interface PersonalStoryCustomizationPanelProps {
  customization: PersonalStoryCustomization
  onCustomizationChange: (customization: PersonalStoryCustomization) => void
}

export function PersonalStoryCustomizationPanel({
  customization,
  onCustomizationChange,
}: PersonalStoryCustomizationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (field: keyof PersonalStoryCustomization, value: string) => {
    onCustomizationChange({
      ...customization,
      [field]: value,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Story Customization</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Customize how your personal story will be generated
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={customization.tone} onValueChange={(value) => handleChange("tone", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="humble">Humble</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={customization.language} onValueChange={(value) => handleChange("language", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={customization.targetAudience} onValueChange={(value) => handleChange("targetAudience", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LinkedIn professionals">LinkedIn Professionals</SelectItem>
                <SelectItem value="industry peers">Industry Peers</SelectItem>
                <SelectItem value="potential employers">Potential Employers</SelectItem>
                <SelectItem value="mentors and leaders">Mentors & Leaders</SelectItem>
                <SelectItem value="general audience">General Audience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Main Goal</Label>
            <Select value={customization.mainGoal} onValueChange={(value) => handleChange("mainGoal", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="inspiration">Inspiration</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="thought leadership">Thought Leadership</SelectItem>
                <SelectItem value="personal branding">Personal Branding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Word Count:</strong> Fixed at 500 words for optimal story length
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
