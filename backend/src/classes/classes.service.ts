import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
    constructor(private readonly prisma: PrismaService) { }

    async createLevel(createDto: any, schoolId: string) {
        return this.prisma.classLevel.create({
            data: {
                ...createDto,
                schoolId,
            }
        });
    }

    async createSection(createDto: any, schoolId: string) {
        // Verify ClassLevel exists and belongs to school
        const classLevel = await this.prisma.classLevel.findFirst({
            where: { id: createDto.classLevelId, schoolId }
        });
        if (!classLevel) throw new NotFoundException('Class Level not found');

        return this.prisma.classSection.create({
            data: {
                ...createDto,
                schoolId,
            }
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.classLevel.findMany({
            where: { schoolId },
            include: {
                sections: {
                    include: {
                        classTeacher: true
                    },
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { level: 'asc' }
        });
    }

    async findOne(id: string, schoolId: string) {
        // Find Level
        const level = await this.prisma.classLevel.findFirst({
            where: { id, schoolId },
            include: { sections: true }
        });
        if (level) return level;

        // Or Find Section?
        const section = await this.prisma.classSection.findFirst({
            where: { id, schoolId },
            include: { classLevel: true, classTeacher: true }
        });
        if (section) return section;

        throw new NotFoundException('Class or Section not found');
    }

    async updateLevel(id: string, updateDto: any, schoolId: string) {
        await this.findOne(id, schoolId); // Verification
        return this.prisma.classLevel.update({
            where: { id },
            data: updateDto
        });
    }

    async updateSection(id: string, updateDto: any, schoolId: string) {
        // Verify existence
        const section = await this.prisma.classSection.findFirst({ where: { id, schoolId } });
        if (!section) throw new NotFoundException('Section not found');

        return this.prisma.classSection.update({
            where: { id },
            data: updateDto
        });
    }

    async remove(id: string, schoolId: string) {
        // Try deleting as Level (cascading sections?) or Section
        // Prisma schema doesn't strictly define cascade delete in relation manually here, 
        // usually safer to check what it is.

        const count = await this.prisma.classLevel.count({ where: { id, schoolId } });
        if (count > 0) {
            return this.prisma.classLevel.delete({ where: { id } });
        }

        const sectionCount = await this.prisma.classSection.count({ where: { id, schoolId } });
        if (sectionCount > 0) {
            return this.prisma.classSection.delete({ where: { id } });
        }

        throw new NotFoundException('Record not found');
    }

    // Get all students in a class section
    async getStudents(sectionId: string, schoolId: string) {
        // Verify section belongs to school
        const section = await this.prisma.classSection.findFirst({
            where: { id: sectionId, schoolId }
        });
        if (!section) throw new NotFoundException('Section not found');

        return this.prisma.student.findMany({
            where: { sectionId },
            include: {
                user: true
            },
            orderBy: { rollNo: 'asc' }
        });
    }

    // Get timetable for a class section
    async getTimetable(sectionId: string, schoolId: string) {
        // Verify section belongs to school
        const section = await this.prisma.classSection.findFirst({
            where: { id: sectionId, schoolId }
        });
        if (!section) throw new NotFoundException('Section not found');

        return this.prisma.timetable.findMany({
            where: { sectionId },
            include: {
                subject: true,
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

    // Get all teachers teaching a class section
    async getTeachers(sectionId: string, schoolId: string) {
        // Verify section belongs to school
        const section = await this.prisma.classSection.findFirst({
            where: { id: sectionId, schoolId }
        });
        if (!section) throw new NotFoundException('Section not found');

        // Get unique teachers from timetable
        const timetableEntries = await this.prisma.timetable.findMany({
            where: { sectionId },
            include: {
                teacher: {
                    include: {
                        user: true
                    }
                },
                subject: true
            }
        });

        // Group by teacher and collect subjects
        const teacherMap = new Map();
        timetableEntries.forEach((entry: any) => {
            const teacherId = entry.teacherId;
            if (!teacherMap.has(teacherId)) {
                teacherMap.set(teacherId, {
                    ...entry.teacher,
                    subjects: []
                });
            }
            teacherMap.get(teacherId).subjects.push(entry.subject);
        });

        return Array.from(teacherMap.values());
    }
}
