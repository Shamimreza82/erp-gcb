"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { LeaseForm } from "@/modules/leases/components/lease-form"
import type { LeaseFormData } from "@/modules/leases/types"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateLeasePage() {
  const router = useRouter()

  const createMutation = useMutation({
    mutationFn: async (formData: LeaseFormData) => {
      const r = await axios.post("/api/leases", formData)
      return r.data
    },
    onSuccess: () => {
      toast.success("Lease created")
      router.push("/leases")
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create"),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leases"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Lease</h1>
          <p className="text-sm text-muted-foreground">Create a new lease agreement</p>
        </div>
      </div>
      <div className="max-w-lg">
        <LeaseForm onSubmit={(fd) => createMutation.mutateAsync(fd)} loading={createMutation.isPending} />
      </div>
    </div>
  )
}
