import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisciplineService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: any, schoolId: string) {
        return this.prisma.disciplineRecord.create({
            data: { schoolId, ...dto, date: dto.date ? new Date(dto.date) : new Date() },
        });
    }

    async findAll(schoolId: string, studentId?: string, type?: string) {
        const where: any = { schoolId };
        if (studentId) where.studentId = studentId;
        if (type) where.type = type;

        return this.prisma.disciplineRecord.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, admissionNo: true } },
                issuer: { select: { firstName: true, lastName: true } },
            },
            orderBy: { date: 'desc' },
        });
    }

    async update(id: string, dto: any, schoolId: string) {
        return this.prisma.disciplineRecord.update({ where: { id, schoolId }, data: dto });
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.disciplineRecord.delete({ where: { id, schoolId } });
    }

    async getStudentSummary(schoolId: string, studentId: string) {
        const [merits, demerits] = await Promise.all([
            this.prisma.disciplineRecord.aggregate({ where: { schoolId, studentId, type: 'MERIT' }, _sum: { points: true }, _count: true }),
            this.prisma.disciplineRecord.aggregate({ where: { schoolId, studentId, type: 'DEMERIT' }, _sum: { points: true }, _count: true }),
        ]);
        return {
            merits: { count: merits._count, points: merits._sum.points || 0 },
            demerits: { count: demerits._count, points: demerits._sum.points || 0 },
            netScore: (merits._sum.points || 0) - (demerits._sum.points || 0),
        };
    }
}
