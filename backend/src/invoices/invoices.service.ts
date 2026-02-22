import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BulkGenerateInvoiceDto } from './dto/bulk-generate-invoice.dto';
import { NotificationsService } from '../notifications/notifications.service';

enum InvoiceStatus {
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
}

@Injectable()
export class InvoicesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(createDto: CreateInvoiceDto, schoolId: string) {
        // Verify student belongs to school
        const student = await this.prisma.student.findFirst({
            where: { id: createDto.studentId, schoolId }
        });
        if (!student) throw new Error('Student not found or does not belong to school');

        const invoice = await this.prisma.invoice.create({
            data: {
                schoolId,
                studentId: createDto.studentId,
                feeStructureId: createDto.feeStructureId,
                amount: createDto.amount,
                dueDate: new Date(createDto.dueDate),
                status: InvoiceStatus.PENDING,
            },
        });

        // Trigger notification for student/guardian
        this.triggerInvoiceNotifications(invoice);

        return invoice;
    }

    private async triggerInvoiceNotifications(invoice: any) {
        const student = await this.prisma.student.findUnique({
            where: { id: invoice.studentId },
            include: { user: true }
        });

        if (student && student.userId) {
            await this.notificationsService.createNotification(
                student.userId,
                'New Invoice Generated',
                `A new invoice of ${invoice.amount} has been generated for you/your ward. Due date: ${new Date(invoice.dueDate).toLocaleDateString()}.`,
                'INFO'
            ).catch(e => console.error('Failed to send invoice notification', e));
        }

        // Also notify guardian if exists
        const guardian = await this.prisma.guardian.findFirst({
            where: { students: { some: { studentId: student?.id } } },
            include: { user: true }
        });

        if (guardian && guardian.userId) {
            await this.notificationsService.createNotification(
                guardian.userId,
                'New Fee Invoice',
                `A new invoice of ${invoice.amount} has been generated for ${student?.firstName}. Due date: ${new Date(invoice.dueDate).toLocaleDateString()}.`,
                'INFO'
            ).catch(e => console.error('Failed to send guardian invoice notification', e));
        }
    }

    async update(id: string, updateDto: any, schoolId: string) {
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
        const structure = await this.prisma.feeStructure.findFirst({
            where: { id: dto.feeStructureId, schoolId }
        });
        if (!structure) throw new Error('Fee Structure not found');

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

        return this.prisma.$transaction(async (tx) => {
            let count = 0;
            for (const student of students) {
                const invoice = await tx.invoice.create({
                    data: {
                        schoolId,
                        studentId: student.id,
                        feeStructureId: structure.id,
                        amount: structure.amount,
                        dueDate: new Date(dto.dueDate),
                        status: InvoiceStatus.PENDING,
                    }
                });

                this.triggerInvoiceNotifications(invoice);
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

    async collectPayment(createDto: CreateTransactionDto, schoolId: string, collectedByUserId: string) {
        const invoice = await this.findOne(createDto.invoiceId, schoolId);
        if (!invoice) throw new Error('Invoice not found');

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
        await this.prisma.transaction.deleteMany({ where: { invoiceId: id } });

        return this.prisma.invoice.delete({
            where: { id, schoolId },
        });
    }
}
