import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('teacher/quizzes')
@UseGuards(SupabaseGuard, RolesGuard)
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Post()
    @Roles(UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    async createQuiz(@Request() req: any, @Body() data: any) {
        const schoolId = req.user.schoolId;
        // Assuming staffProfile exists to get teacherId, otherwise use userId depending on how other routes do it
        const teacherId = req.user.staffProfile?.id || req.user.userId;
        return this.quizzesService.createQuiz(schoolId, teacherId, data);
    }

    @Get()
    @Roles(UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    async getMyQuizzes(@Request() req: any) {
        const schoolId = req.user.schoolId;
        const teacherId = req.user.staffProfile?.id || req.user.userId;
        return this.quizzesService.getQuizzesByTeacher(schoolId, teacherId);
    }

    @Get(':id')
    @Roles(UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    async getQuizDetails(@Request() req: any, @Param('id') quizId: string) {
        return this.quizzesService.getQuizDetails(req.user.schoolId, quizId);
    }

    @Get(':id/attempts')
    @Roles('TEACHER', 'SUBJECT_TEACHER', 'CLASS_TEACHER', 'SENIOR_TEACHER', 'HOD', 'SCHOOL_HEAD', 'SUPER_ADMIN')
    async getQuizAttempts(@Request() req: any, @Param('id') quizId: string) {
        return this.quizzesService.getAttempts(req.user.schoolId, quizId);
    }
}
