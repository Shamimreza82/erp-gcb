"use client"

import { useTheme } from "next-themes"
import { useAuthStore } from "@/modules/auth/hooks/use-auth-store"
import { Button } from "@/components/ui/button"
import { PanelLeft, Sun, Moon, Bell, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Topbar({
  onToggleSidebar,
  title,
}: {
  onToggleSidebar: () => void
  title?: string
}) {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
        <PanelLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-sm font-medium lg:text-base">{title || "Dashboard"}</h1>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" asChild>
          <a href="/notifications">
            <Bell className="h-4 w-4" />
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="hidden text-sm font-medium md:inline">{user?.fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs uppercase text-muted-foreground">{user?.role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
