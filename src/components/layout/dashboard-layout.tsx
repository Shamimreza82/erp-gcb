"use client"

import { useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

const pageTitles: Record<string, string> = {
  "dashboard": "Dashboard",
  "properties": "Properties",
  "units": "Units",
  "users": "Users",
  "leases": "Leases",
  "invoices": "Invoices",
  "payments": "Payments",
  "expenses": "Expenses",
  "maintenance": "Maintenance",
  "boards": "Boards",
  "reports": "Reports",
  "settings": "Settings",
  "activity-logs": "Activity Logs",
  "notifications": "Notifications",
  "my-property": "My Property",
  "my-invoices": "My Invoices",
  "my-payments": "My Payments",
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setSidebarCollapsed((p) => !p)
  }, [])

  const openMobile = useCallback(() => {
    setMobileSidebarOpen(true)
  }, [])

  const closeMobile = useCallback(() => {
    setMobileSidebarOpen(false)
  }, [])

  const segments = pathname.split("/").filter(Boolean)
  const currentPage = segments.length >= 2 ? segments[1] : segments[0] || "dashboard"
  const topbarTitle = pageTitles[currentPage] || "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onClose={closeMobile}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              openMobile()
            } else {
              toggleCollapsed()
            }
          }}
          title={topbarTitle}
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
