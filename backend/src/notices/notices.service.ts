import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateNoticeDto) {
        return this.prisma.notice.create({
            data: {
                title: createDto.title,
                content: createDto.content,
                targetAudience: createDto.targetAudience,
                postedBy: createDto.postedBy,
                schoolId: createDto.schoolId,
                expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
            },
        });
    }

    async findAll(audience?: string) {
        const where: any = {};
        if (audience) {
            where.targetAudience = audience;
        }

        return this.prisma.notice.findMany({
            where,
            include: {
                poster: {
                    select: {
                        email: true, // User doesn't have name directly, maybe join Staff? 
                        // For now just email or if we link to Staff profile
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

    async findOne(id: string) {
        return this.prisma.notice.findUnique({
            where: { id },
            include: {
                poster: {
                    include: {
                        staffProfile: true
                    }
                }
            }
        });
    }

    async update(id: string, updateDto: UpdateNoticeDto) {
        const data: any = { ...updateDto };
        if (updateDto.expiresAt) data.expiresAt = new Date(updateDto.expiresAt);

        return this.prisma.notice.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.notice.delete({
            where: { id },
        });
    }
}
