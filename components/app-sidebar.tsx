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
      <Sidebar variant="inset" collapsible="icon" className="hidden lg:block">
        <SidebarHeader className="px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton size="lg" asChild className="w-full">
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
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
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
                            className="w-full px-3 py-2.5 text-base hover:bg-accent/50"
                          >
                            <Link href={item.url} className="flex items-center gap-3 w-full">
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
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
