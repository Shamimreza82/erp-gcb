import { NextRequest } from "next/server"
import { InvoiceController } from "@/modules/invoices/controllers/invoice-controller"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return InvoiceController.getById(request, { params: { id } })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return InvoiceController.delete(request, { params: { id } })
}
