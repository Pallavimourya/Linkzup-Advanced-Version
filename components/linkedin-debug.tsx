"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useLinkedInStatus } from "@/hooks/use-linkedin-status"
import { Bug, RefreshCw } from "lucide-react"

export function LinkedInDebug() {
  const { data: session, update: updateSession } = useSession()
  const { isConnected: isLinkedInConnected, isLoading: isLinkedInLoading, refreshStatus } = useLinkedInStatus()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkLinkedInStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/linkedin/status')
      const data = await response.json()
      setDebugInfo({
        apiStatus: data,
        session: {
          user: session?.user,
          linkedinConnected: (session?.user as any)?.linkedinConnected,
          linkedinId: (session?.user as any)?.linkedinId,
        },
        hookStatus: {
          isConnected: isLinkedInConnected,
          isLoading: isLinkedInLoading,
        }
      })
    } catch (error) {
      setDebugInfo({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAll = async () => {
    await updateSession()
    await refreshStatus()
    await checkLinkedInStatus()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          LinkedIn Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkLinkedInStatus} disabled={isLoading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Check Status
          </Button>
          <Button onClick={refreshAll} variant="outline" size="sm">
            Refresh All
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Badge variant={isLinkedInConnected ? "default" : "destructive"}>
              Hook Status: {isLinkedInConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          <div>
            <Badge variant={isLinkedInLoading ? "secondary" : "outline"}>
              Loading: {isLinkedInLoading ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {debugInfo && (
          <div className="space-y-2">
            <h4 className="font-medium">Debug Information:</h4>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
