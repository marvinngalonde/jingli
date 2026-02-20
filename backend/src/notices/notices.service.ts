import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateNoticeDto, schoolId: string, userId: string) {
        return this.prisma.notice.create({
            data: {
                title: createDto.title,
                content: createDto.content,
                targetAudience: createDto.targetAudience,
                postedBy: userId,
                schoolId: schoolId,
                expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
            },
        });
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
