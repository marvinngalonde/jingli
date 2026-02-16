import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('academics')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('subjects')
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    @Post()
    create(@Req() req: any, @Body() createSubjectDto: any) {
        return this.subjectsService.create(createSubjectDto, req.user.schoolId);
    }

    @Post('allocate')
    allocate(@Req() req: any, @Body() allocationDto: any) {
        return this.subjectsService.allocate(allocationDto, req.user.schoolId);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.subjectsService.findAll(req.user.schoolId);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.subjectsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() updateSubjectDto: any) {
        return this.subjectsService.update(id, updateSubjectDto, req.user.schoolId);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.subjectsService.remove(id, req.user.schoolId);
    }

    @Get(':id/assignments')
    getAssignments(@Req() req: any, @Param('id') id: string) {
        return this.subjectsService.getAssignments(id, req.user.schoolId);
    }

    @Get(':id/teachers')
    getTeachers(@Req() req: any, @Param('id') id: string) {
        return this.subjectsService.getTeachers(id, req.user.schoolId);
    }

    @Get(':id/classes')
    getClasses(@Req() req: any, @Param('id') id: string) {
        return this.subjectsService.getClasses(id, req.user.schoolId);
    }
}
