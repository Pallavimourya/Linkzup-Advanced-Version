import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AccountHeader } from "@/components/account-header"
import { DashboardClientWrapper } from "@/components/dashboard-client-wrapper"
import { TrialBanner } from "@/components/trial-banner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardClientWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AccountHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <TrialBanner />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardClientWrapper>
  )
}
