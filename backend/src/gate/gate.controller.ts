import { Controller, Post, Body, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { GateService } from './gate.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('gate')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('gate')
export class GateController {
    constructor(private readonly gateService: GateService) { }

    @Post('students/late')
    @ApiOperation({ summary: 'Record a late entry for a student' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.RECEPTION, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    recordLateEntry(@Req() req: any, @Body('studentId') studentId: string, @Body('reason') reason: string) {
        return this.gateService.recordLateEntry(studentId, req.user.schoolId, req.user.id, reason);
    }

    @Get('students/late/today')
    @ApiOperation({ summary: 'Get all late student entries for today' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.RECEPTION, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    getLateEntriesToday(@Req() req: any) {
        return this.gateService.getLateEntriesToday(req.user.schoolId);
    }

    @Get('students/late/all')
    @ApiOperation({ summary: 'Get all historical late student entries' })
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD)
    getAllLateEntries(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.gateService.getAllLateEntries(
            req.user.schoolId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 7
        );
    }

    @Get('students/:studentId/late')
    @ApiOperation({ summary: 'Get late entry history for a specific student' })
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD, UserRole.PARENT, UserRole.STUDENT)
    getStudentLateHistory(
        @Req() req: any,
        @Param('studentId') studentId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.gateService.getStudentLateHistory(
            studentId,
            req.user.schoolId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 7
        );
    }
}

