import { NextRequest } from "next/server"
import { BoardController } from "@/modules/boards/controllers/board-controller"

export async function GET(request: NextRequest) {
  return BoardController.list(request)
}

export async function POST(request: NextRequest) {
  return BoardController.create(request)
}
