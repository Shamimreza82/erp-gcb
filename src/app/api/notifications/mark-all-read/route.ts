import { NextRequest } from "next/server"
import { NotificationController } from "@/modules/notifications/controllers/notification-controller"

export async function POST(request: NextRequest) {
  return NotificationController.markAllRead(request)
}
