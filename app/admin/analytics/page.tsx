"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  Clock,
  Target,
  PieChart,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  Download,
  RefreshCw
} from "lucide-react"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Simple Chart Component
const SimpleChart = ({ data, title, color = "blue" }: { data: any[], title: string, color?: string }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value || 0))
  const minHeight = 20

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex items-end space-x-1 h-32">
        {data.slice(-7).map((item, index) => {
          const height = maxValue > 0 ? Math.max((item.value / maxValue) * 100, minHeight) : minHeight
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t bg-${color}-500/20 border border-${color}-300 dark:border-${color}-600`}
                style={{ height: `${height}%` }}
              >
                <div className={`h-full bg-${color}-500 rounded-t`}></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {item.label || item.date?.slice(-2) || index + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "blue",
  format = "number" 
}: {
  title: string
  value: number | string
  change?: number
  icon: any
  color?: string
  format?: "number" | "currency" | "percentage"
}) => {
  const formatValue = (val: number | string) => {
    if (format === "currency") {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(val))
    }
    if (format === "percentage") {
      return `${val}%`
    }
    return new Intl.NumberFormat('en-IN').format(Number(val))
  }

  return (
    <Card className={`border-${color}-200 bg-${color}-50 dark:bg-${color}-950/20 dark:border-${color}-800`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-medium text-${color}-700 dark:text-${color}-400`}>
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${color}-900 dark:text-${color}-100`}>
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <div className="flex items-center text-xs mt-1">
            {change >= 0 ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{change}% from last period
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <TrendingDown className="h-3 w-3 mr-1" />
                {change}% from last period
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminAnalyticsPage() {
  const { data: summaryData } = useSWR("/api/admin/analytics/summary", fetcher)
  const { data: detailedData, error, isLoading } = useSWR("/api/admin/analytics/detailed", fetcher)
  const [activeTab, setActiveTab] = useState("overview")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
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
        <h1 className="text-3xl font-bold">Analytics</h1>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={summaryData?.users?.total || 0}
          change={detailedData?.metrics?.conversionRate}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Monthly Revenue"
          value={summaryData?.revenue?.currentMonth || 0}
          change={summaryData?.revenue?.growth}
          icon={DollarSign}
          color="green"
          format="currency"
        />
        <MetricCard
          title="Conversion Rate"
          value={detailedData?.metrics?.conversionRate || 0}
          icon={Target}
          color="purple"
          format="percentage"
        />
        <MetricCard
          title="ARPU"
          value={detailedData?.metrics?.arpu || 0}
          icon={BarChart3}
          color="orange"
          format="currency"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Growth (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart 
                  data={detailedData?.userGrowth?.slice(-7).map((item: any) => ({
                    label: item.date,
                    value: item.users
                  })) || []}
                  title="New Users"
                  color="blue"
                />
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Revenue Trends (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart 
                  data={detailedData?.revenueTrends?.slice(-7).map((item: any) => ({
                    label: item.date,
                    value: item.revenue
                  })) || []}
                  title="Daily Revenue"
                  color="green"
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity (Last 24 Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {detailedData?.recentActivity?.newUsers24h || 0}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">New Users</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {detailedData?.recentActivity?.newPayments24h || 0}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">New Payments</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {detailedData?.recentActivity?.newPosts24h || 0}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">New Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Activity by Hour */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  User Activity by Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart 
                  data={detailedData?.hourlyActivity?.map((item: any) => ({
                    label: `${item.hour}:00`,
                    value: item.activity
                  })) || []}
                  title="Activity Level"
                  color="orange"
                />
              </CardContent>
            </Card>

            {/* Top Performing Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Top Performing Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedData?.topPlans?.map((plan: any, index: number) => (
                    <div key={plan._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">{plan._id || 'Unknown'}</span>
                      </div>
                      <Badge variant="outline">{plan.count} users</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Content Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedData?.contentStats?.map((stat: any) => (
                    <div key={stat._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stat._id === 'posted' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {stat._id === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                        {stat._id === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm font-medium capitalize">{stat._id}</span>
                      </div>
                      <Badge variant="outline">{stat.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <Badge variant="default">{detailedData?.metrics?.conversionRate || 0}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ARPU</span>
                  <Badge variant="default">{formatCurrency(detailedData?.metrics?.arpu || 0)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Churn Rate</span>
                  <Badge variant="destructive">{detailedData?.metrics?.churnRate || 0}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedData?.userLocations?.slice(0, 5).map((location: any) => (
                    <div key={location._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{location._id || 'Unknown'}</span>
                      <Badge variant="outline">{location.count} users</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span className="text-sm font-medium">Export Report</span>
                    </div>
                  </button>
                  <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">View Detailed Report</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
