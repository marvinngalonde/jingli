import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GateService {
    constructor(private prisma: PrismaService) { }

    async recordLateEntry(studentId: string, schoolId: string, recordedBy: string, reason: string) {
        // Verify student exists
        const student = await this.prisma.student.findFirst({
            where: { id: studentId, schoolId }
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        return this.prisma.lateArrival.create({
            data: {
                schoolId,
                studentId,
                reportedBy: 'GATE', // Assuming marked by gate security
                recordedBy,
                reason,
                arrivalTime: new Date()
            }
        });
    }

    async getLateEntriesToday(schoolId: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return this.prisma.lateArrival.findMany({
            where: {
                schoolId,
                arrivalTime: { gte: startOfDay }
            },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        admissionNo: true
                    }
                }
            },
            orderBy: { arrivalTime: 'desc' }
        });
    }
}

