import { NextRequest } from "next/server"
import { BoardController } from "@/modules/boards/controllers/board-controller"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return BoardController.getById(request, { params: { id } })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return BoardController.update(request, { params: { id } })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return BoardController.delete(request, { params: { id } })
}
