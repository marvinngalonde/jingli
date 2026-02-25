import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('exam-results')
@Controller('exam-results')
@UseGuards(SupabaseGuard, RolesGuard)
export class ExamResultsController {
    constructor(private readonly examResultsService: ExamResultsService) { }

    @Post('bulk')
    @ApiOperation({ summary: 'Bulk record exam results' })
    @Roles(UserRole.SUBJECT_TEACHER, UserRole.HOD, UserRole.SENIOR_TEACHER, UserRole.SUPER_ADMIN)
    createBulk(@Req() req: any, @Body() bulkDto: any) {
        return this.examResultsService.createBulk(bulkDto, req.user.id);
    }

    @Get('exam/:examId')
    @ApiOperation({ summary: 'Get results for a specific exam' })
    @Roles(UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.HOD, UserRole.SENIOR_TEACHER, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    findByExam(@Param('examId') examId: string) {
        return this.examResultsService.findByExam(examId);
    }

    @Get('student/:studentId')
    @ApiOperation({ summary: 'Get results for a specific student' })
    @Roles(UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.HOD, UserRole.SENIOR_TEACHER, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
    findByStudent(@Param('studentId') studentId: string) {
        return this.examResultsService.findByStudent(studentId);
    }
}
