import { NextRequest } from "next/server"
import { PropertyController } from "@/modules/properties/controllers/property-controller"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PropertyController.getById(request, { params: { id } })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PropertyController.update(request, { params: { id } })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PropertyController.delete(request, { params: { id } })
}
