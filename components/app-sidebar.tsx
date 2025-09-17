"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import {
  Home,
  Sparkles,
  TrendingUp,
  Calendar,
  FileText,
  CreditCard,
  HelpCircle,
  BookOpen,
  Edit3,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuSections = [
  {
    title: "Main",
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
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

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <TooltipProvider>
      <Sidebar variant="inset" collapsible="icon" className="hidden lg:block bg-white/95 dark:bg-black/95 backdrop-blur-sm border-r border-blue-200/50 dark:border-blue-800/50">
        <SidebarHeader className="px-2 py-3 border-b border-blue-200/30 dark:border-blue-800/30">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton size="lg" asChild className="w-full hover:bg-blue-50 dark:hover:bg-blue-950/50">
                    <Link href="/dashboard" className="flex items-center gap-3 w-full px-3 py-2">
                      <Logo size="sm" className="flex-shrink-0" />
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2">
          {menuSections.map((section, sectionIndex) => (
            <SidebarGroup key={section.title}>
              {state === "expanded" && (
                <SidebarGroupLabel className="text-xs font-medium text-gray-600 dark:text-gray-400 px-3 py-2 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg mx-2 mb-2">
                  {section.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            asChild 
                            isActive={pathname === item.url}
                            className={`w-full px-3 py-2.5 text-base transition-all duration-200 ${
                              pathname === item.url 
                                ? 'bg-gradient-to-r from-blue-500 to-secondary text-white shadow-lg' 
                                : 'hover:bg-blue-50 dark:hover:bg-blue-950/50 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            <Link href={item.url} className="flex items-center gap-3 w-full">
                              <item.icon className={`h-5 w-5 flex-shrink-0 ${
                                pathname === item.url 
                                  ? 'text-white' 
                                  : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                              }`} />
                              <span className="truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-white dark:bg-black border-blue-200 dark:border-blue-800 text-black dark:text-white">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}
