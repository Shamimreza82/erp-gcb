"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { BoardForm } from "./board-form"
import { Plus, Trash2, Eye, Building2 } from "lucide-react"
import { formatDate } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import type { Board, BoardFormData } from "../types"
import Link from "next/link"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function BoardList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["boards", page, search],
    queryFn: async () => { const r = await axios.get(`/api/boards?page=${page}&search=${search}`); return r.data },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: BoardFormData) => { const r = await axios.post("/api/boards", formData); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["boards"] }); setDialogOpen(false); toast.success("Board created") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const r = await axios.delete(`/api/boards/${id}`); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["boards"] }); setDeleteDialogOpen(false); toast.success("Board deleted") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete"),
  })

  const columns: ColumnDef<Board>[] = [
    {
      accessorKey: "name",
      header: "Board",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.logo ? (
            <img src={row.original.logo} alt="" className="h-6 w-6 rounded object-contain" />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground" />
          )}
          <Link href={`/boards/${row.original.id}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        </div>
      ),
    },
    { accessorKey: "code", header: "Code" },
    {
      id: "usersCount",
      accessorKey: "_count",
      header: "Users",
      cell: ({ row }) => row.original._count?.users || 0,
    },
    {
      id: "propsCount",
      accessorKey: "_count",
      header: "Properties",
      cell: ({ row }) => row.original._count?.properties || 0,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <Badge variant={row.original.isActive ? "success" : "secondary"}>{row.original.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.getValue("createdAt")) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/boards/${row.original.id}`}><Eye className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => { setSelectedBoard(row.original); setDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Boards" description="Manage Cantonment Boards (SaaS tenants)">
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setSelectedBoard(null) }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Board</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Board</DialogTitle></DialogHeader>
            <BoardForm onSubmit={(fd) => createMutation.mutateAsync(fd)} loading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={setSearch} loading={isLoading} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={() => selectedBoard && deleteMutation.mutate(selectedBoard.id)} loading={deleteMutation.isPending} />
    </div>
  )
}
