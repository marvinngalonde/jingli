import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    @ApiOperation({ summary: 'Record single student attendance' })
    @Roles(UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.SENIOR_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateAttendanceDto) {
        return this.attendanceService.create(createDto, req.user.schoolId);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Record multiple attendance entries (e.g. whole class)' })
    @Roles(UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.SENIOR_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
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
    @Roles(UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.DEPUTY_HEAD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
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
    @Roles(UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.DEPUTY_HEAD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.attendanceService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update attendance record' })
    @Roles(UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.SENIOR_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateAttendanceDto) {
        return this.attendanceService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete attendance record' })
    @Roles(UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.attendanceService.remove(id, req.user.schoolId);
    }

    // --- STAFF ATTENDANCE OUT IN THE GATE ---

    @Post('staff/check-in')
    @ApiOperation({ summary: 'Check in a staff member at the gate' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.RECEPTION, UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    staffCheckIn(@Req() req: any, @Body('staffId') staffId: string, @Body('notes') notes?: string) {
        return this.attendanceService.staffCheckIn(staffId, req.user.schoolId, req.user.id, notes);
    }

    @Post('staff/check-out')
    @ApiOperation({ summary: 'Check out a staff member at the gate' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.RECEPTION, UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    staffCheckOut(@Req() req: any, @Body('staffId') staffId: string) {
        return this.attendanceService.staffCheckOut(staffId, req.user.schoolId);
    }

    @Get('staff/today')
    @ApiOperation({ summary: 'Get all staff attendance for today' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.RECEPTION, UserRole.HR_MANAGER, UserRole.SCHOOL_HEAD, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    getStaffAttendanceToday(@Req() req: any) {
        return this.attendanceService.getStaffAttendanceToday(req.user.schoolId);
    }
}
