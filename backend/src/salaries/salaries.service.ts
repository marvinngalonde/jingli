import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaryPaymentDto, RunPayrollDto, UpdateSalaryPaymentDto } from './dto/salary.dto';

@Injectable()
export class SalariesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateSalaryPaymentDto, schoolId: string) {
        return this.prisma.salaryPayment.create({
            data: {
                schoolId,
                staffId: dto.staffId,
                amount: dto.amount,
                baseSalary: dto.baseSalary || dto.amount,
                allowances: dto.allowances || 0,
                deductions: dto.deductions || 0,
                currency: dto.currency || 'USD',
                month: dto.month,
                year: dto.year,
                method: dto.method as any,
                notes: dto.notes,
            },
        });
    }

    async runPayroll(dto: RunPayrollDto, schoolId: string, processedByUserId: string) {
        const month = parseInt(dto.month as any);
        const year = parseInt(dto.year as any);

        // Get all active staff
        const allStaff = await this.prisma.staff.findMany({
            where: { schoolId },
            include: { user: { select: { status: true } } },
        });

        const activeStaff = allStaff.filter(s => s.user.status === 'ACTIVE');

        // Check for existing payroll entries this month
        const existing = await this.prisma.salaryPayment.findMany({
            where: { schoolId, month, year },
            select: { staffId: true },
        });
        const existingStaffIds = new Set(existing.map(e => e.staffId));

        let count = 0;
        for (const staff of activeStaff) {
            if (existingStaffIds.has(staff.id)) continue; // Skip duplicates

            const baseSalary = Number(staff.baseSalary || 0);

            await this.prisma.salaryPayment.create({
                data: {
                    schoolId,
                    staffId: staff.id,
                    baseSalary,
                    amount: baseSalary, // Net amount is same as base if no allowances/deductions
                    currency: dto.currency || 'USD',
                    month,
                    year,
                    status: 'PENDING',
                    processedBy: processedByUserId,
                },
            });
            count++;
        }

        return { count, message: `Created ${count} payroll entries for ${month}/${year}` };
    }

    async findAll(schoolId: string, month?: number, year?: number, page = 1, limit = 20) {
        const where: any = { schoolId };
        if (month) where.month = month;
        if (year) where.year = year;

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.salaryPayment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    staff: { select: { id: true, firstName: true, lastName: true, employeeId: true, designation: true, department: true } },
                    processor: { select: { id: true, username: true } },
                },
                orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
            }),
            this.prisma.salaryPayment.count({ where })
        ]);

        return { data, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.salaryPayment.findFirst({
            where: { id, schoolId },
            include: {
                staff: { select: { firstName: true, lastName: true, employeeId: true, designation: true, department: true } },
                processor: { select: { id: true, username: true } },
            },
        });
    }

    async update(id: string, dto: UpdateSalaryPaymentDto, schoolId: string) {
        const { status, method, amount, baseSalary, allowances, deductions, ...rest } = dto;

        // Fetch current calculation if only partial data provided
        const current = await this.prisma.salaryPayment.findUnique({
            where: { id },
            select: { baseSalary: true, allowances: true, deductions: true, amount: true }
        });

        if (!current) return null;

        const newBase = baseSalary != null ? Number(baseSalary) : Number(current.baseSalary);
        const newAllowances = allowances != null ? Number(allowances) : Number(current.allowances);
        const newDeductions = deductions != null ? Number(deductions) : Number(current.deductions);

        // Calculate net amount automate
        const netAmount = amount != null ? Number(amount) : (newBase + newAllowances - newDeductions);

        return this.prisma.salaryPayment.update({
            where: { id, schoolId },
            data: {
                ...rest,
                baseSalary: newBase,
                allowances: newAllowances,
                deductions: newDeductions,
                amount: netAmount,
                ...(status && { status: status as any }),
                ...(method && { method: method as any }),
            },
        });
    }

    async markAsPaid(id: string, schoolId: string, userId: string, referenceNo?: string) {
        return this.prisma.salaryPayment.update({
            where: { id, schoolId },
            data: {
                status: 'PAID',
                processedBy: userId,
                processedAt: new Date(),
                referenceNo,
            },
        });
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.salaryPayment.delete({ where: { id, schoolId } });
    }

    async getStats(schoolId: string) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const [totalPayroll, thisMonth, pending, staffCount] = await Promise.all([
            this.prisma.salaryPayment.aggregate({
                where: { schoolId, status: 'PAID' },
                _sum: { amount: true },
            }),
            this.prisma.salaryPayment.aggregate({
                where: { schoolId, month: currentMonth, year: currentYear },
                _sum: { amount: true },
            }),
            this.prisma.salaryPayment.aggregate({
                where: { schoolId, status: 'PENDING' },
                _sum: { amount: true },
            }),
            this.prisma.staff.count({ where: { schoolId } }),
        ]);

        return {
            totalPayroll: Number(totalPayroll._sum.amount || 0),
            thisMonth: Number(thisMonth._sum.amount || 0),
            pendingDisbursal: Number(pending._sum.amount || 0),
            staffCount,
        };
    }
}
