"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Calendar, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface MonthlyCreditData {
  monthlyCredits: number
  monthlyCreditsResetDate: string
  plan: string
  totalCredits: number
}

export default function MonthlyCreditStatus() {
  const [creditData, setCreditData] = useState<MonthlyCreditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetchMonthlyCredits()
  }, [])

  const fetchMonthlyCredits = async () => {
    try {
      const response = await fetch("/api/credits/monthly-reset")
      if (response.ok) {
        const data = await response.json()
        setCreditData(data)
      }
    } catch (error) {
      console.error("Failed to fetch monthly credits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetMonthlyCredits = async () => {
    setResetting(true)
    try {
      const response = await fetch("/api/credits/monthly-reset", {
        method: "POST",
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success("Monthly credits reset successfully!")
        fetchMonthlyCredits() // Refresh data
      } else {
        toast.error("Failed to reset monthly credits")
      }
    } catch (error) {
      console.error("Reset error:", error)
      toast.error("Failed to reset monthly credits")
    } finally {
      setResetting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDaysUntilReset = () => {
    if (!creditData?.monthlyCreditsResetDate) return 0
    
    const resetDate = new Date(creditData.monthlyCreditsResetDate)
    const nextReset = new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, resetDate.getDate())
    const now = new Date()
    
    const diffTime = nextReset.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  const getPlanMonthlyCredits = (plan: string) => {
    const planCredits: Record<string, number> = {
      'basic': 50,
      'popular': 100,
      'professional': 1000,
      'free': 0
    }
    return planCredits[plan] || 0
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Monthly Credit Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!creditData) return null

  const daysUntilReset = getDaysUntilReset()
  const planMonthlyCredits = getPlanMonthlyCredits(creditData.plan)
  const usagePercentage = planMonthlyCredits > 0 ? ((planMonthlyCredits - creditData.monthlyCredits) / planMonthlyCredits) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Monthly Credit Status
        </CardTitle>
        <CardDescription>
          Your monthly credit allocation and usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Information */}
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">Current Plan</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {creditData.plan} Plan
          </Badge>
        </div>

        {/* Monthly Credits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Credits</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {creditData.monthlyCredits}
              </span>
              <span className="text-sm text-muted-foreground">
                / {planMonthlyCredits}
              </span>
            </div>
          </div>
          
          <Progress value={usagePercentage} className="h-2" />
          
          <div className="text-xs text-muted-foreground">
            {Math.round(usagePercentage)}% used this month
          </div>
        </div>

        {/* Additional Credits */}
        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium">Additional Credits</span>
          </div>
          <Badge variant="secondary" className="text-lg">
            {creditData.totalCredits}
          </Badge>
        </div>

        {/* Total Available */}
        <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium">Total Available</span>
          </div>
          <Badge variant="default" className="text-lg">
            {creditData.monthlyCredits + creditData.totalCredits}
          </Badge>
        </div>

        {/* Reset Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Next Reset</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {creditData.monthlyCreditsResetDate ? formatDate(creditData.monthlyCreditsResetDate) : 'Not set'}
              </span>
            </div>
          </div>

          {daysUntilReset > 0 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg border">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                {daysUntilReset} days until monthly credits reset
              </span>
            </div>
          )}

          {daysUntilReset === 0 && (
            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border">
              <RefreshCw className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Monthly credits can be reset today
              </span>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {creditData.plan !== 'free' && (
          <Button
            onClick={handleResetMonthlyCredits}
            disabled={resetting}
            className="w-full"
            variant="outline"
          >
            {resetting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Monthly Credits
              </>
            )}
          </Button>
        )}

        {/* Info Text */}
        <div className="text-xs text-muted-foreground text-center">
          Monthly credits reset automatically each month. Additional credits never expire.
        </div>
      </CardContent>
    </Card>
  )
}
