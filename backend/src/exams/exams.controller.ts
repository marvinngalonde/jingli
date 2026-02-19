import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Logger } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';

@ApiTags('exams')
@Controller('exams')
@UseGuards(SupabaseGuard)
export class ExamsController {
    private readonly logger = new Logger(ExamsController.name);

    constructor(private readonly examsService: ExamsService) {
        this.logger.log('ExamsController initialized');
    }

    @Post()
    @ApiOperation({ summary: 'Create a new exam' })
    create(@Body() createExamDto: any) {
        return this.examsService.create(createExamDto);
    }

    @Get()
    @ApiOperation({ summary: 'List exams with filters' })
    @ApiQuery({ name: 'schoolId', required: true })
    @ApiQuery({ name: 'termId', required: false })
    @ApiQuery({ name: 'classLevelId', required: false })
    findAll(
        @Query('schoolId') schoolId: string,
        @Query('termId') termId?: string,
        @Query('classLevelId') classLevelId?: string,
    ) {
        return this.examsService.findAll(schoolId, termId, classLevelId);
    }

    @Post('terms')
    @ApiOperation({ summary: 'Create a new exam term' })
    createTerm(@Body() createTermDto: any) {
        return this.examsService.createTerm(createTermDto);
    }

    @Get('terms')
    @ApiOperation({ summary: 'List all exam terms' })
    @ApiQuery({ name: 'schoolId', required: true })
    getTerms(@Query('schoolId') schoolId: string) {
        return this.examsService.getTerms(schoolId);
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
    remove(@Param('id') id: string) {
        return this.examsService.remove(id);
    }
}
