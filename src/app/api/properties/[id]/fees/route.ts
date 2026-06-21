import { NextRequest } from "next/server"
import { PropertyFeeController } from "@/modules/property-fees/controllers/property-fee-controller"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PropertyFeeController.list(request, { params: { id } })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PropertyFeeController.create(request, { params: { id } })
}
