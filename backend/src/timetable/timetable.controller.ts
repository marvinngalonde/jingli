import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { BulkCreateTimetableDto } from './dto/bulk-create-timetable.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('timetable')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    @Post()
    @ApiOperation({ summary: 'Create timetable entry' })
    @Roles(UserRole.HOD, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateTimetableDto) {
        return this.timetableService.create(createDto, req.user.schoolId);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Bulk create timetable entries' })
    @Roles(UserRole.HOD, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    bulkCreate(@Req() req: any, @Body() bulkDto: BulkCreateTimetableDto) {
        return this.timetableService.bulkCreate(bulkDto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'Get timetable entries' })
    @ApiQuery({ name: 'sectionId', required: false, type: String })
    @ApiQuery({ name: 'teacherId', required: false, type: String })
    @ApiQuery({ name: 'subjectId', required: false, type: String })
    findAll(
        @Req() req: any,
        @Query('sectionId') sectionId?: string,
        @Query('teacherId') teacherId?: string,
        @Query('subjectId') subjectId?: string
    ) {
        // All authenticated users can view timetables
        return this.timetableService.findAll(req.user.schoolId, sectionId, teacherId, subjectId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific timetable entry' })
    findOne(@Param('id') id: string) {
        return this.timetableService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update timetable entry' })
    @Roles(UserRole.HOD, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateTimetableDto) {
        return this.timetableService.update(id, updateDto, req.user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete timetable entry' })
    @Roles(UserRole.HOD, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.timetableService.remove(id, req.user);
    }
}
