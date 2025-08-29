"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Crown, Calendar, CreditCard, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Subscription {
  _id: string
  planType: string
  status: "active" | "cancelled" | "expired"
  startDate: string
  endDate: string
  nextBillingDate: string
  amount: number
  credits: number
}

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/current")
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      })
      
      if (response.ok) {
        toast.success("Subscription cancelled successfully")
        fetchSubscription() // Refresh subscription data
      } else {
        toast.error("Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Cancel subscription error:", error)
      toast.error("Failed to cancel subscription")
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/reactivate", {
        method: "POST",
      })
      
      if (response.ok) {
        toast.success("Subscription reactivated successfully")
        fetchSubscription() // Refresh subscription data
      } else {
        toast.error("Failed to reactivate subscription")
      }
    } catch (error) {
      console.error("Reactivate subscription error:", error)
      toast.error("Failed to reactivate subscription")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
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

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active subscription</p>
            <p className="text-sm">Subscribe to a plan to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Current Subscription
        </CardTitle>
        <CardDescription>Manage your subscription settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Plan</span>
          <Badge variant="outline">{subscription.planType}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Status</span>
          {getStatusBadge(subscription.status)}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Monthly Credits</span>
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4 text-blue-600" />
            {subscription.credits}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Monthly Amount</span>
          <span className="font-medium">₹{subscription.amount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Started</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formatDate(subscription.startDate)}
          </div>
        </div>

        {subscription.status === "active" && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Next Billing</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(subscription.nextBillingDate)}
            </div>
          </div>
        )}

        {subscription.status === "cancelled" && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Ends On</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(subscription.endDate)}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {subscription.status === "active" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {subscription.status === "cancelled" && (
            <Button onClick={handleReactivateSubscription} className="flex-1">
              <Crown className="h-4 w-4 mr-2" />
              Reactivate Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
