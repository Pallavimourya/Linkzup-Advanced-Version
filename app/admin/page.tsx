"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Activity,
  Target,
  Zap,
  Crown,
  Gift,
  BarChart3,
  Eye,
  Plus,
  Minus
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminHomePage() {
  const { data, error, isLoading } = useSWR("/api/admin/analytics/summary", fetcher)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <Badge variant="secondary">Loading...</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load analytics data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time analytics and insights</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatNumber(data?.users?.total || 0)}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
              <Plus className="h-3 w-3 mr-1" />
              +{data?.users?.newThisWeek || 0} this week
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Active Subscriptions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatNumber(data?.subscriptions?.active || 0)}
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              {data?.subscriptions?.trial || 0} on trial
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(data?.revenue?.currentMonth || 0)}
            </div>
            <div className="flex items-center text-xs mt-1">
              {Number(data?.revenue?.growth || 0) >= 0 ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{data?.revenue?.growth || 0}% vs last month
                </div>
              ) : (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {data?.revenue?.growth || 0}% vs last month
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Coupons */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Active Coupons
              </CardTitle>
              <Gift className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {formatNumber(data?.coupons?.active || 0)}
            </div>
            <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 mt-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              {formatNumber(data?.coupons?.total || 0)} total created
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Trial Users</span>
              <Badge variant="secondary">{formatNumber(data?.users?.trial || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <Badge variant="default">{formatNumber(data?.users?.active || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">With Credits</span>
              <Badge variant="outline">{formatNumber(data?.users?.withCredits || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">No Credits</span>
              <Badge variant="destructive">{formatNumber(data?.users?.noCredits || 0)}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Content Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Posts</span>
              <Badge variant="secondary">{formatNumber(data?.content?.postsPending || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Posted Today</span>
              <Badge variant="default">{formatNumber(data?.content?.postsToday || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Posted</span>
              <Badge variant="outline">{formatNumber(data?.content?.postsPosted || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Failed Posts</span>
              <Badge variant="destructive">{formatNumber(data?.content?.postsFailed || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Drafts</span>
              <Badge variant="outline">{formatNumber(data?.content?.draftsTotal || 0)}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Last 24 Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Users</span>
              <Badge variant="default">{formatNumber(data?.activity?.recentUsers || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Payments</span>
              <Badge variant="default">{formatNumber(data?.activity?.recentPayments || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Posts</span>
              <Badge variant="default">{formatNumber(data?.activity?.recentPosts || 0)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Plans Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(data?.revenue?.currentMonth || 0)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">This Month</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(data?.revenue?.last30Days || 0)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Last 30 Days</div>
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(data?.revenue?.lastMonth || 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Last Month</div>
            </div>
          </CardContent>
        </Card>

        {/* Plans & Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Plans & Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(data?.plans?.subscription || 0)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Subscription Plans</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatNumber(data?.plans?.credit || 0)}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Credit Plans</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Subscriptions</span>
                <Badge variant="default">{formatNumber(data?.subscriptions?.active || 0)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <Badge variant="destructive">{formatNumber(data?.subscriptions?.cancelled || 0)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">On Trial</span>
                <Badge variant="secondary">{formatNumber(data?.subscriptions?.trial || 0)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
