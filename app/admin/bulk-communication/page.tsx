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
  Search,
  ShoppingBag,
  History,
  Info,
  UserCheck,
  UserX,
  LogIn,
  CalendarDays,
  Timer,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { toast } from "sonner"
import BulkMessageHistory from "@/components/bulk-message-history"
import MessageTemplates from "@/components/message-templates"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

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
  hasEverPurchased: boolean
  lastPurchaseDate?: string
  lastPurchasePlan?: string
  lastPurchaseType?: string
  
  // Detailed user information
  joinDate: string
  trialStartDate?: string
  trialEndDate?: string
  trialStatus: 'not_started' | 'active' | 'expired' | 'ended'
  trialDaysRemaining: number
  trialDaysUsed: number
  lastLoginDate?: string
  totalLogins: number
  profileCompleted: boolean
  emailVerified: boolean
  mobileVerified: boolean
  
  createdAt: string
  updatedAt?: string
}

interface BulkMessage {
  subject: string
  content: string
  type: 'email' | 'whatsapp'
  userType: 'trialActive' | 'trialEndedNoPurchase' | 'trialEndedWithCredits' | 'trialEndedZeroCredits' | 'purchasedPlans' | 'activeSubscribers' | 'expiredSubscribers' | 'oneTimePurchasers' | 'suspendedUsers' | 'adminUsers'
  selectedUsers: string[]
}

