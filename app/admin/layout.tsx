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
  Crown,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Client layout gate
  // We gate via middleware, but double-check here for UX
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch summary data for sidebar
  const fetcher = (url: string) => fetch(url).then((r) => r.json())
  const { data: summaryData } = useSWR("/api/admin/analytics/summary", fetcher)

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
          icon: Tag,
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
      {/* Simplified Top Bar */}
      <header className="border-b border-gray-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-2 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-14">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>

            {/* Logo - Hidden on mobile */}
            <Link href="/" className="hidden lg:flex items-center gap-3">
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
          
          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Admin Badge */}
            <Badge className="bg-gradient-to-r from-teal-600 to-blue-600 text-white border-0 text-xs px-3 py-1 font-medium hidden sm:block">
              Admin
            </Badge>

            {/* User Info - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <div className="p-1.5 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                  {session.user.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                  {session.user.email || ''}
                </p>
              </div>
            </div>

            {/* Theme Toggle - Reduced height on mobile */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="lg:p-2 p-1.5">
                <ThemeToggle />
              </div>
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-14 h-full w-80 bg-white dark:bg-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col gap-1 p-4">
              {navigationItems.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
                    {section.title}
                  </h3>
                  
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      
                      return (
                        <Button
                          key={itemIndex}
                          asChild
                          variant="ghost"
                          className={`justify-start h-11 rounded-xl transition-all duration-200 w-full ${
                            isActive
                              ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          } px-4`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            
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
                          </Link>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Quick Stats */}
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
            </nav>
          </div>
        </div>
      )}

      <div className="flex flex-1 pt-16">
        {/* Enhanced Sidebar - Hidden on mobile */}
        <aside className={`border-r border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto shadow-lg transition-all duration-300 hidden lg:block ${
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
        <main className={`flex-1 p-4 lg:p-6 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'
        }`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
