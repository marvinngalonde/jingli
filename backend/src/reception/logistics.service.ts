import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGatePassDto, CreateLateArrivalDto } from './dto/logistics.dto';

@Injectable()
export class LogisticsService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Gate Passes ---
    async createGatePass(dto: CreateGatePassDto, schoolId: string, userId: string) {
        return this.prisma.gatePass.create({
            data: {
                schoolId,
                studentId: dto.studentId,
                reason: dto.reason,
                guardianName: dto.guardianName,
                issuedBy: userId,
            },
            include: {
                student: {
                    select: { firstName: true, lastName: true, admissionNo: true }
                }
            }
        });
    }

    async findAllGatePasses(schoolId: string, page: number = 1, limit: number = 7) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.gatePass.findMany({
                where: { schoolId },
                include: {
                    student: {
                        select: { firstName: true, lastName: true, admissionNo: true }
                    },
                    issuer: {
                        select: { email: true }
                    }
                },
                orderBy: { issuedAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.gatePass.count({ where: { schoolId } })
        ]);

        return {
            data,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };
    }

    // --- Late Arrivals ---
    async createLateArrival(dto: CreateLateArrivalDto, schoolId: string, userId: string) {
        return this.prisma.lateArrival.create({
            data: {
                schoolId,
                studentId: dto.studentId,
                reason: dto.reason,
                reportedBy: dto.reportedBy,
                recordedBy: userId,
            },
            include: {
                student: {
                    select: { firstName: true, lastName: true, admissionNo: true }
                }
            }
        });
    }

    async findAllLateArrivals(schoolId: string, page: number = 1, limit: number = 7) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.lateArrival.findMany({
                where: { schoolId },
                include: {
                    student: {
                        select: { firstName: true, lastName: true, admissionNo: true }
                    },
                    recorder: {
                        select: { email: true }
                    }
                },
                orderBy: { arrivalTime: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.lateArrival.count({ where: { schoolId } })
        ]);

        return {
            data,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };
    }
}
