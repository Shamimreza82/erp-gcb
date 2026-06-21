"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { UnitForm } from "./unit-form"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import type { Unit, UnitFormData } from "../types"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function UnitList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["units", page, search],
    queryFn: async () => {
      const res = await axios.get(`/api/units?page=${page}&search=${search}`)
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: UnitFormData) => {
      const res = await axios.post("/api/units", formData)
      return res.data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); setDialogOpen(false); toast.success("Unit created") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UnitFormData }) => {
      const res = await axios.put(`/api/units/${id}`, data)
      return res.data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); setDialogOpen(false); setSelectedUnit(null); toast.success("Unit updated") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/units/${id}`)
      return res.data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); setDeleteDialogOpen(false); toast.success("Unit deleted") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete"),
  })

  const columns: ColumnDef<Unit>[] = [
    { accessorKey: "unitNumber", header: "Unit" },
    {
      accessorKey: "property",
      header: "Property",
      cell: ({ row }) => row.original.property?.name || "-",
    },
    { accessorKey: "floor", header: "Floor" },
    { accessorKey: "unitType", header: "Type" },
    {
      accessorKey: "monthlyRent",
      header: "Rent",
      cell: ({ row }) => formatCurrency(row.getValue("monthlyRent")),
    },
    { accessorKey: "size", header: "Size", cell: ({ row }) => row.original.size ? `${row.original.size} sqft` : "-" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variant = status === "VACANT" ? "secondary" : status === "OCCUPIED" ? "success" : "warning"
        const label = status === "VACANT" ? "Vacant" : status === "OCCUPIED" ? "Occupied" : status === "RESERVED" ? "Reserved" : status
        return <Badge variant={variant}>{label}</Badge>
      },
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
          <Button variant="ghost" size="icon" onClick={() => { setSelectedUnit(row.original); setDialogOpen(true) }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedUnit(row.original); setDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Units" description="Manage units & flats">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedUnit(null) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUnit ? "Edit Unit" : "Add Unit"}</DialogTitle>
            </DialogHeader>
            <UnitForm
              initialData={selectedUnit ? { propertyId: selectedUnit.propertyId, unitNumber: selectedUnit.unitNumber, floor: selectedUnit.floor, unitType: selectedUnit.unitType, monthlyRent: selectedUnit.monthlyRent, size: selectedUnit.size, status: selectedUnit.status } : undefined}
              onSubmit={(formData) =>
                selectedUnit
                  ? updateMutation.mutateAsync({ id: selectedUnit.id, data: formData })
                  : createMutation.mutateAsync(formData)
              }
              loading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedUnit && deleteMutation.mutate(selectedUnit.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
