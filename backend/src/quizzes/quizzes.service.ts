import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
    constructor(private prisma: PrismaService) { }

    async createQuiz(schoolId: string, teacherId: string, data: any) {
        const { questions, ...quizData } = data;

        return this.prisma.quiz.create({
            data: {
                ...quizData,
                schoolId,
                teacherId,
                questions: {
                    create: questions
                }
            },
            include: {
                questions: true
            }
        });
    }

    async getQuizzesByTeacher(schoolId: string, teacherId: string) {
        return this.prisma.quiz.findMany({
            where: { schoolId, teacherId },
            include: {
                subject: true,
                section: { include: { classLevel: true } },
                _count: { select: { questions: true, attempts: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getQuizDetails(schoolId: string, quizId: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId, schoolId },
            include: { questions: true }
        });
        if (!quiz) throw new NotFoundException('Quiz not found');
        return quiz;
    }

    async getAttempts(schoolId: string, quizId: string) {
        return this.prisma.quizAttempt.findMany({
            where: { quiz: { id: quizId, schoolId } },
            include: { student: true }
        });
    }

    // Used by students
    async startAttempt(schoolId: string, studentId: string, quizId: string) {
        // Basic logic
        return this.prisma.quizAttempt.create({
            data: {
                quizId,
                studentId,
                status: 'IN_PROGRESS'
            }
        });
    }
}
