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

  useEffect(() => {
    if (session?.user && isClient) {
      setLoading(true)
      fetchCreditData()
    }
  }, [session, isClient])

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
    <div className="flex items-center gap-3">
      {/* Credits Display - Show Total Available Credits */}
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-500" />
        <Badge variant="secondary" className="font-medium">
          {formatCredits(totalAvailableCredits)}
        </Badge>
      </div>

      {/* Trial Status */}
      {creditData?.isTrialActive && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {daysLeft} days trial left
          </Badge>
        </div>
      )}

      {/* Show subscription plan badge if user has a plan */}
      {creditData?.plan && creditData.plan !== 'free' && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {creditData.plan.charAt(0).toUpperCase() + creditData.plan.slice(1)}
          </Badge>
        </div>
      )}

      {/* Trial Expired or Credits Low - Show Buy Credits Button */}
      {((!creditData?.isTrialActive && totalAvailableCredits === 0) || 
        (creditData?.isTrialActive && totalAvailableCredits === 0) ||
        (!creditData?.isTrialActive && totalAvailableCredits < 5)) && (
        <Button asChild size="sm" variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
          <Link href="/dashboard/billing">
            <CreditCard className="h-4 w-4 mr-2" />
            {!creditData?.isTrialActive && totalAvailableCredits === 0 ? 'Get Credits' : 'Buy Credits'}
          </Link>
        </Button>
      )}
    </div>
  )
}
