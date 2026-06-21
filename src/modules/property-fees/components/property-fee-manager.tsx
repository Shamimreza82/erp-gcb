"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Pencil, X, Check, Loader2, Copy, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import type { PropertyFee } from "../types"

const feeTypes = [
  "Electricity Bill", "Gas Bill", "Water Bill", "Maintenance",
  "Security", "Trash Bill", "Service Charge", "Other",
]

const currentYear = new Date().getFullYear()

function calcAnnual(rate: number) { return rate * 12 }

export function PropertyFeeManager({ propertyId }: { propertyId: string }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingFee, setEditingFee] = useState<PropertyFee | null>(null)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [newYearInput, setNewYearInput] = useState("")

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["property-fees", propertyId],
    queryFn: async () => {
      const r = await axios.get(`/api/properties/${propertyId}/fees`)
      return r.data.data
    },
  })

  const resetForm = () => {
    setName(""); setAmount(""); setOverrides({}); setNewYearInput(""); setShowForm(false); setEditingFee(null)
  }

  const buildPayload = () => {
    const p: any = { name, amount: parseFloat(amount) || 0 }
    const def = parseFloat(amount) || 0
    const cleaned: Record<string, number> = {}
    for (const [year, val] of Object.entries(overrides)) {
      const num = parseFloat(val)
      if (!isNaN(num) && num !== def) cleaned[year] = num
    }
    if (Object.keys(cleaned).length > 0) p.yearlyOverrides = cleaned
    return p
  }

  const createMutation = useMutation({
    mutationFn: async () => { await axios.post(`/api/properties/${propertyId}/fees`, buildPayload()) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["property-fees", propertyId] }); resetForm(); toast.success("Fee added") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to add fee"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => { await axios.put(`/api/properties/${propertyId}/fees/${id}`, buildPayload()) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["property-fees", propertyId] }); resetForm(); toast.success("Fee updated") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update fee"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await axios.delete(`/api/properties/${propertyId}/fees/${id}`) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["property-fees", propertyId] }); toast.success("Fee removed") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to remove fee"),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await axios.put(`/api/properties/${propertyId}/fees/${id}`, { isActive })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["property-fees", propertyId] }); toast.success("Updated") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update"),
  })

  const startEdit = (fee: PropertyFee) => {
    setEditingFee(fee)
    setName(fee.name)
    setAmount(String(fee.amount))
    const ov: Record<string, string> = {}
    if (fee.yearlyOverrides) {
      for (const [y, v] of Object.entries(fee.yearlyOverrides)) ov[y] = String(v)
    }
    setOverrides(ov)
    setShowForm(true)
  }

  const addYear = () => {
    const y = newYearInput.trim()
    if (!y || !/^\d{4}$/.test(y)) { toast.error("Enter a 4-digit year"); return }
    if (y in overrides) { toast.error("Year already exists"); return }
    setOverrides({ ...overrides, [y]: "" })
    setNewYearInput("")
  }

  const removeYear = (y: string) => {
    const { [y]: _, ...rest } = overrides
    setOverrides(rest)
  }

  const copyFromPrev = () => {
    const years = Object.keys(overrides).sort()
    if (years.length === 0) { toast.error("No years to copy from"); return }
    const last = years[years.length - 1]
    const lastVal = overrides[last]
    const next = String(Number(last) + 1)
    if (next in overrides) { toast.error("Next year already exists"); return }
    setOverrides({ ...overrides, [next]: lastVal })
  }

  const applyIncrease = () => {
    const pct = prompt("Increase by % (e.g. 5 for 5%):")
    if (!pct) return
    const factor = 1 + (parseFloat(pct) / 100)
    if (isNaN(factor)) { toast.error("Invalid percentage"); return }
    const updated: Record<string, string> = {}
    for (const [y, v] of Object.entries(overrides)) {
      const num = parseFloat(v)
      updated[y] = String(Math.round((isNaN(num) ? parseFloat(amount) || 0 : num) * factor))
    }
    setOverrides(updated)
  }

  const sortedYears = Object.keys(overrides).sort()

  const defaultRate = parseFloat(amount) || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Service Charges</CardTitle>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add Charge
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Name</Label>
                <Select value={name} onValueChange={setName}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {feeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">Default /mo</Label>
                <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
              </div>
              <div className="flex items-end gap-1">
                <Button size="icon" variant="ghost"
                  onClick={() => editingFee ? updateMutation.mutate({ id: editingFee.id }) : createMutation.mutate()}
                  disabled={!name || !amount || createMutation.isPending || updateMutation.isPending}>
                  <Check className="h-4 w-4 text-emerald-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-xs text-muted-foreground">Yearly Overrides</Label>
                <div className="flex-1" />
                <Input type="text" placeholder="YYYY" value={newYearInput}
                  onChange={e => setNewYearInput(e.target.value)} className="w-16 h-7 text-xs" />
                <Button variant="outline" size="sm" onClick={addYear}><Plus className="h-3 w-3" /> Add</Button>
                {sortedYears.length > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={copyFromPrev}>
                      <Copy className="h-3 w-3" /> Copy Prev
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyIncrease}>
                      <TrendingUp className="h-3 w-3" /> Apply %
                    </Button>
                  </>
                )}
              </div>

              {sortedYears.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-1 pr-2 w-16">Year</th>
                        <th className="text-left py-1 px-2">Rate /mo</th>
                        <th className="text-right py-1 px-2">Annual</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedYears.map(y => {
                        const val = parseFloat(overrides[y])
                        const rate = isNaN(val) ? defaultRate : val
                        return (
                          <tr key={y} className="border-b last:border-b-0">
                            <td className="py-1 pr-2 font-medium">{y}</td>
                            <td className="py-1 px-2">
                              <Input type="number" step="0.01" value={overrides[y]}
                                onChange={e => setOverrides({ ...overrides, [y]: e.target.value })}
                                className="h-7 w-24 text-xs" placeholder={String(defaultRate)} />
                            </td>
                            <td className="py-1 px-2 text-right font-semibold">{calcAnnual(rate).toFixed(0)}</td>
                            <td className="py-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeYear(y)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No overrides — default rate applies to all years</p>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : fees.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No service charges configured</p>
        ) : (
          <div className="space-y-3">
            {fees.map((fee: PropertyFee) => {
              const years = fee.yearlyOverrides ? Object.keys(fee.yearlyOverrides).sort() : []
              const allYears = years.length > 0 ? years : [String(currentYear)]
              const grandTotal = allYears.reduce((sum, y) =>
                sum + calcAnnual(fee.yearlyOverrides?.[y] ?? fee.amount), 0)
              return (
                <div key={fee.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium">{fee.name}</p>
                      <p className="text-xs text-muted-foreground">{fee.amount.toFixed(0)} /mo</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-600">{grandTotal.toFixed(0)} BDT</span>
                      <Switch checked={fee.isActive} onCheckedChange={checked => toggleMutation.mutate({ id: fee.id, isActive: checked })} />
                      <Button variant="ghost" size="icon" onClick={() => startEdit(fee)}><Pencil className="h-4 w-4 text-amber-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(fee.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-1 pr-4 w-16">Year</th>
                          <th className="text-left py-1 px-2">Rate /mo</th>
                          <th className="text-right py-1 px-2">Annual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allYears.map(y => {
                          const rate = fee.yearlyOverrides?.[y] ?? fee.amount
                          return (
                            <tr key={y} className="border-b last:border-b-0">
                              <td className="py-1 pr-4 font-medium">{y}</td>
                              <td className="py-1 px-2">
                                {fee.yearlyOverrides?.[y]
                                  ? <span className="font-semibold">{rate.toFixed(0)}</span>
                                  : <span className="text-muted-foreground">{rate.toFixed(0)}</span>}
                              </td>
                              <td className="py-1 px-2 text-right font-semibold">{calcAnnual(rate).toFixed(0)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
