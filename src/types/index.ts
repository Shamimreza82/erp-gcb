export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SelectOption {
  label: string
  value: string
}

export interface DashboardStats {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  activeTenants: number
  activeLeases: number
  monthlyRevenue: number
  collectedRevenue: number
  outstandingRevenue: number
  monthlyExpenses: number
  netProfit: number
}
