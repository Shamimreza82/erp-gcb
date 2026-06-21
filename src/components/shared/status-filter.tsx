"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/utils/cn"

export interface StatusOption {
  label: string
  value: string
  count?: number
}

interface StatusFilterProps {
  options: StatusOption[]
  value: string
  onChange: (value: string) => void
  variant?: "tabs" | "dropdown"
  className?: string
}

export function StatusFilter({ options, value, onChange, variant = "tabs", className }: StatusFilterProps) {
  if (variant === "dropdown") {
    const selected = options.find((o) => o.value === value)
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("w-40", className)}>
          <SelectValue>{selected?.label || "Filter"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                {option.label}
                {option.count !== undefined && (
                  <span className="text-xs text-muted-foreground">({option.count})</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className={cn("flex gap-1 rounded-lg border p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
            value === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                value === option.value
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
