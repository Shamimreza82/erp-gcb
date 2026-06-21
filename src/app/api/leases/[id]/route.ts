import { NextRequest } from "next/server"
import { LeaseController } from "@/modules/leases/controllers/lease-controller"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return LeaseController.getById(request, { params: { id } })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return LeaseController.delete(request, { params: { id } })
}
