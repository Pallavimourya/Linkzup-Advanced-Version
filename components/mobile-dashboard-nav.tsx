"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Calendar,
  FileText,
  CreditCard,
  HelpCircle,
  Edit3,
  BookOpen,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { CreditDisplay } from "@/components/credit-display"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Custom Post",
    url: "/dashboard/custom-post",
    icon: Edit3,
  },
  {
    title: "AI Articles",
    url: "/dashboard/ai-articles",
    icon: BookOpen,
  },
  {
    title: "Personal Story",
    url: "/dashboard/personal-story",
    icon: Sparkles,
  },
  {
    title: "AI Carousel",
    url: "/dashboard/ai-carousel",
    icon: Sparkles,
  },
  {
    title: "Scheduled Posts",
    url: "/dashboard/scheduled-posts",
    icon: Calendar,
  },
  {
    title: "Drafts",
    url: "/dashboard/drafts",
    icon: FileText,
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Help",
    url: "/dashboard/help",
    icon: HelpCircle,
  },
]

export function MobileDashboardNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => {
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 sm:w-80 p-0">
          <SheetHeader className="p-3 sm:p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Logo size="sm" />
            </SheetTitle>
            {/* Credit Display in Mobile Navigation Header */}
            <div className="mt-2 sm:mt-3 flex justify-center">
              <div className="w-full max-w-[280px] sm:max-w-xs">
                <CreditDisplay compact={true} />
              </div>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4">
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Platform
                </div>
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={closeSheet}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      pathname === item.url
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
