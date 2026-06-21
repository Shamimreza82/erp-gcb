import { format, formatDistanceToNow } from "date-fns"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy")
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy, h:mm a")
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
