"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { BoardFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const boardSchema = z.object({
  name: z.string().min(1, "Board name is required"),
  code: z.string().min(2, "Code is required").toUpperCase(),
  address: z.string().optional(),
  ceoEmail: z.string().email("Valid email required"),
  ceoName: z.string().min(1, "CEO name is required"),
  ceoPhone: z.string().optional(),
})

interface BoardFormProps {
  onSubmit: (data: BoardFormData) => Promise<void>
  loading?: boolean
}

export function BoardForm({ onSubmit, loading }: BoardFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Board Name</Label>
          <Input id="name" {...register("name")} placeholder="e.g. Gazipur Cantonment Board" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Board Code</Label>
          <Input id="code" {...register("code")} placeholder="e.g. GCB" />
          {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} placeholder="Board address" />
      </div>
      <hr />
      <p className="text-sm font-medium text-muted-foreground">CEO Account (auto-created)</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ceoName">CEO Full Name</Label>
          <Input id="ceoName" {...register("ceoName")} placeholder="CEO name" />
          {errors.ceoName && <p className="text-xs text-destructive">{errors.ceoName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ceoEmail">CEO Email (login)</Label>
          <Input id="ceoEmail" type="email" {...register("ceoEmail")} placeholder="ceo@board.gov.bd" />
          {errors.ceoEmail && <p className="text-xs text-destructive">{errors.ceoEmail.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ceoPhone">CEO Phone</Label>
        <Input id="ceoPhone" {...register("ceoPhone")} placeholder="Optional" />
      </div>
      <p className="text-xs text-muted-foreground">Default password for all accounts: <strong>123456</strong></p>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Board"}
      </Button>
    </form>
  )
}
