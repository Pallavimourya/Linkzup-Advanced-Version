"use client"
import { useSession, signOut, signIn } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditDisplay } from "@/components/credit-display"
import { User, Settings, LogOut, ChevronDown, Zap, Linkedin, Unlink } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AccountHeader() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const isLinkedInConnected = !!session.user.linkedinConnected

  const handleLinkedInConnection = () => {
    if (!isLinkedInConnected) {
      signIn("linkedin", { callbackUrl: "/dashboard" })
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
        // Refresh the page to update the session
        window.location.reload()
      } else {
        console.error("Failed to disconnect LinkedIn")
      }
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error)
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-end px-4">
        <div className="flex items-center gap-4">
          {/* LinkedIn Connection Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`flex items-center gap-2 ${!isLinkedInConnected ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={handleLinkedInConnection}
                >
                  <Linkedin className={`h-4 w-4 ${isLinkedInConnected ? 'text-green-600' : 'text-red-600'}`} />
                  <Badge variant={isLinkedInConnected ? "default" : "destructive"} className="text-xs">
                    {isLinkedInConnected ? "LinkedIn Connected" : "LinkedIn Not Connected"}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-3 hover:bg-accent">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{session.user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing" className="cursor-pointer">
                  <Zap className="mr-2 h-4 w-4" />
                  <span>Billing & Credits</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {isLinkedInConnected && (
                <DropdownMenuItem
                  className="cursor-pointer text-orange-600 focus:text-orange-600"
                  onClick={handleLinkedInDisconnect}
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  <span>Disconnect LinkedIn</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
