import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DiscussionsService {
    constructor(private readonly prisma: PrismaService) {}

    private async getUserDetails(userId: string, role: string) {
        if (role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { id: userId }});
            return student ? `${student.firstName} ${student.lastName}` : 'Student';
        } else {
            const staff = await this.prisma.staff.findUnique({ where: { id: userId }});
            return staff ? `${staff.firstName} ${staff.lastName}` : 'Teacher';
        }
    }

    async findAll(schoolId: string, subjectId?: string) {
        const whereClause: any = { schoolId };
        if (subjectId) {
            whereClause.subjectId = subjectId;
        }

        const threads = await this.prisma.discussionThread.findMany({
            where: whereClause,
            include: {
                replies: {
                    orderBy: { createdAt: 'asc' }
                },
                school: false // don't include school
            },
            orderBy: [
                { pinned: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Map to format frontend expects
        return threads.map(t => ({
            id: t.id,
            title: t.title,
            body: t.body,
            subject: t.subjectId || 'General',
            classSection: t.sectionId || '',
            author: t.authorName,
            authorRole: t.authorRole === 'STUDENT' ? 'student' : 'teacher',
            pinned: t.pinned,
            locked: t.locked,
            createdAt: t.createdAt.toISOString(),
            replies: t.replies.map(r => ({
                id: r.id,
                author: r.authorName,
                role: r.authorRole === 'STUDENT' ? 'student' : 'teacher',
                content: r.content,
                createdAt: r.createdAt.toISOString(),
            }))
        }));
    }

    async create(schoolId: string, user: any, dto: any) {
        const authorName = await this.getUserDetails(user.id, user.role);
        
        return this.prisma.discussionThread.create({
            data: {
                schoolId,
                authorId: user.id,
                authorName,
                authorRole: user.role,
                title: dto.title,
                body: dto.body,
                subjectId: dto.subject,
                sectionId: dto.classSection,
            }
        });
    }

    async addReply(threadId: string, user: any, dto: any) {
        const thread = await this.prisma.discussionThread.findUnique({ where: { id: threadId }});
        if (!thread) throw new NotFoundException('Thread not found');
        if (thread.locked) throw new Error('Thread is locked');

        const authorName = await this.getUserDetails(user.id, user.role);

        return this.prisma.discussionReply.create({
            data: {
                threadId,
                authorId: user.id,
                authorName,
                authorRole: user.role,
                content: dto.content
            }
        });
    }

    async togglePin(threadId: string, schoolId: string) {
        const thread = await this.prisma.discussionThread.findUnique({ where: { id: threadId, schoolId }});
        if (!thread) throw new NotFoundException('Thread not found');
        return this.prisma.discussionThread.update({
            where: { id: threadId },
            data: { pinned: !thread.pinned }
        });
    }

    async toggleLock(threadId: string, schoolId: string) {
        const thread = await this.prisma.discussionThread.findUnique({ where: { id: threadId, schoolId }});
        if (!thread) throw new NotFoundException('Thread not found');
        return this.prisma.discussionThread.update({
            where: { id: threadId },
            data: { locked: !thread.locked }
        });
    }
}
