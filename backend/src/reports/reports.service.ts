import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async getReportHistory(schoolId: string) {
        return this.prisma.reportLog.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getStats(schoolId: string) {
        const totalGenerated = await this.prisma.reportLog.count({
            where: { schoolId },
        });

        const pendingCount = await this.prisma.reportLog.count({
            where: { schoolId, status: 'Processing' },
        });

        // Mocking storage for now as we don't actually store files on disk yet
        return {
            totalGenerated,
            downloads: Math.floor(totalGenerated * 0.7), // Mocked for UI
            pending: pendingCount,
            storageUsed: '0.0 GB',
        };
    }

    async generateReport(schoolId: string, username: string, data: any) {
        const { reportType, period, type } = data;

        // Determine date range
        const now = new Date();
        let startDate = new Date(0);
        let endDate = new Date(now);

        if (period === 'Last 7 Days') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === 'Last 30 Days') {
            startDate = new Date(now.setDate(now.getDate() - 30));
        } else if (period === 'This Month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === 'Last Month') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        const dateRange = { gte: startDate, lte: endDate };

        let actualSummary: any = {
            totalRecords: 0,
            period: period,
            generatedAt: new Date().toISOString(),
            sections: []
        };

        try {
            // ==========================================
            // FINANCE
            // ==========================================
            if (reportType === 'Fee Collection Summary') {
                const transactions = await this.prisma.transaction.findMany({
                    where: { schoolId, date: dateRange },
                    select: { amount: true, method: true }
                });

                const totalCollected = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
                const methods = transactions.reduce((acc, t) => {
                    const m = t.method;
                    acc[m] = (acc[m] || 0) + Number(t.amount);
                    return acc;
                }, {} as Record<string, number>);

                actualSummary.totalRecords = transactions.length;
                actualSummary.sections = [
                    { title: 'Overview', details: `Financial summary from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` },
                    { title: 'Total Collected', value: totalCollected.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) },
                    { title: 'Breakdown by Method', value: Object.entries(methods).map(([m, a]) => `${m}: ${a.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`).join(', ') || 'N/A' },
                    { title: 'Average Transaction', value: (transactions.length ? (totalCollected / transactions.length) : 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' }) }
                ];
            } else if (reportType === 'Unpaid Invoices (Defaulters)') {
                const invoices = await this.prisma.invoice.findMany({
                    where: { schoolId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
                    include: { student: true, feeStructure: true }
                });

                const totalOwed = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
                actualSummary.totalRecords = invoices.length;
                actualSummary.sections = [
                    { title: 'Overview', details: `Currently outstanding invoices as of ${new Date().toLocaleDateString()}` },
                    { title: 'Total Outstanding Balance', value: totalOwed.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) },
                    { title: 'Number of Defaulters', value: invoices.length.toString() }
                ];
            } else if (reportType === 'Transaction Log') {
                const txs = await this.prisma.transaction.count({ where: { schoolId, date: dateRange } });
                actualSummary.totalRecords = txs;
                actualSummary.sections = [{ title: 'Overview', details: `Detailed log of ${txs} transactions recorded between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}.` }];
            } else if (reportType === 'Fee Structure Breakdown') {
                const heads = await this.prisma.feeHead.count({ where: { schoolId } });
                actualSummary.totalRecords = heads;
                actualSummary.sections = [{ title: 'Overview', details: `Configuration map of all ${heads} fee heads and structures.` }];

                // ==========================================
                // ACADEMIC & DAILY
                // ==========================================
            } else if (reportType === 'Attendance Summary') {
                const attendance = await this.prisma.attendance.groupBy({
                    by: ['status'],
                    where: { schoolId, date: dateRange },
                    _count: { status: true }
                });

                let present = 0, absent = 0, late = 0;
                attendance.forEach(a => {
                    if (a.status === 'PRESENT') present = a._count.status;
                    if (a.status === 'ABSENT') absent = a._count.status;
                    if (a.status === 'LATE') late = a._count.status;
                });

                const total = present + absent + late;
                const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                actualSummary.totalRecords = total;
                actualSummary.sections = [
                    { title: 'Overview', details: `Attendance metrics from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` },
                    { title: 'Total Classes/Days Recorded', value: total.toString() },
                    { title: 'Overall Present Rate', value: `${rate}%` },
                    { title: 'Absences', value: absent.toString() },
                    { title: 'Late Arrivals', value: late.toString() }
                ];
            } else if (reportType === 'Student Performance') {
                const results = await this.prisma.examResult.findMany({
                    where: { exam: { schoolId, date: dateRange } }
                });
                actualSummary.totalRecords = results.length;
                actualSummary.sections = [{ title: 'Overview', details: `Generated performance sheets for ` + results.length + ` exam results.` }];
            } else if (reportType === 'Class Grade Master Sheet') {
                const exams = await this.prisma.exam.count({ where: { schoolId, date: dateRange } });
                actualSummary.totalRecords = exams;
                actualSummary.sections = [{ title: 'Overview', details: `Aggregated grade master sheets for ${exams} exams.` }];
            } else if (reportType === 'Class Timetables') {
                const sections = await this.prisma.classSection.count({ where: { schoolId } });
                actualSummary.totalRecords = sections;
                actualSummary.sections = [{ title: 'Overview', details: `Exported weekly schedules for ${sections} classes.` }];

                // ==========================================
                // STUDENTS
                // ==========================================
            } else if (reportType === 'Student Directory' || reportType === 'Class & Section Lists') {
                const students = await this.prisma.student.count({ where: { schoolId } });
                actualSummary.totalRecords = students;
                actualSummary.sections = [{ title: 'Overview', details: `Full directory export of all ${students} enrolled students.` }];
            } else if (reportType === 'New Admissions Log') {
                const admissions = await this.prisma.student.count({ where: { schoolId, enrollmentDate: dateRange } });
                actualSummary.totalRecords = admissions;
                actualSummary.sections = [{ title: 'Overview', details: `${admissions} new students enrolled between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}.` }];

                // ==========================================
                // HR & STAFF
                // ==========================================
            } else if (reportType === 'Staff Directory' || reportType === 'Department Roster') {
                const staff = await this.prisma.staff.groupBy({
                    by: ['department'],
                    where: { schoolId },
                    _count: { id: true }
                });

                const totalStaff = staff.reduce((sum, s) => sum + s._count.id, 0);
                actualSummary.totalRecords = totalStaff;
                actualSummary.sections = [
                    { title: 'Overview', details: `Current active staff roster across ${staff.length} departments.` },
                    { title: 'Total Employees', value: totalStaff.toString() },
                    { title: 'Departments', value: staff.map(s => `${s.department} (${s._count.id})`).join(', ') }
                ];
            } else if (reportType === 'Subject Allocations') {
                const allocs = await this.prisma.subjectAllocation.count({ where: { staff: { schoolId } } });
                actualSummary.totalRecords = allocs;
                actualSummary.sections = [{ title: 'Overview', details: `Map of ${allocs} teacher subject assignments.` }];
            } else if (reportType === 'Staff Attendance Summary') {
                const activeLogins = await this.prisma.user.count({ where: { schoolId, role: { in: ['TEACHER', 'ADMIN', 'RECEPTION', 'FINANCE'] }, lastLogin: dateRange } });
                actualSummary.totalRecords = activeLogins;
                actualSummary.sections = [{ title: 'Overview', details: `${activeLogins} staff members were active during this period.` }];

                // ==========================================
                // LIBRARY
                // ==========================================
            } else if (reportType === 'Book Inventory') {
                const books = await this.prisma.book.groupBy({
                    by: ['status'],
                    where: { schoolId },
                    _count: { id: true }
                });

                const totalBooks = books.reduce((sum, b) => sum + b._count.id, 0);
                actualSummary.totalRecords = totalBooks;
                actualSummary.sections = [
                    { title: 'Overview', details: `Current library inventory status.` },
                    { title: 'Total Books', value: totalBooks.toString() },
                    { title: 'Status Breakdown', value: books.map(b => `${b.status}: ${b._count.id}`).join(', ') }
                ];
            } else if (reportType === 'Overdue Circulations') {
                const overdue = await this.prisma.bookCirculation.count({
                    where: { schoolId, dueDate: { lt: now }, status: 'ISSUED' }
                });
                actualSummary.totalRecords = overdue;
                actualSummary.sections = [{ title: 'Overview', details: `There are currently ${overdue} books that have not been returned on time.` }];

                // ==========================================
                // LOGISTICS & OPS
                // ==========================================
            } else if (reportType === 'Visitor Log') {
                const visitors = await this.prisma.visitor.count({ where: { schoolId, checkIn: dateRange } });
                actualSummary.totalRecords = visitors;
                actualSummary.sections = [{ title: 'Overview', details: `${visitors} external visitors registered on campus.` }];
            } else if (reportType === 'Gate Pass Registry') {
                const passes = await this.prisma.gatePass.count({ where: { schoolId, issuedAt: dateRange } });
                actualSummary.totalRecords = passes;
                actualSummary.sections = [{ title: 'Overview', details: `${passes} early dismissal gate passes were issued.` }];
            } else if (reportType === 'Late Arrivals Report') {
                const lates = await this.prisma.lateArrival.count({ where: { schoolId, arrivalTime: dateRange } });
                actualSummary.totalRecords = lates;
                actualSummary.sections = [{ title: 'Overview', details: `${lates} instances of tardiness recorded.` }];
            } else if (reportType === 'Admission Inquiries') {
                const inquiries = await this.prisma.inquiry.count({ where: { schoolId } });
                actualSummary.totalRecords = inquiries;
                actualSummary.sections = [{ title: 'Overview', details: `${inquiries} admission inquiries currently tracked.` }];

                // ==========================================
                // FALLBACK
                // ==========================================
            } else {
                const students = await this.prisma.student.count({ where: { schoolId } });
                const staff = await this.prisma.staff.count({ where: { schoolId } });
                actualSummary.totalRecords = students + staff;
                actualSummary.sections = [
                    { title: 'System Overview', details: `General system snapshot as of ${new Date().toLocaleDateString()}` },
                    { title: 'Total Enrolled Students', value: students.toString() },
                    { title: 'Total Staff Members', value: staff.toString() }
                ];
            }
        } catch (error) {
            console.error("Error aggregating report data:", error);
            // Fallback gracefully instead of failing the report completely
            actualSummary.sections = [{ title: 'Notice', details: 'Unable to aggregate deep metrics for this specific period.' }];
        }

        return this.prisma.reportLog.create({
            data: {
                schoolId,
                name: `${reportType} (${period})`,
                type: type || 'Other',
                status: 'Ready',
                generatedBy: username,
                parameters: { ...data, summary: actualSummary },
            },
        });
    }

    async getReportById(id: string, schoolId: string) {
        // Also fetch the school details for the PDF generator
        return this.prisma.reportLog.findFirst({
            where: { id, schoolId },
            include: { school: true }
        });
    }

    async deleteReport(id: string, schoolId: string) {
        return this.prisma.reportLog.delete({
            where: { id, schoolId }
        });
    }
}
