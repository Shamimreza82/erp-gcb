export interface PaymentFormData {
  invoiceId: string
  amount: number
  date: string
  method: "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING"
  referenceNumber?: string
  notes?: string
}

export interface PaymentRecord extends PaymentFormData {
  id: string
  receiptUrl?: string
  createdAt: string
  updatedAt: string
  invoice?: {
    invoiceNumber: string
    totalAmount: number
    paidAmount: number
    status: string
    lease: {
      tenant: { fullName: string }
    }
  }
}
