"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  Clock, 
  Zap, 
  Star, 
  Crown, 
  Rocket, 
  Check, 
  Tag, 
  Percent, 
  DollarSign, 
  Calendar, 
  Users,
  TrendingUp,
  Shield,
  Gift,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Target,
  Globe,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react"
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
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[400px]">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="text-gray-600">Loading billing information...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  const trialEndDate = creditData ? new Date(creditData.trialEndDate) : null
  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
        {/* Enhanced Header */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                Billing & Credits
              </h1>
              <p className="text-sm text-gray-600">Manage your credits and subscription</p>
            </div>
          </div>
        </motion.div>

        {/* Trial Information */}
        {creditData?.isTrialActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-3 text-blue-800 text-lg sm:text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  Free Trial Status
                </CardTitle>
                <CardDescription className="text-blue-700 text-sm sm:text-base">
                  You're currently in your free trial period with 10 credits to get started!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <span className="text-sm font-medium text-blue-800">Trial Credits Remaining</span>
                    <Badge className="text-base sm:text-lg px-3 py-1 bg-blue-100 text-blue-800 border-blue-200">
                      {creditData?.credits || 0} credits
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <span className="text-sm font-medium text-blue-800">Days Left in Trial</span>
                    <Badge className="text-green-600 bg-green-100 border-green-200">
                      {daysLeft} days left
                    </Badge>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>What happens after your trial?</strong> Once your trial ends or credits are exhausted, you'll
                    need to purchase credits to continue using our AI-powered content generation features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Trial Expired Warning */}
        {!creditData?.isTrialActive && (creditData?.credits || 0) === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-3 text-red-800 text-lg sm:text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  Trial Period Expired
                </CardTitle>
                <CardDescription className="text-red-700 text-sm sm:text-base">
                  Your free trial has ended. Purchase credits to continue using our services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <p className="text-sm text-red-800 leading-relaxed">
                    <strong>No credits remaining!</strong> To continue generating AI content, posting to LinkedIn, and using
                    all our features, please purchase a credit pack or subscription plan below.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-yellow-600" />
                </div>
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span className="text-sm font-medium">Monthly Credits</span>
                  <Badge className="text-base sm:text-lg px-3 py-1 bg-blue-100 text-blue-800">
                    {creditData?.monthlyCredits || 0} credits
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span className="text-sm font-medium">Additional Credits</span>
                  <Badge className="text-base sm:text-lg px-3 py-1 bg-green-100 text-green-800">
                    {creditData?.credits || 0} credits
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span className="text-sm font-medium">Total Available</span>
                  <Badge className="text-base sm:text-lg px-3 py-1 bg-purple-100 text-purple-800">
                    {(creditData?.monthlyCredits || 0) + (creditData?.credits || 0)} credits
                  </Badge>
                </div>
                {creditData?.isTrialActive && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      Trial Period
                    </span>
                    <Badge className="text-green-600 bg-green-100 border-green-200">
                      {daysLeft} days left
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200">
                <span className="text-sm font-medium">Total Credits Purchased</span>
                <span className="text-sm text-gray-600">{creditData?.totalCreditsEver || 0} credits</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Coupons */}
        {availableCoupons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-3 text-green-800 text-lg sm:text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Gift className="h-4 w-4 text-green-600" />
                  </div>
                  Available Discount Coupons
                </CardTitle>
                <CardDescription className="text-green-700 text-sm sm:text-base">
                  Use these coupon codes during checkout to get discounts on your purchase!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {availableCoupons.map((coupon, index) => (
                    <motion.div
                      key={coupon.code}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="border border-green-200 rounded-xl p-4 bg-white/70 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-base sm:text-lg text-green-900">{coupon.code}</span>
                          <Badge className={`text-xs ${coupon.type === 'percent' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>
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
                      
                      <div className="mt-3 p-3 bg-green-100 rounded-lg text-xs text-green-800">
                        <strong>How to use:</strong> Enter "{coupon.code}" in the coupon field during checkout
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plans and Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Tabs defaultValue="subscriptions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="subscriptions" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Subscription Plans</span>
                <span className="sm:hidden">Subscriptions</span>
              </TabsTrigger>
              <TabsTrigger value="credits" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Credit Packs</span>
                <span className="sm:hidden">Credits</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subscriptions" className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Crown className="h-4 w-4 text-blue-600" />
                  </div>
                  Choose Your Subscription Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan, index) => (
                    <motion.div
                      key={plan._id || plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                    >
                      <Card className={`relative h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                        plan.popular ? "border-l-4 border-l-blue-500" : plan.recommended ? "border-l-4 border-l-purple-500" : ""
                      }`}>
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs shadow-lg">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        {plan.recommended && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs shadow-lg">
                              <Rocket className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-base sm:text-lg">
                            {plan.name}
                            <Badge className="text-xs sm:text-sm w-fit bg-gray-100 text-gray-800">₹{plan.price}/month</Badge>
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
                          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {plan.credits} Credits
                          </div>
                          <ul className="space-y-3 text-xs sm:text-sm">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={() => handlePurchaseSubscription(plan)}
                              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              variant={plan.popular || plan.recommended ? "default" : "outline"}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              <span className="text-sm sm:text-base">Subscribe Now</span>
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="credits" className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  Purchase Credit Packs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creditPlans.map((plan, index) => (
                    <motion.div
                      key={plan._id || plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                    >
                      <Card className={`relative h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                        plan.popular ? "border-l-4 border-l-green-500" : ""
                      }`}>
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs shadow-lg">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-base sm:text-lg">
                            {plan.name}
                            <Badge className="text-xs sm:text-sm w-fit bg-gray-100 text-gray-800">₹{plan.price}</Badge>
                          </CardTitle>
                          <CardDescription className="text-sm">One-time purchase</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            {plan.credits} Credits
                          </div>
                          <ul className="space-y-3 text-xs sm:text-sm">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={() => handlePurchaseCredits(plan)}
                              className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              variant={plan.popular ? "default" : "outline"}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              <span className="text-sm sm:text-base">Purchase Now</span>
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Credit Usage Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-purple-600" />
                </div>
                Credit Usage Guide
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">How credits are consumed for different actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-base sm:text-lg flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Content Generation
                  </h4>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Text only</span>
                      <Badge className="text-xs w-fit bg-blue-100 text-blue-800">0.5 credits</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Text + Post to LinkedIn</span>
                      <Badge className="text-xs w-fit bg-green-100 text-green-800">1 credit</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Text + Image generation</span>
                      <Badge className="text-xs w-fit bg-purple-100 text-purple-800">1.5 credits</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Text + Image + Post</span>
                      <Badge className="text-xs w-fit bg-orange-100 text-orange-800">2 credits</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-base sm:text-lg flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    Other Actions
                  </h4>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Image generation only</span>
                      <Badge className="text-xs w-fit bg-blue-100 text-blue-800">1 credit</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Carousel creation</span>
                      <Badge className="text-xs w-fit bg-green-100 text-green-800">
                        Free
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Scheduling posts</span>
                      <Badge className="text-xs w-fit bg-green-100 text-green-800">
                        Free
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <span>Auto-posting scheduled</span>
                      <Badge className="text-xs w-fit bg-purple-100 text-purple-800">0.5 credits</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
    </div>
  )
}