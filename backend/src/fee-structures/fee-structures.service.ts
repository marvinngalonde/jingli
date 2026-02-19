import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';

@Injectable()
export class FeeStructuresService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateFeeStructureDto, schoolId: string) {
        const { items, ...structureData } = createDto;

        if ((!items || items.length === 0) && !structureData.feeHeadId) {
            throw new BadRequestException('Either a main Fee Head or nested Fee Items must be provided.');
        }

        return this.prisma.feeStructure.create({
            data: {
                schoolId,
                academicYearId: structureData.academicYearId,
                classLevelId: structureData.classLevelId,
                feeHeadId: structureData.feeHeadId,
                name: structureData.name,
                amount: structureData.amount,
                frequency: structureData.frequency,
                items: items?.length ? {
                    create: items.map(item => ({
                        feeHeadId: item.feeHeadId,
                        amount: item.amount
                    }))
                } : undefined
            },
            include: {
                items: { include: { head: true } },
                feeHead: true
            }
        });
    }

    async findAll(schoolId: string, academicYearId?: string, classLevelId?: string) {
        const where: any = { schoolId };
        if (academicYearId) where.academicYearId = academicYearId;
        if (classLevelId) where.classLevelId = classLevelId;

        return this.prisma.feeStructure.findMany({
            where,
            include: {
                feeHead: true,
                classLevel: true,
                academicYear: true,
                items: {
                    include: { head: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.feeStructure.findFirst({
            where: { id, schoolId },
            include: {
                feeHead: true,
                classLevel: true,
                academicYear: true,
                items: {
                    include: { head: true }
                }
            }
        });
    }

    async update(id: string, updateDto: any, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership

        // Simple update for now, complex item update requires more logic (delete/upsert)
        // For MVP, we might just allow updating scalar fields.
        const { items, ...data } = updateDto;

        return this.prisma.feeStructure.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership

        const deleteItems = this.prisma.feeStructureItem.deleteMany({
            where: { feeStructureId: id }
        });

        const deleteStructure = this.prisma.feeStructure.delete({
            where: { id }
        });

        return this.prisma.$transaction([deleteItems, deleteStructure]);
    }
}
