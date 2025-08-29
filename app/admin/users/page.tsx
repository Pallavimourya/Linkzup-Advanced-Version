"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  Users, 
  User, 
  Mail, 
  CreditCard, 
  Zap, 
  Calendar, 
  Shield, 
  Crown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Save,
  X,
  Eye,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminUsersPage() {
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { data, mutate, isLoading } = useSWR(`/api/admin/users?q=${encodeURIComponent(q)}`, fetcher)

  const updateUser = async (id: string, updates: any) => {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      })
      mutate()
      setIsEditDialogOpen(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser._id, editingUser)
    }
  }

  const handleDeleteUser = async (user: any) => {
    setDeletingUser(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return

    try {
      const response = await fetch(`/api/admin/users/${deletingUser._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        console.log("User deleted successfully:", result)
        mutate() // Refresh the user list
        setIsDeleteDialogOpen(false)
        setDeletingUser(null)
      } else {
        const error = await response.json()
        console.error("Failed to delete user:", error)
        alert(`Failed to delete user: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user. Please try again.")
    }
  }

  const getStatusBadge = (user: any) => {
    if (user.isAdmin) {
      return <Badge className="bg-teal-700 text-white border-0"><Crown className="h-3 w-3 mr-1" />Admin</Badge>
    }
    if (user.accountStatus === "suspended") {
      return <Badge className="bg-red-700 text-white border-0"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
    }
    if (user.isTrialActive) {
      return <Badge className="bg-blue-700 text-white border-0"><Calendar className="h-3 w-3 mr-1" />Trial</Badge>
    }
    return <Badge className="bg-teal-600 text-white border-0"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
  }

  const filteredUsers = data?.users?.filter((user: any) => {
    if (statusFilter === "all") return true
    if (statusFilter === "admin") return user.isAdmin
    if (statusFilter === "trial") return user.isTrialActive
    if (statusFilter === "active") return !user.isTrialActive && !user.isAdmin && user.accountStatus !== "suspended"
    if (statusFilter === "suspended") return user.accountStatus === "suspended"
    return true
  }) || []

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-700">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all registered users and their accounts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700 dark:text-teal-400">Total Users</p>
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">{data?.users?.length || 0}</p>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                <Users className="h-6 w-6 text-teal-700 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700 dark:text-teal-400">Active Users</p>
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                  {data?.users?.filter((u: any) => !u.isTrialActive && !u.isAdmin && u.accountStatus !== "suspended").length || 0}
                </p>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-teal-700 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700 dark:text-teal-400">Trial Users</p>
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                  {data?.users?.filter((u: any) => u.isTrialActive).length || 0}
                </p>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                <Calendar className="h-6 w-6 text-teal-700 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700 dark:text-teal-400">Admins</p>
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                  {data?.users?.filter((u: any) => u.isAdmin).length || 0}
                </p>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                <Crown className="h-6 w-6 text-teal-700 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-teal-50/50 dark:bg-teal-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-teal-700">
            <Filter className="h-5 w-5 text-teal-700" />
            Search & Filter Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-teal-700">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-teal-600" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 border-2 border-teal-200 focus:border-teal-700 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm font-medium text-teal-700">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-2 border-teal-200 focus:border-teal-700 transition-colors">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="trial">Trial Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="suspended">Suspended Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-0 shadow-lg bg-teal-50/50 dark:bg-teal-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-teal-700">
            <Users className="h-5 w-5 text-teal-700" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
      {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <span className="text-muted-foreground">Loading users...</span>
              </div>
            </div>
      )}
      
      {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
          
                      {!isLoading && filteredUsers.map((u: any) => (
            <div key={u._id} className="group border border-teal-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-teal-400 bg-white/80 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-teal-900">{u.name || "Unnamed User"}</h3>
                      <div className="flex items-center gap-2 text-sm text-teal-600">
                        <Mail className="h-3 w-3" />
                        {u.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(u)}
                      {u.subscriptionStatus && (
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                          {u.subscriptionStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Zap className="h-4 w-4 text-teal-700" />
                          </div>
                      <div>
                        <p className="text-xs text-teal-600">Credits</p>
                        <p className="font-semibold text-teal-900">{u.credits ?? 0}</p>
                          </div>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <CreditCard className="h-4 w-4 text-teal-700" />
                      </div>
                      <div>
                        <p className="text-xs text-teal-600">Plan</p>
                        <p className="font-semibold text-teal-900">{u.plan || "No Plan"}</p>
                </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Shield className="h-4 w-4 text-teal-700" />
                  </div>
                    <div>
                        <p className="text-xs text-teal-600">Role</p>
                        <p className="font-semibold text-teal-900 capitalize">{u.role || "user"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 ml-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditUser(u)}
                          className="h-8 w-8 p-0 border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit User</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    {!u.isAdmin && (
                      <AlertDialog open={isDeleteDialogOpen && deletingUser?._id === u._id} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteUser(u)}
                                className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete User</p>
                            </TooltipContent>
                          </Tooltip>
                        </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-700">Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingUser?.name || deletingUser?.email}</strong>? 
                            This action will permanently remove:
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                              <li>User account and profile</li>
                              <li>All user posts and drafts</li>
                              <li>Order history and subscriptions</li>
                              <li>Credit transaction history</li>
                              <li>All related data</li>
                            </ul>
                            <p className="mt-3 font-semibold text-red-600">This action cannot be undone!</p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-teal-300 text-teal-700 hover:bg-teal-50">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={confirmDeleteUser}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                                      {!u.isAdmin && (
                      <>
                        {u.accountStatus === "suspended" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateUser(u._id, { accountStatus: "active" })}
                                className="h-8 w-8 p-0 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Activate User</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateUser(u._id, { accountStatus: "suspended" })}
                                className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Suspend User</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {u.isTrialActive && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateUser(u._id, { isTrialActive: false })}
                                className="h-8 w-8 p-0 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>End Trial</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-700">
              <Edit className="h-5 w-5 text-teal-700" />
              Edit User Details
            </DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder="User name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="User email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-credits">Credits</Label>
                  <Input
                    id="edit-credits"
                    type="number"
                    value={editingUser.credits || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, credits: parseInt(e.target.value) || 0 })}
                    placeholder="Credits"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plan">Plan</Label>
                  <Select 
                    value={editingUser.plan || ""} 
                    onValueChange={(value) => setEditingUser({ ...editingUser, plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={editingUser.role || "user"} 
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Account Status</Label>
                  <Select 
                    value={editingUser.accountStatus || "active"} 
                    onValueChange={(value) => setEditingUser({ ...editingUser, accountStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingUser.notes || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  placeholder="Add notes about this user..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-trial"
                  checked={editingUser.isTrialActive || false}
                  onChange={(e) => setEditingUser({ ...editingUser, isTrialActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-trial">Trial Active</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-admin"
                  checked={editingUser.isAdmin || false}
                  onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-admin">Admin Access</Label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingUser(null)
                  }}
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveUser} className="bg-teal-700 hover:bg-teal-800 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
        </div>
      )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
