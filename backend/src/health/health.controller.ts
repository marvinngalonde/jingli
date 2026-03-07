import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('health')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('health')
export class HealthController {
    constructor(private readonly service: HealthService) { }

    @Post('profiles')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    @ApiOperation({ summary: 'Create/Update Medical Profile' })
    upsertProfile(@Req() req: any, @Body() dto: any) { return this.service.upsertProfile(dto, req.user.schoolId); }

    @Get('profiles')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    @ApiOperation({ summary: 'List All Medical Profiles' })
    findAllProfiles(@Req() req: any) { return this.service.findAllProfiles(req.user.schoolId); }

    @Get('profiles/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION, UserRole.PARENT)
    @ApiOperation({ summary: 'Get Medical Profile' })
    getProfile(@Req() req: any, @Param('studentId') studentId: string) { return this.service.getProfile(studentId, req.user.schoolId); }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    @ApiOperation({ summary: 'Health Stats' })
    getStats(@Req() req: any) { return this.service.getStats(req.user.schoolId); }

    @Post('visits')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    @ApiOperation({ summary: 'Log Clinic Visit' })
    createVisit(@Req() req: any, @Body() dto: any) { return this.service.createVisit(dto, req.user.schoolId); }

    @Get('visits')
    @ApiQuery({ name: 'studentId', required: false })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    @ApiOperation({ summary: 'List Clinic Visits' })
    findAllVisits(@Req() req: any, @Query('studentId') studentId?: string) { return this.service.findAllVisits(req.user.schoolId, studentId); }

    @Patch('visits/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    @ApiOperation({ summary: 'Update Visit' })
    updateVisit(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.service.updateVisit(id, dto, req.user.schoolId); }

    @Delete('visits/:id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete Visit' })
    removeVisit(@Req() req: any, @Param('id') id: string) { return this.service.removeVisit(id, req.user.schoolId); }
}
