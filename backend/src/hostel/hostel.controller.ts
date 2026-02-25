import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HostelService } from './hostel.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('hostel')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('hostel')
export class HostelController {
    constructor(private readonly service: HostelService) { }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    getStats(@Req() req: any) { return this.service.getStats(req.user.schoolId); }

    @Post('hostels')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    createHostel(@Req() req: any, @Body() dto: any) { return this.service.createHostel(dto, req.user.schoolId); }

    @Get('hostels')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findAllHostels(@Req() req: any) { return this.service.findAllHostels(req.user.schoolId); }

    @Delete('hostels/:id')
    @Roles(UserRole.SUPER_ADMIN)
    removeHostel(@Req() req: any, @Param('id') id: string) { return this.service.removeHostel(id, req.user.schoolId); }

    @Post('rooms')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    createRoom(@Req() req: any, @Body() dto: any) { return this.service.createRoom(dto, req.user.schoolId); }

    @Get('rooms')
    @ApiQuery({ name: 'hostelId', required: false })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findAllRooms(@Req() req: any, @Query('hostelId') hostelId?: string) { return this.service.findAllRooms(req.user.schoolId, hostelId); }

    @Delete('rooms/:id')
    @Roles(UserRole.SUPER_ADMIN)
    removeRoom(@Req() req: any, @Param('id') id: string) { return this.service.removeRoom(id, req.user.schoolId); }

    @Post('beds')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    allocateBed(@Req() req: any, @Body() dto: any) { return this.service.allocateBed(dto, req.user.schoolId); }

    @Delete('beds/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    deallocateBed(@Req() req: any, @Param('id') id: string) { return this.service.deallocateBed(id, req.user.schoolId); }

    @Post('exeats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    createExeat(@Req() req: any, @Body() dto: any) { return this.service.createExeat(dto, req.user.schoolId); }

    @Get('exeats')
    @ApiQuery({ name: 'status', required: false })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findAllExeats(@Req() req: any, @Query('status') status?: string) { return this.service.findAllExeats(req.user.schoolId, status); }

    @Patch('exeats/:id/approve')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    approveExeat(@Req() req: any, @Param('id') id: string) { return this.service.approveExeat(id, req.user.schoolId, req.user.id); }

    @Patch('exeats/:id/return')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    markReturned(@Req() req: any, @Param('id') id: string) { return this.service.markReturned(id, req.user.schoolId); }
}
