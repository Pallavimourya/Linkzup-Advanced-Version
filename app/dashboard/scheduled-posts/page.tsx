"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Calendar as CalendarLucide,
  TrendingUp,
  Users,
  Target,
  Zap,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  MoreVertical,
  Copy,
  Archive,
  Star,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react"
import { format } from "date-fns"
import { useScheduledPosts } from "@/hooks/use-scheduled-posts"
import { SchedulePostModal } from "@/components/schedule-post-modal"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { formatIstTime, formatIstDateShort } from "@/lib/ist-utils"

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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Globe className="h-3 w-3" />
      case "twitter":
        return <MessageSquare className="h-3 w-3" />
      case "facebook":
        return <Users className="h-3 w-3" />
      default:
        return <Globe className="h-3 w-3" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <MessageSquare className="h-3 w-3" />
      case "carousel":
        return <Monitor className="h-3 w-3" />
      case "image":
        return <Eye className="h-3 w-3" />
      case "article":
        return <Target className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-white via-teal-50/20 to-black/5 dark:from-black dark:via-teal-950/20 dark:to-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
        {/* Enhanced Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-secondary rounded-xl flex items-center justify-center">
                <CalendarLucide className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-black via-teal-600 to-secondary dark:from-white dark:via-teal-400 dark:to-secondary bg-clip-text text-transparent">
                  Scheduled Posts
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your scheduled content and track performance</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={handleRefresh} disabled={loading} className="gap-2 h-12 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={() => setShowStats(!showStats)} className="gap-2 h-12 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300">
                {showStats ? <EyeOff className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                {showStats ? "Hide Stats" : "Show Stats"}
              </Button>
            </motion.div>
            <SchedulePostModal
              content="Write your post content here..."
              trigger={
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="gap-2 h-12 bg-gradient-to-r from-teal-500 to-secondary hover:from-teal-600 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-4 w-4" />
                    Schedule Post
                  </Button>
                </motion.div>
              }
              onSuccess={() => {
                console.log("[v0] Post scheduled successfully, refreshing data")
                fetchPosts()
                fetchStats()
              }}
            />
          </div>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        {showStats && stats && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-100 to-secondary/20 dark:from-teal-900/50 dark:to-secondary/30 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{stats.total}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All scheduled posts</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{stats.pending}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting publication</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Posted</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{stats.posted}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Successfully published</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Posts</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-100 to-secondary/20 dark:from-teal-900/50 dark:to-secondary/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{stats.today}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scheduled for today</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        <Tabs defaultValue="list" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TabsList className="grid w-full grid-cols-2 h-12 bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg">
              <TabsTrigger value="list" className="text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-secondary data-[state=active]:text-white">
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                Calendar View
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Enhanced Search and Filters */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search scheduled posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Status" />
                  </div>
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
                <SelectTrigger className="w-full sm:w-[140px] h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm">
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
                <SelectTrigger className="w-full sm:w-[140px] h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm">
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
          </motion.div>

          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <motion.div 
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                  <p className="text-gray-600">Loading scheduled posts...</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Posts</h3>
                <p className="text-red-500 font-medium mb-4">{error}</p>
                <Button variant="outline" onClick={handleRefresh} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </motion.div>
            ) : filteredPosts.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No scheduled posts found</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {posts.length === 0
                    ? "You haven't scheduled any posts yet. Click the 'Schedule Post' button to get started!"
                    : "No posts match your current filters. Try adjusting your search criteria."}
                </p>
                <SchedulePostModal
                  content="Write your post content here..."
                  trigger={
                    <Button className="gap-2 h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-4 w-4" />
                      Schedule Your First Post
                    </Button>
                  }
                  onSuccess={() => {
                    fetchPosts()
                    fetchStats()
                  }}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <AnimatePresence>
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        <CardHeader className="pb-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 border-b border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge className={`${getStatusColor(post.status)} border-0 shadow-sm`}>
                                  {getStatusIcon(post.status)}
                                  <span className="ml-1 capitalize text-xs font-medium">{post.status}</span>
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {getTypeIcon(post.type)}
                                  <span className="ml-1 capitalize">{post.type}</span>
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  {getPlatformIcon(post.platform)}
                                  <span className="ml-1 capitalize">{post.platform}</span>
                                </Badge>
                                {post.retryCount && post.retryCount > 0 && (
                                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                    Retry {post.retryCount}/{post.maxRetries || 3}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Scheduled for {formatIstDateShort(post.scheduledFor)} at {formatIstTime(post.scheduledFor)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {post.status === "pending" && (
                                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(post._id, post.status)} className="h-8 w-8 p-0 hover:bg-yellow-50">
                                  <Pause className="h-4 w-4 text-yellow-600" />
                                </Button>
                              )}
                              {post.status === "paused" && (
                                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(post._id, post.status)} className="h-8 w-8 p-0 hover:bg-green-50">
                                  <Play className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {post.status === "failed" && (
                                <Button variant="ghost" size="sm" onClick={() => handleRetryPost(post._id)} className="h-8 w-8 p-0 hover:bg-blue-50">
                                  <RefreshCw className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post._id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-sm leading-relaxed mb-4 line-clamp-3 text-gray-700">{post.content}</p>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {post.engagement && (
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.engagement.likes} likes
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {post.engagement.comments} comments
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-3 w-3" />
                                {post.engagement.shares} shares
                              </span>
                            </div>
                          )}

                          {post.errorMessage && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                              <strong>Error:</strong> {post.errorMessage}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {hasMore && (
                  <motion.div 
                    className="text-center py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Button onClick={handleLoadMore} variant="outline" className="gap-2 h-12 border-gray-200 hover:bg-gray-50">
                      Load More Posts
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50/50 to-blue-50/50 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <CalendarLucide className="w-4 h-4 text-white" />
                    </div>
                    Calendar
                  </CardTitle>
                  <CardDescription>Select a date to view scheduled posts</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-xl border-0"
                  />
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50/50 to-blue-50/50 border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      Posts for {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Selected Date"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {filteredPosts.length > 0 ? (
                      <div className="space-y-3">
                        {filteredPosts.map((post, index) => (
                          <motion.div
                            key={post._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(post.status)}
                              <span className="text-sm font-medium text-gray-900">{formatIstTime(post.scheduledFor)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate">{post.content}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {getTypeIcon(post.type)}
                                <span className="ml-1 capitalize">{post.type}</span>
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {getPlatformIcon(post.platform)}
                                <span className="ml-1 capitalize">{post.platform}</span>
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CalendarIcon className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts scheduled for this date</h3>
                        <p className="text-gray-600 mb-4">Schedule a post for this date to get started</p>
                        <SchedulePostModal
                          content="Write your post content here..."
                          trigger={
                            <Button variant="outline" className="gap-2 border-gray-200 hover:bg-gray-50">
                              <Plus className="h-4 w-4" />
                              Schedule for this date
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
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}