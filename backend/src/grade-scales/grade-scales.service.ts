import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradeScalesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: any, schoolId: string) {
        return this.prisma.gradeScale.create({
            data: {
                schoolId,
                name: dto.name,
                system: dto.system || 'CUSTOM',
                ranges: { create: dto.ranges?.map((r: any) => ({ grade: r.grade, symbol: r.symbol, minPercent: r.minPercent, maxPercent: r.maxPercent, points: r.points, description: r.description })) },
            },
            include: { ranges: true },
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.gradeScale.findMany({
            where: { schoolId },
            include: { ranges: { orderBy: { minPercent: 'desc' } } },
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.gradeScale.findFirst({
            where: { id, schoolId },
            include: { ranges: { orderBy: { minPercent: 'desc' } } },
        });
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.gradeScale.delete({ where: { id, schoolId } });
    }
}
