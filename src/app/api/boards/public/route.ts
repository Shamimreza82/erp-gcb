import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const boards = await prisma.board.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, code: true, address: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ success: true, data: boards })
}
