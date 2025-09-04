"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Clock, Zap, Star, Crown, Rocket, Check, Tag, Percent, DollarSign, Calendar, Users } from "lucide-react"
import PaymentModal from "@/components/payment-modal"
import PaymentHistory from "@/components/payment-history"
import SubscriptionManager from "@/components/subscription-manager"
import CreditTransactions from "@/components/credit-transactions"
import PlanAccessibility from "@/components/plan-accessibility"
import MonthlyCreditStatus from "@/components/monthly-credit-status"

interface CreditData {
  credits: number
  monthlyCredits: number
  isTrialActive: boolean
  trialEndDate: string
  totalCreditsEver: number
}

interface SubscriptionPlan {
  id?: string
  _id?: string
  name: string
  price: number
  credits: number
  features: string[]
  popular?: boolean
  recommended?: boolean
}

interface CreditPlan {
  id?: string
  _id?: string
  name: string
  price: number
  credits: number
  features: string[]
  popular?: boolean
}

interface Coupon {
  code: string
  type: "percent" | "fixed"
  value: number
  maxRedemptions: number
  uses: number
  expiresAt: string
  active: boolean
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [creditData, setCreditData] = useState<CreditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    planType: string
    credits: number
    amount: number
  }>({
    isOpen: false,
    planType: "",
    credits: 0,
    amount: 0,
  })

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [creditPlans, setCreditPlans] = useState<CreditPlan[]>([])
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    fetchCreditData()
    fetchPlans()
    fetchCoupons()
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

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans")
      if (res.ok) {
        const data = await res.json()
        setSubscriptionPlans(
          (data.subscriptionPlans || []).map((p: any) => ({
            _id: p._id,
            name: p.name,
            price: p.price,
            credits: p.credits,
            features: p.features || [],
            popular: p.popular,
            recommended: p.recommended,
          })),
        )
        setCreditPlans(
          (data.creditPlans || []).map((p: any) => ({
            _id: p._id,
            name: p.name,
            price: p.price,
            credits: p.credits,
            features: p.features || [],
            popular: p.popular,
          })),
        )
      } else {
        // Fallback to defaults if API fails
        setSubscriptionPlans([
          {
            name: "Basic Plan",
            price: 499,
            credits: 50,
            features: ["50 credits per month"],
            popular: false,
            recommended: false,
          },
          {
            name: "Most Popular",
            price: 799,
            credits: 100,
            features: ["100 credits per month"],
            popular: true,
            recommended: false,
          },
          {
            name: "Professional",
            price: 5999,
            credits: 1000,
            features: ["1000 credits per month"],
            popular: false,
            recommended: true,
          },
        ])
        setCreditPlans([
          { name: "Small Pack", price: 299, credits: 30, features: ["Valid for 12 months"], popular: false },
          { name: "Medium Pack", price: 499, credits: 60, features: ["Valid for 12 months"], popular: true },
          { name: "Large Pack", price: 999, credits: 150, features: ["Valid for 12 months"], popular: false },
        ])
      }
    } catch {
      // ignore
    }
  }

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons")
      if (res.ok) {
        const data = await res.json()
        // Filter only active coupons that haven't expired and haven't reached max redemptions
        const activeCoupons = (data.coupons || []).filter((coupon: Coupon) => {
          const isActive = coupon.active
          const hasNotExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date()
          const hasUsesLeft = coupon.uses < coupon.maxRedemptions
          return isActive && hasNotExpired && hasUsesLeft
        })
        setAvailableCoupons(activeCoupons)
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
    }
  }

  const handlePurchaseCredits = (plan: CreditPlan) => {
    setPaymentModal({
      isOpen: true,
      planType: plan.name,
      credits: plan.credits,
      amount: plan.price,
    })
  }

  const handlePurchaseSubscription = (plan: SubscriptionPlan) => {
    setPaymentModal({
      isOpen: true,
      planType: plan.name,
      credits: plan.credits,
      amount: plan.price,
    })
  }

  const handlePaymentSuccess = (credits: number) => {
    fetchCreditData() // Refresh credit data

    // Also refresh the credit display in the top panel
    if (typeof window !== "undefined" && (window as any).refreshCredits) {
      ;(window as any).refreshCredits()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] p-2 sm:p-6">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const trialEndDate = creditData ? new Date(creditData.trialEndDate) : null
  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen space-y-4 sm:space-y-6 p-2 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Billing & Credits</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your credits and subscription</p>
      </div>

      {/* Trial Information */}
      {creditData?.isTrialActive && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              Free Trial Status
            </CardTitle>
            <CardDescription className="text-blue-700 text-sm sm:text-base">
              You're currently in your free trial period with 10 credits to get started!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <span className="text-sm font-medium text-blue-800">Trial Credits Remaining</span>
              <Badge variant="outline" className="text-base sm:text-lg px-3 py-1 border-blue-300 text-blue-700 w-fit">
                {creditData?.credits || 0} credits
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <span className="text-sm font-medium text-blue-800">Days Left in Trial</span>
              <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                {daysLeft} days left
              </Badge>
            </div>
            <div className="bg-blue-100 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                <strong>What happens after your trial?</strong> Once your trial ends or credits are exhausted, you'll
                need to purchase credits to continue using our AI-powered content generation features.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trial Expired Warning */}
      {!creditData?.isTrialActive && (creditData?.credits || 0) === 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-red-800 text-lg sm:text-xl">
              <Clock className="h-5 w-5 text-red-600 flex-shrink-0" />
              Trial Period Expired
            </CardTitle>
            <CardDescription className="text-red-700 text-sm sm:text-base">
              Your free trial has ended. Purchase credits to continue using our services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                <strong>No credits remaining!</strong> To continue generating AI content, posting to LinkedIn, and using
                all our features, please purchase a credit pack or subscription plan below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <span className="text-sm font-medium">Monthly Credits</span>
            <Badge variant="secondary" className="text-base sm:text-lg px-3 py-1 w-fit">
              {creditData?.monthlyCredits || 0} credits
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <span className="text-sm font-medium">Additional Credits</span>
            <Badge variant="outline" className="text-base sm:text-lg px-3 py-1 w-fit">
              {creditData?.credits || 0} credits
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <span className="text-sm font-medium">Total Available</span>
            <Badge variant="default" className="text-base sm:text-lg px-3 py-1 w-fit">
              {(creditData?.monthlyCredits || 0) + (creditData?.credits || 0)} credits
            </Badge>
          </div>

          {creditData?.isTrialActive && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                Trial Period
              </span>
              <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                {daysLeft} days left
              </Badge>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <span className="text-sm font-medium">Total Credits Purchased</span>
            <span className="text-sm text-muted-foreground">{creditData?.totalCreditsEver || 0} credits</span>
          </div>
        </CardContent>
      </Card>

      {/* Available Coupons */}
      {availableCoupons.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-green-800 text-lg sm:text-xl">
              <Tag className="h-5 w-5 text-green-600 flex-shrink-0" />
              Available Discount Coupons
            </CardTitle>
            <CardDescription className="text-green-700 text-sm sm:text-base">
              Use these coupon codes during checkout to get discounts on your purchase!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availableCoupons.map((coupon) => (
                <div key={coupon.code} className="border border-green-200 rounded-lg p-3 sm:p-4 bg-white/70">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-base sm:text-lg text-green-900">{coupon.code}</span>
                      <Badge variant={coupon.type === 'percent' ? 'default' : 'secondary'} className="text-xs">
                        {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-green-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 flex-shrink-0" />
                      <span>{coupon.maxRedemptions - coupon.uses} uses remaining</span>
                    </div>
                    {coupon.expiresAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 p-3 bg-green-100 rounded text-xs text-green-800">
                    <strong>How to use:</strong> Enter "{coupon.code}" in the coupon field during checkout
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans and Credits */}
      <Tabs defaultValue="subscriptions" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10">
          <TabsTrigger value="subscriptions" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
            <Crown className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Subscription Plans</span>
            <span className="sm:hidden">Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
            <CreditCard className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Credit Packs</span>
            <span className="sm:hidden">Credits</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Choose Your Subscription Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subscriptionPlans.map((plan) => (
                <Card
                  key={plan._id || plan.id}
                  className={`relative ${plan.popular ? "border-blue-200 bg-blue-50/50" : ""} ${plan.recommended ? "border-purple-200 bg-purple-50/50" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white text-xs">
                        <Star className="h-3 w-3 mr-1 flex-shrink-0" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  {plan.recommended && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white text-xs">
                        <Rocket className="h-3 w-3 mr-1 flex-shrink-0" />
                        Recommended
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-base sm:text-lg">
                      {plan.name}
                      <Badge variant="secondary" className="text-xs sm:text-sm w-fit">₹{plan.price}/month</Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Perfect for{" "}
                      {plan.id === "basic"
                        ? "getting started"
                        : plan.id === "popular"
                          ? "regular users"
                          : "enterprise users"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="text-2xl sm:text-3xl font-bold">{plan.credits} Credits</div>
                    <ul className="space-y-3 text-xs sm:text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePurchaseSubscription(plan)}
                      className="w-full min-h-[44px] sm:min-h-[40px]"
                      variant={plan.popular || plan.recommended ? "default" : "outline"}
                    >
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Subscribe Now</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Purchase Credit Packs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {creditPlans.map((plan) => (
                <Card
                  key={plan._id || plan.id}
                  className={`relative ${plan.popular ? "border-blue-200 bg-blue-50/50" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white text-xs">
                        <Star className="h-3 w-3 mr-1 flex-shrink-0" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-base sm:text-lg">
                      {plan.name}
                      <Badge variant="secondary" className="text-xs sm:text-sm w-fit">₹{plan.price}</Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">One-time purchase</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="text-2xl sm:text-3xl font-bold">{plan.credits} Credits</div>
                    <ul className="space-y-3 text-xs sm:text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePurchaseCredits(plan)}
                      className="w-full min-h-[44px] sm:min-h-[40px]"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Purchase Now</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Credit Usage Guide */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Credit Usage Guide</CardTitle>
          <CardDescription className="text-sm sm:text-base">How credits are consumed for different actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-base sm:text-lg">Content Generation</h4>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Text only</span>
                  <Badge variant="outline" className="text-xs w-fit">0.5 credits</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Text + Post to LinkedIn</span>
                  <Badge variant="outline" className="text-xs w-fit">1 credit</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Text + Image generation</span>
                  <Badge variant="outline" className="text-xs w-fit">1.5 credits</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Text + Image + Post</span>
                  <Badge variant="outline" className="text-xs w-fit">2 credits</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-base sm:text-lg">Other Actions</h4>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Image generation only</span>
                  <Badge variant="outline" className="text-xs w-fit">1 credit</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Carousel creation</span>
                  <Badge variant="outline" className="text-green-600 text-xs w-fit">
                    Free
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Scheduling posts</span>
                  <Badge variant="outline" className="text-green-600 text-xs w-fit">
                    Free
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span>Auto-posting scheduled</span>
                  <Badge variant="outline" className="text-xs w-fit">0.5 credits</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Credit Status */}
      <MonthlyCreditStatus />

      {/* Plan Accessibility */}
      <PlanAccessibility />

      {/* Subscription Management */}
      <SubscriptionManager />

      {/* Credit Transactions */}
      <CreditTransactions />

      {/* Payment History */}
      <PaymentHistory />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, planType: "", credits: 0, amount: 0 })}
        planType={paymentModal.planType}
        credits={paymentModal.credits}
        amount={paymentModal.amount}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
