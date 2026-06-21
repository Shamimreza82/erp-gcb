"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Plus, Trash2, XCircle, CheckCircle, X } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import type { Lease } from "../types"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"
import Link from "next/link"

export function LeaseList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["leases", page, search],
    queryFn: async () => { const r = await axios.get(`/api/leases?page=${page}&search=${search}`); return r.data },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => { const r = await axios.post(`/api/leases/${id}/approve`); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leases"] }); queryClient.invalidateQueries({ queryKey: ["units"] }); toast.success("Lease approved") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to approve"),
  })

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => { const r = await axios.post(`/api/leases/${id}/reject`); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leases"] }); toast.success("Lease rejected") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to reject"),
  })

  const terminateMutation = useMutation({
    mutationFn: async (id: string) => { const r = await axios.post(`/api/leases/${id}/terminate`); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leases"] }); queryClient.invalidateQueries({ queryKey: ["units"] }); toast.success("Lease terminated") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to terminate"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const r = await axios.delete(`/api/leases/${id}`); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leases"] }); setDeleteDialogOpen(false); toast.success("Lease deleted") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete"),
  })

  const variantMap: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    PENDING_CEO_APPROVAL: "warning",
    ACTIVE: "success",
    TERMINATED: "destructive",
    EXPIRED: "secondary",
    REJECTED: "destructive",
  }

  const columns: ColumnDef<Lease>[] = [
    { accessorKey: "leaseNumber", header: "Lease #" },
    { accessorKey: "tenant", header: "User", cell: ({ row }) => row.original.tenant?.fullName || "-" },
    { accessorKey: "unit", header: "Unit", cell: ({ row }) => row.original.unit?.unitNumber || "-" },
    { accessorKey: "monthlyRent", header: "Rent", cell: ({ row }) => formatCurrency(row.getValue("monthlyRent")) },
    { accessorKey: "startDate", header: "Start", cell: ({ row }) => formatDate(row.getValue("startDate")) },
    { accessorKey: "endDate", header: "End", cell: ({ row }) => formatDate(row.getValue("endDate")) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => {
      const statusLabels: Record<string, string> = { PENDING_CEO_APPROVAL: "Pending CEO Approval", ACTIVE: "Active", TERMINATED: "Terminated", EXPIRED: "Expired", REJECTED: "Rejected" }
      const s = row.original.status
      const label = statusLabels[s] ?? s
      return <Badge variant={variantMap[s] || "secondary"}>{label}</Badge>
    } },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.status === "PENDING_CEO_APPROVAL" && (
            <>
              <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate(row.original.id)} title="Approve"><CheckCircle className="h-4 w-4 text-emerald-500" /></Button>
              <Button variant="ghost" size="icon" onClick={() => rejectMutation.mutate(row.original.id)} title="Reject"><X className="h-4 w-4 text-destructive" /></Button>
            </>
          )}
          {row.original.status === "ACTIVE" && (
            <Button variant="ghost" size="icon" onClick={() => terminateMutation.mutate(row.original.id)} title="Terminate"><XCircle className="h-4 w-4" /></Button>
          )}
          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => { setSelectedLease(row.original); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Leases" description="Lease agreement management">
        <Button asChild><Link href="/leases/new"><Plus className="h-4 w-4" /> Create Lease</Link></Button>
      </PageHeader>
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={() => selectedLease && deleteMutation.mutate(selectedLease.id)} loading={deleteMutation.isPending} />
    </div>
  )
}
