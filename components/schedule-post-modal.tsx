"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
}

export function SchedulePostModal({
  content,
  images = [],
  trigger,
  onSuccess,
  defaultPlatform = "linkedin",
  defaultType = "text",
}: SchedulePostModalProps) {
  const [open, setOpen] = useState(false)
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

  const { schedulePost } = useScheduledPosts()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      setSelectedDate(new Date())
      setSelectedTime(format(oneHourLater, "HH:mm"))
      setTags([])
      setNewTag("")
    }
  }, [open])

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
        content,
        images,
        scheduledFor: scheduledDateTime,
        platform,
        type,
        tags,
      })
      if (result.success) {
        toast({
          title: "Post Scheduled!",
          description: `Will publish on ${formatIstDate(scheduledDateTime)}`,
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
        {trigger || (
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Schedule Post
          </Button>
        )}
      </DialogTrigger>

      {/* 🔥 Wider canvas (more width, same height cap) */}
      <DialogContent className="max-w-7xl w-[96vw] max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-5 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Schedule Post
                </DialogTitle>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="secondary" className="uppercase tracking-wide">{platform}</Badge>
                <Badge variant="outline" className="uppercase tracking-wide">{type}</Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Main Grid Layout (give preview more room) */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] flex-1 min-h-0">
            {/* LEFT: Preview */}
            <div className="p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r">
              <div className="space-y-4 max-w-3xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">Preview</Badge>
                  {selectedDate && selectedTime ? (
                    <span className="text-xs text-muted-foreground">{formatIstDate(new Date(new Date(selectedDate).setHours(Number(selectedTime.split(":")[0]), Number(selectedTime.split(":")[1]), 0, 0)))}</span>
                  ) : null}
                </div>

                {/* Social-like Card Preview */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted border" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Your Page</div>
                        <div className="text-xs text-muted-foreground capitalize">{platform} • {type}</div>
                      </div>
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-6">
                      {content}
                    </div>
                  </div>
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
                      {images.map((_, i) => (
                        <div key={i} className="aspect-video bg-muted/50 border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick date"}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedTime || "Set time"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Config */}
            <div className="flex flex-col min-h-0">
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Type (Platform is fixed to LinkedIn) */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Post Configuration</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Platform selector removed since only LinkedIn is supported */}
                    <div className="rounded-lg border bg-background p-2">
                      <div className="text-xs text-muted-foreground px-1 pb-1">Post type</div>
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

                {/* Date & Time */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Schedule</Label>
                  <div className="grid grid-cols-1 gap-3 [&>*]:min-w-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(d) => d < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input className="w-full" type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      const now = new Date()
                      const plus1h = new Date(now.getTime() + 60 * 60 * 1000)
                      setSelectedDate(new Date())
                      setSelectedTime(format(plus1h, "HH:mm"))
                    }}>+1H</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const t = new Date()
                      t.setDate(t.getDate() + 1)
                      t.setHours(9, 0, 0, 0)
                      setSelectedDate(t)
                      setSelectedTime("09:00")
                    }}>Tomorrow 9AM</Button>
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
                    />
                    <Button variant="outline" onClick={addTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No tags added yet</span>
                    ) : null}
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => removeTag(t)}>
                        {t} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simple Actions */}
              <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime || isScheduling}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isScheduling ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Schedule Post
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
