"use client"
import { useState, useRef, useEffect } from "react"
import { useSession, signOut, signIn } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CreditDisplay } from "@/components/credit-display"
import { User, Settings, LogOut, ChevronDown, Zap, Linkedin, Unlink, Key } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"

export function AccountHeader() {
  const { data: session, update } = useSession()

  if (!session?.user) return null

  const [isConnecting, setIsConnecting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Use local state for LinkedIn connection status to allow immediate updates
  const [localLinkedInStatus, setLocalLinkedInStatus] = useState<boolean | null>(null)
  
  // Determine LinkedIn connection status - use local state if available, otherwise use session
  const isLinkedInConnected = localLinkedInStatus !== null ? localLinkedInStatus : !!session.user.linkedinConnected

  // Debug logging to see session state (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log("Session LinkedIn status:", {
      linkedinConnected: session.user.linkedinConnected,
      linkedinId: session.user.linkedinId,
      accessToken: session.user.accessToken ? "exists" : "missing"
    })
  }

  // Sync local state with session when component mounts or session changes
  useEffect(() => {
    if (session?.user?.linkedinConnected !== undefined) {
      setLocalLinkedInStatus(session.user.linkedinConnected)
    }
  }, [session?.user?.linkedinConnected])

  const handleLinkedInConnection = async () => {
    if (!isLinkedInConnected) {
      setIsConnecting(true)
      try {
        console.log("Starting LinkedIn connection...")
        
        // First, test the LinkedIn setup
        const testResponse = await fetch("/api/test-linkedin")
        if (testResponse.ok) {
          const testData = await testResponse.json()
          console.log("LinkedIn test data:", testData)
          
          if (testData.env.LINKEDIN_CLIENT_ID === "missing") {
            toast({
              title: "Configuration Error",
              description: "LinkedIn Client ID is not configured. Please check your environment variables.",
              variant: "destructive",
            })
            return
          }
        }
        
        const response = await fetch("/api/linkedin/connect")
        console.log("LinkedIn connect response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("LinkedIn connect response data:", data)
          
          if (data.success && data.authUrl) {
            console.log("Redirecting to LinkedIn auth URL...")
            // Set connecting state to show yellow status
            setLocalLinkedInStatus(false) // Reset to ensure proper state
            window.location.href = data.authUrl
          } else {
            console.error("No auth URL in response:", data)
            toast({
              title: "Error",
              description: "Failed to get LinkedIn authorization URL",
              variant: "destructive",
            })
          }
        } else {
          const errorText = await response.text()
          console.error("LinkedIn connect error response:", errorText)
          toast({
            title: "Error",
            description: "Failed to connect to LinkedIn",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error connecting LinkedIn:", error)
        toast({
          title: "Error",
          description: "Failed to connect to LinkedIn",
          variant: "destructive",
        })
      } finally {
        setIsConnecting(false)
      }
    }
  }

  const handleLinkedInDisconnect = async () => {
    try {
      console.log("Disconnecting LinkedIn...")
      const response = await fetch("/api/linkedin/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Disconnect response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("Disconnect result:", result)
        
        toast({
          title: "Success",
          description: "LinkedIn account disconnected successfully",
        })
        
        // Immediately update local state to show disconnected status
        setLocalLinkedInStatus(false)
        setIsDropdownOpen(false)
        
        // Force session update to reflect the disconnection
        await update()
        
        // Verify the disconnect worked by checking the database
        try {
          const refreshResponse = await fetch("/api/auth/refresh-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            console.log("Session refresh data:", refreshData)
            
            // Update local state based on actual database state
            setLocalLinkedInStatus(refreshData.linkedinConnected)
          }
        } catch (error) {
          console.error("Error refreshing session:", error)
        }
      } else {
        const errorData = await response.json()
        console.error("Disconnect error:", errorData)
        toast({
          title: "Error",
          description: errorData.error || "Failed to disconnect LinkedIn account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect LinkedIn account",
        variant: "destructive",
      })
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

     return (
     <div className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
       <div className="flex h-14 items-center justify-end px-4">
        <div className="flex items-center gap-4">
          {/* LinkedIn Connection Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                                 <div 
                   className={`flex items-center gap-2 ${!isLinkedInConnected && !isConnecting ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                   onClick={!isConnecting ? handleLinkedInConnection : undefined}
                 >
                   <Linkedin className={`h-4 w-4 ${isLinkedInConnected ? 'text-green-600' : isConnecting ? 'text-yellow-600' : 'text-red-600'}`} />
                   <Badge 
                     variant={isLinkedInConnected ? "default" : isConnecting ? "secondary" : "destructive"} 
                     className={`text-xs ${isLinkedInConnected ? 'bg-green-100 text-green-800 border-green-200' : isConnecting ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}`}
                   >
                     {isLinkedInConnected ? "LinkedIn Connected" : isConnecting ? "Connecting..." : "LinkedIn Not Connected"}
                   </Badge>
                 </div>
              </TooltipTrigger>
              <TooltipContent>
                {isLinkedInConnected 
                  ? "Your LinkedIn account is connected" 
                  : "Click to connect your LinkedIn account"
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Credit Display */}
          <CreditDisplay />

                                           {/* Account Dropdown */}
           <div className="relative" ref={dropdownRef}>
             <Button 
               variant="ghost" 
               className="relative h-10 w-auto px-3 hover:bg-accent"
               onClick={toggleDropdown}
             >
                               <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={session.user.profilePicture || session.user.image || ""} 
                      alt={session.user.name || ""} 
                    />
                    <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                 <div className="hidden md:flex flex-col items-start">
                   <span className="text-sm font-medium leading-none">{session.user.name}</span>
                   <span className="text-xs text-muted-foreground">{session.user.email}</span>
                 </div>
                 <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
               </div>
             </Button>
             
             {isDropdownOpen && (
                               <div className="absolute right-0 top-full mt-1 w-56 z-[9999] bg-background border border-border rounded-md shadow-lg">
                  <div className="flex items-center justify-start gap-2 p-3 border-b">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={session.user.profilePicture || session.user.image || ""} 
                        alt={session.user.name || ""} 
                      />
                      <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session.user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                 
                 <div className="py-1">
                   <Link 
                     href="/dashboard/profile" 
                     className="flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                     onClick={() => setIsDropdownOpen(false)}
                   >
                     <User className="mr-2 h-4 w-4" />
                     <span>Profile</span>
                   </Link>
                   
                   <Link 
                     href="/dashboard/billing" 
                     className="flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                     onClick={() => setIsDropdownOpen(false)}
                   >
                     <Zap className="mr-2 h-4 w-4" />
                     <span>Billing & Credits</span>
                   </Link>
                   
                   <Link 
                     href="/dashboard/profile" 
                     className="flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                     onClick={() => setIsDropdownOpen(false)}
                   >
                     <Key className="mr-2 h-4 w-4" />
                     <span>Change Password</span>
                   </Link>
                   
                   {isLinkedInConnected && (
                     <button
                       className="flex items-center w-full px-3 py-2 text-sm text-orange-600 hover:bg-accent cursor-pointer"
                       onClick={handleLinkedInDisconnect}
                     >
                       <Unlink className="mr-2 h-4 w-4" />
                       <span>Disconnect LinkedIn</span>
                     </button>
                   )}
                   
                   <div className="border-t my-1"></div>
                   
                   <button
                     className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-accent cursor-pointer"
                     onClick={() => {
                       setIsDropdownOpen(false)
                       signOut({ callbackUrl: "/" })
                     }}
                   >
                     <LogOut className="mr-2 h-4 w-4" />
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
