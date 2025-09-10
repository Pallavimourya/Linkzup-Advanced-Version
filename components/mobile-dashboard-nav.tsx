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

const menuSections = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ]
  },
  {
    title: "Content Creation",
    items: [
      {
        title: "Custom Post",
        url: "/dashboard/custom-post",
        icon: Edit3,
      },
      {
        title: "Topic Generator",
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
    ]
  },
  {
    title: "Management",
    items: [
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
    ]
  },
  {
    title: "Account",
    items: [
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
        <SheetContent side="left" className="w-72 sm:w-80 p-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
          <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-3">
                <Logo size="sm" />
              </SheetTitle>
            </div>
            {/* Credit Display in Mobile Navigation Header */}
            <div className="mt-6 flex justify-center">
              <div className="w-full max-w-[280px] sm:max-w-xs">
                <CreditDisplay compact={true} />
              </div>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="space-y-8">
                {menuSections.map((section, sectionIndex) => (
                  <div key={section.title} className="space-y-4">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-2">
                      {section.title}
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          onClick={closeSheet}
                          className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            pathname === item.url
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${
                            pathname === item.url 
                              ? "text-blue-600 dark:text-blue-400" 
                              : "text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                          }`} />
                          <span className="truncate">{item.title}</span>
                          {pathname === item.url && (
                            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
