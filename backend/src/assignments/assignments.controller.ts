import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/create-assignment.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create assignment' })
    create(@Req() req: any, @Body() createDto: CreateAssignmentDto) {
        return this.assignmentsService.create(createDto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'Get assignments' })
    @ApiQuery({ name: 'sectionId', required: false })
    @ApiQuery({ name: 'subjectId', required: false })
    findAll(@Req() req: any, @Query('sectionId') sectionId?: string, @Query('subjectId') subjectId?: string) {
        return this.assignmentsService.findAll(req.user.schoolId, sectionId, subjectId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get assignment details with submissions' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.assignmentsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update assignment' })
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateAssignmentDto) {
        return this.assignmentsService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete assignment' })
    remove(@Req() req: any, @Param('id') id: string) {
        return this.assignmentsService.remove(id, req.user.schoolId);
    }
}
