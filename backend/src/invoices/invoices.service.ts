import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BulkGenerateInvoiceDto } from './dto/bulk-generate-invoice.dto';

enum InvoiceStatus {
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
}

@Injectable()
export class InvoicesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateInvoiceDto, schoolId: string) {
        // Verify student belongs to school
        const student = await this.prisma.student.findFirst({
            where: { id: createDto.studentId, schoolId }
        });
        if (!student) throw new Error('Student not found or does not belong to school');

        return this.prisma.invoice.create({
            data: {
                schoolId,
                studentId: createDto.studentId,
                feeStructureId: createDto.feeStructureId,
                amount: createDto.amount,
                dueDate: new Date(createDto.dueDate),
                status: InvoiceStatus.PENDING,
            },
        });
    }

    async update(id: string, updateDto: any, schoolId: string) {
        // Simple update for now. 
        // Real systems might restrict editing if payments exist, but user asked for full CRUD.
        return this.prisma.invoice.update({
            where: { id, schoolId },
            data: {
                amount: updateDto.amount,
                dueDate: updateDto.dueDate,
                status: updateDto.status
            }
        });
    }

    async generateBulk(dto: BulkGenerateInvoiceDto, schoolId: string) {
        // 1. Get Fee Structure to verify amount
        const structure = await this.prisma.feeStructure.findFirst({
            where: { id: dto.feeStructureId, schoolId }
        });
        if (!structure) throw new Error('Fee Structure not found');

        // 2. Get All Students in the Class Level
        // We need to find students whose section belongs to this classLevel
        const students = await this.prisma.student.findMany({
            where: {
                schoolId,
                section: { classLevelId: dto.classLevelId }
            },
            select: { id: true }
        });

        if (students.length === 0) {
            return { count: 0, message: 'No students found in this class' };
        }

        // 3. Create Invoices
        // Using transaction for safety
        return this.prisma.$transaction(async (tx) => {
            let count = 0;
            for (const student of students) {
                // Check if invoice already exists for this structure? 
                // Optional: Skip if duplicate. For now, we allow multiple (e.g. monthly fees).

                await tx.invoice.create({
                    data: {
                        schoolId,
                        studentId: student.id,
                        feeStructureId: structure.id,
                        amount: structure.amount,
                        dueDate: new Date(dto.dueDate),
                        status: InvoiceStatus.PENDING,
                    }
                });
                count++;
            }
            return { count, message: `Successfully generated ${count} invoices` };
        });
    }

    async findAll(schoolId: string, studentId?: string) {
        const where: any = { schoolId };
        if (studentId) where.studentId = studentId;

        return this.prisma.invoice.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, admissionNo: true } },
                feeStructure: { include: { feeHead: true } },
                transactions: true,
            },
            orderBy: {
                issueDate: 'desc',
            }
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.invoice.findFirst({
            where: { id, schoolId },
            include: {
                student: true,
                feeStructure: { include: { feeHead: true } },
                transactions: true,
            }
        });
    }

    // --- Transactions ---
    async collectPayment(createDto: CreateTransactionDto, schoolId: string, collectedByUserId: string) {
        // 1. Get Invoice
        const invoice = await this.findOne(createDto.invoiceId, schoolId);
        if (!invoice) throw new Error('Invoice not found');

        // 2. Record Transaction
        const transaction = await this.prisma.transaction.create({
            data: {
                schoolId,
                invoiceId: createDto.invoiceId,
                amount: createDto.amount,
                method: createDto.method as any,
                referenceNo: createDto.referenceNo,
                collectedBy: collectedByUserId,
            }
        });

        // 3. Update Invoice Status
        const totalPaid = invoice.transactions.reduce((sum, t) => sum + Number(t.amount), 0) + createDto.amount;
        let newStatus = InvoiceStatus.PENDING;
        if (totalPaid >= Number(invoice.amount)) newStatus = InvoiceStatus.PAID;
        else if (totalPaid > 0) newStatus = InvoiceStatus.PARTIAL;

        await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: newStatus }
        });

        return transaction;
    }

    async remove(id: string, schoolId: string) {
        // Delete related transactions first? Or cascading delete?
        // For safety, let's delete transactions first if any.
        await this.prisma.transaction.deleteMany({ where: { invoiceId: id } });

        return this.prisma.invoice.delete({
            where: { id, schoolId },
        });
    }
}
