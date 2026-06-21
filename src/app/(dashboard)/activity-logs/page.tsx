"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import { api as axios } from "@/lib/axios"

interface LogRow {
  id: string
  action: string
  entity: string
  entityId: string | null
  details: Record<string, unknown> | null
  createdAt: string
  user: { fullName: string; email: string; role: string } | null
}

const actionVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  CREATE: "success",
  UPDATE: "default",
  DELETE: "destructive",
  APPROVE: "success",
  REJECT: "destructive",
  TERMINATE: "warning",
  LOGIN: "secondary",
}

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", page, search],
    queryFn: async () => { const r = await axios.get(`/api/activity-logs?page=${page}&search=${search}`); return r.data },
  })

  const columns: ColumnDef<LogRow>[] = [
    { accessorKey: "createdAt", header: "Time", cell: ({ row }) => formatDateTime(row.getValue("createdAt")) },
    { accessorKey: "action", header: "Action", cell: ({ row }) => <Badge variant={actionVariant[row.original.action] || "secondary"}>{row.original.action}</Badge> },
    { accessorKey: "entity", header: "Entity", cell: ({ row }) => <span className="capitalize">{row.original.entity}</span> },
    { accessorKey: "entityId", header: "ID", cell: ({ row }) => row.original.entityId ? <span className="font-mono text-xs">{row.original.entityId.slice(0, 8)}...</span> : "-" },
    { accessorKey: "user", header: "User", cell: ({ row }) => row.original.user?.fullName || "System" },
    { accessorKey: "details", header: "Details", cell: ({ row }) => row.original.details ? <span className="text-xs text-muted-foreground">{JSON.stringify(row.original.details).slice(0, 60)}</span> : "-" },
  ]

  return (
    <div>
      <PageHeader title="Activity Logs" description="System audit trail" />
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
    </div>
  )
}
