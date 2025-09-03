"use client"

import type { ReactNode } from "react"
import React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { redirect, usePathname } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
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
  Crown,
  ChevronDown,
  ChevronRight,
  Home,
  Activity,
  FileText,
  CreditCard,
  Gift,
  Shield,
  Database,
  Bell,
  Search
} from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Client layout gate
  // We gate via middleware, but double-check here for UX
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isEditing, setIsEditing] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Fetch summary data for sidebar
  const fetcher = (url: string) => fetch(url).then((r) => r.json())
  const { data: summaryData } = useSWR("/api/admin/analytics/summary", fetcher)

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

  const navigationItems = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          description: "Overview & analytics"
        }
      ]
    },
    {
      title: "Management",
      items: [
        {
          title: "Users",
          href: "/admin/users",
          icon: Users,
          description: "User management",
          badge: summaryData?.users?.total || 0
        },
        {
          title: "Plans",
          href: "/admin/plans",
          icon: BadgeDollarSign,
          description: "Subscription plans"
        },
        {
          title: "Coupons",
          href: "/admin/coupons",
          icon: Gift,
          description: "Discount management",
          badge: summaryData?.coupons?.active || 0
        }
      ]
    },
    {
      title: "Analytics",
      items: [
        {
          title: "Analytics",
          href: "/admin/analytics",
          icon: BarChart2,
          description: "Detailed insights"
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
          description: "System configuration"
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800" suppressHydrationWarning>
      {/* Top Bar */}
      <header className="border-b border-gray-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-2 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  LinkZup
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block -mt-1">Admin Panel</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-32"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <div className="p-1.5 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-7 text-xs border-gray-200 focus:border-teal-500 w-20"
                    placeholder="Name"
                  />
                  <Input
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-7 text-xs border-gray-200 focus:border-teal-500 w-24"
                    placeholder="Email"
                  />
                  <Button size="sm" onClick={handleSave} className="h-7 w-7 p-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 w-7 p-0 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">{userEmail}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Admin Badge */}
            <Badge className="bg-gradient-to-r from-teal-600 to-blue-600 text-white border-0 text-xs px-3 py-1 font-medium">
              Admin
            </Badge>

            {/* Theme Toggle */}
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <ThemeToggle />
            </div>

            {/* Sign Out Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 h-9 px-3 text-sm"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-14">
        {/* Enhanced Sidebar */}
        <aside className={`border-r border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto shadow-lg transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}>
          <nav className="flex flex-col gap-1 p-4">
            {navigationItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
                    {section.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    
                    return (
                      <Button
                        key={itemIndex}
                        asChild
                        variant="ghost"
                        className={`justify-start h-11 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        } ${sidebarCollapsed ? 'px-3' : 'px-4'}`}
                      >
                        <Link href={item.href} className="flex items-center gap-3 w-full">
                          <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{item.title}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Quick Stats */}
            {!sidebarCollapsed && (
              <div className="mt-8 p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 rounded-xl border border-teal-200 dark:border-teal-800">
                <h4 className="text-sm font-semibold text-teal-900 dark:text-teal-100 mb-3">
                  Quick Stats
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-teal-700 dark:text-teal-300">Active Users</span>
                    <Badge variant="outline" className="text-xs">
                      {summaryData?.users?.active || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-teal-700 dark:text-teal-300">Revenue</span>
                    <Badge variant="outline" className="text-xs">
                      ₹{summaryData?.revenue?.currentMonth || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </aside>
        
        {/* Main Content Area */}
        <main className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-72'
        }`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
