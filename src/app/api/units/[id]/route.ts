import { NextRequest } from "next/server"
import { UnitController } from "@/modules/units/controllers/unit-controller"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return UnitController.getById(request, { params: { id } })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return UnitController.update(request, { params: { id } })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return UnitController.delete(request, { params: { id } })
}
