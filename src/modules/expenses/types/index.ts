export interface ExpenseFormData {
  title: string
  category: "MAINTENANCE" | "UTILITY" | "CLEANING" | "SECURITY" | "MISCELLANEOUS"
  amount: number
  date: string
  notes?: string
}

export interface Expense extends ExpenseFormData {
  id: string
  createdAt: string
  updatedAt: string
}
