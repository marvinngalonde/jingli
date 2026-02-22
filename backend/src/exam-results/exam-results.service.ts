import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExamResultsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    /**
     * Resolve the Staff record ID from an internal User ID.
     * Returns null if the user has no associated staff record.
     */
    private async resolveStaffId(userId: string): Promise<string | null> {
        const staff = await this.prisma.staff.findFirst({
            where: { userId },
            select: { id: true },
        });
        return staff?.id ?? null;
    }

    async createBulk(
        bulkDto: { examId: string; results: { studentId: string; marksObtained: number; remarks?: string; gradedBy?: string }[] },
        requestUserId: string,
    ) {
        const { examId, results } = bulkDto;

        // Try to resolve the grader's Staff ID from the authenticated user.
        // Admin users may not have a Staff record — that's fine, gradedBy will be null.
        const staffId = await this.resolveStaffId(requestUserId);
        if (!staffId) {
            throw new BadRequestException('The authenticated user does not have a Staff profile and cannot grade exams.');
        }

        const results_data = await this.prisma.$transaction(
            results.map(result =>
                this.prisma.examResult.upsert({
                    where: {
                        examId_studentId: {
                            examId,
                            studentId: result.studentId,
                        },
                    },
                    update: {
                        marksObtained: result.marksObtained,
                        remarks: result.remarks,
                        gradedBy: staffId,
                    },
                    create: {
                        examId,
                        studentId: result.studentId,
                        marksObtained: result.marksObtained,
                        remarks: result.remarks,
                        gradedBy: staffId,
                    },
                })
            )
        );

        // Trigger notifications for underperformance (marks < 40%)
        this.triggerUnderperformanceNotifications(examId, results);

        return results_data;
    }

    private async triggerUnderperformanceNotifications(examId: string, results: any[]) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: { subject: true, school: true }
        });

        if (!exam) return;

        for (const res of results) {
            // Simplified check: marks < 40% (assuming maxMarks is available on exam, but if not we use a raw Mark)
            // If exam has maxMarks, we should use it. Let's check schema.
            if (res.marksObtained < 40) { // Defaulting to 40 as a raw score for now if maxMarks not found
                const student = await this.prisma.student.findUnique({
                    where: { id: res.studentId },
                    include: { user: true }
                });

                if (student) {
                    // Notify Staff/Admins about underperformance
                    const usersToNotify = await this.prisma.user.findMany({
                        where: {
                            schoolId: exam.schoolId,
                            role: { in: ['ADMIN', 'TEACHER'] }
                        }
                    });

                    for (const user of usersToNotify) {
                        this.notificationsService.createNotification(
                            user.id,
                            'Academic Alert: Underperformance',
                            `Student ${student.firstName} ${student.lastName} scored ${res.marksObtained} in ${exam.subject.name} exam.`,
                            'WARNING'
                        ).catch(e => console.error('Failed to send underperformance notification', e));
                    }
                }
            }
        }
    }

    async findByExam(examId: string) {
        return this.prisma.examResult.findMany({
            where: { examId },
            include: {
                student: {
                    include: {
                        user: { select: { status: true } },
                    },
                },
            },
        });
    }

    async findByStudent(studentId: string) {
        return this.prisma.examResult.findMany({
            where: { studentId },
            include: {
                exam: {
                    include: {
                        subject: true,
                        term: true,
                    },
                },
            },
            orderBy: {
                exam: { date: 'desc' },
            },
        });
    }
}
