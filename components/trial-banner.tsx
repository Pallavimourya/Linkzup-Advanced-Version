"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Clock, Zap, CreditCard, X, Sparkles, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface TrialData {
  credits: number
  isTrialActive: boolean
  trialEndDate: string
  totalCreditsEver: number
}

export function TrialBanner() {
  const { data: session } = useSession()
  const [trialData, setTrialData] = useState<TrialData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (session?.user && isClient) {
      setLoading(true)
      fetchTrialData()
    }
  }, [session, isClient])

  const fetchTrialData = async () => {
    try {
      const response = await fetch("/api/billing/credits")
      if (response.ok) {
        const data = await response.json()
        setTrialData(data)
      }
    } catch (error) {
      console.error("Failed to fetch trial data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isClient || !trialData || dismissed || loading) {
    return null
  }

  const trialEndDate = trialData ? new Date(trialData.trialEndDate) : null
  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // Show banner if trial is active with credits remaining
  if (trialData.isTrialActive && trialData.credits > 0) {
    return (
      <div className="mb-4 relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Free Trial Active! 🎉</h3>
              <p className="text-sm text-blue-700">
                You have <span className="font-semibold">{trialData.credits} credits</span> remaining and{" "}
                <span className="font-semibold">{daysLeft} days</span> left in your trial.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Link href="/dashboard/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Get More Credits
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show banner if trial is active but no credits
  if (trialData.isTrialActive && trialData.credits === 0) {
    return (
      <div className="mb-4 relative overflow-hidden rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-amber-400/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 animate-pulse">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Trial Credits Exhausted!</h3>
              <p className="text-sm text-orange-700">
                You still have <span className="font-semibold">{daysLeft} days</span> left in your trial, but you need to{" "}
                <span className="font-semibold">purchase credits</span> to continue.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
              <Link href="/dashboard/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Get Credits
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-orange-600 hover:text-orange-800 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show banner if trial expired and no credits
  if (!trialData.isTrialActive && trialData.credits === 0) {
    return (
      <div className="mb-4 relative overflow-hidden rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Trial Period Expired!</h3>
              <p className="text-sm text-red-700">
                Your free trial has ended. <span className="font-semibold">Purchase credits</span> to continue using the service.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
              <Link href="/dashboard/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Get Credits
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
