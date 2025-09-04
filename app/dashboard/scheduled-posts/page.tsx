"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
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
  RefreshCw,
  BarChart3,
  Loader2,
  EyeOff,
} from "lucide-react"
import { format } from "date-fns"
import { useScheduledPosts } from "@/hooks/use-scheduled-posts"
import { SchedulePostModal } from "@/components/schedule-post-modal"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export default function ScheduledPostsPage() {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showStats, setShowStats] = useState(true)

  const {
    posts,
    stats,
    loading,
    error,
    totalCount,
    hasMore,
    fetchPosts,
    fetchStats,
    deletePost,
    togglePostStatus,
    retryPost,
    loadMore,
  } = useScheduledPosts()

  const { toast } = useToast()

  // Fetch posts and stats on component mount
  useEffect(() => {
    if ((session?.user as any)?.id) {
      console.log("[v0] Fetching scheduled posts and stats for user:", (session?.user as any)?.id)
      console.log("[v0] Session user object:", session?.user)
      fetchPosts()
      fetchStats()
    }
  }, [(session?.user as any)?.id, fetchPosts, fetchStats])

  // Apply filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    const matchesPlatform = platformFilter === "all" || post.platform === platformFilter
    const matchesType = typeFilter === "all" || post.type === typeFilter
    const matchesDate = selectedDate
      ? format(new Date(post.scheduledFor), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      : true
    return matchesSearch && matchesStatus && matchesPlatform && matchesType && matchesDate
  })

  useEffect(() => {
    console.log("[v0] Total posts:", posts.length)
    console.log("[v0] Filtered posts:", filteredPosts.length)
    console.log("[v0] Selected date:", selectedDate)
    console.log("[v0] Filters:", { statusFilter, platformFilter, typeFilter, searchQuery })
  }, [posts, filteredPosts, selectedDate, statusFilter, platformFilter, typeFilter, searchQuery])

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
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
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
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const handleDeletePost = async (postId: string) => {
    const result = await deletePost(postId)
    if (result.success) {
      toast({
        title: "Deleted!",
        description: "Post deleted successfully",
      })
    }
  }

  const handleToggleStatus = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === "paused" ? "pending" : "paused"
    const result = await togglePostStatus(postId, newStatus as "paused" | "pending")
    if (result.success) {
      toast({
        title: "Updated!",
        description: `Post ${newStatus === "paused" ? "paused" : "resumed"} successfully`,
      })
    }
  }

  const handleRetryPost = async (postId: string) => {
    const result = await retryPost(postId)
    if (result.success) {
      toast({
        title: "Retrying!",
        description: "Post will be retried",
      })
    }
  }

  const handleLoadMore = () => {
    loadMore({
      status: statusFilter !== "all" ? statusFilter : undefined,
      platform: platformFilter !== "all" ? platformFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      search: searchQuery || undefined,
    })
  }

  const handleRefresh = () => {
    console.log("[v0] Refreshing posts and stats")
    fetchPosts()
    fetchStats()
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Scheduled Posts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your scheduled content and track performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading} className="w-full sm:w-auto min-h-[40px]">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowStats(!showStats)} className="w-full sm:w-auto min-h-[40px]">
            {showStats ? <EyeOff className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
            <span className="text-sm sm:text-base">{showStats ? "Hide Stats" : "Show Stats"}</span>
          </Button>

          <SchedulePostModal
            content="Write your post content here..."
            trigger={
              <Button className="gap-2 w-full sm:w-auto min-h-[40px]">
                <Plus className="h-4 w-4" />
                <span className="text-sm sm:text-base">Schedule Post</span>
              </Button>
            }
            onSuccess={() => {
              console.log("[v0] Post scheduled successfully, refreshing data")
              fetchPosts()
              fetchStats()
            }}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Posts</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Posted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.posted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Today's Posts</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-10 sm:h-9">
          <TabsTrigger value="list" className="text-xs sm:text-sm">List View</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm">Calendar View</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scheduled posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] text-sm sm:text-base">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-[150px] text-sm sm:text-base">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px] text-sm sm:text-base">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="article">Article</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="list" className="space-y-3 sm:space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
              <span className="ml-2 text-sm sm:text-base">Loading scheduled posts...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6 sm:py-8">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-red-500 mb-2" />
              <p className="text-red-500 font-medium text-sm sm:text-base">{error}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4 bg-transparent min-h-[40px]">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No scheduled posts found</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                {posts.length === 0
                  ? "You haven't scheduled any posts yet. Click the 'Schedule Post' button to get started!"
                  : "No posts match your current filters. Try adjusting your search criteria."}
              </p>
              <SchedulePostModal
                content="Write your post content here..."
                trigger={
                  <Button className="min-h-[40px]">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-sm sm:text-base">Schedule Your First Post</span>
                  </Button>
                }
                onSuccess={() => {
                  fetchPosts()
                  fetchStats()
                }}
              />
            </div>
          ) : (
            <>
              {filteredPosts.map((post) => (
                <Card key={post._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={getStatusColor(post.status)}>
                            {getStatusIcon(post.status)}
                            <span className="ml-1 capitalize text-xs">{post.status}</span>
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">
                            {post.type}
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">
                            {post.platform}
                          </Badge>
                          {post.retryCount && post.retryCount > 0 && (
                            <Badge variant="outline" className="text-orange-600 text-xs">
                              Retry {post.retryCount}/{post.maxRetries || 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Scheduled for {format(new Date(post.scheduledFor), "MMM dd, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(post._id, post.status)} className="min-h-[32px]">
                            <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        {post.status === "paused" && (
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(post._id, post.status)} className="min-h-[32px]">
                            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        {post.status === "failed" && (
                          <Button variant="ghost" size="sm" onClick={() => handleRetryPost(post._id)} className="min-h-[32px]">
                            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="min-h-[32px]">
                          <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-600 hover:text-red-700 min-h-[32px]"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3">{post.content}</p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {post.engagement && (
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-3 border-t">
                        <span>{post.engagement.likes} likes</span>
                        <span>{post.engagement.comments} comments</span>
                        <span>{post.engagement.shares} shares</span>
                      </div>
                    )}

                    {post.errorMessage && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
                        <strong>Error:</strong> {post.errorMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {hasMore && (
                <div className="text-center py-3 sm:py-4">
                  <Button onClick={handleLoadMore} variant="outline" className="min-h-[40px]">
                    Load More Posts
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Calendar</CardTitle>
                <CardDescription className="text-sm">Select a date to view scheduled posts</CardDescription>
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

            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Posts for {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Selected Date"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredPosts.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {filteredPosts.map((post) => (
                        <div
                          key={post._id}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(post.status)}
                            <span className="text-xs sm:text-sm font-medium">{format(new Date(post.scheduledFor), "h:mm a")}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm truncate">{post.content}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="capitalize text-xs">
                              {post.type}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs">
                              {post.platform}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm sm:text-base text-muted-foreground">No posts scheduled for this date</p>
                      <SchedulePostModal
                        content="Write your post content here..."
                        trigger={
                          <Button variant="outline" className="mt-3 sm:mt-4 bg-transparent min-h-[40px]">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="text-sm sm:text-base">Schedule for this date</span>
                          </Button>
                        }
                        onSuccess={() => {
                          fetchPosts()
                          fetchStats()
                        }}
                      />
                    </div>
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
