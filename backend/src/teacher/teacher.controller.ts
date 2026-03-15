import { Controller, Get, Post, Delete, Req, UseGuards, Param, Body, Query } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('teacher')
@UseGuards(SupabaseGuard)
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) { }

    @Get('dashboard-stats')
    getDashboardStats(@Req() req: any) {
        return this.teacherService.getDashboardStats(req.user);
    }

    @Get('schedule')
    getTodaySchedule(@Req() req: any) {
        return this.teacherService.getTodaySchedule(req.user);
    }

    @Get('classes')
    getTeacherClasses(@Req() req: any) {
        return this.teacherService.getTeacherClasses(req.user);
    }

    @Get('classes/:sectionId/students')
    getClassStudents(
        @Req() req: any,
        @Param('sectionId') sectionId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.teacherService.getClassStudents(
            req.user,
            sectionId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 7
        );
    }

    @Get('classes/:sectionId/materials')
    getSectionMaterials(@Req() req: any, @Param('sectionId') sectionId: string) {
        return this.teacherService.getSectionMaterials(req.user, sectionId);
    }

    @Post('classes/:sectionId/materials')
    uploadMaterial(@Req() req: any, @Param('sectionId') sectionId: string, @Body() body: any) {
        return this.teacherService.uploadMaterial(req.user, sectionId, body);
    }

    @Delete('materials/:materialId')
    deleteMaterial(@Req() req: any, @Param('materialId') materialId: string) {
        return this.teacherService.deleteMaterial(req.user, materialId);
    }

    @Get('materials')
    getAllMaterials(@Req() req: any) {
        return this.teacherService.getAllMaterials(req.user);
    }

    // --- ASSIGNMENTS ---

    @Get('classes/:sectionId/assignments')
    getSectionAssignments(@Req() req: any, @Param('sectionId') sectionId: string) {
        return this.teacherService.getSectionAssignments(req.user, sectionId);
    }

    @Post('classes/:sectionId/assignments')
    createAssignment(@Req() req: any, @Param('sectionId') sectionId: string, @Body() body: any) {
        return this.teacherService.createAssignment(req.user, sectionId, body);
    }

    @Delete('assignments/:assignmentId')
    deleteAssignment(@Req() req: any, @Param('assignmentId') assignmentId: string) {
        return this.teacherService.deleteAssignment(req.user, assignmentId);
    }

    @Get('assignments')
    getAllAssignments(@Req() req: any) {
        return this.teacherService.getAllAssignments(req.user);
    }

    // --- GRADING ---

    @Get('grading/dashboard-submissions')
    getDashboardSubmissions(@Req() req: any) {
        return this.teacherService.getDashboardSubmissions(req.user);
    }

    @Get('assignments/:assignmentId/submissions')
    getAssignmentSubmissions(@Req() req: any, @Param('assignmentId') assignmentId: string) {
        return this.teacherService.getAssignmentSubmissions(req.user, assignmentId);
    }

    @Post('submissions/:submissionId/grade')
    gradeSubmission(@Req() req: any, @Param('submissionId') submissionId: string, @Body() body: any) {
        return this.teacherService.gradeSubmission(req.user, submissionId, body);
    }
    @Get('analytics')
    getAnalytics(@Req() req: any) {
        return this.teacherService.getAnalytics(req.user);
    }

    @Get('leaderboard')
    getLeaderboard(@Req() req: any) {
        return this.teacherService.getLeaderboard(req.user);
    }

    @Get('exams')
    getExams(@Req() req: any) {
        return this.teacherService.getExams(req.user);
    }

}
