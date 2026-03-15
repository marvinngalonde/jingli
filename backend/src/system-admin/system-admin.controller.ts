import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Query, Param } from '@nestjs/common';
import { SystemAdminService } from './system-admin.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('system-admin')
export class SystemAdminController {
    constructor(private readonly systemAdminService: SystemAdminService) { }

    @Get('stats')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    getStats() {
        return this.systemAdminService.getStats();
    }

    @Get('schools')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    getSchools(
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Query('search') search?: string,
    ) {
        return this.systemAdminService.getSchools(
            page ? parseInt(page) : 1,
            pageSize ? parseInt(pageSize) : 20,
            search || '',
        );
    }

    @Get('schools/:id')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    getSchoolById(@Param('id') id: string) {
        return this.systemAdminService.getSchoolById(id);
    }

    @Patch('schools/:id/status')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    toggleSchoolStatus(
        @Param('id') id: string,
        @Body('status') status: 'ACTIVE' | 'SUSPENDED',
    ) {
        return this.systemAdminService.toggleSchoolStatus(id, status);
    }

    @Patch('schools/:id')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    updateSchool(
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.systemAdminService.updateSchool(id, body);
    }

    @Patch('schools/:id/ai')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    toggleAiEnabled(
        @Param('id') id: string,
        @Body('aiEnabled') aiEnabled: boolean,
    ) {
        return this.systemAdminService.toggleAiEnabled(id, aiEnabled);
    }

    @Get('users')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    getGlobalUsers(
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Query('search') search?: string,
    ) {
        return this.systemAdminService.getGlobalUsers(
            page ? parseInt(page) : 1,
            pageSize ? parseInt(pageSize) : 25,
            search || '',
        );
    }

    // Bootstrap endpoint — should be removed or key-guarded in production
    @Post('bootstrap')
    bootstrapAdmin(@Body('email') email: string) {
        return this.systemAdminService.bootstrapAdmin(email);
    }

    @Delete('schools/:id')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    deleteSchool(@Param('id') id: string) {
        return this.systemAdminService.deleteSchool(id);
    }

    @Delete('users/:id')
    @UseGuards(SupabaseGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    deleteUser(@Param('id') id: string) {
        return this.systemAdminService.deleteUser(id);
    }
}
