"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Building2 } from "lucide-react"
import { formatDate } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import { api as axios } from "@/lib/axios"

interface UserRow {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  board?: { name: string; code: string } | null
}

export function UserList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search],
    queryFn: async () => {
      const r = await axios.get(`/api/users?page=${page}&search=${search}`)
      return r.data
    },
  })

  const roleVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    SUPER_ADMIN: "destructive",
    CEO: "default",
    MANAGER: "secondary",
    FINANCE_OFFICER: "warning",
    USER: "success",
  }

  const columns: ColumnDef<UserRow>[] = [
    { accessorKey: "fullName", header: "Name" },
    {
      accessorKey: "board",
      header: "Board",
      cell: ({ row }) => row.original.board ? (
        <span className="flex items-center gap-1 text-sm"><Building2 className="h-3 w-3 text-muted-foreground" />{row.original.board.name}</span>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ? <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{row.original.email}</span> : "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone ? <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{row.original.phone}</span> : "-",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant={roleVariant[row.original.role] || "secondary"}>{row.original.role.replace("_", " ")}</Badge>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <Badge variant={row.original.isActive ? "success" : "destructive"}>{row.original.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.getValue("createdAt")) },
  ]

  return (
    <div>
      <PageHeader title="Users" description="All users of this board" />
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
    </div>
  )
}
