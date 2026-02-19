import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createExamDto: any) {
        const { schoolId, subjectId, classLevelId, termId, name, date, startTime, duration, maxMarks } = createExamDto;
        return this.prisma.exam.create({
            data: {
                schoolId,
                subjectId,
                classLevelId,
                termId,
                name,
                date: new Date(date),
                startTime: new Date(startTime),
                duration: parseInt(duration),
                maxMarks: parseFloat(maxMarks),
            },
        });
    }

    async findAll(schoolId: string, termId?: string, classLevelId?: string) {
        return this.prisma.exam.findMany({
            where: {
                schoolId,
                ...(termId && { termId }),
                ...(classLevelId && { classLevelId }),
            },
            include: {
                subject: true,
                classLevel: true,
                term: true,
            },
            orderBy: {
                date: 'asc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.exam.findUnique({
            where: { id },
            include: {
                subject: true,
                classLevel: true,
                term: true,
            },
        });
    }

    async update(id: string, updateExamDto: any) {
        // Basic update logic, refine as needed
        return this.prisma.exam.update({
            where: { id },
            data: updateExamDto,
        });
    }

    async remove(id: string) {
        return this.prisma.exam.delete({
            where: { id },
        });
    }
    // Exam Terms
    async createTerm(data: any) {
        return this.prisma.examTerm.create({
            data: {
                schoolId: data.schoolId,
                name: data.name,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                academicYearId: data.academicYearId,
            }
        });
    }

    async getTerms(schoolId: string) {
        return this.prisma.examTerm.findMany({
            where: { schoolId },
            orderBy: { startDate: 'asc' },
            include: { academicYear: true } // Optional: include academic year details
        });
    }
}
