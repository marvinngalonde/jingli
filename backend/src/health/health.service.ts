import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
    constructor(private readonly prisma: PrismaService) { }

    // ═══════ Medical Profiles ═══════
    async upsertProfile(dto: any) {
        return this.prisma.medicalProfile.upsert({
            where: { studentId: dto.studentId },
            create: { ...dto },
            update: { ...dto },
        });
    }

    async getProfile(studentId: string) {
        return this.prisma.medicalProfile.findUnique({ where: { studentId } });
    }

    // ═══════ Clinic Visits ═══════
    async createVisit(dto: any, schoolId: string) {
        return this.prisma.clinicVisit.create({
            data: { schoolId, ...dto, date: dto.date ? new Date(dto.date) : new Date() },
        });
    }

    async findAllVisits(schoolId: string, studentId?: string) {
        const where: any = { schoolId };
        if (studentId) where.studentId = studentId;

        return this.prisma.clinicVisit.findMany({
            where,
            include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
            orderBy: { date: 'desc' },
        });
    }

    async updateVisit(id: string, dto: any, schoolId: string) {
        return this.prisma.clinicVisit.update({ where: { id, schoolId }, data: dto });
    }

    async removeVisit(id: string, schoolId: string) {
        return this.prisma.clinicVisit.delete({ where: { id, schoolId } });
    }

    async getStats(schoolId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [total, todayVisits, profiles] = await Promise.all([
            this.prisma.clinicVisit.count({ where: { schoolId } }),
            this.prisma.clinicVisit.count({ where: { schoolId, date: { gte: today } } }),
            this.prisma.medicalProfile.count(),
        ]);
        return { totalVisits: total, todayVisits, profilesRecorded: profiles };
    }
}
