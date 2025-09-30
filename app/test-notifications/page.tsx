"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TestNotificationsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleServiceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      service: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Form submitted successfully! Check the admin panel for real-time notification.')
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        })
      } else {
        alert('Error: ' + (result.error || 'Failed to submit form'))
      }
    } catch (error) {
      alert('Error: Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        alert('Test notification sent! Check the admin panel bell icon.')
      } else {
        alert('Error: ' + (result.error || 'Failed to send test notification'))
      }
    } catch (error) {
      alert('Error: Failed to send test notification')
    }
  }

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/notifications/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Cleared ${result.deletedCount} notifications successfully!`)
      } else {
        alert('Error: ' + (result.error || 'Failed to clear notifications'))
      }
    } catch (error) {
      alert('Error: Failed to clear notifications')
    }
  }

  const checkNotificationStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications/clear', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Notification Stats:\nTotal: ${result.totalCount}\nUnread: ${result.unreadCount}`)
      } else {
        alert('Error: ' + (result.error || 'Failed to get notification stats'))
      }
    } catch (error) {
      alert('Error: Failed to get notification stats')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Test Real-Time Notifications</CardTitle>
            <p className="text-muted-foreground">
              Submit this form to test the real-time notification system. 
              Open the admin panel in another tab to see instant notifications.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name *
                  </label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    placeholder="John" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name *
                  </label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address *
                </label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="john@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <Input 
                  id="phone" 
                  name="phone"
                  placeholder="+91 9876543210" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="service" className="text-sm font-medium text-foreground">
                  Service Interest
                </label>
                <Select value={formData.service} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile-revamp">Profile Revamp</SelectItem>
                    <SelectItem value="content-calendar">Content Calendar</SelectItem>
                    <SelectItem value="engagement">Engagement & DMs</SelectItem>
                    <SelectItem value="growth-insights">Growth Insights</SelectItem>
                    <SelectItem value="complete-package">Complete Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message *
                </label>
                <Textarea 
                  id="message" 
                  name="message"
                  placeholder="Tell us about your goals and how we can help you..." 
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Test Form"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div>
                <Button 
                  onClick={sendTestNotification}
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                >
                  🔔 Send Test Notification
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click this button to instantly send a test notification to admin panel
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={checkNotificationStats}
                  variant="secondary" 
                  size="sm"
                >
                  📊 Check Stats
                </Button>
                <Button 
                  onClick={clearAllNotifications}
                  variant="destructive" 
                  size="sm"
                >
                  🗑️ Clear All
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Check notification count or clear all test notifications
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to Test:
              </h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Open the admin panel in another tab/window</li>
                <li>2. Make sure you're logged in as an admin</li>
                <li>3. Look for the bell icon in the admin navbar</li>
                <li>4. Click "Send Test Notification" button above</li>
                <li>5. Watch for instant notification in the admin panel!</li>
                <li>6. Or submit the contact form to test real form submission</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
