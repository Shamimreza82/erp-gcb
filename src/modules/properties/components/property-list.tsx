"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { PropertyForm } from "./property-form"
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react"
import { formatDate } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import type { Property, PropertyFormData } from "../types"
import Link from "next/link"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function PropertyList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["properties", page, search],
    queryFn: async () => {
      const res = await axios.get(`/api/properties?page=${page}&search=${search}`)
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: PropertyFormData) => {
      const res = await axios.post("/api/properties", formData)
      return res.data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["properties"] }); setDialogOpen(false); toast.success("Property created") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PropertyFormData }) => {
      const res = await axios.put(`/api/properties/${id}`, data)
      return res.data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["properties"] }); setDialogOpen(false); setSelectedProperty(null); toast.success("Property updated") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/properties/${id}`)
      return res.data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["properties"] }); setDeleteDialogOpen(false); toast.success("Property deleted") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete"),
  })

  const columns: ColumnDef<Property>[] = [
    { accessorKey: "code", header: "Code" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <Badge variant="secondary">{(row.getValue("category") as string)}</Badge>,
    },
    { accessorKey: "address", header: "Address" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const v = status === "ACTIVE" ? "success" : status === "UNDER_MAINTENANCE" ? "warning" : "secondary"
        const label = status === "ACTIVE" ? "Active" : status === "INACTIVE" ? "Inactive" : status === "UNDER_MAINTENANCE" ? "Under Maintenance" : status
        return <Badge variant={v as any}>{label}</Badge>
      },
    },
    {
      accessorKey: "_count",
      header: "Units",
      cell: ({ row }) => (<span className="flex items-center gap-1"><DoorOpen className="h-3 w-3" />{row.original._count?.units || 0}</span>),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><Link href={`/properties/${row.original.id}`}><DoorOpen className="h-4 w-4" /></Link></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedProperty(row.original); setDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedProperty(row.original); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Properties" description="Manage your properties">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedProperty(null) }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Property</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{selectedProperty ? "Edit Property" : "Add Property"}</DialogTitle></DialogHeader>
            <PropertyForm
              initialData={selectedProperty ? { code: selectedProperty.code, name: selectedProperty.name, category: selectedProperty.category, address: selectedProperty.address, description: selectedProperty.description, status: selectedProperty.status } : undefined}
              onSubmit={(fd) => selectedProperty ? updateMutation.mutateAsync({ id: selectedProperty.id, data: fd }) : createMutation.mutateAsync(fd)}
              loading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={() => selectedProperty && deleteMutation.mutate(selectedProperty.id)} loading={deleteMutation.isPending} />
    </div>
  )
}
