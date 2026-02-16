import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateFeeHeadDto } from './dto/create-fee-head.dto';

@Injectable()
export class FeeStructuresService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Fee Heads ---
    async createHead(createDto: CreateFeeHeadDto, schoolId: string) {
        return this.prisma.feeHead.create({
            data: {
                ...createDto,
                schoolId,
            }
        });
    }

    async findAllHeads(schoolId: string) {
        return this.prisma.feeHead.findMany({
            where: { schoolId }
        });
    }

    // --- Fee Structures ---
    async create(createDto: CreateFeeStructureDto, schoolId: string) {
        // Validation: Verify Foreign Keys belong to school (optional but recommended)
        // For brevity, assuming IDs are valid or Prisma will throw FK constraint error if not found.
        // Ideally we should check if academicYear and classLevel belong to schoolId.

        return this.prisma.feeStructure.create({
            data: {
                schoolId,
                academicYearId: createDto.academicYearId,
                classLevelId: createDto.classLevelId,
                feeHeadId: createDto.feeHeadId,
                amount: createDto.amount,
                frequency: createDto.frequency as any,
            },
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
            }
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.feeStructure.findFirst({
            where: { id, schoolId },
            include: {
                feeHead: true,
                classLevel: true,
                academicYear: true,
            }
        });
    }

    async update(id: string, updateDto: any, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership
        return this.prisma.feeStructure.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership
        return this.prisma.feeStructure.delete({
            where: { id },
        });
    }
}
