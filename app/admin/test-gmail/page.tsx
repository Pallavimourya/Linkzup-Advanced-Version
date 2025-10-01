"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  AlertTriangle,
  RefreshCw,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TestGmailPage() {
  const [gmailConfig, setGmailConfig] = useState<any>(null)
  const [testEmail, setTestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const { toast } = useToast()

  const checkGmailConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test/gmail-config')
      const result = await response.json()
      setGmailConfig(result)
    } catch (error) {
      console.error('Error checking Gmail config:', error)
      toast({
        title: "Error",
        description: "Failed to check Gmail configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test/gmail-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: testEmail.trim()
        }),
      })

      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Test email sent to ${testEmail}`,
        })
      } else {
        toast({
          title: "Failed",
          description: result.message || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getConfigStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getConfigStatusColor = (configured: boolean) => {
    return configured 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gmail Configuration Test</h1>
          <p className="text-muted-foreground mt-1">Test and verify Gmail email system</p>
        </div>
        <Button onClick={checkGmailConfig} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Check Gmail Config
        </Button>
      </div>

      {/* Gmail Configuration Status */}
      {gmailConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getConfigStatusIcon(gmailConfig.configured)}
              <span>Gmail Configuration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Gmail Status:</span>
                <Badge className={getConfigStatusColor(gmailConfig.configured)}>
                  {gmailConfig.configured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Gmail User:</span>
                  <span className="text-muted-foreground">{gmailConfig.details?.gmailUser}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Gmail App Password:</span>
                  <span className="text-muted-foreground">{gmailConfig.details?.gmailAppPassword}</span>
                </div>
                {gmailConfig.details?.gmailUserValue && gmailConfig.details.gmailUserValue !== 'Not configured' && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Gmail Address:</span>
                    <span className="text-muted-foreground">{gmailConfig.details.gmailUserValue}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {gmailConfig.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Instructions */}
      {gmailConfig && !gmailConfig.configured && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Gmail Configuration Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600">
              Gmail is not configured. Please set up the following environment variables:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Environment Variables to Set:</h4>
              <pre className="text-sm">
{`GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password`}
              </pre>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Setup Steps:</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Enable 2-Factor Authentication on your Gmail account</li>
                <li>Generate an App Password:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Go to Google Account settings → Security</li>
                    <li>Under "2-Step Verification", click "App passwords"</li>
                    <li>Select "Mail" and "Other"</li>
                    <li>Name it "LinkzUp Email System"</li>
                    <li>Copy the 16-character password</li>
                  </ul>
                </li>
                <li>Add the credentials to your environment variables</li>
                <li>Restart your application</li>
                <li>Test the configuration using this page</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Email */}
      {gmailConfig?.configured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Send Test Email</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a test email to verify that the Gmail system is working correctly.
            </p>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address to send test email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
                type="email"
              />
              <Button 
                onClick={sendTestEmail} 
                disabled={isLoading || !testEmail.trim()}
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">Test Result</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {testResult.message}
                </p>
                {testResult.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">View Details</summary>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use This Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">1. Check Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Click "Check Gmail Config" to see if Gmail is properly configured.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Set Up Gmail (if needed)</h4>
            <p className="text-sm text-muted-foreground">
              If Gmail is not configured, follow the setup instructions above.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. Send Test Email</h4>
            <p className="text-sm text-muted-foreground">
              Once configured, send a test email to verify everything is working.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">4. Use Reply System</h4>
            <p className="text-sm text-muted-foreground">
              After successful testing, you can use the reply system in Contact Submissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
