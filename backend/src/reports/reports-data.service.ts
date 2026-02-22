import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ReportColumn { header: string; key: string; }
export interface ReportResult {
    title: string;
    columns: ReportColumn[];
    rows: Record<string, any>[];
    totalRecords: number;
}

@Injectable()
export class ReportsDataService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── helpers ────────────────────────────────────────────────────────────────
    private dateRange(from?: string, to?: string) {
        if (!from && !to) return undefined;
        const gte = from ? new Date(from) : undefined;
        const lte = to ? new Date(to) : undefined;
        return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    }
    private fmt(date: any) {
        return date ? new Date(date).toLocaleDateString() : '—';
    }
    private money(n: any) {
        return Number(n || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
    }

    // ============================================================
    // 1. ALL STUDENTS
    // ============================================================
    async studentsReport(schoolId: string, filters: {
        classLevelId?: string; sectionId?: string; status?: string;
        gender?: string; fromDate?: string; toDate?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.sectionId) where.sectionId = filters.sectionId;
        if (filters.status) where.status = filters.status;
        if (filters.gender) where.gender = filters.gender;
        if (filters.fromDate || filters.toDate) where.enrollmentDate = this.dateRange(filters.fromDate, filters.toDate);

        const rows = await this.prisma.student.findMany({
            where,
            include: { section: { include: { classLevel: true } }, user: { select: { email: true } } },
            orderBy: { lastName: 'asc' }
        });

        if (filters.classLevelId) {
            const filtered = rows.filter(s => s.section?.classLevel?.id === filters.classLevelId);
            return this.buildStudentResult('All Students', filtered);
        }
        return this.buildStudentResult('All Students', rows);
    }

    private buildStudentResult(title: string, rows: any[]): ReportResult {
        return {
            title,
            columns: [
                { header: 'Adm. No', key: 'admissionNo' },
                { header: 'First Name', key: 'firstName' },
                { header: 'Last Name', key: 'lastName' },
                { header: 'Gender', key: 'gender' },
                { header: 'Class', key: 'class' },
                { header: 'Section', key: 'section' },
                { header: 'Email', key: 'email' },
                { header: 'Enrolled', key: 'enrolled' },
                { header: 'Status', key: 'status' },
            ],
            rows: rows.map(s => ({
                admissionNo: s.admissionNo,
                firstName: s.firstName,
                lastName: s.lastName,
                gender: s.gender || '—',
                class: s.section?.classLevel?.name || '—',
                section: s.section?.name || '—',
                email: s.user?.email || '—',
                enrolled: this.fmt(s.enrollmentDate),
                status: s.status || 'ACTIVE',
            })),
            totalRecords: rows.length,
        };
    }

    // ============================================================
    // 2. STUDENTS IN ARREARS
    // ============================================================
    async studentsInArrearsReport(schoolId: string, filters: {
        classLevelId?: string; minAmount?: number;
    }): Promise<ReportResult> {
        const invoices = await this.prisma.invoice.findMany({
            where: { schoolId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
            include: {
                student: { include: { section: { include: { classLevel: true } } } },
                feeStructure: true
            },
            orderBy: { amount: 'desc' }
        });

        let filtered = invoices;
        if (filters.classLevelId) filtered = filtered.filter(i => i.student?.section?.classLevel?.id === filters.classLevelId);
        if (filters.minAmount) filtered = filtered.filter(i => Number(i.amount) >= filters.minAmount!);

        return {
            title: 'Students in Arrears',
            columns: [
                { header: 'Adm. No', key: 'admissionNo' },
                { header: 'Student Name', key: 'name' },
                { header: 'Class', key: 'class' },
                { header: 'Fee Type', key: 'feeType' },
                { header: 'Amount', key: 'amount' },
                { header: 'Due Date', key: 'dueDate' },
                { header: 'Status', key: 'status' },
            ],
            rows: filtered.map(i => ({
                admissionNo: i.student?.admissionNo || '—',
                name: i.student ? `${i.student.firstName} ${i.student.lastName}` : '—',
                class: i.student?.section?.classLevel?.name || '—',
                feeType: i.feeStructure?.name || 'General Fee',
                amount: this.money(i.amount),
                dueDate: this.fmt(i.dueDate),
                status: i.status,
            })),
            totalRecords: filtered.length,
        };
    }

    // ============================================================
    // 3. LATE ARRIVALS REPORT
    // ============================================================
    async lateArrivalsReport(schoolId: string, filters: {
        fromDate?: string; toDate?: string; classLevelId?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.fromDate || filters.toDate) where.arrivalTime = this.dateRange(filters.fromDate, filters.toDate);

        const rows = await this.prisma.lateArrival.findMany({
            where,
            include: { student: { include: { section: { include: { classLevel: true } } } } },
            orderBy: { arrivalTime: 'desc' }
        });

        let filtered = rows;
        if (filters.classLevelId) filtered = rows.filter(l => l.student?.section?.classLevel?.id === filters.classLevelId);

        return {
            title: 'Late Arrivals Report',
            columns: [
                { header: 'Date/Time', key: 'time' },
                { header: 'Adm. No', key: 'admissionNo' },
                { header: 'Student Name', key: 'name' },
                { header: 'Class', key: 'class' },
                { header: 'Reason', key: 'reason' },
                { header: 'Reported By', key: 'reportedBy' },
            ],
            rows: filtered.map(l => ({
                time: new Date(l.arrivalTime).toLocaleString(),
                admissionNo: l.student?.admissionNo || '—',
                name: l.student ? `${l.student.firstName} ${l.student.lastName}` : '—',
                class: l.student?.section?.classLevel?.name || '—',
                reason: l.reason || '—',
                reportedBy: l.reportedBy || '—',
            })),
            totalRecords: filtered.length,
        };
    }

    // ============================================================
    // 4. GATE PASSES REPORT
    // ============================================================
    async gatePassesReport(schoolId: string, filters: {
        fromDate?: string; toDate?: string; classLevelId?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.fromDate || filters.toDate) where.issuedAt = this.dateRange(filters.fromDate, filters.toDate);

        const rows = await this.prisma.gatePass.findMany({
            where,
            include: { student: { include: { section: { include: { classLevel: true } } } } },
            orderBy: { issuedAt: 'desc' }
        });

        let filtered = rows;
        if (filters.classLevelId) filtered = rows.filter(p => p.student?.section?.classLevel?.id === filters.classLevelId);

        return {
            title: 'Gate Pass Registry',
            columns: [
                { header: 'Issued At', key: 'issuedAt' },
                { header: 'Adm. No', key: 'admissionNo' },
                { header: 'Student Name', key: 'name' },
                { header: 'Class', key: 'class' },
                { header: 'Guardian/Escort', key: 'guardian' },
                { header: 'Reason', key: 'reason' },
            ],
            rows: filtered.map(p => ({
                issuedAt: new Date(p.issuedAt).toLocaleString(),
                admissionNo: p.student?.admissionNo || '—',
                name: p.student ? `${p.student.firstName} ${p.student.lastName}` : '—',
                class: p.student?.section?.classLevel?.name || '—',
                guardian: p.guardianName || '—',
                reason: p.reason || '—',
            })),
            totalRecords: filtered.length,
        };
    }

    // ============================================================
    // 5. STUDENT ATTENDANCE SUMMARY
    // ============================================================
    async studentAttendanceReport(schoolId: string, filters: {
        fromDate?: string; toDate?: string; sectionId?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.sectionId) where.sectionId = filters.sectionId;
        if (filters.fromDate || filters.toDate) where.date = this.dateRange(filters.fromDate, filters.toDate);

        const rows = await this.prisma.attendance.findMany({
            where,
            include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
            orderBy: { date: 'desc' }
        });

        return {
            title: 'Student Attendance Record',
            columns: [
                { header: 'Date', key: 'date' },
                { header: 'Adm. No', key: 'admissionNo' },
                { header: 'Student', key: 'name' },
                { header: 'Status', key: 'status' },
                { header: 'Remarks', key: 'remarks' },
            ],
            rows: rows.map(a => ({
                date: this.fmt(a.date),
                admissionNo: a.student?.admissionNo || '—',
                name: a.student ? `${a.student.firstName} ${a.student.lastName}` : '—',
                status: a.status,
                remarks: a.remarks || '—',
            })),
            totalRecords: rows.length,
        };
    }

    // ============================================================
    // 6. NEW ENROLLMENTS
    // ============================================================
    async newEnrollmentsReport(schoolId: string, filters: {
        fromDate?: string; toDate?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.fromDate || filters.toDate) where.enrollmentDate = this.dateRange(filters.fromDate, filters.toDate);

        const rows = await this.prisma.student.findMany({
            where,
            include: { section: { include: { classLevel: true } } },
            orderBy: { enrollmentDate: 'desc' }
        });

        return this.buildStudentResult('New Enrollments', rows);
    }

    // ============================================================
    // 7. ALL STAFF
    // ============================================================
    async staffReport(schoolId: string, filters: {
        department?: string; designation?: string; fromDate?: string; toDate?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.department) where.department = filters.department;
        if (filters.designation) where.designation = { contains: filters.designation, mode: 'insensitive' };
        if (filters.fromDate || filters.toDate) where.joinDate = this.dateRange(filters.fromDate, filters.toDate);

        const rows = await this.prisma.staff.findMany({
            where,
            include: { user: { select: { email: true } } },
            orderBy: { department: 'asc' }
        });

        return {
            title: 'Staff Directory',
            columns: [
                { header: 'Employee ID', key: 'employeeId' },
                { header: 'First Name', key: 'firstName' },
                { header: 'Last Name', key: 'lastName' },
                { header: 'Department', key: 'department' },
                { header: 'Designation', key: 'designation' },
                { header: 'Email', key: 'email' },
                { header: 'Phone', key: 'phone' },
                { header: 'Joined', key: 'joined' },
            ],
            rows: rows.map(s => ({
                employeeId: s.employeeId,
                firstName: s.firstName,
                lastName: s.lastName,
                department: s.department,
                designation: s.designation,
                email: s.user?.email || '—',
                phone: s.phone || '—',
                joined: this.fmt(s.joinDate),
            })),
            totalRecords: rows.length,
        };
    }

    // ============================================================
    // 8. STAFF BY DEPARTMENT
    // ============================================================
    async staffByDepartmentReport(schoolId: string): Promise<ReportResult> {
        const groups = await this.prisma.staff.groupBy({
            by: ['department'],
            where: { schoolId },
            _count: { id: true }
        });

        return {
            title: 'Staff by Department',
            columns: [
                { header: 'Department', key: 'department' },
                { header: 'Headcount', key: 'count' },
            ],
            rows: groups.map(g => ({
                department: g.department,
                count: g._count.id,
            })),
            totalRecords: groups.reduce((sum, g) => sum + g._count.id, 0),
        };
    }

    // ============================================================
    // 9. VISITORS REPORT
    // ============================================================
    async visitorsReport(schoolId: string, filters: {
        fromDate?: string; toDate?: string; status?: string; purpose?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.status) where.status = filters.status;
        if (filters.fromDate || filters.toDate) where.checkIn = this.dateRange(filters.fromDate, filters.toDate);

        const rows = await this.prisma.visitor.findMany({
            where,
            orderBy: { checkIn: 'desc' }
        });

        let filtered = filters.purpose
            ? rows.filter(v => v.purpose?.toLowerCase().includes(filters.purpose!.toLowerCase()))
            : rows;

        return {
            title: 'Visitor Log',
            columns: [
                { header: 'Name', key: 'name' },
                { header: 'Phone', key: 'phone' },
                { header: 'Purpose', key: 'purpose' },
                { header: 'Meeting', key: 'meeting' },
                { header: 'ID Proof', key: 'idProof' },
                { header: 'Vehicle', key: 'vehicle' },
                { header: 'Check In', key: 'checkIn' },
                { header: 'Check Out', key: 'checkOut' },
                { header: 'Status', key: 'status' },
            ],
            rows: filtered.map(v => ({
                name: v.name,
                phone: v.phone,
                purpose: v.purpose || '—',
                meeting: v.personToMeet || '—',
                idProof: v.idProof || '—',
                vehicle: v.vehicleNo || '—',
                checkIn: new Date(v.checkIn).toLocaleString(),
                checkOut: v.checkOut ? new Date(v.checkOut).toLocaleString() : 'On premises',
                status: v.status,
            })),
            totalRecords: filtered.length,
        };
    }

    // ============================================================
    // 10. CURRENT VISITORS ON PREMISES
    // ============================================================
    async currentVisitorsReport(schoolId: string): Promise<ReportResult> {
        return this.visitorsReport(schoolId, { status: 'IN' });
    }

    // ============================================================
    // 11. CLASSES & SECTIONS LIST
    // ============================================================
    async classesReport(schoolId: string): Promise<ReportResult> {
        const levels = await this.prisma.classLevel.findMany({
            where: { schoolId },
            include: {
                sections: {
                    include: {
                        _count: { select: { students: true } },
                        classTeacher: { select: { firstName: true, lastName: true } }
                    }
                }
            },
            orderBy: { level: 'asc' }
        });

        const rows: any[] = [];
        for (const level of levels) {
            for (const section of level.sections) {
                rows.push({
                    classLevel: level.name,
                    section: section.name,
                    classTeacher: section.classTeacher
                        ? `${section.classTeacher.firstName} ${section.classTeacher.lastName}`
                        : '—',
                    studentCount: section._count.students,
                    capacity: section.capacity,
                });
            }
        }

        return {
            title: 'Classes & Sections',
            columns: [
                { header: 'Class Level', key: 'classLevel' },
                { header: 'Section', key: 'section' },
                { header: 'Class Teacher', key: 'classTeacher' },
                { header: 'Students', key: 'studentCount' },
                { header: 'Capacity', key: 'capacity' },
            ],
            rows,
            totalRecords: rows.length,
        };
    }

    // ============================================================
    // 12. SUBJECTS LIST
    // ============================================================
    async subjectsReport(schoolId: string): Promise<ReportResult> {
        const subjects = await this.prisma.subject.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' }
        });

        return {
            title: 'Subjects List',
            columns: [
                { header: 'Subject', key: 'name' },
                { header: 'Code', key: 'code' },
                { header: 'Department', key: 'department' },
            ],
            rows: subjects.map(s => ({
                name: s.name,
                code: s.code || '—',
                department: s.department || '—',
            })),
            totalRecords: subjects.length,
        };
    }

    // ============================================================
    // 13. EXAM RESULTS REPORT
    // ============================================================
    async examResultsReport(schoolId: string, filters: {
        examId?: string; classLevelId?: string;
    }): Promise<ReportResult> {
        const where: any = { exam: { schoolId } };
        if (filters.examId) where.examId = filters.examId;

        const results = await this.prisma.examResult.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, admissionNo: true } },
            },
            orderBy: { marksObtained: 'desc' }
        });

        return {
            title: 'Exam Results',
            columns: [
                { header: 'Exam ID', key: 'examId' },
                { header: 'Adm. No', key: 'admissionNo' },
                { header: 'Student', key: 'name' },
                { header: 'Marks Obtained', key: 'marks' },
                { header: 'Remarks', key: 'remarks' },
            ],
            rows: (results as any[]).map(r => ({
                examId: r.examId,
                admissionNo: r.student?.admissionNo || '—',
                name: r.student ? `${r.student.firstName} ${r.student.lastName}` : '—',
                marks: r.marksObtained,
                remarks: r.remarks || '—',
            })),
            totalRecords: results.length,
        };
    }

    // ============================================================
    // 14. FEE COLLECTION SUMMARY (itemised)
    // ============================================================
    async feeCollectionReport(schoolId: string, filters: {
        fromDate?: string; toDate?: string; method?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.fromDate || filters.toDate) where.date = this.dateRange(filters.fromDate, filters.toDate);
        if (filters.method) where.method = filters.method;

        const rows = await this.prisma.transaction.findMany({
            where,
            include: {
                invoice: {
                    include: {
                        student: { select: { firstName: true, lastName: true, admissionNo: true } }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        return {
            title: 'Fee Collection Log',
            columns: [
                { header: 'Date', key: 'date' },
                { header: 'Adm. No', key: 'admissionNo' },
                { header: 'Student', key: 'name' },
                { header: 'Amount', key: 'amount' },
                { header: 'Method', key: 'method' },
                { header: 'Reference', key: 'reference' },
                { header: 'Collected By', key: 'collectedBy' },
            ],
            rows: rows.map(t => ({
                date: this.fmt(t.date),
                admissionNo: t.invoice?.student?.admissionNo || '—',
                name: t.invoice?.student
                    ? `${t.invoice.student.firstName} ${t.invoice.student.lastName}`
                    : '—',
                amount: this.money(t.amount),
                method: t.method,
                reference: t.referenceNo || '—',
                collectedBy: t.collectedBy || '—',
            })),
            totalRecords: rows.length,
        };
    }

    // ============================================================
    // 15. REVENUE SUMMARY BY PERIOD (grouped by month)
    // ============================================================
    async revenueReport(schoolId: string, filters: {
        fromDate?: string; toDate?: string;
    }): Promise<ReportResult> {
        const where: any = { schoolId };
        if (filters.fromDate || filters.toDate) where.date = this.dateRange(filters.fromDate, filters.toDate);

        const txs = await this.prisma.transaction.findMany({
            where,
            select: { amount: true, date: true, method: true }
        });

        // Group by month
        const grouped: Record<string, { total: number; count: number }> = {};
        txs.forEach(t => {
            const month = new Date(t.date).toLocaleDateString('en', { year: 'numeric', month: 'long' });
            if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
            grouped[month].total += Number(t.amount);
            grouped[month].count += 1;
        });

        const rows = Object.entries(grouped).map(([month, data]) => ({
            month,
            transactions: data.count,
            total: this.money(data.total),
        }));

        return {
            title: 'Revenue by Period',
            columns: [
                { header: 'Month', key: 'month' },
                { header: 'Transactions', key: 'transactions' },
                { header: 'Total Revenue', key: 'total' },
            ],
            rows,
            totalRecords: rows.length,
        };
    }

    // ============================================================
    // 16. SCHOOL OVERVIEW (dashboard style — one row per metric)
    // ============================================================
    async schoolOverviewReport(schoolId: string): Promise<ReportResult> {
        const [students, staff, visitors, invoices, transactions, absent] = await Promise.all([
            this.prisma.student.count({ where: { schoolId } }),
            this.prisma.staff.count({ where: { schoolId } }),
            this.prisma.visitor.count({ where: { schoolId } }),
            this.prisma.invoice.aggregate({ where: { schoolId, status: { in: ['PENDING', 'OVERDUE'] } }, _sum: { amount: true } }),
            this.prisma.transaction.aggregate({ where: { schoolId }, _sum: { amount: true } }),
            this.prisma.attendance.count({ where: { schoolId, status: 'ABSENT', date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } }),
        ]);

        const rows = [
            { metric: 'Total Students Enrolled', value: students },
            { metric: 'Total Staff Members', value: staff },
            { metric: 'Total Visitors (All Time)', value: visitors },
            { metric: 'Total Revenue Collected', value: this.money(transactions._sum?.amount || 0) },
            { metric: 'Outstanding Fees', value: this.money(invoices._sum?.amount || 0) },
            { metric: 'Absences (Last 30 Days)', value: absent },
        ];

        return {
            title: 'School Overview',
            columns: [
                { header: 'Metric', key: 'metric' },
                { header: 'Value', key: 'value' },
            ],
            rows,
            totalRecords: rows.length,
        };
    }

    // ─── DISPATCHER ─────────────────────────────────────────────────────────────
    async getReport(reportType: string, schoolId: string, filters: any = {}): Promise<ReportResult> {
        switch (reportType) {
            case 'students': return this.studentsReport(schoolId, filters);
            case 'students-arrears': return this.studentsInArrearsReport(schoolId, filters);
            case 'late-arrivals': return this.lateArrivalsReport(schoolId, filters);
            case 'gate-passes': return this.gatePassesReport(schoolId, filters);
            case 'student-attendance': return this.studentAttendanceReport(schoolId, filters);
            case 'new-enrollments': return this.newEnrollmentsReport(schoolId, filters);
            case 'staff': return this.staffReport(schoolId, filters);
            case 'staff-by-dept': return this.staffByDepartmentReport(schoolId);
            case 'visitors': return this.visitorsReport(schoolId, filters);
            case 'current-visitors': return this.currentVisitorsReport(schoolId);
            case 'classes': return this.classesReport(schoolId);
            case 'subjects': return this.subjectsReport(schoolId);
            case 'exam-results': return this.examResultsReport(schoolId, filters);
            case 'fee-collection': return this.feeCollectionReport(schoolId, filters);
            case 'revenue': return this.revenueReport(schoolId, filters);
            case 'overview': return this.schoolOverviewReport(schoolId);
            default: throw new Error(`Unknown report type: ${reportType}`);
        }
    }
}
