export interface PropertyFormData {
  code: string
  name: string
  category: "SHOP" | "LAND" | "HOUSE" | "FLAT" | "MARKET" | "WAREHOUSE" | "OTHER"
  address?: string
  description?: string
  status: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE"
}

export interface Property extends PropertyFormData {
  id: string
  boardId: string
  createdAt: string
  updatedAt: string
  _count?: { units: number }
}
