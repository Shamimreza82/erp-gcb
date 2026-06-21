import { AuthGuard } from "@/components/shared/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function RoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  )
}
