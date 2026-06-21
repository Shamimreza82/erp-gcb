"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, ArrowLeft, Mail, Phone } from "lucide-react"
import { formatDate } from "@/utils/format"
import Link from "next/link"
import { api as axios } from "@/lib/axios"

export function BoardDetail({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => { const r = await axios.get(`/api/boards/${id}`); return r.data.data },
  })

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Board not found</div>

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    CEO: "CEO",
    MANAGER: "Manager",
    FINANCE_OFFICER: "Finance Officer",
    USER: "User",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/boards"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        {data.logo ? (
          <img src={data.logo} alt={`${data.name} logo`} className="h-10 w-10 rounded object-contain" />
        ) : (
          <Building2 className="h-6 w-6 text-primary" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-sm text-muted-foreground">{data.code}</p>
        </div>
        <Badge variant={data.isActive ? "success" : "secondary"}>{data.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Board Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{data.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span>{data.code}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{data.address || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDate(data.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Properties</span><span>{data._count?.properties || 0}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({data._count?.users || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.users?.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{u.fullName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {u.email}
                    </p>
                  </div>
                  <Badge variant="secondary">{roleLabels[u.role] || u.role}</Badge>
                </div>
              ))}
              {(!data.users || data.users.length === 0) && (
                <p className="text-sm text-muted-foreground">No users</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
