import { NextRequest } from "next/server"
import { PropertyFeeController } from "@/modules/property-fees/controllers/property-fee-controller"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; feeId: string }> }) {
  const p = await params
  return PropertyFeeController.update(request, { params: p })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; feeId: string }> }) {
  const p = await params
  return PropertyFeeController.remove(request, { params: p })
}
