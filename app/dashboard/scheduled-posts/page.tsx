"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarIcon,
  Clock,
  Edit3,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
} from "lucide-react"
import { format } from "date-fns"

interface ScheduledPost {
  id: string
  content: string
  scheduledFor: Date
  status: "pending" | "posted" | "failed" | "paused"
  platform: "linkedin" | "twitter" | "facebook"
  type: "text" | "carousel" | "image"
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
  createdAt: Date
  lastModified: Date
}

const mockScheduledPosts: ScheduledPost[] = [
  {
    id: "1",
    content:
      "Excited to share my thoughts on the future of AI in marketing. Here are 5 key trends every marketer should watch...",
    scheduledFor: new Date(2024, 11, 28, 9, 0),
    status: "pending",
    platform: "linkedin",
    type: "text",
    createdAt: new Date(2024, 11, 25),
    lastModified: new Date(2024, 11, 25),
  },
  {
    id: "2",
    content:
      "Just finished an amazing workshop on leadership. Key takeaway: vulnerability is a superpower, not a weakness.",
    scheduledFor: new Date(2024, 11, 27, 14, 30),
    status: "posted",
    platform: "linkedin",
    type: "text",
    engagement: {
      likes: 234,
      comments: 45,
      shares: 67,
    },
    createdAt: new Date(2024, 11, 20),
    lastModified: new Date(2024, 11, 20),
  },
  {
    id: "3",
    content:
      "New carousel post about productivity tips for remote workers. Swipe to see all 7 game-changing strategies!",
    scheduledFor: new Date(2024, 11, 29, 11, 15),
    status: "pending",
    platform: "linkedin",
    type: "carousel",
    createdAt: new Date(2024, 11, 26),
    lastModified: new Date(2024, 11, 26),
  },
  {
    id: "4",
    content:
      "Sharing my journey from junior developer to tech lead. The mistakes I made and lessons I learned along the way.",
    scheduledFor: new Date(2024, 11, 26, 16, 0),
    status: "failed",
    platform: "linkedin",
    type: "text",
    createdAt: new Date(2024, 11, 24),
    lastModified: new Date(2024, 11, 24),
  },
]

export default function ScheduledPostsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [posts, setPosts] = useState(mockScheduledPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "posted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "paused":
        return <Pause className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "posted":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "paused":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    const matchesDate = selectedDate
      ? format(post.scheduledFor, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      : true
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  const handleToggleStatus = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, status: post.status === "paused" ? "pending" : ("paused" as const) } : post,
      ),
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Posts</h1>
          <p className="text-muted-foreground">Manage your scheduled content and track performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Post</DialogTitle>
              <DialogDescription>Create and schedule a new post for your LinkedIn profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Post Content</Label>
                <Textarea id="content" placeholder="What would you like to share?" className="min-h-[120px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Schedule Date</Label>
                  <Input type="date" id="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Schedule Time</Label>
                  <Input type="time" id="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select defaultValue="linkedin">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save as Draft</Button>
                <Button>Schedule Post</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scheduled posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="list" className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1 capitalize">{post.status}</span>
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {post.type}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {post.platform}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Scheduled for {format(post.scheduledFor, "MMM dd, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(post.id)}
                      disabled={post.status === "posted"}
                    >
                      {post.status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingPost(post)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-4">{post.content}</p>

                {post.engagement && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                    <span>{post.engagement.likes} likes</span>
                    <span>{post.engagement.comments} comments</span>
                    <span>{post.engagement.shares} shares</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Calendar</CardTitle>
                <CardDescription>Select a date to view scheduled posts</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Posts for {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Selected Date"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredPosts.length > 0 ? (
                    <div className="space-y-3">
                      {filteredPosts.map((post) => (
                        <div key={post.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(post.status)}
                            <span className="text-sm font-medium">{format(post.scheduledFor, "h:mm a")}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm truncate">{post.content}</p>
                          </div>
                          <Badge variant="outline" className="capitalize text-xs">
                            {post.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No posts scheduled for this date</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
