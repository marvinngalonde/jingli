import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CbtService {
  constructor(private prisma: PrismaService) { }

  async getAllQuizzes(user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.quiz.findMany({
      where: { teacherId: staff.id },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } },
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getQuizById(id: string, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const quiz = await this.prisma.quiz.findFirst({
      where: { id, teacherId: staff.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } },
        _count: { select: { attempts: true } }
      }
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async createQuiz(dto: any, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.quiz.create({
      data: {
        title: dto.title,
        duration: dto.duration,
        isPublished: dto.isPublished || false,
        randomize: dto.randomize ?? true,
        showAnswers: dto.showAnswers ?? true,
        autoGrade: dto.autoGrade ?? true,
        secureMode: dto.secureMode || false,
        subjectId: dto.subjectId,
        sectionId: dto.sectionId,
        teacherId: staff.id,
        schoolId: staff.schoolId,
      }
    });
  }

  async updateQuiz(id: string, dto: any, user: any) {
    const quiz = await this.getQuizById(id, user);

    return this.prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        title: dto.title,
        duration: dto.duration,
        isPublished: dto.isPublished,
        randomize: dto.randomize,
        showAnswers: dto.showAnswers,
        autoGrade: dto.autoGrade,
        secureMode: dto.secureMode,
      }
    });
  }

  async deleteQuiz(id: string, user: any) {
    const quiz = await this.getQuizById(id, user);
    return this.prisma.quiz.delete({ where: { id: quiz.id } });
  }

  async addQuestion(quizId: string, dto: any, user: any) {
    const quiz = await this.getQuizById(quizId, user);

    // Get last order
    const lastQ = await this.prisma.quizQuestion.findFirst({
      where: { quizId: quiz.id },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastQ ? lastQ.order + 1 : 0;

    return this.prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        question: dto.text,
        options: dto.options,
        correctAnswer: dto.correctAnswer,
        explanation: dto.explanation,
        marks: dto.points || 1,
        order: nextOrder
      }
    });
  }
}
