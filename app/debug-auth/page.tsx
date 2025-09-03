"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function DebugAuthPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTestCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Testing credentials:", { email, hasPassword: !!password })
      
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Sign-in result:", signInResult)
      setResult(signInResult)

      if (signInResult?.error) {
        setError(signInResult.error)
      }
    } catch (err: any) {
      console.error("Test error:", err)
      setError(err.message || "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLinkedInOAuth = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Testing LinkedIn OAuth flow")
      
      const signInResult = await signIn("credentials", {
        email: "techzuperstudio@gmail.com", // Use the email from your error
        password: "linkedin_oauth",
        redirect: false,
      })

      console.log("LinkedIn OAuth result:", signInResult)
      setResult(signInResult)

      if (signInResult?.error) {
        setError(signInResult.error)
      }
    } catch (err: any) {
      console.error("LinkedIn OAuth test error:", err)
      setError(err.message || "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestAdmin = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Testing admin credentials")
      
      const signInResult = await signIn("credentials", {
        email: "admin@linkzup.com",
        password: "admin4321",
        redirect: false,
      })

      console.log("Admin test result:", signInResult)
      setResult(signInResult)

      if (signInResult?.error) {
        setError(signInResult.error)
      }
    } catch (err: any) {
      console.error("Admin test error:", err)
      setError(err.message || "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">🔐 Authentication Debug</h1>
          <p className="text-muted-foreground">Debug authentication issues and test different sign-in methods</p>
        </div>

        {/* Current Session Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={status === "authenticated" ? "default" : "secondary"}>
                  {status}
                </Badge>
              </div>
              
              {session && (
                <div className="space-y-2">
                  <div><strong>User ID:</strong> {session.user?.id}</div>
                  <div><strong>Email:</strong> {session.user?.email}</div>
                  <div><strong>Name:</strong> {session.user?.name}</div>
                  <div><strong>LinkedIn Connected:</strong> {(session.user as any)?.linkedinConnected ? "Yes" : "No"}</div>
                  <div><strong>Google Connected:</strong> {(session.user as any)?.googleConnected ? "Yes" : "No"}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>Test Credentials Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestCredentials} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to test"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to test"
                  required
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Credentials"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleTestAdmin} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test Admin Login (admin@linkzup.com)
              </Button>
              
              <Button 
                onClick={handleTestLinkedInOAuth} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test LinkedIn OAuth Flow (techzuperstudio@gmail.com)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {(result || error) && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <h4 className="font-medium text-red-800 mb-2">Error:</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              {result && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Result:</h4>
                  <pre className="text-sm text-blue-700 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
              <div><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || "Not set"}</div>
              <div><strong>Has Google Client ID:</strong> {process.env.GOOGLE_CLIENT_ID ? "Yes" : "No"}</div>
              <div><strong>Has LinkedIn Client ID:</strong> {process.env.LINKEDIN_CLIENT_ID ? "Yes" : "No"}</div>
              <div><strong>Has NextAuth Secret:</strong> {process.env.NEXTAUTH_SECRET ? "Yes" : "No"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
