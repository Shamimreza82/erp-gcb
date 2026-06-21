export const roleRoutes: Record<string, string> = {
  SUPER_ADMIN: "super-admin",
  CEO: "ceo",
  MANAGER: "manager",
  FINANCE_OFFICER: "finance",
  USER: "user",
}

export const routeToRole: Record<string, string> = {
  "super-admin": "SUPER_ADMIN",
  ceo: "CEO",
  manager: "MANAGER",
  finance: "FINANCE_OFFICER",
  user: "USER",
}

export function getDashboardPath(role?: string): string {
  const slug = role ? roleRoutes[role] : "user"
  return `/${slug}/dashboard`
}
