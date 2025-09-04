"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock } from "lucide-react"
import { formatCredits } from "@/lib/utils"

interface CreditData {
  credits: number
  monthlyCredits: number
  isTrialActive: boolean
  trialEndDate: string
  totalCreditsEver: number
  plan?: string
}

interface CreditDisplayProps {
  compact?: boolean
}

export function CreditDisplay({ compact = false }: CreditDisplayProps) {
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
  }, [session?.user?.email, isClient])

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
          0
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
    <div className={`flex ${compact ? 'flex-row items-center gap-2' : 'flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'}`}>
      {/* Credits Display - Show Total Available Credits */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
          <Badge variant="secondary" className="font-medium text-xs sm:text-sm truncate">
            {formatCredits(totalAvailableCredits)}
          </Badge>
          {creditData.isTrialActive && (
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50 flex-shrink-0">
              Trial
            </Badge>
          )}
        </div>
      </div>

      {/* Trial Status - Only show on larger screens and not in compact mode */}
      {creditData.isTrialActive && !compact && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{daysLeft} days left</span>
        </div>
      )}


    </div>
  )
}
