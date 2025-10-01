"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Users, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Crown,
  Calendar,
  User,
  Phone,
  MapPin,
  Zap,
  CreditCard,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Search
} from "lucide-react"
import { toast } from "sonner"
import BulkMessageHistory from "@/components/bulk-message-history"
import MessageTemplates from "@/components/message-templates"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface User {
  _id: string
  name: string
  email: string
  mobile?: string
  city?: string
  credits: number
  plan?: string
  role: string
  isTrialActive: boolean
  isAdmin: boolean
  accountStatus: string
  subscriptionStatus?: string
  createdAt: string
}

interface BulkMessage {
  subject: string
  content: string
  type: 'email' | 'whatsapp'
  userType: 'trial' | 'active' | 'pending'
  selectedUsers: string[]
}

export default function BulkCommunicationPage() {
  const [selectedTab, setSelectedTab] = useState<'trial' | 'active' | 'pending'>('trial')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [message, setMessage] = useState<BulkMessage>({
    subject: "",
    content: "",
    type: 'email',
    userType: 'trial',
    selectedUsers: []
  })

  const { data, mutate, isLoading, error } = useSWR("/api/admin/bulk-communication/users", fetcher)

  // Filter users based on current tab and search
  const getFilteredUsers = () => {
    if (!data?.users) return []
    
    let filtered = data.users.filter((user: User) => {
      // Filter by user type
      if (selectedTab === 'trial') {
        if (!user.isTrialActive) return false
      } else if (selectedTab === 'active') {
        if (user.isTrialActive || user.isAdmin || user.accountStatus === 'suspended') return false
        if (!user.subscriptionStatus || user.subscriptionStatus !== 'active') return false
      } else if (selectedTab === 'pending') {
        if (user.isTrialActive || user.isAdmin) return false
        if (user.subscriptionStatus === 'active') return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.mobile?.includes(query) ||
          user.city?.toLowerCase().includes(query)
        )
      }

      return true
    })

    return filtered
  }

  const filteredUsers = getFilteredUsers()

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user: User) => user._id))
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleComposeMessage = () => {
    setMessage(prev => ({
      ...prev,
      userType: selectedTab,
      selectedUsers: selectedUsers
    }))
    setIsComposeOpen(true)
  }

  const handleSelectTemplate = (template: any) => {
    setMessage(prev => ({
      ...prev,
      subject: template.subject || "",
      content: template.content,
      type: template.type,
      userType: template.userType
    }))
    setIsComposeOpen(true)
  }

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error("Please enter a test email address")
      return
    }

    setIsTestingEmail(true)
    try {
      const response = await fetch("/api/test/gmail-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        toast.success(`Test email sent successfully to ${testEmail}`)
        setTestEmail("")
      } else {
        toast.error(result.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error("Failed to send test email")
    } finally {
      setIsTestingEmail(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.subject.trim() || !message.content.trim()) {
      toast.error("Please fill in both subject and content")
      return
    }

    if (message.selectedUsers.length === 0) {
      toast.error("Please select at least one user")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/admin/bulk-communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...message,
          selectedUsers: message.selectedUsers
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success(`Message sent successfully to ${result.sentCount} users`)
        setIsComposeOpen(false)
        setMessage({
          subject: "",
          content: "",
          type: 'email',
          userType: 'trial',
          selectedUsers: []
        })
        setSelectedUsers([])
      } else {
        toast.error(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const getUserTypeStats = () => {
    if (!data?.users) return { trial: 0, active: 0, pending: 0 }
    
    const trial = data.users.filter((u: User) => u.isTrialActive).length
    const active = data.users.filter((u: User) => 
      !u.isTrialActive && !u.isAdmin && u.accountStatus !== 'suspended' && u.subscriptionStatus === 'active'
    ).length
    const pending = data.users.filter((u: User) => 
      !u.isTrialActive && !u.isAdmin && u.subscriptionStatus !== 'active'
    ).length

    return { trial, active, pending }
  }

  const stats = getUserTypeStats()

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'trial': return <Calendar className="h-4 w-4" />
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getTabColor = (type: string) => {
    switch (type) {
      case 'trial': return "bg-blue-50 border-blue-200 text-blue-700"
      case 'active': return "bg-green-50 border-green-200 text-green-700"
      case 'pending': return "bg-orange-50 border-orange-200 text-orange-700"
      default: return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-700">Bulk Communication</h1>
          <p className="text-muted-foreground mt-1">Send bulk emails and WhatsApp messages to users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Trial Users</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.trial}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Active Users</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Pending Users</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Email Section */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Mail className="h-5 w-5" />
            Test Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="test-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="Enter email to test..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400"
              />
            </div>
            <Button
              onClick={handleTestEmail}
              disabled={isTestingEmail || !testEmail.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTestingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Test if your Gmail configuration is working by sending a test email
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management & Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={(value) => {
            setSelectedTab(value as 'trial' | 'active' | 'pending')
            setSelectedUsers([])
            setSearchQuery("")
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trial" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Trial Users ({stats.trial})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active Users ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Users ({stats.pending})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={filteredUsers.length === 0}
                  >
                    {selectedUsers.length === filteredUsers.length ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Select All ({filteredUsers.length})
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleComposeMessage}
                    disabled={selectedUsers.length === 0}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Compose Message ({selectedUsers.length})
                  </Button>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Error loading users</h3>
                    <p className="text-red-500 mb-4">{error.message || "Failed to load users"}</p>
                    <Button onClick={() => mutate()} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredUsers.map((user: User) => (
                    <div
                      key={user._id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        selectedUsers.includes(user._id)
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={() => handleSelectUser(user._id)}
                          className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:border-teal-500 dark:data-[state=checked]:border-teal-400"
                        />
                        
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-teal-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {user.name || "Unnamed User"}
                            </h3>
                            {user.isAdmin && (
                              <Badge className="bg-purple-100 text-purple-700">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.mobile && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.mobile}</span>
                              </div>
                            )}
                            {user.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{user.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm">
                                <Zap className="h-3 w-3 text-yellow-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{user.credits || 0}</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.plan || "No Plan"}
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Compose Bulk Message
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Message Type */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Message Type</Label>
              <Select value={message.type} onValueChange={(value: 'email' | 'whatsapp') => 
                setMessage(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger className="border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter message subject..."
                value={message.subject}
                onChange={(e) => setMessage(prev => ({ ...prev, subject: e.target.value }))}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-gray-700 dark:text-gray-300">Message Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your message content..."
                value={message.content}
                onChange={(e) => setMessage(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="resize-none border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400"
              />
            </div>

            {/* Recipients Info */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Recipients</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This message will be sent to <strong className="text-gray-800 dark:text-gray-200">{selectedUsers.length}</strong> {selectedTab} users
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsComposeOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.subject.trim() || !message.content.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Templates */}
      <MessageTemplates onSelectTemplate={handleSelectTemplate} />

      {/* Message History */}
      <BulkMessageHistory />
    </div>
  )
}
