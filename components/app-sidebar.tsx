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
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import {
  LayoutDashboard,
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
    title: "Viral Post & News",
    url: "/dashboard/viral-posts",
    icon: TrendingUp,
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

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" className="hidden md:block">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Logo size="sm" className="flex-shrink-0" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="w-full justify-start px-3 py-2 text-sm"
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.comingSoon && (
                        <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full flex-shrink-0">
                          Coming Soon
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
