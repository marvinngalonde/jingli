import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/supabase.guard';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_HEAD'];

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Get all users in school' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'includeInactive', required: false })
    async getAll(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('includeInactive') includeInactive?: string
    ) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me) return [];
        return this.usersService.findAll(
            me.schoolId!,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 7,
            includeInactive === 'true'
        );
    }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    async create(@Request() req: any, @Body() body: any) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me || !ADMIN_ROLES.includes(me.role)) throw new ForbiddenException('Admin access required');
        return this.usersService.create(me.schoolId!, body);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me || !ADMIN_ROLES.includes(me.role)) throw new ForbiddenException('Admin access required');
        return this.usersService.update(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    async remove(@Request() req: any, @Param('id') id: string) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me || !ADMIN_ROLES.includes(me.role)) throw new ForbiddenException('Admin access required');
        return this.usersService.remove(id);
    }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore a soft-deleted user' })
    async restore(@Request() req: any, @Param('id') id: string) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me || !ADMIN_ROLES.includes(me.role)) throw new ForbiddenException('Admin access required');
        return this.usersService.restore(id);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current logged-in user profile' })
    getMe(@Request() req: any) {
        // req.user is populated by SupabaseGuard
        return this.usersService.findMe(req.user.id);
    }

    @Patch('me/username')
    @ApiOperation({ summary: 'Update your own username' })
    async updateMyUsername(@Request() req: any, @Body() body: { username: string }) {
        if (!body.username) throw new ForbiddenException('Username is required');
        return this.usersService.updateUsername(req.user.id, body.username);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get user statistics' })
    async getStats(@Request() req: any) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me) return null;
        return this.usersService.getStats(me.schoolId!);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search users in the same school' })
    async search(@Request() req: any) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me) return [];
        return this.usersService.findAll(me.schoolId!);
    }
}
