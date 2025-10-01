"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TestWhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const { toast } = useToast()

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/test/whatsapp')
      const result = await response.json()
      setConfigStatus(result)
    } catch (error) {
      console.error('Error checking configuration:', error)
      toast({
        title: "Error",
        description: "Failed to check WhatsApp configuration",
        variant: "destructive",
      })
    }
  }

  const sendTestMessage = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter both phone number and message",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          message: message.trim()
        }),
      })

      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        toast({
          title: "Success!",
          description: "WhatsApp message sent successfully",
        })
      } else {
        toast({
          title: "Failed",
          description: result.message || "Failed to send WhatsApp message",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error sending test message:', error)
      toast({
        title: "Error",
        description: "Failed to send test message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
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
          <h1 className="text-3xl font-bold">WhatsApp Integration Test</h1>
          <p className="text-muted-foreground mt-1">Test WhatsApp Business API integration</p>
        </div>
        <Button onClick={checkConfiguration} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Check Configuration
        </Button>
      </div>

      {/* Configuration Status */}
      {configStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getConfigStatusIcon(configStatus.configured)}
              <span>Configuration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">WhatsApp API Status:</span>
                <Badge className={getConfigStatusColor(configStatus.configured)}>
                  {configStatus.configured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>API URL:</span>
                  <span className="text-muted-foreground">{configStatus.details?.apiUrl}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Access Token:</span>
                  <span className="text-muted-foreground">{configStatus.details?.accessToken}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Phone Number ID:</span>
                  <span className="text-muted-foreground">{configStatus.details?.phoneNumberId}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {configStatus.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Message Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Send Test Message</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              placeholder="Enter phone number (e.g., +91XXXXXXXXXX or 91XXXXXXXXXX)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Include country code. For India, use +91 or 91 prefix.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Message</label>
            <Textarea
              placeholder="Enter your test message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} characters
            </p>
          </div>

          <Button 
            onClick={sendTestMessage} 
            disabled={isSending || !phoneNumber.trim() || !message.trim()}
            className="w-full"
          >
            {isSending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Result */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Test Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <div className="flex items-center space-x-2">
                  <Badge className={testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {testResult.success ? 'Success' : 'Failed'}
                  </Badge>
                  {testResult.details?.isDummy && (
                    <Badge className="bg-yellow-100 text-yellow-800">Dummy Mode</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Message:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {testResult.message}
                </p>
                {testResult.details?.isDummy && (
                  <p className="text-sm text-yellow-600 mt-2 font-medium">
                    ⚠️ Using dummy credentials - message was simulated, not actually sent
                  </p>
                )}
              </div>

              {testResult.details && (
                <div>
                  <span className="font-medium">Details:</span>
                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">1. WhatsApp Business API Setup</h4>
            <p className="text-sm text-muted-foreground">
              Follow the setup guide in <code>WHATSAPP_INTEGRATION_SETUP.md</code>
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Environment Variables</h4>
            <p className="text-sm text-muted-foreground">
              Add these to your <code>.env.local</code> file:
            </p>
            <pre className="text-xs bg-muted p-3 rounded mt-1">
{`WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your-access-token-here
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id-here`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. Test the Integration</h4>
            <p className="text-sm text-muted-foreground">
              Use this page to test WhatsApp message sending before using it in production.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
