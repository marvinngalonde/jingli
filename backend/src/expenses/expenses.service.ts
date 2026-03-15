import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateExpenseDto, schoolId: string) {
        return this.prisma.expense.create({
            data: {
                schoolId,
                description: dto.description,
                category: dto.category,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                date: new Date(dto.date),
                notes: dto.notes,
                receiptUrl: dto.receiptUrl,
            },
        });
    }

    async findAll(schoolId: string, category?: string, status?: string, page = 1, limit = 7) {
        const where: any = { schoolId };
        if (category) where.category = category;
        if (status) where.status = status;

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                include: {
                    approver: { select: { id: true, username: true, email: true } },
                },
                orderBy: { date: 'desc' },
            }),
            this.prisma.expense.count({ where })
        ]);

        return { data, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.expense.findFirst({
            where: { id, schoolId },
            include: { approver: { select: { id: true, username: true, email: true } } },
        });
    }

    async update(id: string, dto: UpdateExpenseDto, schoolId: string) {
        const data: any = { ...dto };
        if (dto.date) data.date = new Date(dto.date);
        return this.prisma.expense.update({ where: { id, schoolId }, data });
    }

    async approve(id: string, schoolId: string, userId: string) {
        return this.prisma.expense.update({
            where: { id, schoolId },
            data: { status: 'APPROVED', approvedBy: userId },
        });
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.expense.delete({ where: { id, schoolId } });
    }

    async getStats(schoolId: string) {
        const [total, thisMonth, pending] = await Promise.all([
            this.prisma.expense.aggregate({ where: { schoolId }, _sum: { amount: true } }),
            this.prisma.expense.aggregate({
                where: {
                    schoolId,
                    date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                },
                _sum: { amount: true },
            }),
            this.prisma.expense.count({ where: { schoolId, status: 'PENDING' } }),
        ]);

        return {
            totalExpenses: Number(total._sum.amount || 0),
            thisMonth: Number(thisMonth._sum.amount || 0),
            pendingCount: pending,
        };
    }
}
