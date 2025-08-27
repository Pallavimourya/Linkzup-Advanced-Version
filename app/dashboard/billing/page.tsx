"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Clock, Zap, Star } from "lucide-react"

interface CreditData {
  credits: number
  isTrialActive: boolean
  trialEndDate: string
  totalCreditsEver: number
}

export default function BillingPage() {
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

  const handlePurchaseCredits = async (amount: number, price: number) => {
    // TODO: Integrate with Razorpay payment gateway
    alert(`Purchase ${amount} credits for ₹${price} - Payment integration coming soon!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const trialEndDate = creditData ? new Date(creditData.trialEndDate) : null
  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Credits</h1>
        <p className="text-muted-foreground">Manage your credits and subscription</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available Credits</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {creditData?.credits || 0} credits
            </Badge>
          </div>

          {creditData?.isTrialActive && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Trial Period
              </span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {daysLeft} days left
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Credits Purchased</span>
            <span className="text-sm text-muted-foreground">{creditData?.totalCreditsEver || 0} credits</span>
          </div>
        </CardContent>
      </Card>

      {/* Credit Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Credit Plans</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Starter Pack
                <Badge variant="secondary">₹500</Badge>
              </CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">50 Credits</div>
              <ul className="space-y-2 text-sm">
                <li>• Text generation: 100 posts</li>
                <li>• With posting: 50 posts</li>
                <li>• Image generation: 50 images</li>
                <li>• Valid for 6 months</li>
              </ul>
              <Button onClick={() => handlePurchaseCredits(50, 500)} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Purchase Now
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-blue-200 bg-blue-50/50">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pro Pack
                <Badge variant="secondary">₹1000</Badge>
              </CardTitle>
              <CardDescription>Best value for regular users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">120 Credits</div>
              <ul className="space-y-2 text-sm">
                <li>• Text generation: 240 posts</li>
                <li>• With posting: 120 posts</li>
                <li>• Image generation: 120 images</li>
                <li>• Valid for 12 months</li>
                <li className="text-green-600 font-medium">• 20% bonus credits!</li>
              </ul>
              <Button onClick={() => handlePurchaseCredits(120, 1000)} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Purchase Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Credit Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Guide</CardTitle>
          <CardDescription>How credits are consumed for different actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Content Generation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Text only</span>
                  <Badge variant="outline">0.5 credits</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Text + Post to LinkedIn</span>
                  <Badge variant="outline">1 credit</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Text + Image generation</span>
                  <Badge variant="outline">1.5 credits</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Text + Image + Post</span>
                  <Badge variant="outline">2 credits</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Other Actions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Image generation only</span>
                  <Badge variant="outline">1 credit</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Carousel creation</span>
                  <Badge variant="outline" className="text-green-600">
                    Free
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Scheduling posts</span>
                  <Badge variant="outline" className="text-green-600">
                    Free
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Auto-posting scheduled</span>
                  <Badge variant="outline">0.5 credits</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
