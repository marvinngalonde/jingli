import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('core')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post('levels')
    @Roles(UserRole.SUPER_ADMIN, UserRole.DEPUTY_HEAD, UserRole.HOD)
    createLevel(@Req() req: any, @Body() createDto: any) {
        return this.classesService.createLevel(createDto, req.user.schoolId);
    }

    @Post('sections')
    @Roles(UserRole.SUPER_ADMIN, UserRole.DEPUTY_HEAD, UserRole.HOD)
    createSection(@Req() req: any, @Body() createDto: any) {
        return this.classesService.createSection(createDto, req.user.schoolId);
    }

    @Get()
    @ApiQuery({ name: 'teacherId', required: false })
    findAll(@Req() req: any, @Query('teacherId') teacherId?: string) {
        // Enforce scope: if caller is a teacher, they can ONLY fetch their own classes
        const role = req.user.role as UserRole;
        const isTeacher = ([UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.SEN_COORDINATOR] as UserRole[]).includes(role);
        const enforcedTeacherId = isTeacher ? req.user.id : teacherId;

        return this.classesService.findAll(req.user.schoolId, enforcedTeacherId);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.classesService.findOne(id, req.user.schoolId);
    }

    @Patch('levels/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.DEPUTY_HEAD, UserRole.HOD)
    updateLevel(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.classesService.updateLevel(id, updateDto, req.user.schoolId);
    }

    @Patch('sections/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.DEPUTY_HEAD, UserRole.HOD, UserRole.CLASS_TEACHER)
    updateSection(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.classesService.updateSection(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.classesService.remove(id, req.user.schoolId);
    }

    @Get('sections/:id/students')
    getStudents(@Req() req: any, @Param('id') id: string) {
        return this.classesService.getStudents(id, req.user.schoolId);
    }

    @Get('sections/:id/timetable')
    getTimetable(@Req() req: any, @Param('id') id: string) {
        return this.classesService.getTimetable(id, req.user.schoolId);
    }

    @Get('sections/:id/teachers')
    getTeachers(@Req() req: any, @Param('id') id: string) {
        return this.classesService.getTeachers(id, req.user.schoolId);
    }
}
