import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('alerts')
export class AlertsController {
    constructor(private readonly service: AlertsService) { }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    getStats(@Req() req: any) { return this.service.getStats(req.user.schoolId); }

    @Post('templates')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    createTemplate(@Req() req: any, @Body() dto: any) { return this.service.createTemplate(dto, req.user.schoolId); }

    @Get('templates')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    findAllTemplates(@Req() req: any) { return this.service.findAllTemplates(req.user.schoolId); }

    @Patch('templates/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    updateTemplate(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.service.updateTemplate(id, dto, req.user.schoolId); }

    @Delete('templates/:id')
    @Roles(UserRole.SUPER_ADMIN)
    removeTemplate(@Req() req: any, @Param('id') id: string) { return this.service.removeTemplate(id, req.user.schoolId); }

    @Post('send')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.BURSAR)
    @ApiOperation({ summary: 'Send Alert' })
    sendAlert(@Req() req: any, @Body() dto: any) { return this.service.sendAlert(dto, req.user.schoolId); }

    @Get('logs')
    @ApiQuery({ name: 'channel', required: false })
    @ApiQuery({ name: 'status', required: false })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    findAllLogs(@Req() req: any, @Query('channel') channel?: string, @Query('status') status?: string) {
        return this.service.findAllLogs(req.user.schoolId, channel, status);
    }
}
