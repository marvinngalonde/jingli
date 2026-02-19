import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('exam-results')
@Controller('exam-results')
@UseGuards(SupabaseGuard)
export class ExamResultsController {
    constructor(private readonly examResultsService: ExamResultsService) { }

    @Post('bulk')
    @ApiOperation({ summary: 'Bulk record exam results' })
    createBulk(@Req() req: any, @Body() bulkDto: any) {
        return this.examResultsService.createBulk(bulkDto, req.user.id);
    }

    @Get('exam/:examId')
    @ApiOperation({ summary: 'Get results for a specific exam' })
    findByExam(@Param('examId') examId: string) {
        return this.examResultsService.findByExam(examId);
    }

    @Get('student/:studentId')
    @ApiOperation({ summary: 'Get results for a specific student' })
    findByStudent(@Param('studentId') studentId: string) {
        return this.examResultsService.findByStudent(studentId);
    }
}
