"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DebugSessionPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const checkSession = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/session')
      const result = await response.json()
      setSessionData(result)
    } catch (error) {
      console.error('Error checking session:', error)
      toast({
        title: "Error",
        description: "Failed to check session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getStatusColor = (status: boolean) => {
    return status 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Debug</h1>
          <p className="text-muted-foreground mt-1">Debug admin session and authentication</p>
        </div>
        <Button onClick={checkSession} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Check Session
        </Button>
      </div>

      {/* Session Status */}
      {sessionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(sessionData.session?.hasSession)}
              <span>Session Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Has Session:</span>
                <Badge className={getStatusColor(sessionData.session?.hasSession)}>
                  {sessionData.session?.hasSession ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Is Admin:</span>
                <Badge className={getStatusColor(sessionData.session?.isAdmin)}>
                  {sessionData.session?.isAdmin ? 'Yes' : 'No'}
                </Badge>
              </div>

              {sessionData.session?.user && (
                <div className="space-y-2">
                  <h4 className="font-medium">User Information:</h4>
                  <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                    <div><strong>Email:</strong> {sessionData.session.user.email}</div>
                    <div><strong>Name:</strong> {sessionData.session.user.name}</div>
                    <div><strong>ID:</strong> {sessionData.session.user.id}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Valid Admin Emails:</h4>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  {sessionData.adminEmails?.map((email: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span>{email}</span>
                      {sessionData.session?.user?.email === email && (
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {sessionData.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Fix Authentication Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">1. Check Session Status</h4>
            <p className="text-sm text-muted-foreground">
              Click "Check Session" to see your current authentication status.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. If No Session Found</h4>
            <p className="text-sm text-muted-foreground">
              You need to login as admin. Use these credentials:
            </p>
            <div className="bg-muted p-3 rounded-lg text-sm mt-2">
              <div><strong>Email:</strong> admin@linkzup.com</div>
              <div><strong>Password:</strong> admin4321</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. If Session Found but Not Admin</h4>
            <p className="text-sm text-muted-foreground">
              Your email must be admin@linkzup.com or admin@linkzup.in to access admin features.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">4. After Login</h4>
            <p className="text-sm text-muted-foreground">
              Once properly authenticated as admin, the reply system should work.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
