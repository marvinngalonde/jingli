import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamResultsService {
    constructor(private readonly prisma: PrismaService) { }

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

        // Transaction to ensure all or nothing
        return this.prisma.$transaction(
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
