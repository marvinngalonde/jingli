import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitorDto, VisitorStatus } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

@Injectable()
export class VisitorsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateVisitorDto, schoolId: string) {
        return this.prisma.visitor.create({
            data: {
                schoolId, // Use passed schoolId, ignore createDto.schoolId if present
                name: createDto.name,
                phone: createDto.phone,
                purpose: createDto.purpose || 'Visit', // Default if optional
                status: VisitorStatus.IN,
                checkIn: new Date(),
            },
        });
    }

    async findAll(schoolId: string, status?: VisitorStatus) {
        const where: any = { schoolId };
        if (status) {
            where.status = status;
        }

        return this.prisma.visitor.findMany({
            where,
            orderBy: {
                checkIn: 'desc',
            }
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.visitor.findFirst({
            where: { id, schoolId },
        });
    }

    async update(id: string, updateDto: UpdateVisitorDto, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership

        const data: any = { ...updateDto };
        if (updateDto.exitTime) {
            data.checkOut = new Date(updateDto.exitTime);
            delete data.exitTime;
        }

        // If status is changed to OUT and no exit time provided, set it
        if (updateDto.status === VisitorStatus.OUT && !data.checkOut) {
            data.checkOut = new Date();
        }

        return this.prisma.visitor.update({
            where: { id },
            data,
        });
    }

    async checkout(id: string, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership
        return this.prisma.visitor.update({
            where: { id },
            data: {
                status: VisitorStatus.OUT,
                checkOut: new Date(),
            },
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership
        return this.prisma.visitor.delete({
            where: { id },
        });
    }
}
