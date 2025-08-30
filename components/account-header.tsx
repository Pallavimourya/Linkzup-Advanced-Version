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

export function AccountHeader() {
  const { data: session, update: updateSession } = useSession()
  const { isConnected: isLinkedInConnected, isLoading: isLinkedInLoading, refreshStatus } = useLinkedInStatus()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

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
    if (!isLinkedInConnected) {
      try {
        const response = await fetch('/api/linkedin/connect')
        const data = await response.json()
        
        if (data.success && data.authUrl) {
          window.location.href = data.authUrl
        } else {
          console.error('Failed to generate LinkedIn auth URL')
        }
      } catch (error) {
        console.error('Error connecting LinkedIn:', error)
      }
    }
  }

  const handleLinkedInDisconnect = async () => {
    try {
      const response = await fetch("/api/linkedin/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        window.location.reload()
      } else {
        console.error("Failed to disconnect LinkedIn")
      }
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error)
    }
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-end px-4">
        <div className="flex items-center gap-4">
          {/* LinkedIn Connection Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`flex items-center gap-2 ${!isLinkedInConnected ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={!isLinkedInConnected ? handleLinkedInConnection : undefined}
                >
                  <Linkedin className={`h-4 w-4 transition-colors duration-300 ${
                    isLinkedInLoading 
                      ? 'text-yellow-500 animate-pulse' 
                      : isLinkedInConnected 
                        ? 'text-green-600' 
                        : 'text-red-600'
                  }`} />
                  <Badge 
                    variant={isLinkedInConnected ? "default" : "destructive"} 
                    className={`text-xs transition-all duration-300 ${
                      isLinkedInLoading ? 'animate-pulse' : ''
                    }`}
                  >
                    {isLinkedInLoading 
                      ? "Checking..." 
                      : isLinkedInConnected 
                        ? "LinkedIn Connected" 
                        : "LinkedIn Not Connected"
                    }
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isLinkedInLoading 
                  ? "Checking LinkedIn connection status..." 
                  : isLinkedInConnected 
                    ? "Your LinkedIn account is connected" 
                    : "Click to connect your LinkedIn account"
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Refresh LinkedIn Status Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await updateSession()
                    refreshStatus()
                  }}
                  disabled={isLinkedInLoading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${isLinkedInLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Refresh LinkedIn connection status
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Credit Display */}
          <CreditDisplay />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Account Dropdown - Custom Implementation */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              className="relative h-10 w-auto px-3 hover:bg-accent focus:bg-accent"
              onClick={() => {
                console.log('Dropdown trigger clicked - isOpen:', !isDropdownOpen)
                setIsDropdownOpen(!isDropdownOpen)
              }}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground">{session.user.email}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </Button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg z-[9999]">
                <div className="flex items-center justify-start gap-2 p-2 border-b">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
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
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer text-orange-600 w-full text-left"
                      onClick={handleLinkedInDisconnect}
                    >
                      <Unlink className="h-4 w-4" />
                      <span>Disconnect LinkedIn</span>
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
