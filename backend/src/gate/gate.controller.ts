import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
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
}

