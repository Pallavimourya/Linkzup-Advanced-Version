"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Clock, CreditCard } from "lucide-react"
import Link from "next/link"
import { formatCredits } from "@/lib/utils"

interface CreditData {
  credits: number
  monthlyCredits: number
  isTrialActive: boolean
  trialEndDate: string
  totalCreditsEver: number
  plan?: string
}

export function CreditDisplay() {
  const { data: session } = useSession()
  const [creditData, setCreditData] = useState<CreditData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchCreditData = async () => {
    try {
      const response = await fetch("/api/billing/credits")
      if (response.ok) {
        const data = await response.json()
        setCreditData(data)
      }
    } catch (error) {
      console.error("Failed to fetch credit data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced fetch to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (session?.user && isClient) {
        setLoading(true)
        fetchCreditData()
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [session?.user?.id, isClient])

  // Function to refresh credits (can be called from other components)
  const refreshCredits = () => {
    fetchCreditData()
  }

  // Expose refresh function globally for other components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshCredits = refreshCredits
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  // Show default state when no data is loaded yet or not on client
  if (!isClient || !creditData) {
    return (
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-500" />
        <Badge variant="secondary" className="font-medium">
          0 credits
        </Badge>
      </div>
    )
  }

  const trialEndDate = creditData ? new Date(creditData.trialEndDate) : null
  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // Calculate total available credits
  const totalAvailableCredits = (creditData?.monthlyCredits || 0) + (creditData?.credits || 0)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      {/* Credits Display - Show Total Available Credits */}
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <Badge variant="secondary" className="font-medium text-xs sm:text-sm">
            {formatCredits(totalAvailableCredits)} credits
          </Badge>
          {creditData.isTrialActive && (
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
              Trial
            </Badge>
          )}
        </div>
      </div>

      {/* Trial Status - Only show on larger screens */}
      {creditData.isTrialActive && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{daysLeft} days left</span>
        </div>
      )}

      {/* Quick Action Button - Responsive */}
      <div className="flex sm:hidden">
        <Button asChild size="sm" variant="outline" className="h-8 px-2 text-xs">
          <Link href="/dashboard/billing">
            <CreditCard className="h-3 w-3 mr-1" />
            Buy
          </Link>
        </Button>
      </div>
      
      <div className="hidden sm:block">
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Buy Credits
          </Link>
        </Button>
      </div>
    </div>
  )
}
