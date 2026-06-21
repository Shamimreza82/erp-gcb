import { NextRequest } from "next/server"
import { PaymentController } from "@/modules/payments/controllers/payment-controller"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PaymentController.delete(request, { params: { id } })
}
