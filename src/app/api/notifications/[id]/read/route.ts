import { NextRequest } from "next/server"
import { NotificationController } from "@/modules/notifications/controllers/notification-controller"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NotificationController.markRead(request, { params: { id } })
}
