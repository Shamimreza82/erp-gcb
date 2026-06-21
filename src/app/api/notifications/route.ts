import { NextRequest } from "next/server"
import { NotificationController } from "@/modules/notifications/controllers/notification-controller"

export async function GET(request: NextRequest) {
  return NotificationController.list(request)
}
