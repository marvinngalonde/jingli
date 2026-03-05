import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalaService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: any, schoolId: string) {
        if (!dto.studentId) throw new Error('studentId is required');
        if (!dto.subjectId) throw new Error('subjectId is required');

        const parsedDate = dto.date ? new Date(dto.date) : new Date();
        if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date provided');
        }

        // dto.assessedBy currently holds the userId from the Controller req.user.id.
        // We must map it to a Staff ID because CalaRecord foreign key requires Staff
        let validAssessedBy: string = dto.assessedBy || '';
        if (dto.assessedBy) {
            const staff = await this.prisma.staff.findFirst({
                where: { userId: dto.assessedBy, schoolId }
            });
            if (staff) {
                validAssessedBy = staff.id;
            } else {
                throw new Error('Staff profile not found for the current user');
            }
        }

        return this.prisma.calaRecord.create({
            data: {
                schoolId,
                studentId: dto.studentId,
                subjectId: dto.subjectId,
                termId: dto.termId || null,
                taskName: dto.taskName || 'Untitled Task',
                score: dto.score != null ? Number(dto.score) : 0,
                maxScore: dto.maxScore != null ? Number(dto.maxScore) : 50,
                teacherRemarks: dto.teacherRemarks || '',
                assessedBy: validAssessedBy,
                date: parsedDate,
            },
        });
    }

    async findAll(schoolId: string, subjectId?: string, termId?: string, studentId?: string) {
        const where: any = { schoolId };
        if (subjectId) where.subjectId = subjectId;
        if (termId) where.termId = termId;
        if (studentId) where.studentId = studentId;

        return this.prisma.calaRecord.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, admissionNo: true } },
                subject: { select: { name: true, code: true } },
                term: { select: { name: true } },
                teacher: { select: { firstName: true, lastName: true } },
            },
            orderBy: { date: 'desc' },
        });
    }

    async update(id: string, dto: any, schoolId: string) {
        return this.prisma.calaRecord.update({
            where: { id, schoolId },
            data: {
                score: dto.score,
                maxScore: dto.maxScore,
                teacherRemarks: dto.teacherRemarks,
            },
        });
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.calaRecord.delete({ where: { id, schoolId } });
    }

    async getStudentReport(schoolId: string, studentId: string, termId: string) {
        const records = await this.prisma.calaRecord.findMany({
            where: { schoolId, studentId, termId },
            include: { subject: { select: { name: true, code: true } } },
            orderBy: { subject: { name: 'asc' } },
        });

        return records.map((r: any) => ({
            subject: r.subject.name,
            subjectCode: r.subject.code,
            task: r.taskName,
            score: r.score,
            maxScore: r.maxScore,
            percentage: Math.round((r.score / r.maxScore) * 100),
            remarks: r.teacherRemarks,
        }));
    }
}
