import { Controller, Get, Post, Req, Body, Param, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('student')
@UseGuards(SupabaseGuard)
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Get('dashboard-stats')
    getDashboardStats(@Req() req: any) {
        return this.studentService.getDashboardStats(req.user);
    }

    @Get('schedule')
    getTodaySchedule(@Req() req: any) {
        return this.studentService.getTodaySchedule(req.user);
    }

    @Get('classes')
    getStudentClasses(@Req() req: any) {
        return this.studentService.getStudentClasses(req.user);
    }

    @Get('classes/:subjectId/materials')
    getCourseMaterials(@Param('subjectId') subjectId: string) {
        return this.studentService.getCourseMaterials(subjectId);
    }

    @Get('classes/:subjectId/assignments')
    getAssignments(@Req() req: any, @Param('subjectId') subjectId: string) {
        return this.studentService.getAssignments(req.user, subjectId);
    }

    @Post('assignments/:assignmentId/submit')
    submitAssignment(@Req() req: any, @Param('assignmentId') assignmentId: string, @Body() data: any) {
        return this.studentService.submitAssignment(req.user, assignmentId, data);
    }

    @Get('grades')
    getGrades(@Req() req: any) {
        return this.studentService.getGrades(req.user);
    }
}
