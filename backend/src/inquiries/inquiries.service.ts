import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';

@Injectable()
export class InquiriesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateInquiryDto) {
        const { schoolId, ...data } = createDto;
        if (!schoolId) {
            throw new Error('School ID is required');
        }
        return this.prisma.inquiry.create({
            data: {
                ...data,
                status: data.status || 'APPLIED',
                school: { connect: { id: schoolId } }
            }
        });
    }

    async findAll(schoolId: string, page = 1, limit = 7) {
        const skip = (page - 1) * limit;
        const where = { schoolId };

        const [data, total] = await Promise.all([
            this.prisma.inquiry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: 'desc' }
            }),
            this.prisma.inquiry.count({ where })
        ]);

        return { data, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        return this.prisma.inquiry.findUnique({
            where: { id }
        });
    }

    async update(id: string, updateDto: UpdateInquiryDto) {
        const { schoolId, ...data } = updateDto;
        return this.prisma.inquiry.update({
            where: { id },
            data: data
        });
    }

    async remove(id: string) {
        return this.prisma.inquiry.delete({
            where: { id }
        });
    }
}
