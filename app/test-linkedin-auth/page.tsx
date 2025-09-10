"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"

interface ConfigStatus {
  linkedinClientId: string
  linkedinClientSecret: string
  nextAuthUrl: string
  nextAuthSecret: string
  environment: string
  callbackUrl: string
  productionUrl: string
  productionCallbackUrl: string
}

interface TestResponse {
  message: string
  config: ConfigStatus
  isProduction: boolean
  instructions: {
    linkedinConsole: string
    addRedirectUri: string
    verifyEnvVars: string
    currentCallbackUrl: string
    requiredCallbackUrl: string
  }
  troubleshooting: {
    redirectUriMismatch: string
    invalidClient: string
    unauthorized: string
  }
}

export default function TestLinkedInAuth() {
  const [config, setConfig] = useState<TestResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConfig()
  }, [])

  const checkConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test-linkedin-config')
      const data = await response.json()
      setConfig(data)
    } catch (err) {
      setError('Failed to check configuration')
    } finally {
      setLoading(false)
    }
  }

  const testLinkedInConnection = async () => {
    try {
      const response = await fetch('/api/linkedin/connect?signin=true')
      const data = await response.json()
      
      if (data.success && data.authUrl) {
        window.open(data.authUrl, '_blank')
      } else {
        alert('Failed to generate LinkedIn auth URL')
      }
    } catch (err) {
      alert('Error testing LinkedIn connection')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn OAuth Configuration Test</CardTitle>
            <CardDescription>Checking configuration...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!config) return null

  const isConfigValid = config.config.linkedinClientId.includes('✅') && 
                       config.config.linkedinClientSecret.includes('✅') &&
                       config.config.nextAuthUrl !== '❌ Missing'

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            LinkedIn OAuth Configuration Test
            <Badge variant={isConfigValid ? "default" : "destructive"}>
              {isConfigValid ? "Ready" : "Needs Configuration"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Test and verify your LinkedIn OAuth setup for the LinkZup application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Environment Variables</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {config.config.linkedinClientId.includes('✅') ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  LinkedIn Client ID: {config.config.linkedinClientId}
                </div>
                <div className="flex items-center gap-2">
                  {config.config.linkedinClientSecret.includes('✅') ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  LinkedIn Client Secret: {config.config.linkedinClientSecret}
                </div>
                <div className="flex items-center gap-2">
                  {config.config.nextAuthUrl !== '❌ Missing' ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  NextAuth URL: {config.config.nextAuthUrl}
                </div>
                <div className="flex items-center gap-2">
                  {config.config.nextAuthSecret.includes('✅') ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  NextAuth Secret: {config.config.nextAuthSecret}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Callback URLs</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Current:</strong> {config.config.callbackUrl}
                </div>
                <div>
                  <strong>Required:</strong> {config.config.productionCallbackUrl}
                </div>
                <div>
                  <strong>Environment:</strong> {config.config.environment}
                </div>
                <div>
                  <strong>Production:</strong> {config.isProduction ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>

          {!isConfigValid && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Your LinkedIn OAuth configuration needs to be updated:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      LinkedIn Developers <ExternalLink className="h-3 w-3" />
                    </a></li>
                    <li>Find your LinkZup app and click on it</li>
                    <li>Go to the "Auth" tab</li>
                    <li>In "OAuth 2.0 settings", add this redirect URL:</li>
                    <li className="font-mono bg-gray-100 p-2 rounded text-xs">
                      {config.config.productionCallbackUrl}
                    </li>
                    <li>Click "Update" to save changes</li>
                    <li>Make sure all environment variables are set in Vercel</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={checkConfig} variant="outline">
              Refresh Configuration
            </Button>
            <Button onClick={testLinkedInConnection} disabled={!isConfigValid}>
              Test LinkedIn Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Common issues and solutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">"redirect_uri does not match the registered value"</h4>
            <p className="text-sm text-gray-600">{config.troubleshooting.redirectUriMismatch}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">"invalid_client"</h4>
            <p className="text-sm text-gray-600">{config.troubleshooting.invalidClient}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">"Unauthorized" error</h4>
            <p className="text-sm text-gray-600">{config.troubleshooting.unauthorized}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
