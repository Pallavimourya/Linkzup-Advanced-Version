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
        title: "Authentication Required",
        description: "Please sign in to schedule posts",
        variant: "destructive",
      })
      return { success: false }
    }

    // Validate post data before scheduling
    if (!postData.content.trim()) {
      toast({
        title: "Empty Content",
        description: "Please add content to your post before scheduling",
        variant: "destructive",
      })
      return { success: false }
    }

    // Check if scheduled time is in the future
    if (new Date(postData.scheduledFor) <= new Date()) {
      toast({
        title: "Invalid Schedule Time",
        description: "Please schedule your post for a future time",
        variant: "destructive",
      })
      return { success: false }
    }

    // Show scheduling started notification
    toast({
      title: "Scheduling Post",
      description: "Your post is being scheduled. This may take a moment...",
    })

    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      const result = await response.json()

      if (result.success) {
        const scheduledTime = new Date(postData.scheduledFor)
        const timeUntilPost = scheduledTime.getTime() - Date.now()
        const hoursUntilPost = Math.ceil(timeUntilPost / (1000 * 60 * 60))
        
        let timeDescription = ""
        if (hoursUntilPost < 1) {
          timeDescription = "in less than an hour"
        } else if (hoursUntilPost < 24) {
          timeDescription = `in ${hoursUntilPost} hour${hoursUntilPost > 1 ? 's' : ''}`
        } else {
          const daysUntilPost = Math.ceil(hoursUntilPost / 24)
          timeDescription = `in ${daysUntilPost} day${daysUntilPost > 1 ? 's' : ''}`
        }

        toast({
          title: "Post Scheduled Successfully! 📅",
          description: `Your ${postData.type} post will be published to ${postData.platform} ${timeDescription}`,
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true, postId: result.postId }
      } else {
        // Handle specific scheduling errors
        if (result.errorCode === "INSUFFICIENT_CREDITS") {
          toast({
            title: "Insufficient Credits",
            description: "You need credits to schedule posts. Please purchase more credits.",
            variant: "destructive",
          })
        } else if (result.errorCode === "PLATFORM_NOT_CONNECTED") {
          toast({
            title: "Platform Not Connected",
            description: `Please connect your ${postData.platform} account before scheduling posts.`,
            variant: "destructive",
          })
        } else if (result.errorCode === "SCHEDULE_CONFLICT") {
          toast({
            title: "Schedule Conflict",
            description: "You have another post scheduled at the same time. Please choose a different time.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Scheduling Failed",
            description: result.error || "Failed to schedule post. Please try again.",
            variant: "destructive",
          })
        }
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error scheduling post:", error)
      
      // Show network-specific error notifications
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Unable to connect to our servers. Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Scheduling Failed",
          description: "Failed to schedule post. Please try again.",
          variant: "destructive",
        })
      }
      
      return { success: false, error: "Network error" }
    }
  }, [typedSession?.user?.id, fetchPosts, fetchStats, toast])

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
    // Show update started notification
    toast({
      title: "Updating Post",
      description: "Your post is being updated. This may take a moment...",
    })

    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, ...updates }),
      })

      const result = await response.json()

      if (result.success) {
        // Show specific update notifications
        if (updates.scheduledFor) {
          const newTime = new Date(updates.scheduledFor)
          const timeUntilPost = newTime.getTime() - Date.now()
          const hoursUntilPost = Math.ceil(timeUntilPost / (1000 * 60 * 60))
          
          let timeDescription = ""
          if (hoursUntilPost < 1) {
            timeDescription = "in less than an hour"
          } else if (hoursUntilPost < 24) {
            timeDescription = `in ${hoursUntilPost} hour${hoursUntilPost > 1 ? 's' : ''}`
          } else {
            const daysUntilPost = Math.ceil(hoursUntilPost / 24)
            timeDescription = `in ${daysUntilPost} day${daysUntilPost > 1 ? 's' : ''}`
          }
          
          toast({
            title: "Schedule Updated! ⏰",
            description: `Post rescheduled to publish ${timeDescription}`,
          })
        } else if (updates.content) {
          toast({
            title: "Content Updated! ✏️",
            description: "Post content has been updated successfully",
          })
        } else if (updates.status) {
          const statusMessages = {
            paused: "Post has been paused and will not be published",
            cancelled: "Post has been cancelled and will not be published",
            pending: "Post has been resumed and will be published as scheduled"
          }
          
          toast({
            title: "Status Updated! 🔄",
            description: statusMessages[updates.status] || "Post status has been updated",
          })
        } else {
          toast({
            title: "Post Updated! ✅",
            description: "Post has been updated successfully",
          })
        }
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update post. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats, toast])

  /**
   * Delete a scheduled post
   */
  const deletePost = useCallback(async (postId: string) => {
    // Show deletion confirmation
    toast({
      title: "Deleting Post",
      description: "Your scheduled post is being deleted...",
    })

    try {
      const response = await fetch(`/api/scheduled-posts?postId=${postId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Post Deleted! 🗑️",
          description: "Scheduled post has been removed successfully",
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete post. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Deletion Failed",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats, toast])

  /**
   * Toggle post status (pause/resume)
   */
  const togglePostStatus = useCallback(async (postId: string, status: "paused" | "pending") => {
    const action = status === "paused" ? "pausing" : "resuming"
    
    // Show status change notification
    toast({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Post`,
      description: `Your post is being ${action}...`,
    })

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
        const actionText = status === "paused" ? "paused" : "resumed"
        const emoji = status === "paused" ? "⏸️" : "▶️"
        
        toast({
          title: `Post ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}! ${emoji}`,
          description: `Post has been ${actionText} successfully`,
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Status Update Failed",
          description: result.error || "Failed to update post status. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error toggling post status:", error)
      toast({
        title: "Status Update Failed",
        description: "Failed to update post status. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats, toast])

  /**
   * Retry a failed post
   */
  const retryPost = useCallback(async (postId: string) => {
    // Show retry notification
    toast({
      title: "Retrying Post",
      description: "Your failed post is being retried...",
    })

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
          title: "Post Retry Initiated! 🔄",
          description: "Failed post will be retried and published as soon as possible",
        })
        
        // Refresh posts and stats
        await fetchPosts()
        await fetchStats()
        
        return { success: true }
      } else {
        toast({
          title: "Retry Failed",
          description: result.error || "Failed to retry post. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error retrying post:", error)
      toast({
        title: "Retry Failed",
        description: "Failed to retry post. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }, [fetchPosts, fetchStats, toast])

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
