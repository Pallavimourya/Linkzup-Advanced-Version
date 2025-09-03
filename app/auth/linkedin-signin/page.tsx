"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { ProgressBar } from "@/components/ui/progress-bar"

function LinkedInSignInContent() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const handleLinkedInSignIn = async () => {
      if (!token) {
        toast({
          title: "Error",
          description: "Invalid sign-in token",
          variant: "destructive",
        })
        router.push('/auth/signin')
        return
      }

      try {
        // Decode the token to get user data
        const userData = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Create a session using NextAuth's signIn with credentials
        const result = await signIn("credentials", {
          email: userData.email,
          password: "", // Empty password for LinkedIn users
          redirect: false,
        })

        if (result?.error) {
          console.error("Sign-in error:", result.error)
          toast({
            title: "Error",
            description: "Failed to create session",
            variant: "destructive",
          })
          router.push('/auth/signin')
        } else {
          toast({
            title: "Success",
            description: "Signed in with LinkedIn successfully",
          })
          // Check if user is admin and redirect accordingly
          if (userData.email?.toLowerCase() === "admin@linkzup.com") {
            router.push('/admin?success=linkedin_signin')
          } else {
            router.push('/dashboard?success=linkedin_signin')
          }
        }
      } catch (error) {
        console.error("Error during LinkedIn sign-in:", error)
        toast({
          title: "Error",
          description: "Failed to complete sign-in",
          variant: "destructive",
        })
        router.push('/auth/signin')
      } finally {
        setIsLoading(false)
      }
    }

    handleLinkedInSignIn()
  }, [token, router])

  return (
    <>
      <ProgressBar 
        isLoading={isLoading}
        title="Completing sign-in..."
        description="Setting up your session"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Completing LinkedIn Sign-In</h1>
          <p className="text-muted-foreground">Please wait while we set up your session...</p>
        </div>
      </div>
    </>
  )
}

export default function LinkedInSignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    }>
      <LinkedInSignInContent />
    </Suspense>
  )
}
