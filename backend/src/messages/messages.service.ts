import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateMessageDto) {
        return this.prisma.message.create({
            data: {
                senderId: createDto.senderId,
                receiverId: createDto.receiverId,
                content: createDto.content,
            },
        });
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
                sender: { select: { email: true } },
                receiver: { select: { email: true } },
            }
        });
    }
}
