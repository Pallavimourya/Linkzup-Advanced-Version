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
  Database,
  Mail,
  MessageSquare,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DebugReplySystemPage() {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [submissionData, setSubmissionData] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>({})
  const { toast } = useToast()

  const checkSystemStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test/reply-system')
      const result = await response.json()
      setSystemStatus(result)
    } catch (error) {
      console.error('Error checking system status:', error)
      toast({
        title: "Error",
        description: "Failed to check system status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkSubmission = async () => {
    if (!submissionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a submission ID",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/test/reply-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType: 'check_submission',
          submissionId: submissionId.trim()
        }),
      })

      const result = await response.json()
      setSubmissionData(result)
    } catch (error) {
      console.error('Error checking submission:', error)
      toast({
        title: "Error",
        description: "Failed to check submission",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runTest = async (testType: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test/reply-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType
        }),
      })

      const result = await response.json()
      setTestResults(prev => ({ ...prev, [testType]: result }))

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `${testType} test passed`,
        })
      } else {
        toast({
          title: "Failed",
          description: result.error || `${testType} test failed`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error running ${testType} test:`, error)
      toast({
        title: "Error",
        description: `Failed to run ${testType} test`,
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
          <h1 className="text-3xl font-bold">Reply System Debug</h1>
          <p className="text-muted-foreground mt-1">Debug and test the reply system</p>
        </div>
        <Button onClick={checkSystemStatus} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Check System Status
        </Button>
      </div>

      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{systemStatus.systemStatus?.totalSubmissions || 0}</div>
                <div className="text-sm text-muted-foreground">Total Submissions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemStatus.systemStatus?.submissionsWithReplies || 0}</div>
                <div className="text-sm text-muted-foreground">With Replies Field</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{systemStatus.systemStatus?.submissionsNeedingMigration || 0}</div>
                <div className="text-sm text-muted-foreground">Need Migration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {systemStatus.systemStatus?.needsMigration ? (
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Migration Status</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Email System:</span>
                <Badge className={getStatusColor(systemStatus.systemStatus?.emailConfigured)}>
                  {systemStatus.systemStatus?.emailConfigured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">WhatsApp System:</span>
                <Badge className={getStatusColor(systemStatus.systemStatus?.whatsappConfigured)}>
                  {systemStatus.systemStatus?.whatsappConfigured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration */}
      {systemStatus?.systemStatus?.needsMigration && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Database Migration Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              {systemStatus.systemStatus.submissionsNeedingMigration} submissions need to be migrated to support replies.
            </p>
            <Button 
              onClick={() => runTest('migrate_schema')} 
              disabled={isLoading}
              variant="destructive"
            >
              <Database className="h-4 w-4 mr-2" />
              Run Migration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Individual Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Check Individual Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter submission ID"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={checkSubmission} disabled={isLoading}>
              Check
            </Button>
          </div>

          {submissionData && (
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Submission Details:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Name: {submissionData.submission?.firstName} {submissionData.submission?.lastName}</div>
                <div>Email: {submissionData.submission?.email}</div>
                <div>Phone: {submissionData.submission?.phone || 'Not provided'}</div>
                <div>Status: {submissionData.submission?.status}</div>
                <div>Has Replies Field: {submissionData.submission?.hasReplies ? 'Yes' : 'No'}</div>
                <div>Reply Count: {submissionData.submission?.replyCount || 0}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Systems */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email System Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test if the email system is working correctly.
            </p>
            <Button 
              onClick={() => runTest('test_email')} 
              disabled={isLoading}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Test Email System
            </Button>
            
            {testResults.test_email && (
              <div className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {testResults.test_email.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">Email Test Result</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {testResults.test_email.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>WhatsApp System Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test if the WhatsApp system is configured correctly.
            </p>
            <Button 
              onClick={() => runTest('test_whatsapp')} 
              disabled={isLoading}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Test WhatsApp Config
            </Button>
            
            {testResults.test_whatsapp && (
              <div className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {testResults.test_whatsapp.configured ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">WhatsApp Config Result</span>
                </div>
                <div className="text-sm space-y-1">
                  <div>API URL: {testResults.test_whatsapp.details?.apiUrl}</div>
                  <div>Access Token: {testResults.test_whatsapp.details?.accessToken}</div>
                  <div>Phone Number ID: {testResults.test_whatsapp.details?.phoneNumberId}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">1. Check System Status</h4>
            <p className="text-sm text-muted-foreground">
              Click "Check System Status" to see overall system health and configuration.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Run Migration (if needed)</h4>
            <p className="text-sm text-muted-foreground">
              If submissions need migration, click "Run Migration" to add missing fields.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. Test Individual Submission</h4>
            <p className="text-sm text-muted-foreground">
              Enter a submission ID to check its schema and reply capabilities.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">4. Test Email/WhatsApp Systems</h4>
            <p className="text-sm text-muted-foreground">
              Run tests to verify email and WhatsApp configurations are working.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
