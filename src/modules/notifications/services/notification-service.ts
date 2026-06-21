import { prisma } from "@/lib/prisma"

export class NotificationService {
  static async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    })
  }

  static async create(data: { userId: string; title: string; message: string; type: string; createdBy?: string }) {
    return prisma.notification.create({ data })
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } })
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  }
}
