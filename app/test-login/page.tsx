"use client"

import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function TestLoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("admin@linkzup.com")
  const [password, setPassword] = useState("admin4321")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      console.log("Login result:", result)
      
      if (result?.error) {
        alert(`Login failed: ${result.error}`)
      } else {
        alert("Login successful!")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert(`Login error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Status: {status}</Label>
          </div>
          
          {session ? (
            <div className="space-y-2">
              <p><strong>Logged in as:</strong></p>
              <p>ID: {session.user?.id}</p>
              <p>Email: {session.user?.email}</p>
              <p>Name: {session.user?.name}</p>
              <p>Role: {(session.user as any)?.role || "user"}</p>
              <p>Is Admin: {(session.user as any)?.isAdmin ? "Yes" : "No"}</p>
              <Button onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
