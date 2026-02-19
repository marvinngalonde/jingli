import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeHeadDto } from './dto/create-fee-head.dto';
import { UpdateFeeHeadDto } from './dto/update-fee-head.dto';

@Injectable()
export class FeeHeadsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createFeeHeadDto: CreateFeeHeadDto, schoolId: string) {
        return this.prisma.feeHead.create({
            data: {
                ...createFeeHeadDto,
                schoolId,
            },
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.feeHead.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.feeHead.findFirst({
            where: { id, schoolId },
        });
    }

    async update(id: string, updateFeeHeadDto: UpdateFeeHeadDto, schoolId: string) {
        // Verify ownership
        await this.findOne(id, schoolId);
        return this.prisma.feeHead.update({
            where: { id },
            data: updateFeeHeadDto,
        });
    }

    async remove(id: string, schoolId: string) {
        // Verify ownership
        await this.findOne(id, schoolId);
        return this.prisma.feeHead.delete({
            where: { id },
        });
    }
}
