import { NextRequest } from "next/server"
import { LeaseController } from "@/modules/leases/controllers/lease-controller"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return LeaseController.terminate(request, { params: { id } })
}
