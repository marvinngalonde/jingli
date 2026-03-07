import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Logger, Req } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';

@ApiTags('exams')
@Controller('exams')
@UseGuards(SupabaseGuard, RolesGuard)
export class ExamsController {
    private readonly logger = new Logger(ExamsController.name);

    constructor(private readonly examsService: ExamsService) {
        this.logger.log('ExamsController initialized');
    }

    @Post()
    @ApiOperation({ summary: 'Create a new exam' })
    @Roles(UserRole.HOD, UserRole.SENIOR_TEACHER, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createExamDto: any) {
        return this.examsService.create({ ...createExamDto, schoolId: req.user.schoolId });
    }

    @Get()
    @ApiOperation({ summary: 'List exams with filters' })
    @ApiQuery({ name: 'termId', required: false })
    @ApiQuery({ name: 'classLevelId', required: false })
    @Roles(UserRole.TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    findAll(
        @Req() req: any,
        @Query('termId') termId?: string,
        @Query('classLevelId') classLevelId?: string,
    ) {
        return this.examsService.findAll(req.user.schoolId, termId, classLevelId);
    }

    @Post('terms')
    @ApiOperation({ summary: 'Create a new exam term' })
    @Roles(UserRole.HOD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    createTerm(@Req() req: any, @Body() createTermDto: any) {
        return this.examsService.createTerm({ ...createTermDto, schoolId: req.user.schoolId });
    }

    @Get('terms')
    @ApiOperation({ summary: 'List all exam terms' })
    @Roles(UserRole.TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    getTerms(@Req() req: any) {
        return this.examsService.getTerms(req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update exam' })
    update(@Param('id') id: string, @Body() updateExamDto: any) {
        this.logger.log(`PATCH request received for ID: ${id}`);
        return this.examsService.update(id, updateExamDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exam details' })
    findOne(@Param('id') id: string) {
        return this.examsService.findOne(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete exam' })
    @Roles(UserRole.HOD, UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.examsService.remove(id);
    }
}
