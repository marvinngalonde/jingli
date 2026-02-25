import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ZIMSEC-compatible CSV export service.
 * Generates student result data in the format required by the
 * Zimbabwe Schools Examination Council for O-Level / A-Level uploads.
 */
@Injectable()
export class ZimsecExportService {
    private readonly logger = new Logger(ZimsecExportService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Compute letter grade from percentage marks.
     */
    private computeGrade(marks: number, maxMarks: number): string {
        const pct = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
        if (pct >= 90) return 'A*';
        if (pct >= 80) return 'A';
        if (pct >= 70) return 'B';
        if (pct >= 60) return 'C';
        if (pct >= 50) return 'D';
        if (pct >= 40) return 'E';
        return 'U';
    }

    /**
     * Export exam results for a given exam as a ZIMSEC-formatted CSV string.
     * Columns: CandidateNo, FirstName, LastName, Gender, DOB, SubjectCode, SubjectName, Mark, MaxMark, Grade
     */
    async exportResultsCsv(schoolId: string, examId: string): Promise<string> {
        const results = await this.prisma.examResult.findMany({
            where: {
                exam: { schoolId },
                examId,
            },
            include: {
                student: true,
                exam: { include: { subject: true } },
            },
            orderBy: { student: { admissionNo: 'asc' } },
        });

        const header = 'CandidateNo,FirstName,LastName,Gender,DOB,SubjectCode,SubjectName,Mark,MaxMark,Grade';

        if (results.length === 0) {
            return header + '\n';
        }

        const rows = results.map(r => {
            const student = r.student;
            const subject = r.exam.subject;
            const maxMarks = r.exam.maxMarks;
            const dob = student.dob
                ? new Date(student.dob).toISOString().split('T')[0]
                : '';
            return [
                this.escapeCsv(student.admissionNo),
                this.escapeCsv(student.firstName),
                this.escapeCsv(student.lastName),
                student.gender || '',
                dob,
                this.escapeCsv(subject?.code || ''),
                this.escapeCsv(subject?.name || ''),
                r.marksObtained.toString(),
                maxMarks.toString(),
                this.computeGrade(r.marksObtained, maxMarks),
            ].join(',');
        });

        this.logger.log(`Exported ${rows.length} ZIMSEC rows for exam ${examId}`);
        return [header, ...rows].join('\n');
    }

    /**
     * Generate a student report card data structure for a given student in a given term.
     * Returns structured data that the PDF service or frontend can render.
     */
    async getReportCardData(studentId: string, examId: string) {
        const student = await this.prisma.student.findUniqueOrThrow({
            where: { id: studentId },
            include: {
                user: true,
                section: {
                    include: { classLevel: true },
                },
            },
        });

        // Get all exams for the same term so we show all subjects
        const sourceExam = await this.prisma.exam.findUniqueOrThrow({
            where: { id: examId },
            include: { term: true },
        });

        const termExams = await this.prisma.exam.findMany({
            where: {
                termId: sourceExam.termId,
                schoolId: sourceExam.schoolId,
            },
            include: { subject: true },
        });

        const results = await this.prisma.examResult.findMany({
            where: {
                studentId,
                examId: { in: termExams.map(e => e.id) },
            },
            include: {
                exam: { include: { subject: true, term: true } },
            },
            orderBy: { exam: { subject: { name: 'asc' } } },
        });

        // Compute totals
        const totalMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
        const totalMaxMarks = results.reduce((sum, r) => sum + r.exam.maxMarks, 0);
        const subjectCount = results.length;
        const average = subjectCount > 0 ? (totalMarks / subjectCount).toFixed(1) : '0.0';
        const percentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : '0.0';

        // Attendance summary
        const attendanceSummary = await this.prisma.attendance.groupBy({
            by: ['status'],
            where: { studentId },
            _count: true,
        });

        return {
            student: {
                admissionNo: student.admissionNo,
                firstName: student.firstName,
                lastName: student.lastName,
                gender: student.gender,
                className: student.section
                    ? `${student.section.classLevel?.name} - ${student.section.name}`
                    : 'Unassigned',
            },
            term: {
                name: sourceExam.term?.name || '',
            },
            subjects: results.map(r => ({
                name: r.exam.subject?.name || 'Unknown',
                code: r.exam.subject?.code || '',
                marksObtained: r.marksObtained,
                maxMarks: r.exam.maxMarks,
                percentage: r.exam.maxMarks > 0
                    ? ((r.marksObtained / r.exam.maxMarks) * 100).toFixed(1)
                    : '0.0',
                grade: this.computeGrade(r.marksObtained, r.exam.maxMarks),
                remarks: r.remarks || '',
            })),
            summary: {
                totalMarks,
                totalMaxMarks,
                subjectCount,
                average,
                percentage,
            },
            attendance: attendanceSummary.map(a => ({
                status: a.status,
                count: a._count,
            })),
        };
    }

    private escapeCsv(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}
