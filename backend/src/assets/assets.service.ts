import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetCategoryDto, CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
    constructor(private readonly prisma: PrismaService) { }

    // ═══════ Categories ═══════
    async createCategory(dto: CreateAssetCategoryDto, schoolId: string) {
        return this.prisma.assetCategory.create({ data: { schoolId, ...dto } });
    }

    async findAllCategories(schoolId: string) {
        return this.prisma.assetCategory.findMany({
            where: { schoolId },
            include: { _count: { select: { assets: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async removeCategory(id: string, schoolId: string) {
        return this.prisma.assetCategory.delete({ where: { id, schoolId } });
    }

    // ═══════ Assets ═══════
    async create(dto: CreateAssetDto, schoolId: string) {
        return this.prisma.asset.create({
            data: {
                schoolId,
                categoryId: dto.categoryId,
                name: dto.name,
                serialNo: dto.serialNo,
                location: dto.location,
                purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
                purchasePrice: dto.purchasePrice,
                condition: (dto.condition as any) || 'NEW',
                quantity: dto.quantity || 1,
                notes: dto.notes,
            },
        });
    }

    async findAll(schoolId: string, categoryId?: string, condition?: string) {
        const where: any = { schoolId };
        if (categoryId) where.categoryId = categoryId;
        if (condition) where.condition = condition;

        return this.prisma.asset.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.asset.findFirst({
            where: { id, schoolId },
            include: { category: true },
        });
    }

    async update(id: string, dto: UpdateAssetDto, schoolId: string) {
        const { condition, ...rest } = dto;
        return this.prisma.asset.update({
            where: { id, schoolId },
            data: {
                ...rest,
                ...(condition && { condition: condition as any }),
            },
        });
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.asset.delete({ where: { id, schoolId } });
    }

    async getStats(schoolId: string) {
        const [totalAssets, totalValue, categories] = await Promise.all([
            this.prisma.asset.count({ where: { schoolId } }),
            this.prisma.asset.aggregate({ where: { schoolId }, _sum: { purchasePrice: true } }),
            this.prisma.assetCategory.count({ where: { schoolId } }),
        ]);
        return {
            totalAssets,
            totalValue: Number(totalValue._sum.purchasePrice || 0),
            categories,
        };
    }
}
