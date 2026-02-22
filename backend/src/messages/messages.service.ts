import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService
    ) { }

    async create(createDto: CreateMessageDto) {
        const message = await this.prisma.message.create({
            data: {
                senderId: createDto.senderId,
                receiverId: createDto.receiverId,
                content: createDto.content,
            },
            include: {
                sender: {
                    select: {
                        email: true,
                        staffProfile: { select: { firstName: true, lastName: true } },
                        studentProfile: { select: { firstName: true, lastName: true } },
                    }
                }
            }
        });

        // Trigger notification for receiver
        const senderName = message.sender.staffProfile
            ? `${message.sender.staffProfile.firstName} ${message.sender.staffProfile.lastName}`
            : message.sender.studentProfile
                ? `${message.sender.studentProfile.firstName} ${message.sender.studentProfile.lastName}`
                : message.sender.email;

        await this.notificationsService.createNotification(
            createDto.receiverId,
            'New Message',
            `You have a new message from ${senderName}: "${createDto.content.substring(0, 50)}${createDto.content.length > 50 ? '...' : ''}"`,
            'INFO'
        );

        return message;
    }

    // Get conversation between two users
    async findConversation(userId1: string, userId2: string) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 },
                ]
            },
            orderBy: {
                sentAt: 'asc',
            },
            include: {
                sender: {
                    select: {
                        email: true,
                        // Include profiles to get names
                        staffProfile: { select: { firstName: true, lastName: true } },
                        studentProfile: { select: { firstName: true, lastName: true } },
                        guardianProfile: { select: { firstName: true, lastName: true } },
                    }
                }
            }
        });
    }

    // Get all messages for a user (Inbox / Sent) - heavily summarized or recently active
    // This is complex, maybe just get recent messages
    async getUserMessages(userId: string) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { receiverId: userId },
                    { senderId: userId }
                ]
            },
            orderBy: {
                sentAt: 'desc',
            },
            take: 50,
            include: {
                sender: {
                    select: {
                        email: true,
                        staffProfile: { select: { firstName: true, lastName: true } },
                        studentProfile: { select: { firstName: true, lastName: true } },
                    }
                },
                receiver: {
                    select: {
                        email: true,
                        staffProfile: { select: { firstName: true, lastName: true } },
                        studentProfile: { select: { firstName: true, lastName: true } },
                    }
                },
            }
        });
    }

    // Get list of unique users the current user has discussed with
    async getConversations(userId: string) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { sentAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        staffProfile: { select: { firstName: true, lastName: true } },
                        studentProfile: { select: { firstName: true, lastName: true } },
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        staffProfile: { select: { firstName: true, lastName: true } },
                        studentProfile: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        const conversationsMap = new Map();

        messages.forEach((msg) => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!conversationsMap.has(partner.id)) {
                conversationsMap.set(partner.id, {
                    partner,
                    lastMessage: msg,
                });
            }
        });

        return Array.from(conversationsMap.values());
    }
}
