"use client"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { useLinkedInStatus } from "@/hooks/use-linkedin-status"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CreditDisplay } from "@/components/credit-display"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Settings, LogOut, ChevronDown, Zap, Linkedin, Unlink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MobileDashboardNav } from "./mobile-dashboard-nav"

export function AccountHeader() {
  const { data: session, update: updateSession } = useSession()
  const { isConnected: isLinkedInConnected, isLoading: isLinkedInLoading, refreshStatus, forceRefresh } = useLinkedInStatus()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isClient) return // Don't add event listener until client-side

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isClient])

  // Don't render anything until client-side hydration is complete
  if (!isClient || !session?.user) return null

  const handleLinkedInConnection = async () => {
    console.log('LinkedIn connection clicked, current status:', isLinkedInConnected)
    if (!isLinkedInConnected) {
      try {
        console.log('Initiating LinkedIn connection...')
        const response = await fetch('/api/linkedin/connect')
        const data = await response.json()
        
        if (data.success && data.authUrl) {
          console.log('Redirecting to LinkedIn OAuth:', data.authUrl)
          window.location.href = data.authUrl
        } else {
          console.error('Failed to generate LinkedIn auth URL:', data)
        }
      } catch (error) {
        console.error('Error connecting LinkedIn:', error)
      }
    }
  }

  const handleLinkedInDisconnect = async () => {
    console.log('LinkedIn disconnect clicked, current status:', isLinkedInConnected)
    if (isDisconnecting) return // Prevent multiple clicks
    
    setIsDisconnecting(true)
    try {
      console.log('Sending disconnect request...')
      const response = await fetch("/api/linkedin/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        console.log('LinkedIn disconnected successfully, updating UI...')
        
        // Close dropdown after disconnect
        setIsDropdownOpen(false)
        
        // Force immediate page reload to ensure UI updates
        console.log('Reloading page to update UI...')
        window.location.reload()
      } else {
        console.error("Failed to disconnect LinkedIn:", response.status)
        setIsDisconnecting(false)
      }
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error)
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-2 sm:px-4">
        {/* Left side - Mobile Navigation and LinkedIn connection status */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Mobile Dashboard Navigation */}
          <MobileDashboardNav />
          
          {/* LinkedIn Connection Status - Responsive */}
          {isLinkedInConnected ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-1.5 sm:px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                    disabled={isLinkedInLoading}
                  >
                    <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden xs:inline text-xs sm:text-sm">Connected</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  LinkedIn Connected
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-1.5 sm:px-2 text-muted-foreground hover:text-foreground"
                    onClick={handleLinkedInConnection}
                    disabled={isLinkedInLoading}
                  >
                    <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden xs:inline text-xs sm:text-sm">Connect</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Connect LinkedIn Account
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Refresh button - responsive visibility */}
          <div className="hidden sm:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={forceRefresh}
                    disabled={isLinkedInLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLinkedInLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Refresh LinkedIn Status
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Test disconnect button - only in development and larger screens */}
          {process.env.NODE_ENV === 'development' && (
            <div className="hidden lg:block">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                      onClick={handleLinkedInDisconnect}
                      disabled={isDisconnecting}
                    >
                      <Unlink className={`h-4 w-4 ${isDisconnecting ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Test Disconnect LinkedIn
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Right side - Credits, Theme, Account */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Credit Display - Always visible including mobile */}
          <div className="block min-w-0 mr-1 sm:mr-0">
            <CreditDisplay compact={false} />
          </div>

          {/* Theme Toggle - Always visible */}
          <ThemeToggle />

          {/* Account Dropdown - Responsive */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              className="relative h-8 sm:h-10 w-auto px-1.5 sm:px-2 lg:px-3 hover:bg-accent focus:bg-accent"
              onClick={() => {
                console.log('Dropdown trigger clicked - isOpen:', !isDropdownOpen)
                setIsDropdownOpen(!isDropdownOpen)
              }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback className="text-xs sm:text-sm">{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground">{session.user.email}</span>
                </div>
                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </Button>

            {/* Custom Dropdown Menu - Responsive positioning */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 rounded-md border bg-popover p-1 shadow-lg z-[9999]">
                <div className="flex items-center justify-start gap-2 p-2 border-b">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{session.user.name}</p>
                    <p className="w-full max-w-[180px] sm:max-w-[200px] truncate text-xs sm:text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                
                <div className="py-1">
                  <Link href="/dashboard/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link href="/dashboard/billing" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <span>Billing & Credits</span>
                  </Link>
                  
                  <Link href="/dashboard/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  
                  {isLinkedInConnected && (
                    <button
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer text-orange-600 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Dropdown disconnect clicked')
                        handleLinkedInDisconnect()
                      }}
                      disabled={isDisconnecting}
                    >
                      <Unlink className={`h-4 w-4 ${isDisconnecting ? 'animate-spin' : ''}`} />
                      <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect LinkedIn'}</span>
                    </button>
                  )}
                  
                  <div className="border-t my-1"></div>
                  
                  <button
                    className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer text-red-600 w-full text-left"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
