export interface BoardFormData {
  name: string
  code: string
  address?: string
  ceoEmail: string
  ceoName: string
  ceoPhone?: string
}

export interface Board {
  id: string
  name: string
  code: string
  address: string | null
  logo: string | null
  isActive: boolean
  createdAt: string
  _count?: {
    users: number
    properties: number
  }
}
