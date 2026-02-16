import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
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

    async findAll(schoolId: string, sectionId?: string, teacherId?: string) {
        const where: any = {
            // Implicitly filter by school via section relation
            section: { schoolId }
        };
        if (sectionId) where.sectionId = sectionId;
        if (teacherId) where.teacherId = teacherId;

        return this.prisma.timetable.findMany({
            where,
            include: {
                subject: true,
                section: true,
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
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
