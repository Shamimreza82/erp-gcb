import { NextRequest } from "next/server"
import { InvoiceController } from "@/modules/invoices/controllers/invoice-controller"

export async function GET(request: NextRequest) {
  return InvoiceController.list(request)
}

export async function POST(request: NextRequest) {
  return InvoiceController.create(request)
}
