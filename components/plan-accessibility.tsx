"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Crown, Check, X, Zap, CreditCard } from "lucide-react"
import { getPlanAccessibility, PLAN_LIMITS } from "@/lib/credit-utils"

interface UserData {
  credits: number
  plan?: string
  usage?: {
    textOnly: number
    textWithPost: number
    textWithImage: number
    textImagePost: number
    imageOnly: number
    autoPost: number
  }
}

export default function PlanAccessibility() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/billing/credits")
      if (response.ok) {
        const data = await response.json()
        setUserData({
          credits: data.credits || 0,
          plan: data.plan || 'free',
          usage: data.usage || {
            textOnly: 0,
            textWithPost: 0,
            textWithImage: 0,
            textImagePost: 0,
            imageOnly: 0,
            autoPost: 0
          }
        })
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAccessibility = () => {
    if (!userData) return null
    return getPlanAccessibility(userData.plan)
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Plan Accessibility
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

  const accessibility = getAccessibility()
  if (!accessibility || !userData) return null

  const limits = accessibility.limits
  const usage = userData.usage || {
    textOnly: 0,
    textWithPost: 0,
    textWithImage: 0,
    textImagePost: 0,
    imageOnly: 0,
    autoPost: 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Plan Accessibility
        </CardTitle>
        <CardDescription>
          {accessibility.planName} - Usage and Limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Credits */}
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="font-medium">Available Credits</span>
          </div>
          <Badge variant="secondary" className="text-lg">
            {userData.credits} credits
          </Badge>
        </div>

        {/* Usage Limits */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Monthly Usage Limits
          </h4>
          
          <div className="grid gap-4">
            {/* Text Only */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Text Generation Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {usage.textOnly} / {limits.textOnly}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    0.5 credits each
                  </Badge>
                </div>
              </div>
              <Progress 
                value={getUsagePercentage(usage.textOnly, limits.textOnly)} 
                className="h-2"
              />
            </div>

            {/* Text + Post */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Text + Post to LinkedIn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {usage.textWithPost} / {limits.textWithPost}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    1 credit each
                  </Badge>
                </div>
              </div>
              <Progress 
                value={getUsagePercentage(usage.textWithPost, limits.textWithPost)} 
                className="h-2"
              />
            </div>

            {/* Text + Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">Text + Image Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {usage.textWithImage} / {limits.textWithImage}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    1.5 credits each
                  </Badge>
                </div>
              </div>
              <Progress 
                value={getUsagePercentage(usage.textWithImage, limits.textWithImage)} 
                className="h-2"
              />
            </div>

            {/* Text + Image + Post */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">Text + Image + Post</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {usage.textImagePost} / {limits.textImagePost}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    2 credits each
                  </Badge>
                </div>
              </div>
              <Progress 
                value={getUsagePercentage(usage.textImagePost, limits.textImagePost)} 
                className="h-2"
              />
            </div>

            {/* Image Only */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-sm font-medium">Image Generation Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {usage.imageOnly} / {limits.imageOnly}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    1 credit each
                  </Badge>
                </div>
              </div>
              <Progress 
                value={getUsagePercentage(usage.imageOnly, limits.imageOnly)} 
                className="h-2"
              />
            </div>

            {/* Auto Post */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium">Auto-posting Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {usage.autoPost} / {limits.autoPost}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    0.5 credits each
                  </Badge>
                </div>
              </div>
              <Progress 
                value={getUsagePercentage(usage.autoPost, limits.autoPost)} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Plan Features
          </h4>
          
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm">Carousel creation (Free)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm">Scheduling posts (Free)</span>
            </div>
            {accessibility.planName !== 'Free Plan' && (
              <>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Priority support</span>
                </div>
                {accessibility.planName === 'Professional Plan' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm">API access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm">Dedicated account manager</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
