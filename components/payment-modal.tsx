"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2, CheckCircle, XCircle, Tag } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { isRazorpaySupported, showBrowserCompatibilityError } from "@/lib/browser-utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planType: string
  credits: number
  amount: number
  onSuccess: (credits: number) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentModal({ isOpen, onClose, planType, credits, amount, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed" | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [discountedAmount, setDiscountedAmount] = useState<number | null>(null)
  const effectiveAmount = discountedAmount ?? amount

  useEffect(() => {
    const checkRazorpay = () => {
      if (typeof window !== "undefined" && window.Razorpay) {
        setRazorpayLoaded(true)
      } else {
        setTimeout(checkRazorpay, 100)
      }
    }

    checkRazorpay()

    const handleScriptLoad = () => {
      if (typeof window !== "undefined" && window.Razorpay) {
        setRazorpayLoaded(true)
      }
    }

    const script = document.querySelector('script[src*="razorpay"]')
    if (script) {
      script.addEventListener("load", handleScriptLoad)
    }

    return () => {
      if (script) {
        script.removeEventListener("load", handleScriptLoad)
      }
    }
  }, [])

  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode)}&amount=${amount}`)
      const data = await res.json()
      if (data.valid) {
        setDiscountedAmount(data.discountedAmount)
        toast.success(`Coupon applied! New total ₹${data.discountedAmount}`)
      } else {
        setDiscountedAmount(null)
        toast.error("Invalid or expired coupon")
      }
    } catch {
      setDiscountedAmount(null)
      toast.error("Failed to validate coupon")
    }
  }

  const handlePayment = async () => {
    // Check browser compatibility first
    if (!isRazorpaySupported()) {
      showBrowserCompatibilityError()
      return
    }

    setLoading(true)
    setPaymentStatus("pending")
    try {
      onClose()
      await new Promise((r) => setTimeout(r, 150))

      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          credits,
          amount: effectiveAmount,
          couponCode: couponCode || undefined,
        }),
      })

      if (!orderResponse.ok) throw new Error("Failed to create order")
      const orderData = await orderResponse.json()

      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment system is not available. Please try using a different browser or check your internet connection.")
        setLoading(false)
        setPaymentStatus("failed")
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Linkzup",
        description: `${planType} - ${credits} Credits`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            if (!verifyResponse.ok) throw new Error("Payment verification failed")
            const verifyData = await verifyResponse.json()
            if (verifyData.success) {
              setPaymentStatus("success")
              toast.success(`Payment successful! ${credits} credits added to your account.`)
              onSuccess(credits)
              if (typeof window !== "undefined" && (window as any).refreshCredits) {
                ;(window as any).refreshCredits()
              }
              setTimeout(() => {
                onClose()
                setPaymentStatus(null)
              }, 2000)
            } else {
              throw new Error(verifyData.error || "Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            setPaymentStatus("failed")
            toast.error("Payment verification failed. Please contact support.")
          }
        },
        theme: { color: "#3B82F6" },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setPaymentStatus(null)
          },
        },
        notes: {
          coupon_applied: couponCode || "",
          original_amount: amount.toString(),
          discounted_amount: String(effectiveAmount),
        },
      }

      const razorpay = new window.Razorpay(options)
      setTimeout(() => {
        try {
          razorpay.open()
          setLoading(false)
        } catch (openError) {
          console.error("Razorpay open error:", openError)
          toast.error("Failed to open payment form. Please try again.")
          setLoading(false)
          setPaymentStatus("failed")
        }
      }, 100)
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Purchase {credits} credits for ₹{effectiveAmount}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Details */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{planType}</span>
              <Badge variant="secondary">₹{effectiveAmount}</Badge>
            </div>
            <div className="text-2xl font-bold text-primary">{credits} Credits</div>
            {discountedAmount !== null && discountedAmount !== amount && (
              <div className="text-sm text-green-600 mt-1">Discount applied! You saved ₹{amount - effectiveAmount}</div>
            )}
          </div>

          {/* Coupon */}
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <Button type="button" variant="outline" onClick={validateCoupon}>
              <Tag className="h-4 w-4 mr-2" /> Apply
            </Button>
          </div>

          {/* Payment Status */}
          {paymentStatus && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              {paymentStatus === "pending" ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : null}
              {paymentStatus === "success" ? <CheckCircle className="h-6 w-6 text-green-600" /> : null}
              {paymentStatus === "failed" ? <XCircle className="h-6 w-6 text-red-600" /> : null}
              <span className="font-medium">
                {paymentStatus === "pending"
                  ? "Processing payment..."
                  : paymentStatus === "success"
                    ? "Payment successful!"
                    : "Payment failed"}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading || paymentStatus === "pending"}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={paymentStatus === "pending" || !razorpayLoaded}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₹{effectiveAmount}
                </>
              )}
            </Button>
          </div>

          {/* Browser Compatibility Warning */}
          {!isRazorpaySupported() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="font-medium">⚠️ Browser Compatibility</span>
              </div>
              <p className="text-yellow-700 mt-1">
                Your browser may not support secure payments. Please try using Chrome, Firefox, Safari, or Edge.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>💡 Click "Pay ₹{effectiveAmount}" to open the secure payment form</p>
            <p>🔒 Your payment is secured by Razorpay. We never store your payment information.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
