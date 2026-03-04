import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostelService {
    constructor(private readonly prisma: PrismaService) { }

    // ═══════ Hostels ═══════
    async createHostel(dto: any, schoolId: string) {
        return this.prisma.hostel.create({ data: { schoolId, ...dto } });
    }
    async findAllHostels(schoolId: string) {
        return this.prisma.hostel.findMany({ where: { schoolId }, include: { rooms: { include: { _count: { select: { beds: true } } } } } });
    }
    async removeHostel(id: string, schoolId: string) {
        return this.prisma.hostel.delete({ where: { id, schoolId } });
    }
    async updateHostel(id: string, dto: any, schoolId: string) {
        return this.prisma.hostel.update({ where: { id, schoolId }, data: dto });
    }

    // ═══════ Rooms ═══════
    async createRoom(dto: any, schoolId: string) {
        return this.prisma.room.create({ data: { schoolId, ...dto } });
    }
    async findAllRooms(schoolId: string, hostelId?: string) {
        const where: any = { schoolId };
        if (hostelId) where.hostelId = hostelId;
        return this.prisma.room.findMany({ where, include: { hostel: { select: { name: true } }, beds: { include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } } } } });
    }
    async removeRoom(id: string, schoolId: string) {
        return this.prisma.room.delete({ where: { id, schoolId } });
    }

    // ═══════ Bed Allocations ═══════
    async allocateBed(dto: any, schoolId: string) {
        return this.prisma.bedAllocation.create({ data: { schoolId, ...dto, status: 'OCCUPIED' as any } });
    }
    async deallocateBed(id: string, schoolId: string) {
        return this.prisma.bedAllocation.delete({ where: { id, schoolId } });
    }

    // ═══════ Exeats ═══════
    async createExeat(dto: any, schoolId: string) {
        return this.prisma.exeat.create({
            data: { schoolId, ...dto, departDate: new Date(dto.departDate), returnDate: new Date(dto.returnDate) },
        });
    }
    async findAllExeats(schoolId: string, status?: string) {
        const where: any = { schoolId };
        if (status) where.status = status;
        return this.prisma.exeat.findMany({
            where,
            include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveExeat(id: string, schoolId: string, userId: string) {
        return this.prisma.exeat.update({ where: { id, schoolId }, data: { status: 'APPROVED' as any, approvedBy: userId } });
    }
    async markReturned(id: string, schoolId: string) {
        return this.prisma.exeat.update({ where: { id, schoolId }, data: { status: 'RETURNED' as any, actualReturn: new Date() } });
    }

    async getStats(schoolId: string) {
        const [hostels, rooms, occupiedBeds, pendingExeats] = await Promise.all([
            this.prisma.hostel.count({ where: { schoolId } }),
            this.prisma.room.count({ where: { schoolId } }),
            this.prisma.bedAllocation.count({ where: { schoolId, status: 'OCCUPIED' } }),
            this.prisma.exeat.count({ where: { schoolId, status: 'PENDING' } }),
        ]);
        return { hostels, rooms, occupiedBeds, pendingExeats };
    }
}
