import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentService {
    constructor(private readonly prisma: PrismaService) { }

    async getChildren(user: any) {
        const guardian = await this.prisma.guardian.findFirst({
            where: { userId: user.id }
        });

        if (!guardian) throw new NotFoundException('Guardian profile not found');

        const linkages = await this.prisma.studentGuardian.findMany({
            where: { guardianId: guardian.id },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNo: true,
                        section: {
                            select: { name: true, classLevel: { select: { name: true } } }
                        }
                    }
                }
            }
        });

        return linkages.map(l => l.student);
    }

    async getDashboardStats(user: any, studentId: string) {
        // Validate child belongs to this guardian
        const guardian = await this.prisma.guardian.findFirst({
            where: { userId: user.id }
        });

        if (!guardian) throw new NotFoundException('Guardian profile not found');

        const linkage = await this.prisma.studentGuardian.findFirst({
            where: { guardianId: guardian.id, studentId }
        });

        if (!linkage) throw new NotFoundException('Student is not linked to this guardian');

        const student = await this.prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) throw new NotFoundException('Student not found');

        // Stats calculation logic similar to student dashboard
        const sectionId = student.sectionId;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

        const classesToday = await this.prisma.timetable.count({
            where: { sectionId, day: today.toUpperCase() as any }
        });

        const activeAssignments = await this.prisma.assignment.findMany({
            where: { sectionId }
        });

        const mySubmissions = await this.prisma.submission.findMany({
            where: { studentId }
        });

        const submittedAssignmentIds = new Set(mySubmissions.map(s => s.assignmentId));
        const pendingAssignmentsCount = activeAssignments.filter(a => !submittedAssignmentIds.has(a.id)).length;

        const gradedSubmissionsCount = mySubmissions.filter(s => s.marks !== null).length;

        return {
            classesToday,
            pendingAssignmentsCount,
            gradedSubmissionsCount
        };
    }

    async getPerformance(user: any, studentId: string) {
        const guardian = await this.prisma.guardian.findFirst({
            where: { userId: user.id }
        });

        if (!guardian) throw new NotFoundException('Guardian profile not found');

        const linkage = await this.prisma.studentGuardian.findFirst({
            where: { guardianId: guardian.id, studentId }
        });

        if (!linkage) throw new NotFoundException('Student is not linked to this guardian');

        // Fetch Attendance Stats
        const attendanceRecords = await this.prisma.attendance.findMany({
            where: { studentId }
        });

        const totalClasses = attendanceRecords.length;
        const attendedClasses = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        let attendancePercentage = 0;
        if (totalClasses > 0) {
            attendancePercentage = (attendedClasses / totalClasses) * 100;
        } else {
            // No records yet, assume 100% or 0 based on preference. Let's say 100% if no classes have happened.
            attendancePercentage = 100;
        }

        // Fetch Recent Grades
        const recentGrades = await this.prisma.submission.findMany({
            where: {
                studentId: studentId,
                OR: [
                    { marks: { not: null } },
                    { feedback: { not: null } }
                ]
            },
            include: {
                assignment: {
                    select: {
                        title: true,
                        maxMarks: true,
                        subject: { select: { name: true, code: true } }
                    }
                }
            },
            orderBy: { submittedAt: 'desc' },
            take: 10 // only show last 10
        });

        return {
            attendancePercentage,
            totalClasses,
            attendedClasses,
            recentGrades
        };
    }

    async getFinancials(user: any, studentId: string) {
        const guardian = await this.prisma.guardian.findFirst({
            where: { userId: user.id }
        });

        if (!guardian) throw new NotFoundException('Guardian profile not found');

        const linkage = await this.prisma.studentGuardian.findFirst({
            where: { guardianId: guardian.id, studentId }
        });

        if (!linkage) throw new NotFoundException('Student is not linked to this guardian');

        // Fetch Invoices
        const invoices = await this.prisma.invoice.findMany({
            where: { studentId },
            include: { feeStructure: true },
            orderBy: { dueDate: 'desc' }
        });

        let pendingAmount = 0;
        const mappedInvoices = invoices.map(inv => {
            const amountNum = Number(inv.amount);
            if (inv.status === 'PENDING' || inv.status === 'OVERDUE' || inv.status === 'PARTIAL') {
                pendingAmount += amountNum;
            }
            return {
                id: inv.id,
                title: inv.feeStructure?.name || 'Fee Invoice',
                amount: amountNum,
                dueDate: inv.dueDate,
                status: inv.status
            };
        });

        // Fetch Transactions (Payments)
        const transactionsRes = await this.prisma.transaction.findMany({
            where: {
                invoice: { studentId }
            },
            orderBy: { date: 'desc' }
        });

        const transactions = transactionsRes.map(tx => ({
            id: tx.id,
            amount: Number(tx.amount),
            date: tx.date,
            paymentMethod: tx.method,
            status: 'COMPLETED' // Simplified for now since Transaction model doesn't have status
        }));

        let totalPaid = 0;
        transactions.forEach(tx => {
            totalPaid += tx.amount;
        });

        return {
            pendingAmount,
            totalPaid,
            invoices: mappedInvoices,
            transactions
        };
    }
}
