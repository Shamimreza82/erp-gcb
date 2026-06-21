export interface ChargeDetail {
  name: string
  amount: number
}

export interface InvoiceFormData {
  leaseId: string
  rentAmount: number
  utilityCharges?: number
  serviceCharges?: number
  otherCharges?: number
  chargeDetails?: ChargeDetail[]
  dueDate: string
  notes?: string
  lateFee?: number
}

export interface Invoice extends InvoiceFormData {
  id: string
  invoiceNumber: string
  totalAmount: number
  paidAmount: number
  lateFee: number
  status: "DRAFT" | "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE"
  createdAt: string
  updatedAt: string
  lease?: {
    id: string
    leaseNumber: string
    tenant: { id: string; fullName: string; phone: string }
    unit: { unitNumber: string; property: { name: string; category: string } }
  }
  payments?: any[]
}
