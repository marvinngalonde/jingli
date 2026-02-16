import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { BulkCreateTimetableDto } from './dto/bulk-create-timetable.dto';
import { DayOfWeek } from './dto/create-timetable.dto';

@Injectable()
export class TimetableService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateTimetableDto, schoolId: string) {
        // Validate that section, subject, and teacher belong to the school
        const section = await this.prisma.classSection.findFirst({ where: { id: createDto.sectionId, schoolId } });
        if (!section) throw new Error('Section not found or does not belong to school');

        // Similarly for subject and teacher if stricter checks needed

        return this.prisma.timetable.create({
            data: {
                sectionId: createDto.sectionId,
                subjectId: createDto.subjectId,
                teacherId: createDto.teacherId,
                day: createDto.day as any,
                startTime: new Date(createDto.startTime),
                endTime: new Date(createDto.endTime),
                roomNo: createDto.roomNo,
            },
        });
    }

    async bulkCreate(bulkDto: BulkCreateTimetableDto, schoolId: string) {
        // We can optimize this by doing a single validation check if all entries are for the same section
        // For now, let's just map them to create operations
        const operations = bulkDto.entries.map(entry => {
            return this.prisma.timetable.create({
                data: {
                    sectionId: entry.sectionId,
                    subjectId: entry.subjectId,
                    teacherId: entry.teacherId,
                    day: entry.day as any,
                    startTime: new Date(entry.startTime),
                    endTime: new Date(entry.endTime),
                    roomNo: entry.roomNo,
                }
            });
        });

        // Use transaction to ensure all or nothing
        // Note: prisma.$transaction works with promises of operations
        // But createMany is more efficient if your DB supports it and you don't need the created objects back individually
        // Since we have relations and date conversions, createMany is slightly trickier with Dates if not handled carefully
        // Also we have validation logic.
        // Let's do a simple loop or Promise.all for now, or proper transaction.

        return this.prisma.$transaction(operations);
    }

    async findAll(schoolId: string, sectionId?: string, teacherId?: string, subjectId?: string) {
        const where: any = {
            // Implicitly filter by school via section relation
            section: { schoolId }
        };
        if (sectionId) where.sectionId = sectionId;
        if (teacherId) where.teacherId = teacherId;
        if (subjectId) where.subjectId = subjectId;

        return this.prisma.timetable.findMany({
            where,
            include: {
                subject: true,
                section: true,
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                day: 'asc',
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.timetable.findUnique({
            where: { id },
            include: {
                subject: true,
                section: true,
                teacher: true
            }
        });
    }

    async update(id: string, updateDto: UpdateTimetableDto) {
        const data: any = { ...updateDto };
        if (updateDto.startTime) data.startTime = new Date(updateDto.startTime);
        if (updateDto.endTime) data.endTime = new Date(updateDto.endTime);

        return this.prisma.timetable.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.timetable.delete({
            where: { id },
        });
    }
}