export default function BulkCommunicationPage() {
  const [selectedTab, setSelectedTab] = useState<'trialActive' | 'trialEndedNoPurchase' | 'trialEndedWithCredits' | 'trialEndedZeroCredits' | 'purchasedPlans' | 'activeSubscribers' | 'expiredSubscribers' | 'oneTimePurchasers' | 'suspendedUsers' | 'adminUsers'>('trialActive')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [message, setMessage] = useState<BulkMessage>({
    subject: "",
    content: "",
    type: 'email',
    userType: 'trialActive',
    selectedUsers: []
  })

  const { data, mutate, isLoading, error } = useSWR("/api/admin/bulk-communication/users", fetcher)

  // Filter users based on current tab and search
  const getFilteredUsers = () => {
    if (!data?.users) return []
    
    let filtered = data.users.filter((user: User) => {
      // Filter by user type
      if (selectedTab === 'trialActive') {
        if (!user.isTrialActive || user.isAdmin) return false
      } else if (selectedTab === 'trialEndedNoPurchase') {
        if (user.isTrialActive || user.isAdmin || user.hasEverPurchased) return false
      } else if (selectedTab === 'trialEndedWithCredits') {
        if (user.isTrialActive || user.isAdmin || user.hasEverPurchased) return false
        if ((user.credits || 0) === 0) return false
      } else if (selectedTab === 'trialEndedZeroCredits') {
        if (user.isTrialActive || user.isAdmin || user.hasEverPurchased) return false
        if ((user.credits || 0) > 0) return false
      } else if (selectedTab === 'purchasedPlans') {
        if (user.isAdmin || user.accountStatus === 'suspended' || !user.hasEverPurchased) return false
      } else if (selectedTab === 'activeSubscribers') {
        if (user.isAdmin || user.accountStatus === 'suspended' || user.subscriptionStatus !== 'active') return false
      } else if (selectedTab === 'expiredSubscribers') {
        if (user.isAdmin || user.accountStatus === 'suspended' || !user.hasEverPurchased || user.subscriptionStatus === 'active') return false
      } else if (selectedTab === 'oneTimePurchasers') {
        if (user.isAdmin || user.accountStatus === 'suspended' || !user.hasEverPurchased || user.lastPurchaseType !== 'payment') return false
      } else if (selectedTab === 'suspendedUsers') {
        if (user.accountStatus !== 'suspended') return false
      } else if (selectedTab === 'adminUsers') {
        if (!user.isAdmin) return false
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

  const handleViewUserDetails = (user: User) => {
    setSelectedUserDetails(user)
    setIsUserDetailsOpen(true)
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
          userType: 'trialActive',
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
    if (!data?.users) return { 
      trialActive: 0, trialEndedNoPurchase: 0, trialEndedWithCredits: 0, trialEndedZeroCredits: 0,
      purchasedPlans: 0, activeSubscribers: 0, expiredSubscribers: 0, oneTimePurchasers: 0,
      suspendedUsers: 0, adminUsers: 0
    }
    
    return {
      trialActive: data.users.filter((u: User) => u.isTrialActive && !u.isAdmin).length,
      trialEndedNoPurchase: data.users.filter((u: User) => 
        !u.isTrialActive && !u.isAdmin && !u.hasEverPurchased
      ).length,
      trialEndedWithCredits: data.users.filter((u: User) => 
        !u.isTrialActive && !u.isAdmin && !u.hasEverPurchased && (u.credits || 0) > 0
      ).length,
      trialEndedZeroCredits: data.users.filter((u: User) => 
        !u.isTrialActive && !u.isAdmin && !u.hasEverPurchased && (u.credits || 0) === 0
      ).length,
      purchasedPlans: data.users.filter((u: User) => 
        !u.isAdmin && u.accountStatus !== 'suspended' && u.hasEverPurchased
      ).length,
      activeSubscribers: data.users.filter((u: User) => 
        !u.isAdmin && u.accountStatus !== 'suspended' && u.subscriptionStatus === 'active'
      ).length,
      expiredSubscribers: data.users.filter((u: User) => 
        !u.isAdmin && u.accountStatus !== 'suspended' && u.hasEverPurchased && u.subscriptionStatus !== 'active'
      ).length,
      oneTimePurchasers: data.users.filter((u: User) => 
        !u.isAdmin && u.accountStatus !== 'suspended' && u.hasEverPurchased && u.lastPurchaseType === 'payment'
      ).length,
      suspendedUsers: data.users.filter((u: User) => u.accountStatus === 'suspended').length,
      adminUsers: data.users.filter((u: User) => u.isAdmin).length
    }
  }

  const stats = getUserTypeStats()

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'trialActive': return <Calendar className="h-4 w-4" />
      case 'trialEndedNoPurchase': return <AlertTriangle className="h-4 w-4" />
      case 'trialEndedWithCredits': return <Clock className="h-4 w-4" />
      case 'trialEndedZeroCredits': return <AlertTriangle className="h-4 w-4" />
      case 'purchasedPlans': return <CheckCircle className="h-4 w-4" />
      case 'activeSubscribers': return <CheckCircle className="h-4 w-4" />
      case 'expiredSubscribers': return <Clock className="h-4 w-4" />
      case 'oneTimePurchasers': return <ShoppingBag className="h-4 w-4" />
      case 'suspendedUsers': return <Shield className="h-4 w-4" />
      case 'adminUsers': return <Crown className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getTabColor = (type: string) => {
    switch (type) {
      case 'trialActive': return "bg-blue-50 border-blue-200 text-blue-700"
      case 'trialEndedNoPurchase': return "bg-red-50 border-red-200 text-red-700"
      case 'trialEndedWithCredits': return "bg-orange-50 border-orange-200 text-orange-700"
      case 'trialEndedZeroCredits': return "bg-red-50 border-red-200 text-red-700"
      case 'purchasedPlans': return "bg-green-50 border-green-200 text-green-700"
      case 'activeSubscribers': return "bg-green-50 border-green-200 text-green-700"
      case 'expiredSubscribers': return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case 'oneTimePurchasers': return "bg-purple-50 border-purple-200 text-purple-700"
      case 'suspendedUsers': return "bg-gray-50 border-gray-200 text-gray-700"
      case 'adminUsers': return "bg-indigo-50 border-indigo-200 text-indigo-700"
      default: return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 truncate">Bulk Communication</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Send bulk emails and WhatsApp messages to users</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => mutate()} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {/* Trial Active */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 truncate">Trial Active</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.trialActive}</p>
              </div>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 self-end sm:self-center" />
            </div>
          </CardContent>
        </Card>

        {/* Trial Ended - No Purchase */}
        <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 truncate">Trial Ended - No Purchase</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-red-900 dark:text-red-100">{stats.trialEndedNoPurchase}</p>
              </div>
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-red-600 dark:text-red-400 flex-shrink-0 self-end sm:self-center" />
            </div>
          </CardContent>
        </Card>

        {/* Trial Ended - With Credits */}
        <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 truncate">Trial Ended - With Credits</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.trialEndedWithCredits}</p>
              </div>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-orange-600 dark:text-orange-400 flex-shrink-0 self-end sm:self-center" />
            </div>
          </CardContent>
        </Card>

        {/* Trial Ended - Zero Credits */}
        <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 truncate">Trial Ended - Zero Credits</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-red-900 dark:text-red-100">{stats.trialEndedZeroCredits}</p>
      </div>
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-red-600 dark:text-red-400 flex-shrink-0 self-end sm:self-center" />
            </div>
          </CardContent>
        </Card>

        {/* Purchased Plans */}
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 truncate">Purchased Plans</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-900 dark:text-green-100">{stats.purchasedPlans}</p>
            </div>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-green-600 dark:text-green-400 flex-shrink-0 self-end sm:self-center" />
          </div>
        </CardContent>
      </Card>

        {/* Active Subscribers */}
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 truncate">Active Subscribers</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeSubscribers}</p>
              </div>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-green-600 dark:text-green-400 flex-shrink-0 self-end sm:self-center" />
            </div>
          </CardContent>
        </Card>

        {/* Expired Subscribers */}
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 truncate">Expired Subscribers</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.expiredSubscribers}</p>
              </div>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 self-end sm:self-center" />
      </div>
          </CardContent>
        </Card>

        {/* One-time Purchasers */}
        <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-purple-700 dark:text-purple-400 truncate">One-time Purchasers</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.oneTimePurchasers}</p>
              </div>
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-purple-600 dark:text-purple-400 flex-shrink-0 self-end sm:self-center" />
            </div>
          </CardContent>
        </Card>

        {/* Suspended Users */}
        <Card className="bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-400 truncate">Suspended Users</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.suspendedUsers}</p>
              </div>
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-gray-600 dark:text-gray-400 flex-shrink-0 self-end sm:self-center" />
          </div>
        </CardContent>
      </Card>

        {/* Admin Users */}
        <Card className="bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 truncate">Admin Users</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.adminUsers}</p>
              </div>
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 self-end sm:self-center" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Main Content */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">User Management & Communication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 sm:pt-3 md:pt-6">
          <Tabs value={selectedTab} onValueChange={(value) => {
            setSelectedTab(value as any)
            setSelectedUsers([])
            setSearchQuery("")
          }}>
            <div className="space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4">
              {/* Main Categories */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Trial Users</h3>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 h-auto">
                  <TabsTrigger value="trialActive" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">Trial Active ({stats.trialActive})</span>
              </TabsTrigger>
                  <TabsTrigger value="trialEndedNoPurchase" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-red-100 data-[state=active]:text-red-900">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">Trial Ended - No Purchase ({stats.trialEndedNoPurchase})</span>
              </TabsTrigger>
                </TabsList>
              </div>

              {/* Trial Ended Sub-categories */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Trial Ended Details</h3>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 h-auto">
                  <TabsTrigger value="trialEndedWithCredits" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">With Credits ({stats.trialEndedWithCredits})</span>
                  </TabsTrigger>
                  <TabsTrigger value="trialEndedZeroCredits" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-red-100 data-[state=active]:text-red-900">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">Zero Credits ({stats.trialEndedZeroCredits})</span>
              </TabsTrigger>
            </TabsList>
              </div>

              {/* Purchased Users */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Purchased Users</h3>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 h-auto">
                  <TabsTrigger value="purchasedPlans" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">All Purchased ({stats.purchasedPlans})</span>
                  </TabsTrigger>
                  <TabsTrigger value="activeSubscribers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">Active Subscribers ({stats.activeSubscribers})</span>
                  </TabsTrigger>
                  <TabsTrigger value="expiredSubscribers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">Expired Subscribers ({stats.expiredSubscribers})</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Special Categories */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Special Categories</h3>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 h-auto">
                  <TabsTrigger value="oneTimePurchasers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">One-time Purchasers ({stats.oneTimePurchasers})</span>
              </TabsTrigger>
                  <TabsTrigger value="suspendedUsers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">Suspended Users ({stats.suspendedUsers})</span>
              </TabsTrigger>
                  <TabsTrigger value="adminUsers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-3 h-auto min-h-[36px] sm:min-h-[40px] data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate text-left">Admin Users ({stats.adminUsers})</span>
              </TabsTrigger>
            </TabsList>
              </div>
            </div>

            <TabsContent value={selectedTab} className="space-y-3 sm:space-y-4">
              {/* Search and Actions */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 w-full"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={filteredUsers.length === 0}
                    className="w-full sm:w-auto"
                  >
                    {selectedUsers.length === filteredUsers.length ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Deselect All</span>
                        <span className="sm:hidden">Deselect</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Select All ({filteredUsers.length})</span>
                        <span className="sm:hidden">Select All</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleComposeMessage}
                    disabled={selectedUsers.length === 0}
                    className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Compose Message ({selectedUsers.length})</span>
                    <span className="sm:hidden">Compose ({selectedUsers.length})</span>
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
                      className={`border-2 rounded-lg p-3 sm:p-4 transition-all ${
                        selectedUsers.includes(user._id)
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={() => handleSelectUser(user._id)}
                          className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:border-teal-500 dark:data-[state=checked]:border-teal-400 mt-1"
                        />
                        
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                              {user.name || "Unnamed User"}
                            </h3>
                            {user.isAdmin && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs w-fit">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.mobile && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{user.mobile}</span>
                              </div>
                            )}
                            {user.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{user.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 sm:gap-2 min-w-0">
                          <div className="flex items-center gap-1 text-xs sm:text-sm">
                            <Zap className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{user.credits || 0}</span>
                              </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                {user.plan || "No Plan"}
                              </div>
                          
                          {/* Trial Status */}
                          {user.trialStatus && user.trialStatus !== 'not_started' && (
                            <div className="flex items-center gap-1 text-xs">
                              {user.trialStatus === 'active' ? (
                                <Timer className="h-3 w-3 text-green-500 flex-shrink-0" />
                              ) : (
                                <Clock className="h-3 w-3 text-orange-500 flex-shrink-0" />
                              )}
                              <span className="text-gray-600 dark:text-gray-400">
                                {user.trialStatus === 'active' ? `${user.trialDaysRemaining}d left` : 
                                 user.trialStatus === 'expired' ? 'Trial expired' : 'Trial ended'}
                              </span>
                            </div>
                          )}
                          
                          {/* Join Date */}
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(user.joinDate)}</span>
                        </div>
                          
                          {user.hasEverPurchased && user.lastPurchaseDate && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                              <div className="flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-20 sm:max-w-none">{user.lastPurchasePlan}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <History className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{formatDate(user.lastPurchaseDate)}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUserDetails(user)}
                            className="mt-2 text-xs px-2 py-1 h-auto"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Details</span>
                            <span className="sm:hidden">Info</span>
                          </Button>
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

      {/* User Details Modal */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedUserDetails && (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{selectedUserDetails.name || "Unnamed User"}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{selectedUserDetails.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedUserDetails.mobile && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{selectedUserDetails.mobile}</span>
                        </div>
                      )}
                      {selectedUserDetails.city && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{selectedUserDetails.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                        <span className="truncate">{Math.round(selectedUserDetails.credits || 0)} credits</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={`text-xs ${selectedUserDetails.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selectedUserDetails.accountStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Role:</span>
                      <Badge className={`text-xs ${selectedUserDetails.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {selectedUserDetails.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Plan:</span>
                      <span className="text-xs sm:text-sm font-medium truncate">{selectedUserDetails.plan || "No Plan"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Subscription:</span>
                      <Badge className={`text-xs ${selectedUserDetails.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {selectedUserDetails.subscriptionStatus || 'inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trial Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Trial Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedUserDetails.trialStatus === 'active' ? selectedUserDetails.trialDaysRemaining : selectedUserDetails.trialDaysUsed}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {selectedUserDetails.trialStatus === 'active' ? 'Days Remaining' : 'Days Used'}
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {selectedUserDetails.trialStatus}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Trial Status</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:col-span-2 lg:col-span-1">
                      <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {selectedUserDetails.isTrialActive ? 'Yes' : 'No'}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Trial Active</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span className="text-gray-600">Join Date:</span>
                      <span className="font-medium">{formatDate(selectedUserDetails.joinDate)}</span>
                    </div>
                    {selectedUserDetails.trialStartDate && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-gray-600">Trial Start:</span>
                        <span className="font-medium">{formatDate(selectedUserDetails.trialStartDate)}</span>
                      </div>
                    )}
                    {selectedUserDetails.trialEndDate && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-gray-600">Trial End:</span>
                        <span className="font-medium">{formatDate(selectedUserDetails.trialEndDate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Information */}
              {selectedUserDetails.hasEverPurchased && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Purchase Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span className="text-gray-600">Last Purchase Date:</span>
                      <span className="font-medium">{selectedUserDetails.lastPurchaseDate ? formatDate(selectedUserDetails.lastPurchaseDate) : 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span className="text-gray-600">Last Purchase Plan:</span>
                      <span className="font-medium truncate">{selectedUserDetails.lastPurchasePlan || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span className="text-gray-600">Purchase Type:</span>
                      <Badge className="bg-blue-100 text-blue-700 text-xs w-fit">
                        {selectedUserDetails.lastPurchaseType || 'N/A'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Activity Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="text-gray-600">Total Logins:</span>
                    <span className="font-medium">{selectedUserDetails.totalLogins || 0}</span>
                  </div>
                  {selectedUserDetails.lastLoginDate && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="font-medium">{formatDate(selectedUserDetails.lastLoginDate)}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="text-gray-600">Profile Completed:</span>
                    <div className="flex items-center gap-1">
                      {selectedUserDetails.profileCompleted ? (
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      )}
                      <span className="font-medium text-xs sm:text-sm">{selectedUserDetails.profileCompleted ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="text-gray-600">Email Verified:</span>
                    <div className="flex items-center gap-1">
                      {selectedUserDetails.emailVerified ? (
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      )}
                      <span className="font-medium text-xs sm:text-sm">{selectedUserDetails.emailVerified ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="text-gray-600">Mobile Verified:</span>
                    <div className="flex items-center gap-1">
                      {selectedUserDetails.mobileVerified ? (
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      )}
                      <span className="font-medium text-xs sm:text-sm">{selectedUserDetails.mobileVerified ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Templates */}
      <MessageTemplates onSelectTemplate={handleSelectTemplate} />

      {/* Message History */}
      <BulkMessageHistory />
    </div>
  )
}
