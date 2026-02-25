import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransportService } from './transport.service';
import { CreateVehicleDto, CreateRouteDto, AssignStudentRouteDto } from './dto/transport.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('transport')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('transport')
export class TransportController {
    constructor(private readonly service: TransportService) { }

    // ═══════ Stats ═══════
    @Get('stats')
    @ApiOperation({ summary: 'Transport Stats' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    getStats(@Req() req: any) {
        return this.service.getStats(req.user.schoolId);
    }

    // ═══════ Vehicles ═══════
    @Post('vehicles')
    @ApiOperation({ summary: 'Add Vehicle' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    createVehicle(@Req() req: any, @Body() dto: CreateVehicleDto) {
        return this.service.createVehicle(dto, req.user.schoolId);
    }

    @Get('vehicles')
    @ApiOperation({ summary: 'List Vehicles' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findAllVehicles(@Req() req: any) {
        return this.service.findAllVehicles(req.user.schoolId);
    }

    @Delete('vehicles/:id')
    @ApiOperation({ summary: 'Remove Vehicle' })
    @Roles(UserRole.SUPER_ADMIN)
    removeVehicle(@Req() req: any, @Param('id') id: string) {
        return this.service.removeVehicle(id, req.user.schoolId);
    }

    // ═══════ Routes ═══════
    @Post('routes')
    @ApiOperation({ summary: 'Create Route' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    createRoute(@Req() req: any, @Body() dto: CreateRouteDto) {
        return this.service.createRoute(dto, req.user.schoolId);
    }

    @Get('routes')
    @ApiOperation({ summary: 'List Routes' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.PARENT)
    findAllRoutes(@Req() req: any) {
        return this.service.findAllRoutes(req.user.schoolId);
    }

    @Get('routes/:id')
    @ApiOperation({ summary: 'Get Route Details' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findOneRoute(@Req() req: any, @Param('id') id: string) {
        return this.service.findOneRoute(id, req.user.schoolId);
    }

    @Patch('routes/:id')
    @ApiOperation({ summary: 'Update Route' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    updateRoute(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateRouteDto>) {
        return this.service.updateRoute(id, dto, req.user.schoolId);
    }

    @Delete('routes/:id')
    @ApiOperation({ summary: 'Delete Route' })
    @Roles(UserRole.SUPER_ADMIN)
    removeRoute(@Req() req: any, @Param('id') id: string) {
        return this.service.removeRoute(id, req.user.schoolId);
    }

    // ═══════ Student Route Assignments ═══════
    @Post('student-routes')
    @ApiOperation({ summary: 'Assign Student to Route' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    assignStudent(@Req() req: any, @Body() dto: AssignStudentRouteDto) {
        return this.service.assignStudent(dto, req.user.schoolId);
    }

    @Delete('student-routes/:id')
    @ApiOperation({ summary: 'Unassign Student from Route' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    unassignStudent(@Req() req: any, @Param('id') id: string) {
        return this.service.unassignStudent(id, req.user.schoolId);
    }
}
