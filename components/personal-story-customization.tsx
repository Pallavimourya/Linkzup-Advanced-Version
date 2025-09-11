"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, ChevronUp, Settings, Palette, Users, Target, 
  MessageSquare, Sparkles, Zap, Heart, TrendingUp, BookOpen,
  Globe, Award, Lightbulb, Star, Crown, Shield
} from "lucide-react"

export interface PersonalStoryCustomization {
  tone: string
  language: string
  targetAudience: string
  mainGoal: string
  storyLength: string
  emotionalTone: string
  includeCallToAction: boolean
  includeHashtags: boolean
  includeEmojis: boolean
  personalTouch: boolean
}

interface PersonalStoryCustomizationPanelProps {
  customization: PersonalStoryCustomization
  onCustomizationChange: (customization: PersonalStoryCustomization) => void
}

export function PersonalStoryCustomizationPanel({
  customization,
  onCustomizationChange,
}: PersonalStoryCustomizationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState("basic")

  const handleChange = (field: keyof PersonalStoryCustomization, value: string | boolean) => {
    onCustomizationChange({
      ...customization,
      [field]: value,
    })
  }

  // Simplified tone options
  const toneOptions = [
    { value: "professional", label: "Professional", icon: Shield, color: "from-blue-500 to-cyan-500" },
    { value: "casual", label: "Casual", icon: Heart, color: "from-pink-500 to-rose-500" },
    { value: "inspirational", label: "Inspirational", icon: Sparkles, color: "from-purple-500 to-indigo-500" },
    { value: "conversational", label: "Conversational", icon: MessageSquare, color: "from-green-500 to-emerald-500" }
  ]

  // Simplified audience options
  const audienceOptions = [
    { value: "LinkedIn professionals", label: "LinkedIn Pros", icon: Users },
    { value: "industry peers", label: "Industry Peers", icon: Target },
    { value: "potential employers", label: "Employers", icon: Award },
    { value: "general audience", label: "General", icon: Globe }
  ]

  // Simplified goal options
  const goalOptions = [
    { value: "engagement", label: "Engagement", icon: Heart },
    { value: "inspiration", label: "Inspiration", icon: Lightbulb },
    { value: "networking", label: "Networking", icon: Users },
    { value: "personal branding", label: "Branding", icon: Star }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Story Settings
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Customize your story style
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 hover:bg-purple-100 rounded-lg"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4 text-purple-600" />
              </motion.div>
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-6 space-y-6">
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant={activeTab === "basic" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("basic")}
                    className={`flex-1 h-8 text-xs ${
                      activeTab === "basic" 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Basic
                  </Button>
                  <Button
                    variant={activeTab === "advanced" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("advanced")}
                    className={`flex-1 h-8 text-xs ${
                      activeTab === "advanced" 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Advanced
                  </Button>
                </div>

                {/* Basic Settings */}
                {activeTab === "basic" && (
                  <div className="space-y-5">
                    {/* Tone Selection - MCQ Style */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-600" />
                        What tone best describes your story?
                      </Label>
                      <div className="space-y-2">
                        {toneOptions.map((tone, index) => (
                          <motion.div
                            key={tone.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="cursor-pointer"
                            onClick={() => handleChange("tone", tone.value)}
                          >
                            <div className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                              customization.tone === tone.value
                                ? `border-purple-500 bg-gradient-to-r ${tone.color} text-white shadow-md`
                                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            }`}>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                customization.tone === tone.value
                                  ? "border-white bg-white"
                                  : "border-gray-300"
                              }`}>
                                {customization.tone === tone.value && (
                                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                )}
                              </div>
                              <tone.icon className={`w-5 h-5 ${customization.tone === tone.value ? 'text-white' : 'text-gray-600'}`} />
                              <span className={`font-medium ${customization.tone === tone.value ? 'text-white' : 'text-gray-900'}`}>
                                {tone.label}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Audience & Goal - Simple Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          Target Audience
                        </Label>
                        <Select value={customization.targetAudience} onValueChange={(value) => handleChange("targetAudience", value)}>
                          <SelectTrigger className="h-9 border border-gray-200 focus:border-purple-500 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {audienceOptions.map((audience) => (
                              <SelectItem key={audience.value} value={audience.value}>
                                <div className="flex items-center gap-2">
                                  <audience.icon className="w-4 h-4" />
                                  <span>{audience.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-600" />
                          Main Goal
                        </Label>
                        <Select value={customization.mainGoal} onValueChange={(value) => handleChange("mainGoal", value)}>
                          <SelectTrigger className="h-9 border border-gray-200 focus:border-purple-500 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {goalOptions.map((goal) => (
                              <SelectItem key={goal.value} value={goal.value}>
                                <div className="flex items-center gap-2">
                                  <goal.icon className="w-4 h-4" />
                                  <span>{goal.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Language - Simple Dropdown */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        Language
                      </Label>
                      <Select value={customization.language} onValueChange={(value) => handleChange("language", value)}>
                        <SelectTrigger className="h-9 border border-gray-200 focus:border-purple-500 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {activeTab === "advanced" && (
                  <div className="space-y-5">
                    {/* Story Length - MCQ Style */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        How long should your story be?
                      </Label>
                      <div className="space-y-2">
                        {[
                          { value: "short", label: "Short Story", description: "300-400 words", icon: "📝", color: "from-green-500 to-emerald-500" },
                          { value: "medium", label: "Medium Story", description: "500-600 words", icon: "📄", color: "from-blue-500 to-cyan-500" },
                          { value: "long", label: "Long Story", description: "700-800 words", icon: "📚", color: "from-purple-500 to-indigo-500" }
                        ].map((length) => (
                          <motion.div
                            key={length.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="cursor-pointer"
                            onClick={() => handleChange("storyLength", length.value)}
                          >
                            <div className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                              (customization.storyLength || "medium") === length.value
                                ? `border-purple-500 bg-gradient-to-r ${length.color} text-white shadow-md`
                                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            }`}>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                (customization.storyLength || "medium") === length.value
                                  ? "border-white bg-white"
                                  : "border-gray-300"
                              }`}>
                                {(customization.storyLength || "medium") === length.value && (
                                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                )}
                              </div>
                              <span className="text-lg">{length.icon}</span>
                              <div className="flex-1">
                                <div className={`font-medium ${(customization.storyLength || "medium") === length.value ? 'text-white' : 'text-gray-900'}`}>
                                  {length.label}
                                </div>
                                <div className={`text-xs ${(customization.storyLength || "medium") === length.value ? 'text-white/80' : 'text-gray-500'}`}>
                                  {length.description}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Content Features - Simple Toggles */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        Content Features
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "includeCallToAction", label: "Call to Action", icon: Target },
                          { key: "includeHashtags", label: "Hashtags", icon: MessageSquare },
                          { key: "includeEmojis", label: "Emojis", icon: Sparkles },
                          { key: "personalTouch", label: "Personal Touch", icon: Heart }
                        ].map((feature) => (
                          <div key={feature.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <feature.icon className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                            </div>
                            <Button
                              variant={customization[feature.key as keyof PersonalStoryCustomization] ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleChange(feature.key as keyof PersonalStoryCustomization, !customization[feature.key as keyof PersonalStoryCustomization])}
                              className={`w-10 h-5 p-0 rounded-full ${
                                customization[feature.key as keyof PersonalStoryCustomization]
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                customization[feature.key as keyof PersonalStoryCustomization] ? "translate-x-2.5" : "translate-x-0"
                              }`} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Summary */}
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Current Style</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      {toneOptions.find(t => t.value === customization.tone)?.label}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700 text-xs">
                      {audienceOptions.find(a => a.value === customization.targetAudience)?.label}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700 text-xs">
                      {goalOptions.find(g => g.value === customization.mainGoal)?.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
