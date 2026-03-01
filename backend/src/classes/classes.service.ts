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

    async findAll(schoolId: string, teacherId?: string) {
        let sectionWhere: any = {};
        if (teacherId) {
            const staff = await this.prisma.staff.findUnique({ where: { userId: teacherId } });
            if (!staff) return [];

            const [subjectAllocs, classSections] = await Promise.all([
                this.prisma.subjectAllocation.findMany({ where: { staffId: staff.id }, select: { sectionId: true } }),
                this.prisma.classSection.findMany({ where: { classTeacherId: staff.id }, select: { id: true } })
            ]);

            const teacherSectionIds = new Set([
                ...subjectAllocs.map(a => a.sectionId),
                ...classSections.map(s => s.id)
            ]);

            if (teacherSectionIds.size === 0) return []; // No classes assigned

            sectionWhere = { id: { in: Array.from(teacherSectionIds) } };
        }

        const classLevels = await this.prisma.classLevel.findMany({
            where: { schoolId },
            include: {
                sections: {
                    where: Object.keys(sectionWhere).length > 0 ? sectionWhere : undefined,
                    include: {
                        classTeacher: true,
                        _count: { select: { students: true } }
                    },
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { level: 'asc' }
        });

        if (teacherId) {
            return classLevels.filter(cl => cl.sections.length > 0);
        }
        return classLevels;
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
            include: {
                classLevel: true,
                classTeacher: {
                    include: { user: true }
                },
                _count: { select: { students: true } }
            }
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

    // Get all teachers associated with a class section (from timetable + allocations)
    async getTeachers(sectionId: string, schoolId: string) {
        const section = await this.prisma.classSection.findFirst({
            where: { id: sectionId, schoolId }
        });
        if (!section) throw new NotFoundException('Section not found');

        // From timetable
        const timetableEntries = await this.prisma.timetable.findMany({
            where: { sectionId },
            include: {
                teacher: { include: { user: true } },
                subject: true
            }
        });

        // From subject allocations
        const allocations = await this.prisma.subjectAllocation.findMany({
            where: { sectionId },
            include: {
                staff: { include: { user: true } },
                subject: true
            }
        });

        // Merge both sources into a teacher map
        const teacherMap = new Map<string, any>();

        timetableEntries.forEach((entry: any) => {
            const tid = entry.teacherId;
            if (!teacherMap.has(tid)) {
                teacherMap.set(tid, {
                    ...entry.teacher,
                    subjects: []
                });
            }
            const subjectNames = teacherMap.get(tid).subjects.map((s: any) => s.id);
            if (!subjectNames.includes(entry.subject.id)) {
                teacherMap.get(tid).subjects.push(entry.subject);
            }
        });

        allocations.forEach((alloc: any) => {
            const tid = alloc.staffId;
            if (!teacherMap.has(tid)) {
                teacherMap.set(tid, {
                    ...alloc.staff,
                    subjects: []
                });
            }
            const subjectNames = teacherMap.get(tid).subjects.map((s: any) => s.id);
            if (!subjectNames.includes(alloc.subject.id)) {
                teacherMap.get(tid).subjects.push(alloc.subject);
            }
        });

        return Array.from(teacherMap.values());
    }
}
