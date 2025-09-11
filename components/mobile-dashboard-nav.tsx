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
  Calendar,
  FileText,
  CreditCard,
  HelpCircle,
  Edit3,
  BookOpen,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { CreditDisplay } from "@/components/credit-display"

const menuSections = [
  {
    title: "Main",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Content Creation",
    items: [
      { title: "Custom Post", url: "/dashboard/custom-post", icon: Edit3 },
      { title: "Topic Generator", url: "/dashboard/ai-articles", icon: BookOpen },
      { title: "Personal Story", url: "/dashboard/personal-story", icon: Sparkles },
      { title: "AI Carousel", url: "/dashboard/ai-carousel", icon: Sparkles },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Scheduled Posts", url: "/dashboard/scheduled-posts", icon: Calendar },
      { title: "Drafts", url: "/dashboard/drafts", icon: FileText },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
      { title: "Help", url: "/dashboard/help", icon: HelpCircle },
    ],
  },
]

export function MobileDashboardNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => setIsOpen(false)

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-80 sm:w-96 p-0 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-700"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
        
          {/* Credit Display */}
          {/* <Link href="/dashboard" onClick={closeSheet}>
              <Logo size="lg" className="justify-center" />
            </Link> */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <CreditDisplay compact={true} />
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
              {menuSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 sm:px-3">
                    {section.title}
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {section.items.map((item) => {
                      const active = pathname === item.url
                      return (
                        <Link
                          key={item.title}
                          href={item.url}
                          onClick={closeSheet}
                          className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 relative ${
                            active
                              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600"
                          }`}
                        >
                          {/* Active indicator bar */}
                          {active && (
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></span>
                          )}
                          <item.icon
                            className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${
                              active
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-500 dark:text-slate-400 group-hover:text-blue-500"
                            }`}
                          />
                          <span className="truncate text-sm sm:text-base">{item.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
