"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Users,
  Home,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCog,
  Hash,
  ChevronRight,
} from "lucide-react"
import { formatDate } from "@/utils/format"
import Link from "next/link"
import { api as axios } from "@/lib/axios"

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CEO: "CEO",
  MANAGER: "Manager",
  FINANCE_OFFICER: "Finance Officer",
  USER: "User",
}

const roleIcons: Record<string, typeof Shield> = {
  CEO: UserCog,
  MANAGER: Users,
  FINANCE_OFFICER: Shield,
  USER: Users,
}

const roleColors: Record<string, string> = {
  CEO: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  MANAGER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  FINANCE_OFFICER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  USER: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  description?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value ?? "-"}</p>
      </div>
    </div>
  )
}

export function BoardDetail({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const r = await axios.get(`/api/boards/${id}`)
      return r.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Board not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The board you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/boards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Boards
          </Link>
        </Button>
      </div>
    )
  }

  const RoleIcon = roleIcons[data.role as keyof typeof roleIcons] || Users

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-primary/5 via-primary/5 to-background">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild className="shrink-0">
              <Link href="/boards">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              {data.logo ? (
                <img
                  src={data.logo}
                  alt={`${data.name} logo`}
                  className="h-10 w-10 rounded-lg object-contain"
                />
              ) : (
                <Building2 className="h-7 w-7 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold sm:text-2xl">{data.name}</h1>
                <Badge
                  variant={data.isActive ? "success" : "secondary"}
                  className="shrink-0"
                >
                  {data.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span>{data.code}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Properties"
          value={data._count?.properties ?? 0}
          icon={Home}
        />
        <StatCard
          label="Total Users"
          value={data._count?.users ?? 0}
          icon={Users}
        />
        <StatCard
          label="Created"
          value={formatDate(data.createdAt)}
          icon={Calendar}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">
            Users
            {data._count?.users ? (
              <Badge variant="secondary" className="ml-2">
                {data._count.users}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Board Information</CardTitle>
              <CardDescription>General details about this cantonment board</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <DetailRow icon={Building2} label="Board Name" value={data.name} />
              <DetailRow icon={Hash} label="Board Code" value={data.code} />
              <DetailRow icon={MapPin} label="Address" value={data.address} />
              <DetailRow icon={Calendar} label="Created" value={formatDate(data.createdAt)} />
              <DetailRow icon={Home} label="Properties" value={data._count?.properties ?? 0} />
              <DetailRow icon={Users} label="Users" value={data._count?.users ?? 0} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {data.users?.length
                  ? `${data.users.length} user${data.users.length !== 1 ? "s" : ""} under this board`
                  : "No users assigned"}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {data.users?.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.users.map((u: any) => {
                    const RoleIcon = roleIcons[u.role as keyof typeof roleIcons] || Users
                    return (
                      <div
                        key={u.id}
                        className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/50" />
                        <div className="relative p-5">
                          <div className="flex items-start justify-between">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${getAvatarColor(u.fullName)}`}
                            >
                              {getInitials(u.fullName)}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`border-0 ${roleColors[u.role as keyof typeof roleColors] || ""}`}
                            >
                              <RoleIcon className="mr-1 h-3 w-3" />
                              {roleLabels[u.role] || u.role}
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-1.5">
                            <p className="font-semibold">{u.fullName}</p>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </p>
                            {u.phone && (
                              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{u.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 font-medium">No team members</p>
                  <p className="text-sm text-muted-foreground">
                    Users will appear here once they are added to this board.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
