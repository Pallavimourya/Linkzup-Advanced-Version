"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarIcon, ImageIcon, Loader2, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { formatIstDate } from "@/lib/ist-utils"
import { useScheduledPosts } from "@/hooks/use-scheduled-posts"
import { useToast } from "@/hooks/use-toast"

interface SchedulePostModalProps {
  content: string
  images?: string[]
  trigger?: React.ReactNode
  onSuccess?: () => void
  defaultPlatform?: "linkedin" | "twitter" | "facebook"
  defaultType?: "text" | "carousel" | "image" | "article"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SchedulePostModal({
  content,
  images = [],
  trigger,
  onSuccess,
  defaultPlatform = "linkedin",
  defaultType = "text",
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: SchedulePostModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const now = new Date()
    return format(new Date(now.getTime() + 60 * 60 * 1000), "HH:mm")
  })
  // Force LinkedIn as the only platform for this product
  const platform: "linkedin" = "linkedin"
  const [type, setType] = useState<"text" | "carousel" | "image" | "article">(defaultType)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)
  const [customContent, setCustomContent] = useState("")

  const { schedulePost } = useScheduledPosts()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      setSelectedDate(new Date())
      setSelectedTime(format(oneHourLater, "HH:mm"))
      // Don't set default tags for carousel
      setTags([])
      setNewTag("")
      setCustomContent("")
    }
  }, [open, type, content])

  const getScheduledDateTime = (): Date | null => {
    if (!selectedDate || !selectedTime) return null
    const [hours, minutes] = selectedTime.split(":").map(Number)
    
    // Create date in local timezone (which is IST)
    const scheduledDateTime = new Date(selectedDate)
    scheduledDateTime.setHours(hours, minutes, 0, 0)
    
    // Since we're already in IST timezone, we don't need to convert
    // The time is already in the correct timezone
    return scheduledDateTime
  }

  const handleSchedule = async () => {
    const scheduledDateTime = getScheduledDateTime()
    if (!scheduledDateTime) {
      toast({
        title: "Schedule Date Required",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }
    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Invalid Time",
        description: "Pick a future date and time",
        variant: "destructive",
      })
      return
    }

    setIsScheduling(true)
    try {
      const result = await schedulePost({
        content: customContent || content,
        images,
        scheduledFor: scheduledDateTime,
        platform,
        type,
        tags,
      })
      if (result.success) {
        toast({
          title: "Post Scheduled!",
          description: `Will publish on ${scheduledDateTime.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}`,
        })
        setOpen(false)
        onSuccess?.()
      }
    } finally {
      setIsScheduling(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      {/* Responsive modal with improved scrolling */}
      <DialogContent className="max-w-7xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 touch-pan-y">
        <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="truncate">Schedule Post</span>
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="uppercase tracking-wide text-xs hidden xs:inline-flex">{platform}</Badge>
                <Badge variant="outline" className="uppercase tracking-wide text-xs">{type}</Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Main Grid Layout - Responsive with better mobile handling */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] flex-1 min-h-0 overflow-hidden">
            {/* LEFT: Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent touch-pan-y overscroll-contain">
              <div className="space-y-4 max-w-3xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">Preview</Badge>
                  {selectedDate && selectedTime ? (
                    <span className="text-xs text-muted-foreground">{new Date(new Date(selectedDate).setHours(Number(selectedTime.split(":")[0]), Number(selectedTime.split(":")[1]), 0, 0)).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  ) : null}
                </div>

                {/* Social-like Card Preview */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">Your Page</div>
                        <div className="text-xs text-muted-foreground capitalize">{platform} • {type}</div>
                      </div>
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-6 break-words">
                      {customContent || content || (type === 'carousel' ? '' : 'Your content will appear here...')}
                    </div>
                  </div>
                  {images.length > 0 && (
                    <div className={`grid gap-1 p-1 ${type === 'carousel' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                      {images.map((image, i) => (
                        <div key={i} className="aspect-video bg-muted/50 border flex items-center justify-center overflow-hidden rounded-sm">
                          {image ? (
                            <img 
                              src={image} 
                              alt={`Slide ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div className="px-3 sm:px-4 py-2 border-t">
                      <div className="flex flex-wrap gap-1">
                        {tags.map(tag => (
                          <span key={tag} className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="px-3 sm:px-4 py-3 border-t flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 min-w-0">
                      <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick date"}</span>
                    </div>
                    <span className="flex-shrink-0">•</span>
                    <span className="flex-shrink-0">{selectedTime || "Set time"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Config */}
            <div className="flex flex-col min-h-0">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent touch-pan-y overscroll-contain">
                {/* Type (Platform is fixed to LinkedIn) */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Post Configuration</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Platform selector removed since only LinkedIn is supported */}
                    <div className="rounded-lg border bg-background p-3">
                      <div className="text-xs text-muted-foreground px-1 pb-2">Post type</div>
                      <Select value={type} onValueChange={(v) => setType(v as any)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Custom Content for Carousel */}
                {type === 'carousel' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Post Content (Optional)</Label>
                    <Textarea
                      placeholder="Add your custom text for the carousel post..."
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      rows={3}
                      className="resize-none border border-gray-300 dark:border-gray-600 min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to post only images without any text.
                    </p>
                  </div>
                )}

                {/* Date & Time */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Schedule</Label>
                  <div className="grid grid-cols-1 gap-3 [&>*]:min-w-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick date"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0 w-auto">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(d) => d < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input 
                      className="w-full" 
                      type="time" 
                      value={selectedTime} 
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        const now = new Date()
                        const plus1h = new Date(now.getTime() + 60 * 60 * 1000)
                        setSelectedDate(new Date())
                        setSelectedTime(format(plus1h, "HH:mm"))
                      }}
                      className="text-xs min-h-[36px] touch-manipulation"
                    >
                      +1H
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        const t = new Date()
                        t.setDate(t.getDate() + 1)
                        t.setHours(9, 0, 0, 0)
                        setSelectedDate(t)
                        setSelectedTime("09:00")
                      }}
                      className="text-xs min-h-[36px] touch-manipulation"
                    >
                      Tomorrow 9AM
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag (press Enter)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      className="flex-1 min-w-0"
                    />
                    <Button variant="outline" onClick={addTag} className="flex-shrink-0 min-h-[36px] touch-manipulation">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No tags added yet</span>
                    ) : null}
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="cursor-pointer text-xs min-h-[28px] touch-manipulation" onClick={() => removeTag(t)}>
                        {t} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simple Actions */}
              <div className="border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 bg-background flex-shrink-0">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="px-4 sm:px-6 py-2 order-2 sm:order-1 min-h-[44px] touch-manipulation"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime || isScheduling}
                  className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2 min-h-[44px] touch-manipulation"
                >
                  {isScheduling ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Scheduling...</span>
                      <span className="sm:hidden">Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Schedule Post</span>
                      <span className="sm:hidden">Schedule</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

