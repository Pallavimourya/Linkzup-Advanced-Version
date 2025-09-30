"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNewNotification, setIsNewNotification] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  
  const { data, error, mutate } = useSWR("/api/admin/notifications?limit=5", fetcher)

  // Initialize notifications from SWR data
  useEffect(() => {
    if (data) {
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    }
  }, [data])

  // Force refresh notifications when component mounts
  useEffect(() => {
    mutate()
  }, [mutate])

  // Set up Server-Sent Events for real-time notifications
  useEffect(() => {
    const setupSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      eventSourceRef.current = new EventSource('/api/admin/notifications/stream')
      
      eventSourceRef.current.onopen = () => {
        console.log('SSE connection opened')
      }

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'new_notification') {
            // Add new notification to the list
            setNotifications(prev => [data.notification, ...prev.slice(0, 4)]) // Keep only 5 most recent
            setUnreadCount(prev => prev + 1)
            
            // Trigger animation
            setIsNewNotification(true)
            setTimeout(() => setIsNewNotification(false), 2000)
            
            // Show browser notification if permission is granted
            if (Notification.permission === 'granted') {
              new Notification(data.notification.title, {
                body: data.notification.message,
                icon: '/favicon.ico',
                tag: 'contact-submission'
              })
            }
          } else if (data.type === 'ping') {
            // Keep connection alive
            console.log('SSE ping received')
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE error:', error)
        // Reconnect after 5 seconds
        setTimeout(setupSSE, 5000)
      }
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    setupSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: notificationId, read: true }),
      })
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      mutate() // Also refresh from server
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!notifications.length) return
    
    try {
      const unreadNotifications = notifications.filter((n: any) => !n.read)
      await Promise.all(
        unreadNotifications.map((notification: any) =>
          fetch('/api/admin/notifications', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: notification._id, read: true }),
          })
        )
      )
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      setUnreadCount(0)
      
      mutate() // Also refresh from server
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contact_submission':
        return '📧'
      default:
        return '🔔'
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ${
          isNewNotification ? 'animate-pulse bg-blue-100 dark:bg-blue-900/20' : ''
        }`}
      >
        <Bell className={`h-5 w-5 transition-transform duration-300 ${
          isNewNotification ? 'animate-bounce' : ''
        }`} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {error ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Failed to load notifications
                </div>
              ) : !notifications.length ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification._id}
                      className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id)
                        }
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
