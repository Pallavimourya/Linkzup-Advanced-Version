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
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "story":
        return "bg-green-100 text-green-800 hover:bg-green-200"
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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  My Drafts
                </h1>
                <p className="text-sm text-gray-600">Manage your saved content and turn ideas into posts</p>
              </div>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="gap-2 w-full sm:w-auto h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4" />
                  <span>Create New Draft</span>
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Draft</DialogTitle>
                <DialogDescription>Start writing your next LinkedIn post</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Give your draft a title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" placeholder="Start writing your post..." className="min-h-[200px] border border-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Post</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="AI, Marketing, Tips..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Draft</Button>
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search your drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="personal development">Personal Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text Post</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="viral-inspired">Viral Inspired</SelectItem>
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
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Card Header with Gradient */}
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-gray-100">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getTypeColor(draft.type)} border-0 shadow-sm`}>
                            {getTypeIcon(draft.type)}
                            <span className="ml-1 capitalize text-xs font-medium">{draft.type.replace("-", " ")}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-white/50 border-gray-200">
                            {draft.category}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/50">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEditDraft(draft)} className="cursor-pointer">
                              <Edit3 className="mr-2 h-4 w-4" />
                              {draft.type === "carousel" ? "Edit in Carousel Editor" : "Edit Draft"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateDraft(draft)} className="cursor-pointer">
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteDraft(draft)} className="text-red-600 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                          {draft.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 mt-1">
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
                          <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {tag}
                          </Badge>
                        ))}
                        {draft.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                            +{draft.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Source Info */}
                    {draft.source && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
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
                          className="h-9 text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          onSuccess={() => {
                            toast({
                              title: "Scheduled!",
                              description: "Your draft has been scheduled successfully.",
                            })
                          }}
                        />
                        <Button 
                          size="sm" 
                          className="h-9 text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
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
                        className="w-full h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
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
            <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="text-center py-12 px-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchQuery || categoryFilter !== "all" || typeFilter !== "all"
                    ? "No drafts match your search"
                    : "No drafts yet"}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {searchQuery || categoryFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Start creating amazing content and your drafts will appear here."}
                </p>
                <Button className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
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