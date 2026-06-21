import { NextRequest } from "next/server"
import { UnitController } from "@/modules/units/controllers/unit-controller"

export async function GET(request: NextRequest) {
  return UnitController.list(request)
}

export async function POST(request: NextRequest) {
  return UnitController.create(request)
}
