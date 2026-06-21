"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leaseSchema, type LeaseSchema } from "../validations"
import type { LeaseFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"

interface LeaseFormProps {
  initialData?: LeaseFormData
  onSubmit: (data: LeaseFormData) => Promise<void>
  loading?: boolean
}

function SearchSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  search,
  onSearchChange,
  open,
  onOpenChange,
  containerRef,
  isFetching,
  getDisplayLabel,
}: {
  value?: string
  onChange: (v: string) => void
  options: any[]
  label: string
  placeholder: string
  search: string
  onSearchChange: (v: string) => void
  open: boolean
  onOpenChange: (v: boolean) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  isFetching: boolean
  getDisplayLabel: (item: any) => string
  error?: string
}) {
  const [selectedId, setSelectedId] = useState(value)
  const [selectedLabel, setSelectedLabel] = useState("")

  useEffect(() => { setSelectedId(value) }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [containerRef, onOpenChange])

  const selected = options.find((o: any) => o.id === selectedId)

  const handleSelect = (item: any) => {
    setSelectedId(item.id)
    onChange(item.id)
    onOpenChange(false)
    onSearchChange("")
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          value={open ? search : (selected ? getDisplayLabel(selected) : "")}
          onChange={(e) => { onSearchChange(e.target.value); onOpenChange(true) }}
          onFocus={() => { onSearchChange(selected ? getDisplayLabel(selected) : ""); onOpenChange(true) }}
          placeholder={placeholder}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                {isFetching ? "Searching..." : "No results found"}
              </div>
            ) : (
              options.map((item: any) => (
                <button
                  key={item.id}
                  type="button"
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent text-left ${selectedId === item.id ? "bg-accent font-semibold" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(item) }}
                >
                  <span className="flex-1">{getDisplayLabel(item)}</span>
                  {selectedId === item.id && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function LeaseForm({ initialData, onSubmit, loading }: LeaseFormProps) {
  const [userSearch, setUserSearch] = useState("")
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  const [unitSearch, setUnitSearch] = useState("")
  const [unitOpen, setUnitOpen] = useState(false)
  const unitRef = useRef<HTMLDivElement>(null)

  const { data: users = [], isFetching: usersLoading } = useQuery({
    queryKey: ["users-search", userSearch],
    queryFn: async () => {
      const r = await axios.get(`/api/users?role=USER&limit=50&search=${encodeURIComponent(userSearch)}`)
      return r.data.data
    },
    enabled: userOpen,
  })

  const { data: units = [], isFetching: unitsLoading } = useQuery({
    queryKey: ["units-search", unitSearch],
    queryFn: async () => {
      const r = await axios.get(`/api/units?limit=50&search=${encodeURIComponent(unitSearch)}`)
      return (r.data.data || []).filter((u: any) => u.status === "VACANT")
    },
    enabled: unitOpen,
  })

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LeaseSchema>({
    resolver: zodResolver(leaseSchema),
    defaultValues: initialData || { monthlyRent: 0, securityDeposit: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SearchSelect
        value={initialData?.tenantId}
        onChange={(v) => setValue("tenantId", v)}
        options={users}
        label="User (Tenant)"
        placeholder="Search user..."
        search={userSearch}
        onSearchChange={setUserSearch}
        open={userOpen}
        onOpenChange={setUserOpen}
        containerRef={userRef}
        isFetching={usersLoading}
        getDisplayLabel={(u) => `${u.fullName} (${u.phone})`}
      />
      {errors.tenantId && <p className="text-xs text-destructive">{errors.tenantId.message}</p>}
      <SearchSelect
        value={initialData?.unitId}
        onChange={(v) => setValue("unitId", v)}
        options={units}
        label="Unit"
        placeholder="Search unit..."
        search={unitSearch}
        onSearchChange={setUnitSearch}
        open={unitOpen}
        onOpenChange={setUnitOpen}
        containerRef={unitRef}
        isFetching={unitsLoading}
        getDisplayLabel={(u) => `${u.unitNumber} - ${u.property?.name || ""} (${u.monthlyRent} BDT)`}
      />
      {errors.unitId && <p className="text-xs text-destructive">{errors.unitId.message}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" {...register("startDate")} />{errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" {...register("endDate")} />{errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="monthlyRent">Monthly Rent</Label><Input id="monthlyRent" type="number" step="0.01" {...register("monthlyRent", { valueAsNumber: true })} />{errors.monthlyRent && <p className="text-xs text-destructive">{errors.monthlyRent.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="securityDeposit">Security Deposit</Label><Input id="securityDeposit" type="number" step="0.01" {...register("securityDeposit", { valueAsNumber: true })} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Input id="notes" {...register("notes")} placeholder="Optional notes" /></div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Lease"}</Button>
    </form>
  )
}
