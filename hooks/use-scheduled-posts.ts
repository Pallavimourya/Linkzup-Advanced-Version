import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

export interface ScheduledPost {
  _id: string
  userId: string
  userEmail: string
  content: string
  images?: string[]
  scheduledFor: string
  status: "pending" | "posted" | "failed" | "paused" | "cancelled"
  platform: "linkedin" | "twitter" | "facebook"
  type: "text" | "carousel" | "image" | "article"
  createdAt: string
  updatedAt: string
  postedAt?: string
  failedAt?: string
  errorMessage?: string
  linkedInPostId?: string
  cronJobId?: string
  retryCount?: number
  maxRetries?: number
  tags?: string[]
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
}

export interface ScheduledPostsStats {
  total: number
  pending: number
  posted: number
  today: number
  statusBreakdown: Array<{ _id: string; count: number }>
}

export interface ScheduledPostsFilters {
  status?: string
  date?: Date
  search?: string
  platform?: string
  type?: string
  limit?: number
  offset?: number
}

export function useScheduledPosts() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [stats, setStats] = useState<ScheduledPostsStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Type assertion to ensure session has the extended user properties
  const typedSession = session as any

  /**
   * Fetch scheduled posts with filters
   */
  const fetchPosts = useCallback(async (filters: ScheduledPostsFilters = {}) => {
    if (!typedSession?.user?.id) {
      setError("User not authenticated")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Fetching posts with filters:", filters)
      console.log("[v0] User ID being used:", typedSession?.user?.id)
      
      const params = new URLSearchParams()
      
      if (filters.status) params.append("status", filters.status)
      if (filters.date) params.append("date", filters.date.toISOString())
      if (filters.search) params.append("search", filters.search)
      if (filters.platform) params.append("platform", filters.platform)
      if (filters.type) params.append("type", filters.type)
      if (filters.limit) params.append("limit", filters.limit.toString())
      if (filters.offset) params.append("offset", filters.offset.toString())

      const url = `/api/scheduled-posts?${params.toString()}`
      console.log("[v0] Fetching from URL:", url)
      
      const response = await fetch(url)
      const result = await response.json()

      console.log("[v0] API response:", result)

      if (result.success) {
        setPosts(result.posts)
        setTotalCount(result.totalCount)
        setHasMore(result.hasMore)
        console.log("[v0] Posts set successfully:", result.posts.length)
      } else {
        setError(result.error || "Failed to fetch posts")
        toast({
          title: "Error",
          description: result.error || "Failed to fetch scheduled posts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching scheduled posts:", error)
      setError("Failed to fetch scheduled posts")
      toast({
        title: "Error",
        description: "Failed to fetch scheduled posts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [typedSession?.user?.id])

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    if (!typedSession?.user?.id) return

    try {
      console.log("[v0] Fetching stats for user:", typedSession?.user?.id)
      const response = await fetch("/api/scheduled-posts?action=stats")
      const result = await response.json()

      console.log("[v0] Stats response:", result)

      if (result.success) {
        setStats(result.stats)
        console.log("[v0] Stats set successfully:", result.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }, [typedSession?.user?.id])

  /**
   * Schedule a new post
   */
  const schedulePost = useCallback(async (postData: {
    content: string
    images?: string[]
    scheduledFor: Date
    platform: "linkedin" | "twitter" | "facebook"
    type: "text" | "carousel" | "image" | "article"
    tags?: string[]
  }) => {
    if (!typedSession?.user?.id) {
      toast({
        title: "Error",
        description: "Please sign in to schedule posts",
        variant: "destructive",
      })
      return { success: false }
    }

    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Scheduled!",
          description: `Post scheduled for ${new Date(postData.scheduledFor).toLocaleString()}`,
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true, postId: result.postId }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to schedule post",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error scheduling post:", error)
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [typedSession?.user?.id, fetchPosts, fetchStats])

  /**
   * Update a scheduled post
   */
  const updatePost = useCallback(async (postId: string, updates: {
    content?: string
    images?: string[]
    scheduledFor?: Date
    status?: "pending" | "posted" | "failed" | "paused" | "cancelled"
    tags?: string[]
  }) => {
    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, ...updates }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Updated!",
          description: "Post updated successfully",
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update post",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats])

  /**
   * Delete a scheduled post
   */
  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/scheduled-posts?postId=${postId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Deleted!",
          description: "Post deleted successfully",
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete post",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats])

  /**
   * Toggle post status (pause/resume)
   */
  const togglePostStatus = useCallback(async (postId: string, status: "paused" | "pending") => {
    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          postId, 
          action: "toggle-status",
          status 
        }),
      })

      const result = await response.json()

      if (result.success) {
        const action = status === "paused" ? "paused" : "resumed"
        toast({
          title: "Updated!",
          description: `Post ${action} successfully`,
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update post status",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error toggling post status:", error)
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats])

  /**
   * Retry a failed post
   */
  const retryPost = useCallback(async (postId: string) => {
    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          postId, 
          action: "retry"
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Retrying!",
          description: "Post will be retried",
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to retry post",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error retrying post:", error)
      toast({
        title: "Error",
        description: "Failed to retry post",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats])

  /**
   * Load more posts (pagination)
   */
  const loadMore = useCallback(async (filters: ScheduledPostsFilters = {}) => {
    if (!hasMore || loading) return

    const currentOffset = posts.length
    const newFilters = { ...filters, offset: currentOffset }
    
    try {
      const params = new URLSearchParams()
      
      if (newFilters.status) params.append("status", newFilters.status)
      if (newFilters.date) params.append("date", newFilters.date.toISOString())
      if (newFilters.search) params.append("search", newFilters.search)
      if (newFilters.platform) params.append("platform", newFilters.platform)
      if (newFilters.type) params.append("type", newFilters.type)
      if (newFilters.limit) params.append("limit", newFilters.limit.toString())
      params.append("offset", newFilters.offset!.toString())

      const response = await fetch(`/api/scheduled-posts?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setPosts(prev => [...prev, ...result.posts])
        setHasMore(result.hasMore)
      }
    } catch (error) {
      console.error("Error loading more posts:", error)
    }
  }, [hasMore, loading, posts.length])

  // Initial load
  useEffect(() => {
    if (typedSession?.user?.id) {
      fetchPosts()
      fetchStats()
    }
  }, [typedSession?.user?.id, fetchPosts, fetchStats])

  return {
    posts,
    stats,
    loading,
    error,
    totalCount,
    hasMore,
    fetchPosts,
    fetchStats,
    schedulePost,
    updatePost,
    deletePost,
    togglePostStatus,
    retryPost,
    loadMore,
  }
}
