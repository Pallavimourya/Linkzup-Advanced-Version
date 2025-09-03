"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react"
import { ProgressBar } from "@/components/ui/progress-bar"

export default function LinkedInCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [message, setMessage] = useState("Completing LinkedIn sign-in...")

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        const email = searchParams.get("email")
        const userId = searchParams.get("userId")

        if (!email || !userId) {
          setStatus("error")
          setMessage("Missing required parameters")
          return
        }

        setMessage("Signing you in...")

        const result = await signIn("credentials", {
          email: email,
          password: "linkedin_oauth",
          redirect: false,
        })

        if (result?.error) {
          console.error("LinkedIn sign-in error:", result.error)
          setStatus("error")
          setMessage(`Sign-in failed: ${result.error}`)
          setTimeout(() => {
            router.push("/auth/signin?error=linkedin_signin_failed")
          }, 2000)
        } else {
          setStatus("success")
          setMessage("LinkedIn sign-in successful!")
          setTimeout(() => {
            router.push("/dashboard?success=linkedin_signin")
          }, 1500)
        }
      } catch (error) {
        console.error("LinkedIn callback error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred")
        setTimeout(() => {
          router.push("/auth/signin?error=linkedin_callback_failed")
        }, 2000)
      }
    }

    handleLinkedInCallback()
  }, [searchParams, router])

  return (
    <>
      <ProgressBar
        isLoading={status === "processing"}
        title={message}
        description="Please wait while we complete your LinkedIn sign-in"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto ${
                status === "success"
                  ? "bg-green-100 text-green-600"
                  : status === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-primary text-primary-foreground"
              }`}
            >
              {status === "success" ? (
                <CheckCircle className="w-6 h-6" />
              ) : status === "error" ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">
                {status === "success" ? "Success!" : status === "error" ? "Error" : "Processing..."}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-muted-foreground">{message}</p>
            {status === "processing" && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
