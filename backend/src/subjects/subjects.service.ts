import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createSubjectDto: any, schoolId: string) {
        return this.prisma.subject.create({
            data: {
                ...createSubjectDto,
                schoolId,
            }
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.subject.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string, schoolId: string) {
        const record = await this.prisma.subject.findFirst({
            where: { id, schoolId }
        });
        if (!record) throw new NotFoundException('Subject not found');
        return record;
    }

    async update(id: string, updateSubjectDto: any, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.subject.update({
            where: { id },
            data: updateSubjectDto
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.subject.delete({ where: { id } });
    }

    async allocate(allocationDto: any, schoolId: string) {
        const { subjectId, sectionId, staffId } = allocationDto;

        // 1. Verify existence and ownership
        const subject = await this.prisma.subject.findFirst({ where: { id: subjectId, schoolId } });
        if (!subject) throw new NotFoundException('Subject not found');

        const section = await this.prisma.classSection.findFirst({ where: { id: sectionId, schoolId } });
        if (!section) throw new NotFoundException('Section not found');

        const staff = await this.prisma.staff.findFirst({ where: { id: staffId, schoolId } });
        if (!staff) throw new NotFoundException('Staff not found');

        // 2. Check strict subject-level constraint? 
        // Some schools assign "Maths" generally, some exact "Maths 101".
        // Schema allows allocating 'Subject' to 'Section' handled by 'Staff'.

        // 3. Create allocation
        return this.prisma.subjectAllocation.create({
            data: {
                subjectId,
                sectionId,
                staffId
            }
        });
    }

    // Get all timetable assignments for a subject (which classes and teachers)
    async getAssignments(subjectId: string, schoolId: string) {
        // Verify subject belongs to school
        await this.findOne(subjectId, schoolId);

        return this.prisma.timetable.findMany({
            where: { subjectId },
            include: {
                section: {
                    include: {
                        classLevel: true
                    }
                },
                teacher: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: [
                { day: 'asc' },
                { startTime: 'asc' }
            ]
        });
    }

    // Get all teachers teaching this subject
    async getTeachers(subjectId: string, schoolId: string) {
        // Verify subject belongs to school
        await this.findOne(subjectId, schoolId);

        const timetableEntries = await this.prisma.timetable.findMany({
            where: { subjectId },
            include: {
                teacher: {
                    include: {
                        user: true
                    }
                },
                section: {
                    include: {
                        classLevel: true
                    }
                }
            }
        });

        // Group by teacher and collect classes
        const teacherMap = new Map();
        timetableEntries.forEach((entry: any) => {
            const teacherId = entry.teacherId;
            if (!teacherMap.has(teacherId)) {
                teacherMap.set(teacherId, {
                    ...entry.teacher,
                    classes: [],
                    totalHours: 0
                });
            }
            const teacher = teacherMap.get(teacherId);
            teacher.classes.push({
                section: entry.section,
                day: entry.day,
                startTime: entry.startTime,
                endTime: entry.endTime
            });
            // Calculate hours (simplified - assumes each entry is 1 hour)
            teacher.totalHours += 1;
        });

        return Array.from(teacherMap.values());
    }

    // Get all classes teaching this subject
    async getClasses(subjectId: string, schoolId: string) {
        // Verify subject belongs to school
        await this.findOne(subjectId, schoolId);

        const timetableEntries = await this.prisma.timetable.findMany({
            where: { subjectId },
            include: {
                section: {
                    include: {
                        classLevel: true
                    }
                }
            }
        });

        // Get unique sections
        const sectionMap = new Map();
        timetableEntries.forEach((entry: any) => {
            const sectionId = entry.sectionId;
            if (!sectionMap.has(sectionId)) {
                sectionMap.set(sectionId, {
                    ...entry.section,
                    weeklyHours: 0
                });
            }
            sectionMap.get(sectionId).weeklyHours += 1;
        });

        return Array.from(sectionMap.values());
    }
}
