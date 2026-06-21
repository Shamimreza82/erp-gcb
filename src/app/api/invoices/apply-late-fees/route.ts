import { NextRequest } from "next/server"
import { InvoiceController } from "@/modules/invoices/controllers/invoice-controller"

export async function POST(request: NextRequest) {
  return InvoiceController.applyLateFees(request)
}
