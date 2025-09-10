"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  Gift, 
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Zap
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminBillingPage() {
  const { data, error, isLoading } = useSWR("/api/admin/billing-analytics", fetcher)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Billing Analytics</h1>
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
        <h1 className="text-3xl font-bold">Billing Analytics</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Failed to load billing analytics</span>
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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive billing insights and conversion metrics</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Conversion Rate */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Conversion Rate
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatPercentage(data?.conversion?.conversionRate || 0)}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
              <Users className="h-3 w-3 mr-1" />
              {formatNumber(data?.conversion?.usersWithSubscriptions || 0)} paid users
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(data?.revenue?.currentMonth || 0)}
            </div>
            <div className="flex items-center text-xs mt-1">
              {Number(data?.revenue?.growth || 0) >= 0 ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{formatPercentage(data?.revenue?.growth || 0)} vs last month
                </div>
              ) : (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {formatPercentage(data?.revenue?.growth || 0)} vs last month
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trial Users */}
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                Trial Users
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {formatNumber(data?.conversion?.trialUsers || 0)}
            </div>
            <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              <Activity className="h-3 w-3 mr-1" />
              {formatPercentage(parseFloat(data?.conversion?.trialToPaidConversion || "0"))} conversion rate
            </div>
          </CardContent>
        </Card>

        {/* Coupon Redemptions */}
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Coupon Usage
              </CardTitle>
              <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatNumber(data?.coupons?.totalRedemptions || 0)}
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              {formatCurrency(data?.coupons?.averageDiscount || 0)} avg discount
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Plan Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.plans?.performance?.map((plan: any, index: number) => (
              <div key={plan._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{plan._id || "Unknown Plan"}</p>
                  <p className="text-sm text-muted-foreground">{plan.count} purchases</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(plan.revenue)}</p>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "Top" : `#${index + 1}`}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Credit Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Credit Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(data?.credits?.totalUsed || 0)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Total Credits Used</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatNumber(Math.round(data?.credits?.averagePerUser || 0))}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Avg per User</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rollover Subscriptions</span>
                <Badge variant="outline">{formatNumber(data?.credits?.rollover?.subscriptionsWithRollover || 0)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Rollover Credits</span>
                <Badge variant="outline">{formatNumber(data?.credits?.rollover?.totalRolloverCredits || 0)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Protection & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fraud Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Fraud Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Multiple Trial Attempts</span>
              <Badge variant={data?.fraud?.riskLevel === "High" ? "destructive" : 
                           data?.fraud?.riskLevel === "Medium" ? "default" : "secondary"}>
                {formatNumber(data?.fraud?.usersWithMultipleTrials || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <Badge variant={data?.fraud?.riskLevel === "High" ? "destructive" : 
                           data?.fraud?.riskLevel === "Medium" ? "default" : "secondary"}>
                {data?.fraud?.riskLevel || "Low"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recent Payments</span>
                <Badge variant="default">{formatNumber(data?.activity?.recentPayments?.length || 0)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Trial Conversions</span>
                <Badge variant="default">{formatNumber(data?.activity?.recentTrialConversions?.length || 0)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupon Performance */}
      {data?.coupons?.usage?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Coupon Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.coupons.usage.map((coupon: any, index: number) => (
                <div key={coupon._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{coupon._id}</p>
                    <p className="text-sm text-muted-foreground">{coupon.count} redemptions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(coupon.totalDiscount)}</p>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {index === 0 ? "Most Used" : `#${index + 1}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
