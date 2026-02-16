import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('core')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post('levels')
    createLevel(@Req() req: any, @Body() createDto: any) {
        return this.classesService.createLevel(createDto, req.user.schoolId);
    }

    @Post('sections')
    createSection(@Req() req: any, @Body() createDto: any) {
        return this.classesService.createSection(createDto, req.user.schoolId);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.classesService.findAll(req.user.schoolId);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.classesService.findOne(id, req.user.schoolId);
    }

    @Patch('levels/:id')
    updateLevel(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.classesService.updateLevel(id, updateDto, req.user.schoolId);
    }

    @Patch('sections/:id')
    updateSection(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.classesService.updateSection(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
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
