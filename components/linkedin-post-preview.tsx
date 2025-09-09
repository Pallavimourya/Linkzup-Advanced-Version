"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Calendar, MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react"

interface LinkedInPostPreviewProps {
  content: string
  tone: string
  wordCount: number
  onClick: () => void
  className?: string
}

export function LinkedInPostPreview({ 
  content, 
  tone, 
  wordCount, 
  onClick, 
  className = "" 
}: LinkedInPostPreviewProps) {
  const { data: session } = useSession()
  // Truncate content for preview
  const previewContent = content.length > 150 ? content.substring(0, 150) + "..." : content

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20 bg-white ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* LinkedIn-style header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-10 h-10">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {session?.user?.name?.charAt(0) || "👤"}
                </span>
              </div>
            )}
            {/* LinkedIn verification badge */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">in</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-gray-900">
              {session?.user?.name || "Your Name"}
            </div>
            <div className="text-xs text-muted-foreground">
              {session?.user?.email?.split('@')[0] || "Professional"} • Now • 🌍
            </div>
          </div>
        </div>

        {/* Content preview */}
        <div className="mb-3">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {previewContent}
          </p>
        </div>

        {/* Engagement preview */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs">👍</span>
              </div>
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs">👏</span>
              </div>
              <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs">❤️</span>
              </div>
            </div>
            <span className="ml-2 font-medium">John Doe and 68 others</span>
          </div>
          <span className="font-medium">4 comments</span>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">{tone}</Badge>
            <Badge variant="outline" className="text-xs">{wordCount} words</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
