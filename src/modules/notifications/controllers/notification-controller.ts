import { NextRequest } from "next/server"
import { NotificationService } from "../services/notification-service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export class NotificationController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const notifications = await NotificationService.findByUser(user.userId)
    const unreadCount = await NotificationService.getUnreadCount(user.userId)
    return successResponse({ notifications, unreadCount })
  }

  static async markRead(request: NextRequest, { params }: { params: { id: string } }) {
    await NotificationService.markAsRead(params.id)
    return successResponse({ message: "Marked as read" })
  }

  static async markAllRead(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    await NotificationService.markAllAsRead(user.userId)
    return successResponse({ message: "All marked as read" })
  }
}
