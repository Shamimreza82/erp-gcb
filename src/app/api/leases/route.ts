import { NextRequest } from "next/server"
import { LeaseController } from "@/modules/leases/controllers/lease-controller"

export async function GET(request: NextRequest) {
  return LeaseController.list(request)
}

export async function POST(request: NextRequest) {
  return LeaseController.create(request)
}
