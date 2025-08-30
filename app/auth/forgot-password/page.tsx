"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Sparkles, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Reset email sent",
          description: "Check your Gmail for password reset instructions",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            href="/auth/signin"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>

          <Card className="border-border shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Check Your Gmail</CardTitle>
                <CardDescription>
                  We've sent password reset instructions to {email}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please check your Gmail inbox and follow the instructions to reset your password.
                  The link will expire in 1 hour.
                </p>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setEmail("")
                      setIsSubmitted(false)
                    }}
                  >
                    Send another email
                  </Button>
                  
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProgressBar 
        isLoading={isLoading}
        title="Sending reset email..."
        description="Please wait while we send you the reset link"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            href="/auth/signin"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>

          <Card className="border-border shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
