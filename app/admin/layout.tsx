"use client"

import type { ReactNode } from "react"
import React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  BadgeDollarSign, 
  Settings, 
  BarChart2, 
  Tag, 
  LogOut, 
  User, 
  Edit2, 
  Check, 
  X,
  Crown
} from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Client layout gate
  // We gate via middleware, but double-check here for UX
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  // Update user info when session loads
  React.useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || 'Admin')
      setUserEmail(session.user.email || '')
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    )
  }

  // Don't redirect immediately, show loading instead
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-teal-700 dark:text-teal-300">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (!session?.user || !(session.user as any).isAdmin) {
    // Use useEffect for redirect to avoid hydration issues
    React.useEffect(() => {
      window.location.href = "/auth/signin"
    }, [])
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-teal-700 dark:text-teal-300">Checking permissions...</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    // Here you would typically update the user data via API
    // For now, we'll just close the edit mode
    setIsEditing(false)
  }

  const handleCancel = () => {
    setUserName(session?.user?.name || 'Admin')
    setUserEmail(session?.user?.email || '')
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800" suppressHydrationWarning>
      {/* Top Bar */}
      <header className="border-b border-teal-200 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-1 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-700 rounded-lg">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-teal-700">
                LinkZup Admin
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Compact User Info */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-teal-200 rounded-lg px-2 py-1">
              <div className="p-1 bg-teal-700 rounded-full">
                <User className="h-3 w-3 text-white" />
              </div>
              
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-6 text-xs border-teal-200 focus:border-teal-700 w-20"
                    placeholder="Name"
                  />
                  <Input
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-6 text-xs border-teal-200 focus:border-teal-700 w-24"
                    placeholder="Email"
                  />
                  <Button size="sm" onClick={handleSave} className="h-6 w-6 p-0 bg-teal-700 hover:bg-teal-800 text-white rounded-full">
                    <Check className="h-2.5 w-2.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 w-6 p-0 border-teal-300 text-teal-700 hover:bg-teal-50 rounded-full">
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-teal-900 dark:text-teal-100 leading-none">{userName}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 leading-none">{userEmail}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-5 w-5 p-0 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-700 rounded-full"
                  >
                    <Edit2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Admin Badge */}
            <Badge className="bg-teal-700 text-white border-0 text-xs px-2 py-0.5">
              Admin
            </Badge>

            {/* Theme Toggle */}
            <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded-lg backdrop-blur-sm border border-teal-200">
              <ThemeToggle />
            </div>

            {/* Sign Out Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 h-8 px-2 text-xs"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              <LogOut className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-12">
        {/* Fixed Sidebar */}
        <aside className="border-r border-teal-200 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md w-64 fixed left-0 top-12 h-[calc(100vh-3rem)] overflow-y-auto shadow-lg">
          <nav className="flex flex-col gap-1 p-4">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider px-3 mb-2">
                Dashboard
              </h3>
            </div>
            
            <Button asChild variant="ghost" className="justify-start h-12 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
              <Link href="/admin/users" className="flex items-center gap-3">
                <Users className="h-5 w-5" /> 
                <span className="font-medium">Users</span>
              </Link>
            </Button>
            
            <Button asChild variant="ghost" className="justify-start h-12 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300">
              <Link href="/admin/plans" className="flex items-center gap-3">
                <BadgeDollarSign className="h-5 w-5" /> 
                <span className="font-medium">Plans</span>
              </Link>
            </Button>
            
            <Button asChild variant="ghost" className="justify-start h-12 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300">
              <Link href="/admin/coupons" className="flex items-center gap-3">
                <Tag className="h-5 w-5" /> 
                <span className="font-medium">Coupons</span>
              </Link>
            </Button>
            
            <Button asChild variant="ghost" className="justify-start h-12 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300">
              <Link href="/admin/analytics" className="flex items-center gap-3">
                <BarChart2 className="h-5 w-5" /> 
                <span className="font-medium">Analytics</span>
              </Link>
            </Button>
            
            <Button asChild variant="ghost" className="justify-start h-12 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300">
              <Link href="/admin/settings" className="flex items-center gap-3">
                <Settings className="h-5 w-5" /> 
                <span className="font-medium">Settings</span>
              </Link>
            </Button>
          </nav>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 ml-64 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
