import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class NoticesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService
    ) { }

    async create(createDto: CreateNoticeDto, schoolId: string, userId: string) {
        const notice = await this.prisma.notice.create({
            data: {
                title: createDto.title,
                content: createDto.content,
                targetAudience: createDto.targetAudience,
                postedBy: userId,
                schoolId: schoolId,
                expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
            },
        });

        // Trigger notifications for target audience (async and non-blocking)
        this.triggerNoticeNotifications(notice, schoolId);

        return notice;
    }

    private async triggerNoticeNotifications(notice: any, schoolId: string) {
        // Find all users in the target audience for this school
        // targetAudience can be 'ALL', 'STUDENTS', 'STAFF', 'ADMIN', etc.
        const roles: any[] = [];
        if (notice.targetAudience === 'ALL') {
            // All roles
        } else if (notice.targetAudience === 'STUDENTS') {
            roles.push('STUDENT');
        } else if (notice.targetAudience === 'STAFF') {
            roles.push('TEACHER', 'RECEPTION', 'FINANCE');
        } else {
            // Assume it's a specific role if not generic
            roles.push(notice.targetAudience);
        }

        const users = await this.prisma.user.findMany({
            where: {
                schoolId,
                ...(roles.length > 0 ? { role: { in: roles } } : {})
            },
            select: { id: true }
        });

        // Bulk create notifications (simplified loop for now)
        for (const user of users) {
            this.notificationsService.createNotification(
                user.id,
                'New Announcement',
                notice.title,
                'INFO'
            ).catch(e => console.error('Failed to send notice notification to', user.id, e));
        }
    }

    async findAll(schoolId: string, audience?: string) {
        const where: any = { schoolId };
        if (audience) {
            where.targetAudience = audience;
        }

        return this.prisma.notice.findMany({
            where,
            include: {
                poster: {
                    select: {
                        email: true,
                        staffProfile: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                }
            },
            orderBy: {
                postedAt: 'desc',
            }
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.notice.findFirst({
            where: { id, schoolId },
            include: {
                poster: {
                    include: {
                        staffProfile: true
                    }
                }
            }
        });
    }

    async update(id: string, updateDto: UpdateNoticeDto, schoolId: string) {
        await this.findOne(id, schoolId); // Ensure exists and belongs to school

        const data: any = { ...updateDto };
        if (updateDto.expiresAt) data.expiresAt = new Date(updateDto.expiresAt);

        // Remove sensitive fields if they leaked in
        delete data.schoolId;
        delete data.postedBy;

        return this.prisma.notice.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.notice.delete({
            where: { id },
        });
    }
}
