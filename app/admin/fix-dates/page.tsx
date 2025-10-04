"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

export default function FixDatesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activityResult, setActivityResult] = useState<any>(null)

  const checkInvalidDates = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/fix-user-dates")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to check dates")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const fixInvalidDates = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/fix-user-dates", {
        method: "POST"
      })
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to fix dates")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const checkActivityInfo = async () => {
    setIsLoading(true)
    setError(null)
    setActivityResult(null)

    try {
      const response = await fetch("/api/admin/fix-user-activity")
      const data = await response.json()

      if (response.ok) {
        setActivityResult(data)
      } else {
        setError(data.error || "Failed to check activity info")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const fixActivityInfo = async () => {
    setIsLoading(true)
    setError(null)
    setActivityResult(null)

    try {
      const response = await fetch("/api/admin/fix-user-activity", {
        method: "POST"
      })
      const data = await response.json()

      if (response.ok) {
        setActivityResult(data)
      } else {
        setError(data.error || "Failed to fix activity info")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fix User Dates</h1>
        <p className="text-gray-600">
          This tool helps fix users who have invalid or missing join dates (createdAt field).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check Invalid Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Check how many users have invalid or missing join dates.
            </p>
            <Button 
              onClick={checkInvalidDates} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Dates"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fix Invalid Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Fix users with invalid dates by setting proper join dates.
            </p>
            <Button 
              onClick={fixInvalidDates} 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                "Fix Dates"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check Activity Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Check users with missing activity information (Total Logins, Profile Completed, etc.).
            </p>
            <Button 
              onClick={checkActivityInfo} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Activity"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fix Activity Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Fix users with missing activity information by setting default values.
            </p>
            <Button 
              onClick={fixActivityInfo} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                "Fix Activity"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {result.message || "Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div><strong>Total Found:</strong> {result.count || result.totalFound}</div>
              <div><strong>Fixed:</strong> {result.fixedCount || 0}</div>
            </div>

            {result.users && result.users.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Users with Invalid Dates:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {result.users.map((user: any) => (
                    <div key={user._id} className="p-2 bg-gray-50 rounded text-xs">
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Name:</strong> {user.name}</div>
                      <div><strong>Current createdAt:</strong> {user.createdAt ? new Date(user.createdAt).toISOString() : "Missing"}</div>
                      <div><strong>Trial Start:</strong> {user.trialStartDate ? new Date(user.trialStartDate).toISOString() : "Missing"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.results && result.results.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Fixed Users:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {result.results.map((fix: any) => (
                    <div key={fix.userId} className="p-2 bg-green-50 rounded text-xs">
                      <div><strong>Email:</strong> {fix.email}</div>
                      <div><strong>Name:</strong> {fix.name}</div>
                      <div><strong>Old Date:</strong> {fix.oldCreatedAt ? new Date(fix.oldCreatedAt).toISOString() : "Missing"}</div>
                      <div><strong>New Date:</strong> {new Date(fix.newCreatedAt).toISOString()}</div>
                      <div><strong>Source:</strong> {fix.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activityResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {activityResult.message || "Activity Information Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div><strong>Total Found:</strong> {activityResult.count || activityResult.totalFound}</div>
              <div><strong>Fixed:</strong> {activityResult.fixedCount || 0}</div>
            </div>

            {activityResult.users && activityResult.users.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Users with Missing Activity Info:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {activityResult.users.map((user: any) => (
                    <div key={user._id} className="p-2 bg-gray-50 rounded text-xs">
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Name:</strong> {user.name}</div>
                      <div><strong>Total Logins:</strong> {user.totalLogins !== undefined ? user.totalLogins : "Missing"}</div>
                      <div><strong>Profile Completed:</strong> {user.profileCompleted !== undefined ? (user.profileCompleted ? "Yes" : "No") : "Missing"}</div>
                      <div><strong>Email Verified:</strong> {user.emailVerified !== undefined ? (user.emailVerified ? "Yes" : "No") : "Missing"}</div>
                      <div><strong>Mobile Verified:</strong> {user.mobileVerified !== undefined ? (user.mobileVerified ? "Yes" : "No") : "Missing"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activityResult.results && activityResult.results.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Fixed Users:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {activityResult.results.map((fix: any) => (
                    <div key={fix.userId} className="p-2 bg-green-50 rounded text-xs">
                      <div><strong>Email:</strong> {fix.email}</div>
                      <div><strong>Name:</strong> {fix.name}</div>
                      <div><strong>Updates Applied:</strong></div>
                      <div className="ml-2 text-xs">
                        {Object.entries(fix.updates).map(([key, value]) => (
                          <div key={key}><strong>{key}:</strong> {String(value)}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
