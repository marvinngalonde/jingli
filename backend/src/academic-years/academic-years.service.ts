import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicYearsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: any, schoolId: string) {
        // Automatically link to school
        return this.prisma.academicYear.create({
            data: {
                ...createDto,
                schoolId,
                // If this is set to current, we need to deactivate others? 
                // Let's handle 'current' flag logic if passed, or default to false.
                current: createDto.current || false,
                startDate: new Date(createDto.startDate),
                endDate: new Date(createDto.endDate),
            }
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.academicYear.findMany({
            where: { schoolId },
            orderBy: { startDate: 'desc' }
        });
    }

    async findOne(id: string, schoolId: string) {
        const record = await this.prisma.academicYear.findFirst({
            where: { id, schoolId }
        });
        if (!record) throw new NotFoundException('Academic Year not found');
        return record;
    }

    async update(id: string, updateDto: any, schoolId: string) {
        // Ensure exists and belongs to school
        await this.findOne(id, schoolId);

        return this.prisma.academicYear.update({
            where: { id },
            data: {
                ...updateDto,
                startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
                endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
            }
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.academicYear.delete({ where: { id } });
    }

    async activate(id: string, schoolId: string) {
        // Transaction: Deactivate all others, activate this one
        return this.prisma.$transaction([
            this.prisma.academicYear.updateMany({
                where: { schoolId },
                data: { current: false }
            }),
            this.prisma.academicYear.update({
                where: { id },
                data: { current: true }
            })
        ]);
    }
}
