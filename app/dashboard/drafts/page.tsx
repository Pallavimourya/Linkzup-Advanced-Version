"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { getDraftsFromDB, saveDraftToDB, updateDraftInDB, deleteDraftFromDB, type Draft } from "@/lib/drafts-api"
import { useRouter } from "next/navigation"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"

export default function DraftsPage() {
  const router = useRouter()
  const { postToLinkedIn, isPosting, isLinkedInConnected } = useLinkedInPosting()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null)
  const [deletingDraft, setDeletingDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)

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
      // Redirect to AI Carousel page with draft data
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
        // Optionally remove the draft after successful posting
        // await deleteDraft(draft.id)
      }
    } catch (error) {
      console.error("LinkedIn posting error:", error)
      toast({
        title: "Posting Failed",
        description: "There was an error posting to LinkedIn. Please try again.",
        variant: "destructive",
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
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="text-muted-foreground">Manage your saved drafts and convert them to posts</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Draft
            </Button>
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
                <Textarea id="content" placeholder="Start writing your post..." className="min-h-[200px]" />
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
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
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
          <SelectTrigger className="w-full sm:w-[200px]">
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

      {/* Drafts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrafts.map((draft) => (
          <Card key={draft.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(draft.type)}>
                      {getTypeIcon(draft.type)}
                      <span className="ml-1 capitalize">{draft.type.replace("-", " ")}</span>
                    </Badge>
                    <Badge variant="outline">{draft.category}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{draft.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {draft.wordCount} words • {format(draft.lastModified, "MMM dd")}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditDraft(draft)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      {draft.type === "carousel" ? "Edit in Carousel Editor" : "Edit"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateDraft(draft)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteDraft(draft)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{draft.content}</p>

              {draft.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {draft.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {draft.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{draft.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {draft.source && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>From {draft.source}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => handlePostToLinkedIn(draft)}
                  disabled={isPosting}
                >
                  <Send className="h-4 w-4" />
                  {isPosting ? "Posting..." : "Post Now"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteDraft(draft)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrafts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start creating content to see your drafts here"}
            </p>
            <Button>Create Your First Draft</Button>
          </CardContent>
        </Card>
      )}

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
                  className="min-h-[200px]"
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
