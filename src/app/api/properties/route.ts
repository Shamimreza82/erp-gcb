import { NextRequest } from "next/server"
import { PropertyController } from "@/modules/properties/controllers/property-controller"

export async function GET(request: NextRequest) {
  return PropertyController.list(request)
}

export async function POST(request: NextRequest) {
  return PropertyController.create(request)
}
