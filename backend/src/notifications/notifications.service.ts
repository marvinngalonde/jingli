import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async getUserNotifications(userId: string, unreadOnly: boolean = false) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly ? { readStatus: false } : {})
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50 for performance
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, readStatus: false }
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { readStatus: true }
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, readStatus: false },
            data: { readStatus: true }
        });
    }

    // Internal utility for other services to trigger notifications
    async createNotification(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO') {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    }
}
