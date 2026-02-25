import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto, CreateRouteDto, AssignStudentRouteDto } from './dto/transport.dto';

@Injectable()
export class TransportService {
    constructor(private readonly prisma: PrismaService) { }

    // ═══════ Vehicles ═══════
    async createVehicle(dto: CreateVehicleDto, schoolId: string) {
        return this.prisma.vehicle.create({
            data: {
                schoolId,
                regNumber: dto.regNumber,
                make: dto.make,
                model: dto.model,
                year: dto.year,
                capacity: dto.capacity || 50,
                insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : null,
                nextServiceDate: dto.nextServiceDate ? new Date(dto.nextServiceDate) : null,
            },
        });
    }

    async findAllVehicles(schoolId: string) {
        return this.prisma.vehicle.findMany({
            where: { schoolId },
            include: { routes: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async removeVehicle(id: string, schoolId: string) {
        return this.prisma.vehicle.delete({ where: { id, schoolId } });
    }

    // ═══════ Routes ═══════
    async createRoute(dto: CreateRouteDto, schoolId: string) {
        return this.prisma.route.create({
            data: {
                schoolId,
                name: dto.name,
                description: dto.description,
                vehicleId: dto.vehicleId,
                driverName: dto.driverName,
                startTime: dto.startTime,
                endTime: dto.endTime,
                stops: dto.stops || [],
            },
        });
    }

    async findAllRoutes(schoolId: string) {
        return this.prisma.route.findMany({
            where: { schoolId },
            include: {
                vehicle: { select: { regNumber: true, make: true, capacity: true } },
                students: {
                    include: {
                        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOneRoute(id: string, schoolId: string) {
        return this.prisma.route.findFirst({
            where: { id, schoolId },
            include: {
                vehicle: true,
                students: {
                    include: {
                        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
                    },
                },
            },
        });
    }

    async updateRoute(id: string, dto: Partial<CreateRouteDto>, schoolId: string) {
        return this.prisma.route.update({
            where: { id, schoolId },
            data: { ...dto, stops: dto.stops || undefined },
        });
    }

    async removeRoute(id: string, schoolId: string) {
        await this.prisma.studentRoute.deleteMany({ where: { routeId: id } });
        return this.prisma.route.delete({ where: { id, schoolId } });
    }

    // ═══════ Student Routes ═══════
    async assignStudent(dto: AssignStudentRouteDto, schoolId: string) {
        return this.prisma.studentRoute.create({
            data: {
                schoolId,
                studentId: dto.studentId,
                routeId: dto.routeId,
                pickupPoint: dto.pickupPoint,
                direction: (dto.direction as any) || 'BOTH',
            },
        });
    }

    async unassignStudent(id: string, schoolId: string) {
        return this.prisma.studentRoute.delete({ where: { id, schoolId } });
    }

    // ═══════ Stats ═══════
    async getStats(schoolId: string) {
        const [vehicles, routes, activeRoutes, studentsOnRoutes] = await Promise.all([
            this.prisma.vehicle.count({ where: { schoolId } }),
            this.prisma.route.count({ where: { schoolId } }),
            this.prisma.route.count({ where: { schoolId, status: 'ACTIVE' } }),
            this.prisma.studentRoute.count({ where: { schoolId } }),
        ]);
        return { totalVehicles: vehicles, totalRoutes: routes, activeRoutes, studentsOnRoutes };
    }
}
