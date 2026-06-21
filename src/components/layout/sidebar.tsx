"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/cn"
import {
  LayoutDashboard, Building2, DoorOpen, Users, FileText,
  Receipt, CreditCard, Wallet, Bell, ScrollText, Wrench, LogOut, X, BarChart3,
} from "lucide-react"
import { useAuthStore } from "@/modules/auth/hooks/use-auth-store"

interface Route {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const roleRoutes: Record<string, Route[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Boards", href: "/boards", icon: Building2 },
    { label: "Users", href: "/users", icon: Users },
    { label: "Activity Logs", href: "/activity-logs", icon: ScrollText },
  ],
  CEO: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Properties", href: "/properties", icon: Building2 },
    { label: "Units", href: "/units", icon: DoorOpen },
    { label: "Users", href: "/users", icon: Users },
    { label: "Leases", href: "/leases", icon: FileText },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Expenses", href: "/expenses", icon: Wallet },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Maintenance", href: "/maintenance", icon: Wrench },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  MANAGER: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Properties", href: "/properties", icon: Building2 },
    { label: "Units", href: "/units", icon: DoorOpen },
    { label: "Users", href: "/users", icon: Users },
    { label: "Leases", href: "/leases", icon: FileText },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Expenses", href: "/expenses", icon: Wallet },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Maintenance", href: "/maintenance", icon: Wrench },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  FINANCE_OFFICER: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Expenses", href: "/expenses", icon: Wallet },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  USER: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "My Property", href: "/my-property", icon: Building2 },
    { label: "My Invoices", href: "/my-invoices", icon: Receipt },
    { label: "My Payments", href: "/my-payments", icon: CreditCard },
    { label: "Maintenance", href: "/maintenance", icon: Wrench },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const routes = roleRoutes[user?.role || ""] || []

  const content = (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-14 items-center border-b", collapsed ? "justify-center px-2" : "px-6")}>
        <Link href="/" className={cn("flex items-center gap-2 font-semibold tracking-tight", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span>ERP GCB</span>}
        </Link>
        {mobileOpen && (
          <button onClick={onClose} className="absolute right-4 top-3.5 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => mobileOpen && onClose()}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === route.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? route.label : undefined}
          >
            <route.icon className="h-4 w-4 shrink-0" />
            {!collapsed && route.label}
          </Link>
        ))}
      </nav>
      <div className={cn("border-t p-3", collapsed && "px-2")}>
        <div className={cn("mb-2 flex items-center", collapsed ? "justify-center" : "justify-between rounded-lg px-3 py-2")}>
          {!collapsed && (
            <div className="text-xs">
              <p className="font-medium text-sidebar-foreground">{user?.fullName}</p>
              <p className="text-sidebar-foreground/50 uppercase">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-sidebar transition-all duration-300 lg:flex lg:flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative w-64 bg-sidebar shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
