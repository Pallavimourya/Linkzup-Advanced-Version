"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Edit3,
  Trash2,
  Calendar,
  Send,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Clock,
  Sparkles,
  ImageIcon,
  BookOpen,
  Heart,
  Target,
  Users,
  Zap,
  Eye,
  Copy,
  Archive,
  Star,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { getDraftsFromDB, saveDraftToDB, updateDraftInDB, deleteDraftFromDB, type Draft } from "@/lib/drafts-api"
import { useRouter } from "next/navigation"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
import { ScheduleButton } from "@/components/schedule-button"

export default function DraftsPage() {
  const router = useRouter()
  const { postToLinkedIn, isLinkedInConnected } = useLinkedInPosting()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null)
  const [deletingDraft, setDeletingDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)
  const [postingDrafts, setPostingDrafts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDrafts()
  }, [])

  const loadDrafts = async () => {
    try {
      const fetchedDrafts = await getDraftsFromDB()
      setDrafts(fetchedDrafts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load drafts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "carousel":
        return <ImageIcon className="h-4 w-4" />
      case "story":
        return <Sparkles className="h-4 w-4" />
      case "viral-inspired":
        return <Sparkles className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "carousel":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "story":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "viral-inspired":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch =
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || draft.category.toLowerCase() === categoryFilter
    const matchesType = typeFilter === "all" || draft.type === typeFilter
    return matchesSearch && matchesCategory && matchesType
  })

  const handleDeleteDraft = async (draft: Draft) => {
    setDeletingDraft(draft)
  }

  const confirmDeleteDraft = async () => {
    if (!deletingDraft) return

    try {
      await deleteDraftFromDB(deletingDraft.id)
      setDrafts(drafts.filter((draft) => draft.id !== deletingDraft.id))
      toast({
        title: "Draft Deleted",
        description: "Draft has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive",
      })
    } finally {
      setDeletingDraft(null)
    }
  }

  const handleDuplicateDraft = async (draft: Draft) => {
    try {
      const newDraft = await saveDraftToDB({
        ...draft,
        title: `${draft.title} (Copy)`,
      })
      setDrafts([newDraft, ...drafts])
      toast({
        title: "Draft Duplicated",
        description: "Draft has been successfully duplicated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate draft",
        variant: "destructive",
      })
    }
  }

  const handleEditDraft = (draft: Draft) => {
    if (draft.type === "carousel") {
      router.push(`/dashboard/ai-carousel?editDraft=${draft.id}`)
    } else {
      setEditingDraft(draft)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingDraft) return

    try {
      await updateDraftInDB(editingDraft.id, editingDraft)
      setDrafts(drafts.map((draft) => (draft.id === editingDraft.id ? editingDraft : draft)))
      setEditingDraft(null)
      toast({
        title: "Draft Updated",
        description: "Draft has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update draft",
        variant: "destructive",
      })
    }
  }

  const handlePostToLinkedIn = async (draft: Draft) => {
    setPostingDrafts(prev => new Set(prev).add(draft.id))
    
    try {
      const result = await postToLinkedIn({
        content: draft.content,
        images: draft.images || [],
      })

      if (result.success) {
        toast({
          title: "Posted to LinkedIn!",
          description: "Your draft has been published successfully.",
        })
      }
    } catch (error) {
      console.error("LinkedIn posting error:", error)
      toast({
        title: "Posting Failed",
        description: "There was an error posting to LinkedIn. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPostingDrafts(prev => {
        const newSet = new Set(prev)
        newSet.delete(draft.id)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-black/5 dark:from-black dark:via-blue-950/20 dark:to-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-secondary/5 rounded-full blur-3xl"></div>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-secondary rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-black via-blue-600 to-secondary dark:from-white dark:via-blue-400 dark:to-secondary bg-clip-text text-transparent">
                  My Drafts
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your saved content and turn ideas into posts</p>
              </div>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="gap-2 w-full sm:w-auto h-12 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4" />
                  <span>Create New Draft</span>
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white dark:bg-black border border-blue-200 dark:border-blue-800">
              <DialogHeader>
                <DialogTitle className="text-black dark:text-white">Create New Draft</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">Start writing your next LinkedIn post</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-black dark:text-white">Title</Label>
                  <Input id="title" placeholder="Give your draft a title..." className="border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-800/20 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-black dark:text-white">Content</Label>
                  <Textarea id="content" placeholder="Start writing your post..." className="min-h-[200px] border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-800/20 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-black dark:text-white">Category</Label>
                    <Select>
                      <SelectTrigger className="border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-black text-black dark:text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black border border-blue-200 dark:border-blue-800">
                        <SelectItem value="marketing" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Marketing</SelectItem>
                        <SelectItem value="leadership" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Leadership</SelectItem>
                        <SelectItem value="technology" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Technology</SelectItem>
                        <SelectItem value="productivity" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Productivity</SelectItem>
                        <SelectItem value="career" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Career</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-black dark:text-white">Type</Label>
                    <Select>
                      <SelectTrigger className="border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-black text-black dark:text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black border border-blue-200 dark:border-blue-800">
                        <SelectItem value="text" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Text Post</SelectItem>
                        <SelectItem value="carousel" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Carousel</SelectItem>
                        <SelectItem value="story" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-black dark:text-white">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="AI, Marketing, Tips..." className="border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-800/20 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300">Cancel</Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white">Save Draft</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search your drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-800/20 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-sm text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-12 border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-sm text-black dark:text-white">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border border-blue-200 dark:border-blue-800">
                <SelectItem value="all" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">All Categories</SelectItem>
                <SelectItem value="marketing" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Marketing</SelectItem>
                <SelectItem value="leadership" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Leadership</SelectItem>
                <SelectItem value="technology" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Technology</SelectItem>
                <SelectItem value="productivity" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Productivity</SelectItem>
                <SelectItem value="career" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Career</SelectItem>
                <SelectItem value="personal development" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Personal Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-sm text-black dark:text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border border-blue-200 dark:border-blue-800">
                <SelectItem value="all" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">All Types</SelectItem>
                <SelectItem value="text" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Text Post</SelectItem>
                <SelectItem value="carousel" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Carousel</SelectItem>
                <SelectItem value="story" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Story</SelectItem>
                <SelectItem value="viral-inspired" className="text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">Viral Inspired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Enhanced Drafts Grid */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredDrafts.map((draft, index) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Card Header with Gradient */}
                  <CardHeader className="pb-4 bg-gradient-to-r from-teal-50/50 to-secondary/20 dark:from-teal-950/30 dark:to-secondary/10 border-b border-teal-200/50 dark:border-teal-800/50">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getTypeColor(draft.type)} border-0 shadow-sm`}>
                            {getTypeIcon(draft.type)}
                            <span className="ml-1 capitalize text-xs font-medium">{draft.type.replace("-", " ")}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                            {draft.category}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/50">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-black border border-blue-200 dark:border-blue-800">
                            <DropdownMenuItem onClick={() => handleEditDraft(draft)} className="cursor-pointer text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">
                              <Edit3 className="mr-2 h-4 w-4" />
                              {draft.type === "carousel" ? "Edit in Carousel Editor" : "Edit Draft"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateDraft(draft)} className="cursor-pointer text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/50">
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteDraft(draft)} className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/50">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold leading-tight text-black dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {draft.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {draft.wordCount} words
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(draft.lastModified, "MMM dd")}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    {/* Content Preview */}
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {draft.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {draft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {draft.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                            {tag}
                          </Badge>
                        ))}
                        {draft.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            +{draft.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Source Info */}
                    {draft.source && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                        <Sparkles className="h-3 w-3" />
                        <span>Generated from {draft.source}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <ScheduleButton
                          content={draft.content}
                          images={draft.images || []}
                          defaultPlatform="linkedin"
                          defaultType={draft.type === "carousel" ? "carousel" : "text"}
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs border-teal-200 dark:border-teal-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-teal-300 dark:hover:border-teal-700 text-teal-700 dark:text-teal-300"
                          onSuccess={() => {
                            toast({
                              title: "Scheduled!",
                              description: "Your draft has been scheduled successfully.",
                            })
                          }}
                        />
                        <Button 
                          size="sm" 
                          className="h-9 text-xs bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white border-0"
                          onClick={() => handlePostToLinkedIn(draft)}
                          disabled={postingDrafts.has(draft.id)}
                        >
                          {postingDrafts.has(draft.id) ? (
                            <>
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3 mr-1" />
                              Post Now
                            </>
                          )}
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-9 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                        onClick={() => handleDeleteDraft(draft)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete Draft
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Empty State */}
        {filteredDrafts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-xl">
              <CardContent className="text-center py-12 px-8">
                <div className="w-20 h-20 bg-gradient-to-r from-teal-100 to-secondary/20 dark:from-teal-900/50 dark:to-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-teal-500 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                  {searchQuery || categoryFilter !== "all" || typeFilter !== "all"
                    ? "No drafts match your search"
                    : "No drafts yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {searchQuery || categoryFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Start creating amazing content and your drafts will appear here."}
                </p>
                <Button className="h-12 px-8 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Draft
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Edit Draft Modal */}
      {editingDraft && editingDraft.type !== "carousel" && (
        <Dialog open={!!editingDraft} onOpenChange={() => setEditingDraft(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Draft</DialogTitle>
              <DialogDescription>Make changes to your draft</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingDraft.title}
                  onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingDraft.content}
                  onChange={(e) =>
                    setEditingDraft({
                      ...editingDraft,
                      content: e.target.value,
                      wordCount: e.target.value.split(" ").length,
                    })
                  }
                  className="min-h-[200px] border border-black"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDraft(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDraft} onOpenChange={() => setDeletingDraft(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDraft?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDraft} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}