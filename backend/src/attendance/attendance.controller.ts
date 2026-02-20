import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    @ApiOperation({ summary: 'Record single student attendance' })
    create(@Req() req: any, @Body() createDto: CreateAttendanceDto) {
        return this.attendanceService.create(createDto, req.user.schoolId);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Record multiple attendance entries (e.g. whole class)' })
    bulkCreate(@Req() req: any, @Body() createDtos: CreateAttendanceDto[]) {
        return this.attendanceService.bulkCreate(createDtos, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'Get attendance records' })
    @ApiQuery({ name: 'date', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'classId', required: false, description: 'Section ID', type: String })
    @ApiQuery({ name: 'studentId', required: false, description: 'Student ID', type: String })
    findAll(
        @Req() req: any,
        @Query('date') date?: string,
        @Query('classId') classId?: string,
        @Query('studentId') studentId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.attendanceService.findAll(req.user.schoolId, date, classId, studentId, startDate, endDate);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific attendance record' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.attendanceService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update attendance record' })
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateAttendanceDto) {
        return this.attendanceService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete attendance record' })
    remove(@Req() req: any, @Param('id') id: string) {
        return this.attendanceService.remove(id, req.user.schoolId);
    }
}
