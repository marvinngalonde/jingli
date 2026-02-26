import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
    constructor(private readonly prisma: PrismaService) { }

    // ═══════ Medical Profiles ═══════
    async upsertProfile(dto: any) {
        // Sanitize dto to only include valid schema fields
        const validFields = {
            studentId: dto.studentId,
            bloodType: dto.bloodType || null,
            allergies: dto.allergies || null,
            chronicConditions: dto.chronicConditions || dto.conditions || null,
            emergencyContact: dto.emergencyContact || null,
            emergencyPhone: dto.emergencyPhone || null,
            medicalAidProvider: dto.medicalAidProvider || null,
            medicalAidNumber: dto.medicalAidNumber || null,
            doctorName: dto.doctorName || null,
            doctorPhone: dto.doctorPhone || null,
            notes: dto.notes || null,
        };

        return this.prisma.medicalProfile.upsert({
            where: { studentId: validFields.studentId },
            create: validFields,
            update: { ...validFields, studentId: undefined } as any,
        });
    }

    async getProfile(studentId: string) {
        return this.prisma.medicalProfile.findUnique({ where: { studentId } });
    }

    // ═══════ Clinic Visits ═══════
    async createVisit(dto: any, schoolId: string) {
        return this.prisma.clinicVisit.create({
            data: {
                schoolId,
                studentId: dto.studentId,
                complaint: dto.complaint,
                diagnosis: dto.diagnosis || null,
                treatment: dto.treatment || null,
                referral: dto.referral || null,
                attendedBy: dto.attendedBy,
                parentNotified: dto.parentNotified || false,
                notes: dto.notes || null,
                date: dto.date ? new Date(dto.date) : new Date(),
            },
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
