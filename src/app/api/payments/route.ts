import { NextRequest } from "next/server"
import { PaymentController } from "@/modules/payments/controllers/payment-controller"

export async function GET(request: NextRequest) {
  return PaymentController.list(request)
}

export async function POST(request: NextRequest) {
  return PaymentController.create(request)
}
