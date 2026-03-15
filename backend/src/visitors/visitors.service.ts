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
                purpose: createDto.purpose,
                personToMeet: createDto.personToMeet,
                idProof: createDto.idProof,
                vehicleNo: createDto.vehicleNo,
                status: VisitorStatus.IN,
                checkIn: new Date(),
            },
        });
    }

    async findAll(schoolId: string, status?: VisitorStatus, page = 1, limit = 7) {
        const where: any = { schoolId };
        if (status) {
            where.status = status;
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.visitor.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    checkIn: 'desc',
                }
            }),
            this.prisma.visitor.count({ where })
        ]);

        return {
            data,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        };
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
