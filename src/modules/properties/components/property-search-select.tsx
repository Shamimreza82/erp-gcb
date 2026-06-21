"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"

interface Property {
  id: string
  code: string
  name: string
  category: string
}

interface PropertySearchSelectProps {
  value?: string
  onChange: (propertyId: string) => void
  error?: string
}

export function PropertySearchSelect({ value, onChange, error }: PropertySearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState(value)
  const [selectedLabel, setSelectedLabel] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedId(value)
  }, [value])

  const { data: properties = [], isFetching } = useQuery({
    queryKey: ["properties-search", search],
    queryFn: async () => {
      const r = await axios.get(`/api/properties?limit=50&search=${encodeURIComponent(search)}`)
      return r.data.data
    },
    enabled: open,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSelectedLabel("")
      return
    }
    if (!open && !selectedLabel) {
      axios.get(`/api/properties/${selectedId}`).then(r => {
        const p = r.data.data
        setSelectedLabel(`${p.code} - ${p.name}`)
      }).catch(() => {})
    }
  }, [selectedId, open, selectedLabel])

  const handleSelect = (property: Property) => {
    setSelectedId(property.id)
    onChange(property.id)
    setSelectedLabel(`${property.code} - ${property.name}`)
    setSearch("")
    setOpen(false)
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>Property</Label>
      <div className="relative">
        <Input
          value={open ? search : selectedLabel}
          onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => { setSearch(selectedLabel); setOpen(true) }}
          placeholder="Search property..."
          className={error ? "border-destructive" : ""}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto">
            {properties.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                {isFetching ? "Searching..." : "No properties found"}
              </div>
            ) : (
              properties.map((property: Property) => (
                <button
                  key={property.id}
                  type="button"
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent text-left ${selectedId === property.id ? "bg-accent font-semibold" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(property) }}
                >
                  <span className="font-medium">{property.code}</span>
                  <span className="text-muted-foreground">- {property.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{property.category}</span>
                  {selectedId === property.id && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
