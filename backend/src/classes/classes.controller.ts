import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
    findAll(@Req() req: any) {
        // All authenticated users can view classes
        return this.classesService.findAll(req.user.schoolId);
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
