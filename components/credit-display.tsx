"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Clock, CreditCard } from "lucide-react"
import Link from "next/link"

interface CreditData {
  credits: number
  isTrialActive: boolean
  trialEndDate: string
  totalCreditsEver: number
}

export function CreditDisplay() {
  const { data: session } = useSession()
  const [creditData, setCreditData] = useState<CreditData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCreditData()
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

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const trialEndDate = creditData ? new Date(creditData.trialEndDate) : null
  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="flex items-center gap-3">
      {/* Credits Display */}
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-500" />
        <Badge variant="secondary" className="font-medium">
          {creditData?.credits || 0} credits
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

      {/* Buy Credits Button */}
      {!creditData?.isTrialActive && (creditData?.credits || 0) < 5 && (
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Buy Credits
          </Link>
        </Button>
      )}
    </div>
  )
}
