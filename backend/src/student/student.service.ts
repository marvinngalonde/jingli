import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboardStats(user: any) {
        // Find the student profile map for this user
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id },
            include: { section: true }
        });

        if (!student || !student.sectionId) {
            throw new NotFoundException('Student profile or class section not found');
        }

        const sectionId = student.sectionId;

        // 1. Classes Today (count events in timetable for today)
        const weekdayMap: Record<string, any> = {
            'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED', 'Thursday': 'THU',
            'Friday': 'FRI', 'Saturday': 'SAT', 'Sunday': 'SUN'
        };
        const todayFull = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const today = weekdayMap[todayFull];

        const classesToday = await this.prisma.timetable.count({
            where: { sectionId: sectionId, day: today }
        });

        // 2. Pending Tasks (Assignments without submissions from this student)
        const activeAssignments = await this.prisma.assignment.findMany({
            where: { sectionId: sectionId }
        });

        const mySubmissions = await this.prisma.submission.findMany({
            where: { studentId: student.id }
        });

        const submittedAssignmentIds = new Set(mySubmissions.map(s => s.assignmentId));
        const pendingAssignmentsCount = activeAssignments.filter(a => !submittedAssignmentIds.has(a.id)).length;

        // 3. New Grades (Submissions with marks where feedback or grade is present, count recently graded)
        const gradedSubmissionsCount = mySubmissions.filter(s => s.marks !== null).length;

        return {
            classesToday,
            pendingAssignmentsCount,
            gradedSubmissionsCount
        };
    }

    async getTodaySchedule(user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });

        if (!student || !student.sectionId) throw new NotFoundException('Student profile not found');

        const weekdayMap: Record<string, any> = {
            'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED', 'Thursday': 'THU',
            'Friday': 'FRI', 'Saturday': 'SAT', 'Sunday': 'SUN'
        };
        const todayFull = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const today = weekdayMap[todayFull];

        return this.prisma.timetable.findMany({
            where: {
                sectionId: student.sectionId,
                day: today
            },
            include: {
                subject: { select: { name: true, code: true } },
                teacher: { select: { firstName: true, lastName: true } }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
    }

    async getStudentClasses(user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });

        if (!student || !student.sectionId) throw new NotFoundException('Student profile not found');

        // Fetch distinct subjects effectively taught to this student's section by looking at timetable
        return this.prisma.subjectAllocation.findMany({
            where: {
                sectionId: student.sectionId
            },
            include: {
                subject: { select: { id: true, name: true, code: true } },
                staff: { select: { firstName: true, lastName: true } } // Teacher
            }
        }).then(allocations => allocations.map((a: any) => ({
            id: a.id,
            subjectId: a.subject.id,
            subject: a.subject,
            teacher: a.staff
        })));
    }

    async getCourseMaterials(subjectId: string) {
        return this.prisma.courseMaterial.findMany({
            where: { subjectId },
            include: { subject: { select: { name: true, code: true } } },
            orderBy: { uploadedAt: 'desc' }
        });
    }

    async getAssignments(user: any, subjectId: string) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });

        if (!student || !student.sectionId) throw new NotFoundException('Student profile not found');

        // Note: For a robust system, we would need to know the specific section the assignment was published to.
        // Assuming assignment is attached to sectionId, and subjectId specifies which subject.
        return this.prisma.assignment.findMany({
            where: {
                sectionId: student.sectionId,
                // If assignment had a subjectId we would filter here. Assuming filtering happens or it's implicitly correct based on section.
            },
            include: {
                submissions: {
                    where: { studentId: student.id }
                }
            },
            orderBy: { dueDate: 'asc' }
        });
    }

    async submitAssignment(user: any, assignmentId: string, data: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });

        if (!student) throw new NotFoundException('Student profile not found');

        return this.prisma.submission.create({
            data: {
                assignmentId,
                studentId: student.id,
                fileUrl: data.fileUrl,
                content: data.content
            }
        });
    }

    async getGrades(user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });

        if (!student) throw new NotFoundException('Student profile not found');

        // Only return submissions that either have a mark or feedback
        return this.prisma.submission.findMany({
            where: {
                studentId: student.id,
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
            orderBy: { submittedAt: 'desc' }
        });
    }

    async getAllAssignments(user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });
        if (!student || !student.sectionId) throw new NotFoundException('Student profile not found');

        return this.prisma.assignment.findMany({
            where: { sectionId: student.sectionId },
            include: {
                subject: { select: { name: true, code: true } },
                submissions: { where: { studentId: student.id } }
            },
            orderBy: { dueDate: 'asc' }
        });
    }

    async getQuizzes(user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });
        if (!student || !student.sectionId) throw new NotFoundException('Student profile not found');

        return this.prisma.quiz.findMany({
            where: { sectionId: student.sectionId, isPublished: true },
            include: {
                subject: { select: { name: true, code: true } },
                teacher: { select: { firstName: true, lastName: true } },
                _count: { select: { questions: true } },
                attempts: {
                    where: { studentId: student.id },
                    orderBy: { startTime: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getQuizQuestions(quizId: string, user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });
        if (!student) throw new NotFoundException('Student profile not found');

        const quiz = await this.prisma.quiz.findFirst({
            where: { id: quizId, sectionId: student.sectionId, isPublished: true },
            include: { questions: { select: { id: true, question: true, options: true, marks: true } } }
        });

        if (!quiz) throw new NotFoundException('Quiz not found or not published');

        // Note: We deliberately exclude correctAnswer from the payload so students can't cheat
        return quiz.questions.map(q => ({
            id: q.id,
            text: q.question,
            options: q.options,
            points: q.marks
        }));
    }

    async submitQuiz(quizId: string, data: any, user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });
        if (!student) throw new NotFoundException('Student profile not found');

        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) throw new NotFoundException('Quiz not found');

        let score = 0;
        const totalMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

        // Calculate score
        for (const answer of (data.answers || [])) {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            if (question && question.correctAnswer && question.correctAnswer.toString() === answer.answer?.toString()) {
                score += question.marks || 1;
            }
        }

        return this.prisma.quizAttempt.create({
            data: {
                quizId,
                studentId: student.id,
                score,
                endTime: new Date(),
                status: 'COMPLETED',
                answers: data.answers || []
            }
        });
    }

    async getLiveClasses(user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id }
        });
        if (!student || !student.sectionId) throw new NotFoundException('Student profile not found');

        return this.prisma.liveClass.findMany({
            where: { sectionId: student.sectionId },
            include: {
                subject: { select: { name: true, code: true } },
                teacher: { select: { firstName: true, lastName: true } }
            },
            orderBy: { scheduledFor: 'asc' }
        });
    }

    async getExams(user: any) {
        const student = await this.prisma.student.findFirst({
            where: { userId: user.id },
            include: { section: true }
        });

        if (!student || !student.sectionId) throw new NotFoundException('Student profile not found');

        return this.prisma.exam.findMany({
            where: {
                classLevelId: student.section!.classLevelId
            },
            include: {
                subject: { select: { name: true, code: true } },
                classLevel: { select: { name: true, level: true } },
                term: { select: { name: true } }
            },
            orderBy: { date: 'asc' }
        });
    }
}
